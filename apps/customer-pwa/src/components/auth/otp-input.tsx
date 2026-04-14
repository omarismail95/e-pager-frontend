'use client'

import { useRef, type KeyboardEvent, type ClipboardEvent } from 'react'
import { cn } from '@epager/ui'

interface OtpInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function OtpInput({ length = 6, value, onChange, disabled }: OtpInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])
  const digits = value.split('').slice(0, length)
  const padded = Array.from({ length }, (_, i) => digits[i] ?? '')

  function handleChange(index: number, char: string) {
    const newDigits = [...padded]
    newDigits[index] = char.slice(-1).replace(/\D/, '')
    onChange(newDigits.join(''))
    if (char && index < length - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      if (!padded[index] && index > 0) {
        inputsRef.current[index - 1]?.focus()
        const newDigits = [...padded]
        newDigits[index - 1] = ''
        onChange(newDigits.join(''))
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    onChange(text.padEnd(length, ''))
    const focusIndex = Math.min(text.length, length - 1)
    inputsRef.current[focusIndex]?.focus()
  }

  return (
    <div className="flex gap-2" role="group" aria-label="OTP input">
      {padded.map((digit, index) => (
        <input
          key={index}
          ref={(el) => { inputsRef.current[index] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          disabled={disabled}
          className={cn(
            'h-12 w-12 rounded-lg border-2 bg-card text-center text-xl font-bold transition-colors focus:border-primary focus:outline-none',
            digit ? 'border-primary/60' : 'border-input',
            disabled && 'opacity-50',
          )}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          aria-label={`Digit ${index + 1}`}
        />
      ))}
    </div>
  )
}
