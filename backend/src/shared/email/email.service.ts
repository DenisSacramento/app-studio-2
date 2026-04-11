import nodemailer from 'nodemailer';

import { env } from '../../config/env';
import { AppError } from '../errors/app-error';

type PasswordResetEmailInput = {
  to: string;
  name: string;
  token: string;
  expiresInMinutes: number;
};

class EmailService {
  private createTransport() {
    if (!env.smtpHost || !env.smtpPort || !env.smtpUser || !env.smtpPassword || !env.smtpFrom) {
      return null;
    }

    return nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpSecure,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPassword,
      },
    });
  }

  async sendPasswordResetInstructions(input: PasswordResetEmailInput): Promise<void> {
    const from = env.smtpFrom;
    const subject = 'Instruções para redefinir sua senha';
    const text = [
      `Olá, ${input.name}.`,
      '',
      'Recebemos uma solicitação para redefinir sua senha.',
      `Use o código abaixo no app. Ele expira em ${input.expiresInMinutes} minutos:`,
      '',
      input.token,
      '',
      'Se você não solicitou essa alteração, ignore este email.',
    ].join('\n');

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #1f2937;">
        <h2 style="color: #a21caf;">Instruções para redefinir sua senha</h2>
        <p>Olá, <strong>${input.name}</strong>.</p>
        <p>Recebemos uma solicitação para redefinir sua senha.</p>
        <p>Use o código abaixo no app. Ele expira em <strong>${input.expiresInMinutes} minutos</strong>:</p>
        <div style="font-size: 20px; font-weight: 700; letter-spacing: 1px; padding: 16px; background: #fdf2f8; border: 1px solid #f9a8d4; display: inline-block; border-radius: 10px; margin: 12px 0;">${input.token}</div>
        <p>Se você não solicitou essa alteração, ignore este email.</p>
      </div>
    `;

    const transport = this.createTransport();

    if (!transport || !from) {
      if (env.nodeEnv === 'development') {
        console.log('[email] Password reset instructions');
        console.log(text);
        return;
      }

      throw new AppError('Serviço de email não configurado', 500);
    }

    await transport.sendMail({
      from,
      to: input.to,
      subject,
      text,
      html,
    });
  }
}

export const emailService = new EmailService();