import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from './logger.js';

const transporter = nodemailer.createTransport({
  host: env.email.host,
  port: env.email.port,
  auth: { user: env.email.user, pass: env.email.pass },
});

export const sendEmail = async ({ to, subject, html }) => {
  if (env.nodeEnv === 'development' || env.nodeEnv === 'test') {
    logger.info(`[EMAIL DEV] To: ${to} | Subject: ${subject}\n${html}`);
    return;
  }
  await transporter.sendMail({ from: env.email.from, to, subject, html });
};
