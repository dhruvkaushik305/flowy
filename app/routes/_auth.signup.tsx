import { data, Form, redirect, useActionData } from "react-router";
import type { Route } from "./+types/_auth.signup";
import { authSchema } from "~/utils/zodSchema";
import { formatAuthError } from "~/utils/formatAuthError";
import { createNewUser, getUserId } from "~/.server/models/user";
import { commitSession, getSession } from "~/.server/sessions";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));

  return data(
    {
      error: session.get("error"),
    },
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    }
  );
}

export async function action({ request }: Route.ActionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const formData = await request.formData();

  const body = {
    name: String(formData.get("name")),
    userName: String(formData.get("userName")),
    password: String(formData.get("password")),
  };

  const validateInput = authSchema.safeParse({
    userName: body.userName,
    password: body.password,
  });

  if (!validateInput.success) {
    const issues = formatAuthError(validateInput.error.message);

    return data(issues, { status: 400 });
  }

  const userId = await getUserId(body.userName);

  if (userId) {
    session.flash("error", "An account with this user name already exists");

    redirect("/signup", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  } else {
    const userId = await createNewUser(body);

    if (!userId) {
      session.flash("error", "Something went wrong");

      redirect("/signup", {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    } else {
      session.set("userId", userId);

      redirect("/home", {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }
  }
}

export default function SignupPage({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  console.log("actionData", actionData);

  return (
    <div>
      <Form method="POST">
        {formFields.map((field) => (
          <label key={field.id}>
            <h2>{field.inputLabel}</h2>
            <input
              type={field.inputType}
              name={field.inputName}
              placeholder={field.inputPlaceholder}
            />
            {actionData ? <p>{actionData[field.inputName]}</p> : null}
          </label>
        ))}
        <button type="submit">Signup</button>
      </Form>
    </div>
  );
}

const formFields = [
  {
    id: 1,
    inputType: "text",
    inputName: "name",
    inputLabel: "Name",
    inputPlaceholder: "John Doe",
  },
  {
    id: 2,
    inputType: "text",
    inputName: "userName",
    inputLabel: "Username",
    inputPlaceholder: "john_doe_123",
  },
  {
    id: 3,
    inputType: "password",
    inputName: "password",
    inputLabel: "Password",
    inputPlaceholder: "Secret",
  },
];
