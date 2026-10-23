import { useState } from 'react'
import { useAccounts } from '@/features/accounts/hooks/useAccounts'
import { TransferActionButton, TransfersPanel } from '@/features/transfers/components/TransfersPanel'
import { PageHeader } from '@/components/shared/PageHeader'

export default function TransfersPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const { data: accountsData } = useAccounts({ page: 1, limit: 100, isArchived: false })
  const accounts = accountsData?.data ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transfers"
        description="Move money from one account to another. The source is deducted and the destination is credited. This is not spending or income."
        action={<TransferActionButton onClick={() => setDialogOpen(true)} />}
      />
      <TransfersPanel accounts={accounts} dialogOpen={dialogOpen} onDialogOpenChange={setDialogOpen} />
    </div>
  )
}
