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
    subject: 'Votre code de réinitialisation SEISAD',
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 500px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #7c3aed, #4f46e5); padding: 32px 24px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700;">Réinitialisation du mot de passe</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">SEISAD — Gestion des produits chimiques</p>
        </div>
        <div style="padding: 32px 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="color: #374151; font-size: 15px; margin: 0 0 16px;">Bonjour,</p>
          <p style="color: #374151; font-size: 15px; margin: 0 0 24px;">
            Vous avez demandé la réinitialisation de votre mot de passe. Utilisez le code ci-dessous pour continuer :
          </p>
          <div style="background: #f5f3ff; border: 2px solid #7c3aed; border-radius: 12px; padding: 24px; text-align: center; margin: 0 0 24px;">
            <p style="color: #6d28d9; font-size: 12px; font-weight: 600; letter-spacing: 2px; margin: 0 0 8px; text-transform: uppercase;">Votre code de vérification</p>
            <span style="font-size: 38px; font-weight: 800; letter-spacing: 12px; color: #7c3aed;">${otp}</span>
          </div>
          <p style="color: #374151; font-size: 14px; margin: 0 0 8px;">
            ⏱ Ce code expire dans <strong>${expiry} minute${expiry > 1 ? 's' : ''}</strong>.
          </p>
          <p style="color: #6b7280; font-size: 13px; margin: 0 0 24px;">
            Si vous n'avez pas demandé cette réinitialisation, ignorez simplement cet e-mail. Votre mot de passe restera inchangé.
          </p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 0 0 16px;" />
          <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">
            Cet e-mail a été envoyé automatiquement, merci de ne pas y répondre.
          </p>
        </div>
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

