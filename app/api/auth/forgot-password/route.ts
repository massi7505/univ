import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateOtp, sendOtpEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { email } })
    // Always return success to prevent user enumeration
    if (!user) return NextResponse.json({ message: 'If that email exists, an OTP was sent.' })

    const otp = await generateOtp(user.id)
    await sendOtpEmail(email, otp)

    return NextResponse.json({ message: 'OTP sent to your email.' })
  } catch (err) {
    console.error('OTP error:', err)
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 })
  }
}

