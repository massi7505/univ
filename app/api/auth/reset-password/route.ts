import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { VerifyOtpSchema } from '@/lib/validations'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = VerifyOtpSchema.parse(body)

    const user = await prisma.user.findUnique({ where: { email: data.email } })
    if (!user || !user.otpCode || !user.otpExpiresAt) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 })
    }

    if (new Date() > user.otpExpiresAt) {
      await prisma.user.update({ where: { id: user.id }, data: { otpCode: null, otpExpiresAt: null } })
      return NextResponse.json({ error: 'OTP has expired' }, { status: 400 })
    }

    if (user.otpCode !== data.otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 })
    }

    const hashed = await bcrypt.hash(data.newPassword, 12)
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed, otpCode: null, otpExpiresAt: null },
    })

    return NextResponse.json({ message: 'Password reset successfully' })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

