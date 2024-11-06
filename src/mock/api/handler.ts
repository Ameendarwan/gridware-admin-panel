/* eslint-disable import/prefer-default-export */
// eslint-disable-next-line import/no-extraneous-dependencies
import { http } from 'msw'

export const handlers = [
  http.get('/posts', () => {}),
  http.post('/posts', () => {}),
  http.delete('/posts/:id', () => {}),
]
