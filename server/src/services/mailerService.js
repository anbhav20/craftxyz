import { transporter } from '../config/mailer.js';

export async function sendPasswordResetEmail(to, resetLink) {
  await transporter.sendMail({
    from: process.env.SMTP_USER || 'no-reply@craftxyz.test',
    to,
    subject: 'Reset your CraftXYZ admin password',
    text: `Reset your password: ${resetLink}\n\nThis link expires in 1 hour. If you didn't request this, ignore this email.`,
    html: `<p>Reset your password by clicking the link below:</p><p><a href="${resetLink}">${resetLink}</a></p><p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>`,
  });
}
