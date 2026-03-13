import { z } from 'zod'

export const LoginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
})

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email'),
})

export const VerifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
})

const MASS_UNITS = ['kg', 'g', 'mg', 'µg', 'ng'] as const
const VOLUME_UNITS = ['L', 'dL', 'cL', 'mL', 'µL'] as const
export const ALL_UNITS = [...MASS_UNITS, ...VOLUME_UNITS] as const

export const ProductSchema = z.object({
  cas: z.string().optional().nullable(),
  name: z.string().min(1, 'Name is required'),
  molarMass: z.number().optional().nullable(),
  stock: z.string().optional().nullable(),
  packagingValue: z.number().optional().nullable(),
  packagingUnit: z.enum(ALL_UNITS).optional().nullable(),
  brand: z.string().optional().nullable(),
  toxic: z.boolean().default(false),
  cmr: z.boolean().default(false),
  explosive:       z.boolean().default(false),
  flammable:       z.boolean().default(false),
  oxidizing:       z.boolean().default(false),
  gasPressure:     z.boolean().default(false),
  corrosive:       z.boolean().default(false),
  harmfulIrritant: z.boolean().default(false),
  healthHazard:    z.boolean().default(false),
  envHazard:       z.boolean().default(false),
  purityPercent: z.number().min(0).max(1).optional().nullable(),
  physicalState: z.string().optional().nullable(),
  comment: z.string().optional().nullable(),
  globalStockType: z.string().optional().nullable(),
  active: z.boolean().default(true),
  shelfId: z.string().min(1, 'Shelf is required'),
})

export const BuildingSchema = z.object({
  name: z.string().min(1, 'Name is required'),
})

export const RoomSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  buildingId: z.string().min(1, 'Building is required'),
})

export const CabinetSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  roomId: z.string().min(1, 'Room is required'),
  type: z.enum(['CABINET', 'FRIDGE', 'FREEZER']).default('CABINET'),
})

export const ShelfSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  cabinetId: z.string().min(1, 'Cabinet is required'),
})

export const UserCreateSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['ADMIN', 'STUDENT']).default('STUDENT'),
})

export const SmtpConfigSchema = z.object({
  smtp_host: z.string().min(1),
  smtp_port: z.string(),
  smtp_email: z.string().email(),
  smtp_password: z.string(),
  smtp_secure: z.string(),
})

export const OtpConfigSchema = z.object({
  otp_expiry_minutes: z.string(),
})

