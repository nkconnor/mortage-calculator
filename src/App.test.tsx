import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

// Mock the recharts components to avoid DOM measurement issues
vi.mock('recharts', async () => {
  const actual = await vi.importActual('recharts')
  return {
    ...actual,
    ResponsiveContainer: ({ children }) => children,
    PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
    BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  }
})

// Mock the DarkModeToggle component
vi.mock('./components/DarkModeToggle', () => ({
  default: () => <button data-testid="dark-mode-toggle">Toggle Dark Mode</button>
}))

describe('Mortgage Calculator', () => {
  // Just test that the app renders without crashing
  it('renders the calculator app with dark mode toggle', () => {
    render(<App />)
    expect(screen.getByText('Advanced Mortgage Calculator')).toBeInTheDocument()
    expect(screen.getByTestId('dark-mode-toggle')).toBeInTheDocument()
  })
})