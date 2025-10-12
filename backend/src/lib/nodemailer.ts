import { createTransport, type Transporter } from 'nodemailer';
import { env } from './env';

const globalForNodemailer = globalThis as unknown as { nodemailer: Transporter };

export const nodemailer =
  globalForNodemailer.nodemailer ||
  createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASS,
    },
  });

if (env.NODE_ENV !== 'development') globalForNodemailer.nodemailer = nodemailer;
