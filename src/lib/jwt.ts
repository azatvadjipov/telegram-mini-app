import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { env } from './env'

export interface JWTPayload {
  telegramUserId: string
  isSubscribed: boolean
  iat?: number
  exp?: number
}

const JWT_EXPIRATION_TIME = '10m' // 10 minutes as specified

export async function signJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  const secret = new TextEncoder().encode(env.JWT_SECRET)

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRATION_TIME)
    .sign(secret)

  return token
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const secret = new TextEncoder().encode(env.JWT_SECRET)

    const { payload } = await jwtVerify(token, secret)

    return {
      telegramUserId: (payload as any).telegramUserId,
      isSubscribed: (payload as any).isSubscribed,
      iat: (payload as any).iat,
      exp: (payload as any).exp,
    }
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}
