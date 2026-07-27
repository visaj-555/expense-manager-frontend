import { useEffect, useRef, useState } from 'react'
import type { ClipboardEvent, KeyboardEvent } from 'react'
import { Loader2 } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useResendOtp } from '@/hooks/auth/useResendOtp'
import { useVerifyOtp } from '@/hooks/auth/useVerifyOtp'
import { getErrorMessage } from '@/utils/errorUtils'

const RESEND_COOLDOWN = 60

function OtpInput({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled?: boolean }) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])
  const digits = value.padEnd(6, ' ').slice(0, 6).split('')

  const handleChange = (index: number, inputValue: string) => {
    const digit = inputValue.replace(/\D/g, '').slice(-1)
    const next = digits.map((d, i) => (i === index ? digit : d === ' ' ? '' : d)).join('')
    onChange(next.replace(/\s/g, '').slice(0, 6))
    if (digit && index < 5) inputsRef.current[index + 1]?.focus()
  }

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !digits[index]?.trim() && index > 0) inputsRef.current[index - 1]?.focus()
  }

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault()
    onChange(event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6))
  }

  return (
    <div className="flex justify-center gap-2">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => { inputsRef.current[index] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          disabled={disabled}
          className={cn('size-12 rounded-lg border bg-background text-center text-lg font-semibold focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none')}
          value={digit.trim()}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
        />
      ))}
    </div>
  )
}

export default function VerifyOtpForm() {
  const location = useLocation()
  const navigate = useNavigate()
  const email = (location.state as { email?: string } | null)?.email ?? ''
  const [otp, setOtp] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const verifyOtp = useVerifyOtp()
  const resendOtp = useResendOtp()

  useEffect(() => { if (!email) navigate('/register', { replace: true }) }, [email, navigate])
  useEffect(() => {
    if (cooldown <= 0) return
    const t = window.setInterval(() => setCooldown((v) => v - 1), 1000)
    return () => window.clearInterval(t)
  }, [cooldown])

  if (!email) return null

  return (
    <form onSubmit={(e) => { e.preventDefault(); if (otp.length === 6) verifyOtp.mutate({ email, otp }) }} className="space-y-6">
      <p className="text-center text-sm text-muted-foreground">Code sent to <span className="font-medium text-foreground">{email}</span></p>
      {verifyOtp.isError ? <Alert variant="destructive"><AlertDescription>{getErrorMessage(verifyOtp.error)}</AlertDescription></Alert> : null}
      <OtpInput value={otp} onChange={setOtp} disabled={verifyOtp.isPending} />
      <Button type="submit" className="w-full" size="lg" disabled={otp.length !== 6 || verifyOtp.isPending}>
        {verifyOtp.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
        Verify email
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Didn&apos;t receive it?{' '}
        <Button type="button" variant="link" className="h-auto p-0" disabled={cooldown > 0 || resendOtp.isPending} onClick={() => {
          resendOtp.mutate({ email, otpType: 'EMAIL_VERIFICATION' }, { onSuccess: () => setCooldown(RESEND_COOLDOWN) })
        }}>
          {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
        </Button>
      </p>
    </form>
  )
}
