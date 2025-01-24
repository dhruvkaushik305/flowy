import { z } from "zod";

const userNameSchema = z.string().regex(/^[a-zA-Z0-9_]+$/, {
  message: "Can only contain alphabets, numbers, and underscores",
});
const passwordSchema = z
  .string()
  .min(4, { message: "Must be atleast 4 characters" });

export const signupSchema = z.object({
  name: z.string().min(3, "Must be atleast 3 characters"),
  userName: userNameSchema,
  password: passwordSchema,
});
