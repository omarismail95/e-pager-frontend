'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@epager/ui'
import { createLoyaltyClient } from '@epager/api-client/loyalty'

const schema = z.object({
  code: z.string().min(2).max(20).regex(/^[A-Z0-9_]+$/, 'Use uppercase letters, digits, underscores'),
  name: z.string().min(2),
  description: z.string().optional(),
  provider: z.enum(['POINTS', 'STAMPS', 'CASHBACK']),
  applyMode: z.enum(['AUTO', 'MANUAL', 'OPT_IN']),
  pointsPerOrder: z.coerce.number().min(0).optional(),
})

type FormValues = z.infer<typeof schema>

interface CreateProgramModalProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  onCreated: () => void
}

export function CreateProgramModal({ open, onOpenChange, onCreated }: CreateProgramModalProps) {
  const [error, setError] = useState<string | null>(null)
  const client = createLoyaltyClient()

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { provider: 'POINTS', applyMode: 'AUTO', pointsPerOrder: 10 },
  })

  async function onSubmit(values: FormValues) {
    setError(null)
    try {
      const requestId = crypto.randomUUID()
      const res = await client.POST('/api/loyalty/programs' as never, {
        body: { requestId, ...values } as never,
      })
      if ((res as { error?: unknown }).error) throw new Error('Failed')
      reset()
      onCreated()
      onOpenChange(false)
    } catch {
      setError('Failed to create program. Please try again.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Loyalty Program</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Code</Label>
              <Input {...register('code')} placeholder="COFFEE_REWARDS" className="uppercase" />
              {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input {...register('name')} placeholder="Coffee Rewards" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Description (optional)</Label>
            <Input {...register('description')} placeholder="Earn points on every order" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Provider</Label>
              <Select defaultValue="POINTS" onValueChange={(v) => setValue('provider', v as FormValues['provider'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="POINTS">Points</SelectItem>
                  <SelectItem value="STAMPS">Stamps</SelectItem>
                  <SelectItem value="CASHBACK">Cashback</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Apply Mode</Label>
              <Select defaultValue="AUTO" onValueChange={(v) => setValue('applyMode', v as FormValues['applyMode'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="AUTO">Auto</SelectItem>
                  <SelectItem value="MANUAL">Manual</SelectItem>
                  <SelectItem value="OPT_IN">Opt-in</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Points per Order</Label>
            <Input type="number" min={0} {...register('pointsPerOrder')} className="w-28" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating…' : 'Create Program'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
