import { z } from "zod";

export const authSchema = z.object({
  userName: z.string().regex(/^[a-zA-Z0-9_]+$/, {
    message: "Can only contain alphabets, numbers, and underscores",
  }),
  password: z.string().min(4, { message: "Must be atleast 4 characters" }),
});
