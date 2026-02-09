/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { parentPort } from 'worker_threads';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { SendMailPayload } from './mailer.worker.util';

const sendMail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  const transporter: Transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SYSTEM_EMAIL,
      pass: process.env.SYSTEM_EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.SYSTEM_EMAIL,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    parentPort?.postMessage({ success: true, response: info.response });
  } catch (error) {
    parentPort?.postMessage({
      success: false,
      error: (error as Error).message,
    });
  }
};

parentPort?.on('message', async (data) => {
  await sendMail(data as SendMailPayload);
});
