import { http } from 'msw'

export const handlers = [
  http.get('/posts', () => {}),
  http.post('/posts', () => {}),
  http.delete('/posts/:id', () => {}),
]
