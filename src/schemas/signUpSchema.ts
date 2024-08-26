import { z } from "zod";

export const userNameValidation = z
    .string()
    .min(3, "Username must be atleast 3 characters")
    .max(18, "User name must be no more than 18 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username must not contain special characters")


export const signUpSchema = z.object({
    username: userNameValidation,
    email: z.string().email({message: "Invalid email address"}),
    password: z.string().min(6, "password must be at least 6 characters")
})