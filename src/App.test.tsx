import { describe, it, expect } from 'vitest'
import App from './App'
import { render, screen } from '../tests/utils'

describe('App', () => {
  it('example test: renders without crashing', () => {
    render(<App />)

    const linkElement = screen.getByText(/Template/i)
    expect(linkElement).toBeInTheDocument()
  })
})
