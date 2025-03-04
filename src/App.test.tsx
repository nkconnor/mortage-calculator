import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
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

describe('Mortgage Calculator', () => {
  beforeEach(() => {
    // Reset mocks between tests
    vi.clearAllMocks()
  })

  it('renders the calculator form', () => {
    render(<App />)
    expect(screen.getByText('Advanced Mortgage Calculator')).toBeInTheDocument()
    expect(screen.getByText('Property Value ($)')).toBeInTheDocument()
    expect(screen.getByText('Loan Amount ($)')).toBeInTheDocument()
    expect(screen.getByText('Down Payment ($)')).toBeInTheDocument()
    expect(screen.getByText('Interest Rate (%)')).toBeInTheDocument()
    expect(screen.getByText('Loan Term (years)')).toBeInTheDocument()
  })

  it('shows funding sources tabs', () => {
    render(<App />)
    expect(screen.getByText('Earned Income')).toBeInTheDocument()
    expect(screen.getByText('Sell Existing House')).toBeInTheDocument()
    expect(screen.getByText('Pledged Asset Mortgage')).toBeInTheDocument()
    expect(screen.getByText('Rental Income')).toBeInTheDocument()
    expect(screen.getByText('Sell Securities')).toBeInTheDocument()
  })

  it('has a calculate mortgage button', () => {
    render(<App />)
    
    // Find the button
    const calculateButton = screen.getByText('Calculate Mortgage')
    expect(calculateButton).toBeInTheDocument()
  })

  it('toggles funding sources when clicked', () => {
    render(<App />)
    
    // First, click on the "Sell Existing House" tab
    const houseTab = screen.getByText('Sell Existing House')
    fireEvent.click(houseTab)
    
    // Find the checkbox and toggle it
    const checkbox = screen.getByLabelText('Enable Sell Existing House')
    expect(checkbox).not.toBeChecked()
    
    fireEvent.click(checkbox)
    expect(checkbox).toBeChecked()
  })
})