"use client"

import { useEffect, useState } from 'react'
import { ConfettiOverlay } from '@/components/motion/ConfettiOverlay'

type MsgType = 'success' | 'error'

declare global {
  interface Window {
    showAppMessage?: (message: string, type?: MsgType, duration?: number) => void
  }
}

export default function GlobalErrorHandler() {
  const [visible, setVisible] = useState(false)
  const [message, setMessage] = useState('')
  const [type, setType] = useState<MsgType>('error')
  const [duration, setDuration] = useState(3000)

  useEffect(() => {
    const show = (msg: string, t: MsgType = 'error', d = 3000) => {
      setMessage(msg)
      setType(t)
      setDuration(d)
      setVisible(true)
    }

    // expose utility for other parts of app — only this API will show messages to users
    window.showAppMessage = (m: string, t: MsgType = 'error', d = 3000) => show(m, t, d)


    return () => {
      delete window.showAppMessage
    }
  }, [])

  return (
    <>
      {visible && (
        <ConfettiOverlay
          message={message}
          type={type}
          duration={duration}
          onComplete={() => setVisible(false)}
        />
      )}
    </>
  )
}
