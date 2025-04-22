// /lib/emailUtils.ts
// Utility functions for sending emails.
// (Content from omniagency_email_util)

// import { Resend } from 'resend';
// const resend = new Resend(process.env.RESEND_API_KEY);

interface SendWelcomeEmailParams {
  to: string;
  name?: string;
}

export async function sendWelcomeEmail({ to, name }: SendWelcomeEmailParams): Promise<boolean> {
  const subject = "Welcome to OmniAgency!";
  const fromAddress = process.env.EMAIL_FROM || 'OmniAgency <noreply@omniagency.app>';
  const bodyHtml = `<p>Hi ${name || 'there'},</p><p>Welcome to <strong>OmniAgency</strong>! We're excited to have you onboard.</p><p>You can now create and manage your AI agents from your <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard">dashboard</a>.</p><p>Best regards,<br>The OmniAgency Team</p>`;

  console.log("--- Sending Welcome Email (Simulation) ---");
  console.log(`To: ${to}`);
  console.log(`From: ${fromAddress}`);
  console.log(`Subject: ${subject}`);
  console.log("------------------------------------------");

  try {
    // --- Placeholder for Resend ---
    // const { data, error } = await resend.emails.send({ from: fromAddress, to: [to], subject: subject, html: bodyHtml });
    // if (error) { console.error('Resend Error:', error); return false; }
    // return true;

    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async
    return true;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return false;
  }
} 