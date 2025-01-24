import { data, Form, redirect, useActionData, useNavigation } from "react-router";
import type { Route } from "./+types/_auth.signup";
import { signupSchema } from "~/utils/zodSchema";
import { formatAuthError } from "~/utils/formatAuthError";
import { createNewUser, getUserId } from "~/.server/models/user";
import { commitSession, getSession } from "~/.server/sessions";
import highFiveImage from "../assets/high-five.png?url";
import { useEffect, useRef } from "react";
import { Ellipsis } from "lucide-react";

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

  const validateInput = signupSchema.safeParse(body);

  if (!validateInput.success) {
    const issues = formatAuthError(validateInput.error.message);

    return data(issues, { status: 400 });
  }

  const userId = await getUserId(body.userName);

  if (userId) {
    session.flash("error", "An account with this user name already exists");

    return redirect("/signup", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  } else {
    const userId = await createNewUser(body);

    if (!userId) {
      session.flash("error", "Oops, Something went wrong :(");

      return redirect("/signup", {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    } else {
      session.set("userId", userId);

      return redirect("/home", {
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
  const formRef = useRef<HTMLFormElement>(null);
  const { error } = loaderData;
  const navigation = useNavigation();

  useEffect(()=>{
    if(actionData){
      const firstErrorField = formFields.find((field)=>actionData[field.inputName]);

      if (firstErrorField) {
        const inputElement = formRef.current?.querySelector<HTMLInputElement>(
          `input[name="${firstErrorField.inputName}"]`,
        );

        if (inputElement) {
          inputElement.focus();
        }
      }
    }
  },[actionData]);

  return (
    <section className="py-4 px-4 md:px-8 w-full flex items-center justify-center gap-16">
      <figure className="h-auto max-w-md grow lg:block hidden">
        <img src={highFiveImage} className="w-full" />
      </figure>
      <div className="flex grow flex-col items-center gap-5">
        <header>
          <span className="font-medium text-xl md:text-2xl">Signup to</span>{" "}
          <span className="font-pacifico text-2xl md:text-3xl">Flowy</span>
        </header>
        <Form method="POST" className="flex-col gap-4 flex border-2 border-blue-50 rounded-lg p-4 max-w-md w-full" ref={formRef}>
          {formFields.map((field) => (
            <label key={field.id} className="space-y-1">
              <h2 className="font-medium font-poppins text-sm md:text-lg">{field.inputLabel}</h2>
              <input
                type={field.inputType}
                name={field.inputName}
                placeholder={field.inputPlaceholder}
                className="input-box"
              />
              {actionData ? <p className="form-error">{actionData[field.inputName]}</p> : null}
            </label>
          ))}
          <button type="submit" className="bg-blue-600 text-white py-2 rounded-lg font-roboto text-sm" disabled={navigation.state !== "idle"}>{navigation.state !== "idle"? <Ellipsis className="mx-auto"/> : "Signup"}</button>
          {error && <p className="form-error text-center">{error}</p>}
        </Form>
      </div>
    </section>
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
    inputPlaceholder: "john_123",
  },
  {
    id: 3,
    inputType: "password",
    inputName: "password",
    inputLabel: "Password",
    inputPlaceholder: "secret",
  },
];
