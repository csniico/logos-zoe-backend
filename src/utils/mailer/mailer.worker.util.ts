import { Worker } from 'worker_threads';
import path from 'path';

export interface SendMailPayload {
  to: string;
  subject: string;
  html: string;
}

export const sendMail = ({
  to,
  subject,
  html,
}: SendMailPayload): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.resolve(__dirname, './mailer.util.js'));

    worker.on(
      'message',
      (result: { success: boolean; response?: any; error?: any }) => {
        if (result.success) {
          console.log('Email sent successfully:', result.response);
          resolve(true);
        } else {
          console.error('Error sending email:', result.error);
          resolve(false);
        }
      },
    );

    worker.on('error', (error) => {
      console.error('Worker encountered an error:', error);
      reject(error);
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        console.error(`Worker stopped with exit code ${code}`);
      }
    });

    worker.postMessage({ to, subject, html });
  });
};
