import { resend } from "@/lib/resend";
import VerificationEmail from "../../email_templates/VerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";

export interface VerificationEmailReq {
  email: string;
  username: string;
  verifyCode: string;
}

export async function sendVerifyEmail(
  req: VerificationEmailReq
): Promise<ApiResponse> {
  try {
    
    const { data, error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: [req.email],
      subject: "Verification email",
      react: VerificationEmail({ username: req.username, otp: req.verifyCode }),
    });

    if (error) {
      return {
        success: false,
        message: "Error Occured " + JSON.stringify(error),
      };
    }

    console.log("Verification email sent successfully: ", JSON.stringify(data));

    return { success: true, message: "verification email send successfully" };
  } catch (emailError) {
    console.error("Error Sending verification email: " + emailError);
    return { success: false, message: "Fail to send verification email" };
  }
}
