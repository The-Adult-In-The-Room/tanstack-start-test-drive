import { useState } from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { desc } from 'drizzle-orm'
import { z } from 'zod'
import { Plus } from 'lucide-react'
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
import { useAppForm } from '@/hooks/demo.form'

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
  .inputValidator(
    (data: { title: string; subtitle: string; game: string; text: string }) =>
      data,
  )
  .handler(async ({ data }) => {
    await db.insert(loresTable).values({
      title: data.title,
      subtitle: data.subtitle || 'N/A',
      game: data.game || 'N/A',
      text: data.text,
    })
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
        await createLore({ data: value })
        router.invalidate()
        form.reset()
        setOpen(false)
      } catch (error) {
        console.error('Failed to create lore:', error)
      }
    },
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <section className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Add Button */}
          <div className="mb-8 flex justify-between items-center">
            <h1 className="text-4xl font-bold text-white">Lore Collection</h1>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-slate-600 hover:bg-slate-500 text-white font-semibold">
                  <Plus className="mr-2 h-5 w-5" />
                  Add Lore
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-700 border-2 border-slate-500 text-white max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-white">
                    Add New Lore
                  </DialogTitle>
                  <DialogDescription className="text-slate-300">
                    Create a new lore entry for your collection.
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
                      <form.SubscribeButton label="Create Lore" />
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
                  <CardTitle className="text-white">{card.title}</CardTitle>
                  <CardDescription className="text-slate-300">
                    {card.subtitle !== 'N/A' && card.subtitle}
                  </CardDescription>
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
