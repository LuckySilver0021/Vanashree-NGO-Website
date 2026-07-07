'use client'

import { ReactNode } from 'react'

export function AuthShell({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(168,197,122,0.24),_transparent_32%),linear-gradient(135deg,_#f7f8f2_0%,_#eef2e6_50%,_#f9f4e8_100%)]">{children}</div>
}
