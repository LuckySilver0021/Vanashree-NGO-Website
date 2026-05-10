'use client'

import { useState } from 'react'
import { IconCopy, IconCheck } from '@tabler/icons-react'

interface CopyButtonProps {
  value: string
  label?: string
}

export function CopyButton({ value, label }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback for older browsers
      const el = document.createElement('textarea')
      el.value = value
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      onClick={handleCopy}
      title={`Copy ${label ?? value}`}
      className="w-8 h-8 rounded-lg bg-gold/10 hover:bg-gold/20 flex items-center justify-center text-gold transition-all duration-200 shrink-0"
    >
      {copied ? <IconCheck size={15} /> : <IconCopy size={15} />}
    </button>
  )
}
