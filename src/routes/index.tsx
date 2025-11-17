import { useState } from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { desc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import type { Lore } from '@/db/schema'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { db } from '@/db'
import { loresTable } from '@/db/schema'
import { useAppForm } from '@/hooks/form'

type LoreFormData = Pick<Lore, 'title' | 'subtitle' | 'game' | 'text'>

const getLores = createServerFn({
  method: 'GET',
}).handler(async () => {
  return await db.query.loresTable.findMany({
    orderBy: [desc(loresTable.createdAt)],
  })
})

const createLore = createServerFn({
  method: 'POST',
})
  .inputValidator((data: LoreFormData) => data)
  .handler(async ({ data }) => {
    await db.insert(loresTable).values({
      title: data.title,
      subtitle: data.subtitle || 'N/A',
      game: data.game || 'N/A',
      text: data.text,
    })
    return { success: true }
  })

const updateLore = createServerFn({
  method: 'POST',
})
  .inputValidator((data: Pick<Lore, 'id'> & LoreFormData) => data)
  .handler(async ({ data }) => {
    await db
      .update(loresTable)
      .set({
        title: data.title,
        subtitle: data.subtitle || 'N/A',
        game: data.game || 'N/A',
        text: data.text,
      })
      .where(eq(loresTable.id, data.id))
    return { success: true }
  })

const deleteLore = createServerFn({
  method: 'POST',
})
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    await db.delete(loresTable).where(eq(loresTable.id, data.id))
    return { success: true }
  })

export const Route = createFileRoute('/')({
  component: App,
  loader: async () => await getLores(),
})

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string(),
  game: z.string(),
  text: z.string().min(1, 'Text is required'),
})

function App() {
  const router = useRouter()
  const lores = Route.useLoaderData()
  const [open, setOpen] = useState(false)
  const [editingLore, setEditingLore] = useState<Pick<
    Lore,
    'id' | 'title' | 'subtitle' | 'game' | 'text'
  > | null>(null)

  const form = useAppForm({
    defaultValues: {
      title: '',
      subtitle: '',
      game: '',
      text: '',
    },
    validators: {
      onChange: schema,
    },
    onSubmit: async ({ value }) => {
      try {
        if (editingLore) {
          await updateLore({ data: { id: editingLore.id, ...value } })
        } else {
          await createLore({ data: value })
        }
        router.invalidate()
        form.reset()
        setOpen(false)
        setEditingLore(null)
      } catch (error) {
        console.error('Failed to save lore:', error)
      }
    },
  })

  const handleEdit = (
    lore: Pick<Lore, 'id' | 'title' | 'subtitle' | 'game' | 'text'>,
  ) => {
    setEditingLore(lore)
    form.setFieldValue('title', lore.title)
    form.setFieldValue('subtitle', lore.subtitle === 'N/A' ? '' : lore.subtitle)
    form.setFieldValue('game', lore.game === 'N/A' ? '' : lore.game)
    form.setFieldValue('text', lore.text)
    setOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this lore?')) {
      try {
        await deleteLore({ data: { id } })
        router.invalidate()
      } catch (error) {
        console.error('Failed to delete lore:', error)
      }
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      setEditingLore(null)
      form.reset()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <section className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Add Button */}
          <div className="mb-8 flex justify-between items-center">
            <h1 className="text-4xl font-bold text-white">
              Where the lore lives
            </h1>
            <Dialog open={open} onOpenChange={handleOpenChange}>
              <DialogTrigger asChild>
                <Button className="bg-slate-600 hover:bg-slate-500 text-white font-semibold">
                  <Plus className="mr-2 h-5 w-5" />
                  Add Lore
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-700 border-2 border-slate-500 text-white max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-white">
                    {editingLore ? 'Edit Lore' : 'Add New Lore'}
                  </DialogTitle>
                  <DialogDescription className="text-slate-300">
                    Catch me up on that lore you been holdin' back
                  </DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    form.handleSubmit()
                  }}
                  className="space-y-4 mt-4"
                >
                  <form.AppField name="title">
                    {(field) => <field.TextField label="Title" />}
                  </form.AppField>

                  <form.AppField name="subtitle">
                    {(field) => <field.TextField label="Subtitle (optional)" />}
                  </form.AppField>

                  <form.AppField name="game">
                    {(field) => <field.TextField label="Game (optional)" />}
                  </form.AppField>

                  <form.AppField name="text">
                    {(field) => <field.TextArea label="Text" />}
                  </form.AppField>

                  <div className="flex justify-end">
                    <form.AppForm>
                      <form.SubscribeButton
                        label={editingLore ? 'Update Lore' : 'Create Lore'}
                      />
                    </form.AppForm>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lores.map((card) => (
              <Card
                key={card.id}
                className="bg-slate-700/80 border-slate-600 hover:bg-slate-700 hover:shadow-2xl hover:border-slate-500 transition-all"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-white">{card.title}</CardTitle>
                      <CardDescription className="text-slate-300">
                        {card.subtitle !== 'N/A' && card.subtitle}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2 ml-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(card)}
                        className="h-8 w-8 text-slate-300 hover:text-white hover:bg-slate-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(card.id)}
                        className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-900/30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-300 mb-2">{card.game}</p>
                  <p className="text-sm text-slate-100">{card.text}</p>
                  <p className="text-xs text-slate-400 mt-4">
                    {new Date(card.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
