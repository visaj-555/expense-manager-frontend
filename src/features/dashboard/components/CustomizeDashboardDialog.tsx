import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DashboardCardToggles } from '@/features/dashboard/components/DashboardCardToggles'
import type { DashboardCardId, DashboardCardVisibility } from '@/features/dashboard/dashboard-cards'

interface CustomizeDashboardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  visibility: DashboardCardVisibility
  onToggle: (id: DashboardCardId, visible: boolean) => void
  onReset: () => void
}

export function CustomizeDashboardDialog({
  open,
  onOpenChange,
  visibility,
  onToggle,
  onReset,
}: CustomizeDashboardDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Customize dashboard</DialogTitle>
          <DialogDescription>
            Hide cards you do not need. Choices stay on this device.
          </DialogDescription>
        </DialogHeader>
        <DashboardCardToggles visibility={visibility} onToggle={onToggle} />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onReset}>
            Show all
          </Button>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
