import { createCookieSessionStorage } from "react-router";

type SessionData = {
  userId: string;
};

type SessionFlashData = {
  error: string;
};

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>({
    cookie: {
      name: "__session",
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 365 * 1000, // this is 1000 years
      path: "/",
      sameSite: "lax",
      secrets: ["s3cret1"],
    },
  });

export { getSession, commitSession, destroySession };
