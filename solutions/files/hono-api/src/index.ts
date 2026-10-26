import { Hono } from 'hono'

const app = new Hono()

// tasklog の tasks.json と同じ形。保存先（D1 や KV）はまだ持たない
const tasks = [
  { id: 1, title: '牛乳を買う', due: '2026-10-25', done: false },
  { id: 2, title: '請求書を送る', due: null, done: true },
]

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/api/tasks', (c) => {
  return c.json(tasks)
})

export default app
