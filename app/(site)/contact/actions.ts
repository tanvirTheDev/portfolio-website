"use server";

import { z } from "zod";
import { Resend } from "resend";

const schema = z.object({
  message: z.string().min(1, "Message is required").max(500, "Maximum 500 characters"),
});

export type ContactState = {
  status: "idle" | "success" | "error";
  message?: string;
  error?: string;
};

export async function sendMessage(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const raw = { message: formData.get("message") };
  const parsed = schema.safeParse(raw);

  if (!parsed.success) {
    return { status: "error", error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { message } = parsed.data;
  const to = process.env.CONTACT_TO_EMAIL;

  if (!process.env.RESEND_API_KEY || !to) {
    // Dev fallback — log to console
    console.info("[CONTACT]", message);
    return { status: "success", message };
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "Portfolio Contact <onboarding@resend.dev>",
      to,
      subject: "New message from portfolio contact form",
      text: message,
    });
    return { status: "success", message };
  } catch (err) {
    console.error("[CONTACT] Resend error:", err);
    return { status: "error", error: "Failed to send. Try again later." };
  }
}
