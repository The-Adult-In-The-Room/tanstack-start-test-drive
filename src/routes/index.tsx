import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { desc } from 'drizzle-orm'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { db } from '@/db'
import { loresTable } from '@/db/schema'

const getLores = createServerFn({
  method: 'GET',
}).handler(async () => {
  return await db.query.loresTable.findMany({
    orderBy: [desc(loresTable.createdAt)],
  })
})

export const Route = createFileRoute('/')({
  component: App,
  loader: async () => await getLores(),
})

function App() {
  const lores = Route.useLoaderData()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <section className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto">
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
