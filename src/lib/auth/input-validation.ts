import { z } from "zod";

const containsControl = (value: string) => /[\p{Cc}\p{Cf}]/u.test(value);
const byteLength = (value: string) => new TextEncoder().encode(value).length;

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3)
  .max(32)
  .regex(/^[a-z][a-z0-9._-]{2,31}$/, "usernameHint");

export const newPasswordSchema = z
  .string()
  .refine(
    (value) =>
      [...value].length >= 8 &&
      byteLength(value) <= 72 &&
      Boolean(value.trim()) &&
      !containsControl(value),
    "passwordHint"
  );

export const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(1)
    .max(200)
    .refine(
      (value) =>
        /^[a-z0-9._-]+$/i.test(value) || z.string().email().safeParse(value).success,
      "usernameInvalid"
    ),
  password: z
    .string()
    .refine(
      (value) =>
        Boolean(value.trim()) &&
        byteLength(value) <= 200 &&
        !containsControl(value),
      "passwordInvalid"
    ),
  rememberMe: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
