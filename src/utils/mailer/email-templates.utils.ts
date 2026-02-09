export const generateEmailVerificationTemplate = () => {
  // Generate a 6-digit random verification code
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // Create an HTML template
  const template = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f9f9f9;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    padding: 20px;
                    background-color: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .header {
                    text-align: center;
                    padding-bottom: 20px;
                    border-bottom: 1px solid #dddddd;
                }
                .header h1 {
                    color: #333333;
                }
                .content {
                    text-align: center;
                    padding: 20px;
                }
                .code {
                    display: inline-block;
                    font-size: 24px;
                    font-weight: bold;
                    color: #4CAF50;
                    padding: 10px 20px;
                    background-color: #f4f4f4;
                    border-radius: 4px;
                    margin: 20px 0;
                }
                .footer {
                    text-align: center;
                    margin-top: 20px;
                    font-size: 14px;
                    color: #888888;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Email Verification</h1>
                </div>
                <div class="content">
                    <p>Thank you for signing up! Please use the following code to verify your email address:</p>
                    <div class="code">${code}</div>
                    <p>If you didn't request this, you can ignore this email.</p>
                </div>
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

  return { code, template };
};
