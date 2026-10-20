import 'server-only';
import { env } from '../env';

export type EmailMessage = {
  to: string | string[];
  subject: string;
  text: string;
  replyTo?: string;
};

export interface EmailSender {
  send(message: EmailMessage): Promise<void>;
}

let sender: EmailSender | undefined;

/** Send a transactional email through the configured driver (EMAIL_DRIVER=log|ses). */
export async function sendEmail(message: EmailMessage): Promise<void> {
  sender ??= await createSender();
  await sender.send(message);
}

async function createSender(): Promise<EmailSender> {
  if (env().EMAIL_DRIVER === 'ses') {
    const { SesEmailSender } = await import('./ses');
    return new SesEmailSender();
  }
  const { LogEmailSender } = await import('./log');
  return new LogEmailSender();
}
