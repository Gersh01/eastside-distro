import 'server-only';
import { SendEmailCommand, SESv2Client } from '@aws-sdk/client-sesv2';
import { env } from '../env';
import type { EmailMessage, EmailSender } from './index';

/** Amazon SES v2. Credentials come from the ECS task role; the sending domain is verified in infra/. */
export class SesEmailSender implements EmailSender {
  private readonly client = new SESv2Client({ region: env().AWS_REGION });

  async send(message: EmailMessage): Promise<void> {
    await this.client.send(
      new SendEmailCommand({
        FromEmailAddress: env().EMAIL_FROM,
        Destination: { ToAddresses: Array.isArray(message.to) ? message.to : [message.to] },
        ReplyToAddresses: message.replyTo ? [message.replyTo] : undefined,
        Content: {
          Simple: {
            Subject: { Data: message.subject, Charset: 'UTF-8' },
            Body: { Text: { Data: message.text, Charset: 'UTF-8' } },
          },
        },
      }),
    );
  }
}
