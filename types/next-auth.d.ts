import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email?: string | null
      fullName?: string | null
      phone?: string | null
    }
  }

  interface User {
    id: string
    email: string
    fullName: string
    phone: string
  }
}
