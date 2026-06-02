import { Resend } from 'resend';

const resend = new Resend('re_F3kQnS2R_PaWreTPt6j6K3jUeJXispfJK');
const email = 'meyerockert2@gmail.com';
const encodedEmail = encodeURIComponent(email);

const r = await resend.emails.send({
  from: 'program@brandscaling.co.za',
  to: email,
  subject: 'Your account is ready — set your password',
  html: `
    <div style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;background:#000;color:#fff;padding:40px;">
      <h1 style="color:#FF6B00;font-size:28px;margin-bottom:8px;">Welcome to the program.</h1>
      <p style="color:#888;margin-bottom:32px;">JvR Brand Scaling Program</p>
      <p style="font-size:16px;line-height:1.6;">Hey Meyer,</p>
      <p style="font-size:16px;line-height:1.6;color:#ccc;">Your <strong style="color:#FF6B00;">Mentorship</strong> account has been created. Click below to set your password and get access immediately:</p>
      <a href="https://program.brandscaling.co.za/welcome?email=${encodedEmail}" style="display:inline-block;background:#FF6B00;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;margin:16px 0;">Set Your Password →</a>
      <p style="font-size:14px;color:#555;margin-top:32px;border-top:1px solid #222;padding-top:24px;">If you have any issues, reply to this email.</p>
      <p style="font-size:14px;color:#555;">JvR Brand Scaling Program · brandscaling.co.za</p>
    </div>
  `
});

console.log('✅ Email sent:', r);
