import { Resend } from 'resend';

interface SendEmailOptions {
  email: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: SendEmailOptions): Promise<void> => {
  const apiKey = process.env.RESEND_API_KEY;

  // Development Fallback: If no API key is set, print the email to the console for testing
  if (!apiKey) {
    console.log('----------------------------------------------------');
    console.log('📧 DEVELOPMENT MODE EMAIL SIMULATION');
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log('----------------------------------------------------');
    console.log(options.html);
    console.log('----------------------------------------------------');
    return;
  }

  // Production Mode: Send real transactional email via Resend
  const resend = new Resend(apiKey);

  await resend.emails.send({
    from: 'Sparksy <onboarding@resend.dev>', // Resend testing domain
    to: options.email,
    subject: options.subject,
    html: options.html,
  });
};