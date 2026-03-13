import nodemailer from 'nodemailer'
import { prisma } from './prisma'

async function getSmtpConfig() {
  const configs = await prisma.appConfig.findMany({
    where: { key: { in: ['smtp_host', 'smtp_port', 'smtp_email', 'smtp_password', 'smtp_secure'] } }
  })
  const map = Object.fromEntries(configs.map(c => [c.key, c.value]))
  return {
    host: map.smtp_host || process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(map.smtp_port || process.env.SMTP_PORT || '587'),
    email: map.smtp_email || process.env.SMTP_EMAIL || '',
    password: map.smtp_password || process.env.SMTP_PASSWORD || '',
    secure: (map.smtp_secure || process.env.SMTP_SECURE || 'false') === 'true',
  }
}

async function getOtpExpiry(): Promise<number> {
  const config = await prisma.appConfig.findUnique({ where: { key: 'otp_expiry_minutes' } })
  return parseInt(config?.value || process.env.OTP_EXPIRY_MINUTES || '10')
}

export async function sendOtpEmail(email: string, otp: string): Promise<void> {
  const smtp = await getSmtpConfig()
  const expiry = await getOtpExpiry()

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: { user: smtp.email, pass: smtp.password },
  })

  await transporter.sendMail({
    from: `"SEISAD" <${smtp.email}>`,
    to: email,
    subject: 'Your SEISAD Password Reset Code',
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #0284c7;">Password Reset</h2>
        <p>Your one-time password (OTP) is:</p>
        <div style="background: #f0f9ff; border: 2px solid #0ea5e9; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0284c7;">${otp}</span>
        </div>
        <p>This code expires in <strong>${expiry} minutes</strong>.</p>
        <p style="color: #6b7280; font-size: 14px;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
  })
}

export async function generateOtp(userId: string): Promise<string> {
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const expiry = await getOtpExpiry()
  const expiresAt = new Date(Date.now() + expiry * 60 * 1000)

  await prisma.user.update({
    where: { id: userId },
    data: { otpCode: otp, otpExpiresAt: expiresAt },
  })

  return otp
}

