import { useEffect, useRef } from "react";
import type { Route } from "./+types/_auth.login";
import { data, Form, Link, redirect, useNavigation } from "react-router";
import welcomeImage from "../assets/welcome.png?url";
import { Ellipsis } from "lucide-react";
import { commitSession, getSession } from "~/.server/sessions";
import { loginSchema } from "~/utils/zodSchema";
import { formatAuthError } from "~/utils/formatAuthError";
import { comparePasswords, getUserId } from "~/.server/models/user";

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
    },
  );
}

export async function action({ request }: Route.ActionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const formData = await request.formData();

  const body = {
    userName: String(formData.get("userName")),
    password: String(formData.get("password")),
  };

  const validateInput = loginSchema.safeParse(body);

  if (!validateInput.success) {
    const issues = formatAuthError(validateInput.error.message);

    return data(issues, { status: 400 });
  }

  const userId = await getUserId(body.userName);

  if (userId === undefined) {
    session.flash("error", "Oops, Something went wrong :(");

    return redirect("/login", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  if (userId === null) {
    session.flash("error", "Username/Password is incorrect");

    return redirect("/login", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  } else {
    const validPassword = await comparePasswords(userId, body.password);

    if (validPassword === undefined) {
      session.flash("error", "Oops, Something went wrong :(");

      return redirect("/login", {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }

    if (validPassword === false) {
      session.flash("error", "Username/Password is incorrect");

      return redirect("/login", {
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

export default function LoginPage({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const { error } = loaderData;
  const navigation = useNavigation();

  useEffect(() => {
    if (actionData) {
      const firstErrorField = formFields.find(
        (field) => actionData[field.inputName],
      );

      if (firstErrorField) {
        const inputElement = formRef.current?.querySelector<HTMLInputElement>(
          `input[name="${firstErrorField.inputName}"]`,
        );

        if (inputElement) {
          inputElement.focus();
        }
      }
    }
  }, [actionData]);

  return (
    <section className="flex w-full items-center justify-center gap-16 px-4 py-4 md:px-8">
      <figure className="hidden h-auto max-w-md grow lg:block">
        <img src={welcomeImage} className="w-full" />
      </figure>
      <div className="flex grow flex-col items-center gap-5">
        <header>
          <span className="text-xl font-medium md:text-2xl">Login to</span>{" "}
          <Link to="/" className="font-pacifico text-2xl md:text-3xl">
            Flowy
          </Link>
        </header>
        <Form
          method="POST"
          className="flex w-full max-w-md flex-col gap-4 rounded-lg border-2 border-blue-50 p-4"
          ref={formRef}
        >
          {formFields.map((field) => (
            <label key={field.id} className="space-y-1">
              <h2 className="font-poppins text-sm font-medium md:text-lg">
                {field.inputLabel}
              </h2>
              <input
                type={field.inputType}
                name={field.inputName}
                placeholder={field.inputPlaceholder}
                className="input-box"
              />
              {actionData ? (
                <p className="form-error">{actionData[field.inputName]}</p>
              ) : null}
            </label>
          ))}
          <button
            type="submit"
            className="rounded-lg bg-blue-600 py-2 font-roboto text-sm text-white"
            disabled={navigation.state !== "idle"}
          >
            {navigation.state !== "idle" ? (
              <Ellipsis className="mx-auto" />
            ) : (
              "Login"
            )}
          </button>
          {error && <p className="form-error text-center">{error}</p>}
        </Form>
        <p className="text-sm">
          Create an account?{" "}
          <Link to="/signup" className="text-blue-500 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </section>
  );
}

const formFields = [
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
