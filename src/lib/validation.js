import { z } from "zod";

const baseAuthSchema = {
  email: z
    .string()
    .min(1, { message: "Email is required." })
    .email("Please enter a valid email."),

  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters long")
    .max(15, "Password must not exceed 15 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^a-zA-Z0-9]/,
      "Password must contain at least one special character (e.g., !@#$%^&*)"
    ),
};
export const loginSchema = z.object({
  ...baseAuthSchema,
  captcha: z.string().nonempty("Please complete the captcha"),
});

export const signupSchema = z.object({
  ...baseAuthSchema,
});

export const resetSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required." })
    .email("Please enter a valid email."),
});

export const resetMailSchema = z.object({
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters long")
    .max(15, "Password must not exceed 15 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^a-zA-Z0-9]/,
      "Password must contain at least one special character (e.g., !@#$%^&*)"
    ),
});

export const userSchema = z.object({
  userName: z.string().min(1, { message: "UserName is required" }),
  email: z
    .string()
    .min(1, { message: "Email is required." })
    .email("Please enter a valid email."),
  address: z.string().min(1, { message: "Address is required" }),
});
