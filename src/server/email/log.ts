import 'server-only';
import type { EmailMessage, EmailSender } from './index';

/** Development driver: prints the email instead of sending it. Never enable in production. */
export class LogEmailSender implements EmailSender {
  async send(message: EmailMessage): Promise<void> {
    const to = Array.isArray(message.to) ? message.to.join(', ') : message.to;
    console.info(
      [
        '--- email (EMAIL_DRIVER=log) ---',
        `To: ${to}`,
        message.replyTo ? `Reply-To: ${message.replyTo}` : null,
        `Subject: ${message.subject}`,
        '',
        message.text,
        '--- end email ---',
      ]
        .filter((line) => line !== null)
        .join('\n'),
    );
  }
}
