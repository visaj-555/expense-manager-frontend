import { useState } from 'react'
import { FolderOpen, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState, ErrorState } from '@/components/shared/States'
import { CategoryFormDialog } from '@/features/categories/components/CategoryFormDialog'
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from '@/features/categories/hooks/useCategories'
import { CATEGORY_TYPE_LABELS } from '@/constants/enums'
import type { Category, CategoryType } from '@/types/category.types'
import { getErrorMessage } from '@/utils/errorUtils'

export default function CategoriesPage() {
  const [typeFilter, setTypeFilter] = useState<CategoryType | 'ALL'>('ALL')
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)

  const { data, isLoading, isError, error, refetch } = useCategories({
    page: 1,
    limit: 100,
    type: typeFilter === 'ALL' ? undefined : typeFilter,
    search: search || undefined,
    isArchived: false,
  })

  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()

  const handleSubmit = (values: { name: string; type: CategoryType; icon?: string; color?: string }) => {
    const payload = {
      ...values,
      icon: values.icon || undefined,
      color: values.color || undefined,
    }

    if (editing) {
      updateCategory.mutate(
        { id: editing.id, payload },
        {
          onSuccess: () => { toast.success('Category updated'); setDialogOpen(false); setEditing(null) },
          onError: (err) => toast.error(getErrorMessage(err)),
        },
      )
    } else {
      createCategory.mutate(payload, {
        onSuccess: () => { toast.success('Category created'); setDialogOpen(false) },
        onError: (err) => toast.error(getErrorMessage(err)),
      })
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description="Organize transactions by income and expense categories."
        action={
          <Button onClick={() => { setEditing(null); setDialogOpen(true) }}>
            <Plus className="size-4" /> Add Category
          </Button>
        }
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={typeFilter} onValueChange={(v) => setTypeFilter(v as CategoryType | 'ALL')}>
          <TabsList>
            <TabsTrigger value="ALL">All</TabsTrigger>
            <TabsTrigger value="EXPENSE">Expense</TabsTrigger>
            <TabsTrigger value="INCOME">Income</TabsTrigger>
          </TabsList>
        </Tabs>
        <Input placeholder="Search categories..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : !data?.data.length ? (
        <EmptyState icon={FolderOpen} title="No categories" description="Create categories to label your transactions." actionLabel="Add Category" onAction={() => setDialogOpen(true)} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.data.map((cat) => (
            <Card key={cat.id} className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <span
                    className="flex size-10 items-center justify-center rounded-lg text-lg"
                    style={{ backgroundColor: `${cat.color ?? '#0d9488'}20`, color: cat.color ?? '#0d9488' }}
                  >
                    {cat.icon ?? '📁'}
                  </span>
                  <div>
                    <p className="font-medium">{cat.name}</p>
                    <Badge variant={cat.type === 'INCOME' ? 'success' : 'secondary'}>{CATEGORY_TYPE_LABELS[cat.type]}</Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8"><MoreHorizontal className="size-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => { setEditing(cat); setDialogOpen(true) }}><Pencil className="size-4" /> Edit</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => {
                      if (confirm(`Delete "${cat.name}"?`)) {
                        deleteCategory.mutate(cat.id, {
                          onSuccess: () => toast.success('Deleted'),
                          onError: (err) => toast.error(getErrorMessage(err)),
                        })
                      }
                    }}><Trash2 className="size-4" /> Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CategoryFormDialog open={dialogOpen} onOpenChange={setDialogOpen} category={editing} onSubmit={handleSubmit} isLoading={createCategory.isPending || updateCategory.isPending} />
    </div>
  )
}
