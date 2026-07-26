const { z } = require("zod");

const registerSchema = z
  .object({
    userName: z
      .string()
      .trim()
      .min(3, "Name must be at least 3 characters.")
      .max(50, "Name cannot exceed 50 characters."),

    userEmail: z
      .string()
      .trim()
      .toLowerCase()
      .email("Please enter a valid email address."),

    userPassword: z.string().min(8, "Password must be at least 8 characters."),

    userConfirmPassword: z
      .string()
      .min(8, "Confirm password must be at least 8 characters."),
  })
  .refine((data) => data.userPassword === data.userConfirmPassword, {
    message: "Passwords do not match.",
    path: ["userConfirmPassword"],
  });

module.exports = {
  registerSchema,
};
