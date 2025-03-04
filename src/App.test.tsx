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
  
  it('handles numeric inputs correctly', () => {
    render(<App />)
    
    // Test property value input - use the ID instead of aria-label
    const propertyValueInput = screen.getByTestId('property-value-input')
    expect(propertyValueInput).toBeInTheDocument()
    
    // Check if we can update the value
    fireEvent.change(propertyValueInput, { target: { value: '400000' } })
    expect(propertyValueInput).toHaveValue(400000)
    
    // Check with leading zeros - should convert to number
    fireEvent.change(propertyValueInput, { target: { value: '0400000' } })
    expect(propertyValueInput).toHaveValue(400000)
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
  
  it('handles funding source numeric inputs', () => {
    render(<App />)
    
    // First, click on the "Sell Existing House" tab and enable it
    const houseTab = screen.getByText('Sell Existing House')
    fireEvent.click(houseTab)
    
    const checkbox = screen.getByLabelText('Enable Sell Existing House')
    fireEvent.click(checkbox)
    
    // Test amount input by getting all number inputs and selecting the first one
    const inputs = screen.getAllByRole('spinbutton')
    const amountInput = inputs[0] // First spinbutton in the tab panel
    expect(amountInput).toBeInTheDocument()
    
    // Check if we can update the value
    fireEvent.change(amountInput, { target: { value: '250000' } })
    expect(amountInput).toHaveValue(250000)
    
    // Test appreciation rate input (second spinbutton in the tab panel)
    const rateInput = inputs[1]
    expect(rateInput).toBeInTheDocument()
    
    // Check if we can update the rate with decimal
    fireEvent.change(rateInput, { target: { value: '4.5' } })
    expect(rateInput).toHaveValue(4.5)
  })
})