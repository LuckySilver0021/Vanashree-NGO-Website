import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

const AUTH_ERROR_MESSAGE = 'Invalid email or password'

function normalizeEmail(value: string) {
  return value.trim().toLowerCase()
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'your@email.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = typeof credentials?.email === 'string' ? normalizeEmail(credentials.email) : ''
        const password = typeof credentials?.password === 'string' ? credentials.password : ''

        if (!email || !password) {
          throw new Error(AUTH_ERROR_MESSAGE)
        }

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            fullName: true,
            phone: true,
            hashedPassword: true,
          },
        })

        if (!user) {
          throw new Error(AUTH_ERROR_MESSAGE)
        }

        const isPasswordValid = await bcrypt.compare(password, user.hashedPassword)

        if (!isPasswordValid) {
          throw new Error(AUTH_ERROR_MESSAGE)
        }

        return {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
        session.user.email = typeof token.email === 'string' ? token.email : null
        session.user.fullName = typeof token.fullName === 'string' ? token.fullName : null
        session.user.phone = typeof token.phone === 'string' ? token.phone : null
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
        token.email = user.email
        token.fullName = user.fullName
        token.phone = user.phone
      }
      return token
    },
  },
  pages: {
    signIn: '/auth',
    error: '/auth',
  },
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
}
