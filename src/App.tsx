import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Tab } from '@headlessui/react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import DarkModeToggle from './components/DarkModeToggle'

// Types for our funding sources
type FundingSource = {
  id: string
  name: string
  enabled: boolean
  amount: number
  monthlyContribution?: number
  interestRate?: number
  appreciationRate?: number
  rentalIncome?: number
  taxRate?: number
}

// Types for our mortgage calculator
type MortgageCalculatorFormData = {
  loanAmount: number
  interestRate: number
  loanTerm: number
  downPayment: number
  propertyValue: number
  fundingSources: FundingSource[]
}

function App() {
  // Initial funding sources
  const initialFundingSources: FundingSource[] = [
    { id: 'earned_income', name: 'Earned Income', enabled: true, amount: 5000, monthlyContribution: 3000 },
    { id: 'existing_house', name: 'Sell Existing House', enabled: false, amount: 200000, appreciationRate: 3 },
    { id: 'pledged_asset', name: 'Pledged Asset Mortgage', enabled: false, amount: 100000, interestRate: 4 },
    { id: 'rental_income', name: 'Rental Income', enabled: false, amount: 0, rentalIncome: 1500 },
    { id: 'securities', name: 'Sell Securities', enabled: false, amount: 50000, appreciationRate: 7, taxRate: 15 }
  ]

  const [fundingSources, setFundingSources] = useState<FundingSource[]>(initialFundingSources)
  const [showResults, setShowResults] = useState(false)
  const [monthlyPayment, setMonthlyPayment] = useState(0)
  const [totalInterest, setTotalInterest] = useState(0)
  const [paymentBreakdown, setPaymentBreakdown] = useState<{ name: string; value: number }[]>([])

  // Set up form
  const { control, handleSubmit, watch, setValue } = useForm<MortgageCalculatorFormData>({
    defaultValues: {
      loanAmount: 300000,
      interestRate: 4.5,
      loanTerm: 30,
      downPayment: 60000,
      propertyValue: 360000,
      fundingSources: initialFundingSources
    }
  })

  // Watch form values for real-time calculation
  const formValues = watch()
  
  // Watch specific fields to update related fields
  const watchPropertyValue = watch('propertyValue')
  const watchDownPayment = watch('downPayment')
  const watchLoanAmount = watch('loanAmount')
  
  // Use a ref to track if we're currently in an update to prevent loops
  const isUpdating = React.useRef(false);
  
  // Effect to update loan amount when property value or down payment changes,
  // but only if we're not already in the middle of an update cycle
  useEffect(() => {
    if (isUpdating.current) return;

    if (watchPropertyValue && watchDownPayment !== undefined) {
      // Calculate new loan amount based on property value minus down payment
      const calculatedLoanAmount = Math.max(0, watchPropertyValue - watchDownPayment);
      
      // Only trigger update if there's a meaningful difference
      if (Math.abs(calculatedLoanAmount - (watchLoanAmount || 0)) > 0.01) {
        try {
          isUpdating.current = true;
          setValue('loanAmount', calculatedLoanAmount);
        } finally {
          // Always reset updating flag, even if error occurs
          setTimeout(() => {
            isUpdating.current = false;
          }, 0);
        }
      }
    }
  }, [watchPropertyValue, watchDownPayment, setValue, watchLoanAmount])
  
  // Effect to update down payment when property value or loan amount changes
  useEffect(() => {
    if (isUpdating.current) return;
    
    if (watchPropertyValue && watchLoanAmount !== undefined) {
      // Calculate new down payment based on property value minus loan amount
      const calculatedDownPayment = Math.max(0, watchPropertyValue - watchLoanAmount);
      
      // Only trigger update if there's a meaningful difference
      if (Math.abs(calculatedDownPayment - (watchDownPayment || 0)) > 0.01) {
        try {
          isUpdating.current = true;
          setValue('downPayment', calculatedDownPayment);
        } finally {
          // Always reset updating flag, even if error occurs
          setTimeout(() => {
            isUpdating.current = false;
          }, 0);
        }
      }
    }
  }, [watchPropertyValue, watchLoanAmount, setValue, watchDownPayment])

  // Calculate mortgage
  const calculateMortgage = (data: MortgageCalculatorFormData) => {
    // Calculate monthly payment
    const principal = data.loanAmount
    const monthlyRate = data.interestRate / 100 / 12
    const numberOfPayments = data.loanTerm * 12
    
    const x = Math.pow(1 + monthlyRate, numberOfPayments)
    const monthly = (principal * x * monthlyRate) / (x - 1)
    
    setMonthlyPayment(monthly)
    setTotalInterest(monthly * numberOfPayments - principal)
    
    // Calculate funding source breakdown
    const totalFunding = fundingSources
      .filter(source => source.enabled)
      .reduce((acc, source) => acc + source.amount, 0)
    
    const breakdown = fundingSources
      .filter(source => source.enabled && source.amount > 0)
      .map(source => ({
        name: source.name,
        value: (source.amount / totalFunding) * data.downPayment
      }))
    
    setPaymentBreakdown(breakdown)
    setShowResults(true)
  }

  // Toggle funding source
  const toggleFundingSource = (index: number) => {
    const updatedSources = [...fundingSources]
    updatedSources[index].enabled = !updatedSources[index].enabled
    setFundingSources(updatedSources)
  }

  // Update funding source amount
  const updateFundingSourceAmount = (index: number, value: string) => {
    const updatedSources = [...fundingSources]
    // Allow empty values for better UX
    updatedSources[index].amount = value === '' ? 0 : Number(value)
    setFundingSources(updatedSources)
  }

  // Pie chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-background py-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-end mb-4">
          <DarkModeToggle />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Advanced Mortgage Calculator
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-300 sm:mt-4">
            Compare different funding sources for your mortgage
          </p>
        </div>

        <div className="mt-12 bg-white dark:bg-dark-card rounded-lg shadow overflow-hidden transition-colors duration-200">
          <form onSubmit={handleSubmit(calculateMortgage)} className="p-6 dark:text-gray-100">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="propertyValue" id="property-value-label" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Property Value ($)
                </label>
                <div className="mt-1">
                  <Controller
                    name="propertyValue"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="number"
                        {...field}
                        id="propertyValue"
                        data-testid="property-value-input"
                        aria-labelledby="property-value-label"
                        value={field.value}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Allow empty string for better UX
                          field.onChange(value === '' ? '' : Number(value));
                        }}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-dark-border dark:bg-gray-800 dark:text-white rounded-md transition-colors duration-200"
                      />
                    )}
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="loanAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Loan Amount ($)
                </label>
                <div className="mt-1">
                  <Controller
                    name="loanAmount"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="number"
                        {...field}
                        id="loanAmount"
                        name="loanAmount"
                        data-testid="loan-amount-input"
                        value={field.value}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === '' ? '' : Number(value));
                        }}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-dark-border dark:bg-gray-800 dark:text-white rounded-md transition-colors duration-200"
                      />
                    )}
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 italic">
                    Property Value - Down Payment
                  </p>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="downPayment" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Down Payment ($)
                </label>
                <div className="mt-1">
                  <Controller
                    name="downPayment"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="number"
                        {...field}
                        id="downPayment"
                        name="downPayment"
                        data-testid="down-payment-input"
                        value={field.value}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === '' ? '' : Number(value));
                        }}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-dark-border dark:bg-gray-800 dark:text-white rounded-md transition-colors duration-200"
                      />
                    )}
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 italic">
                    Property Value - Loan Amount
                  </p>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="interestRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Interest Rate (%)
                </label>
                <div className="mt-1">
                  <Controller
                    name="interestRate"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        {...field}
                        value={field.value}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === '' ? '' : Number(value));
                        }}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-dark-border dark:bg-gray-800 dark:text-white rounded-md transition-colors duration-200"
                      />
                    )}
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="loanTerm" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Loan Term (years)
                </label>
                <div className="mt-1">
                  <Controller
                    name="loanTerm"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-dark-border dark:bg-gray-800 dark:text-white rounded-md transition-colors duration-200"
                      >
                        <option value="15">15 years</option>
                        <option value="20">20 years</option>
                        <option value="30">30 years</option>
                      </select>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Funding Sources</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Select and configure your funding sources for the down payment
              </p>

              <div className="mt-4">
                <Tab.Group>
                  <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/10 dark:bg-blue-900/20 p-1 transition-colors duration-200">
                    {fundingSources.map((source, index) => (
                      <Tab
                        key={source.id}
                        className={({ selected }) =>
                          `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors duration-200
                          ${selected 
                            ? 'bg-white dark:bg-gray-700 text-blue-700 dark:text-blue-200 shadow' 
                            : 'text-blue-400 hover:bg-white/[0.12] dark:text-blue-300 hover:text-blue-600 dark:hover:text-blue-200'}`
                        }
                      >
                        {source.name}
                      </Tab>
                    ))}
                  </Tab.List>
                  <Tab.Panels className="mt-2">
                    {fundingSources.map((source, idx) => (
                      <Tab.Panel
                        key={source.id}
                        className="rounded-xl bg-white dark:bg-gray-800 p-3 transition-colors duration-200"
                      >
                        <div className="space-y-4">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id={`enable-${source.id}`}
                              checked={source.enabled}
                              onChange={() => toggleFundingSource(idx)}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded transition-colors duration-200"
                            />
                            <label htmlFor={`enable-${source.id}`} className="ml-2 block text-sm text-gray-900 dark:text-gray-200">
                              Enable {source.name}
                            </label>
                          </div>

                          <div>
                            <label htmlFor={`amount-${source.id}`} id={`amount-label-${source.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Available Amount ($)
                            </label>
                            <input
                              type="number"
                              id={`amount-${source.id}`}
                              value={source.amount}
                              onChange={(e) => updateFundingSourceAmount(idx, e.target.value)}
                              disabled={!source.enabled}
                              min="0"
                              aria-labelledby={`amount-label-${source.id}`}
                              className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-dark-border dark:bg-gray-800 dark:text-white rounded-md transition-colors duration-200"
                            />
                          </div>

                          {source.id === 'earned_income' && (
                            <div>
                              <label htmlFor="monthly-income" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Monthly Income Contribution ($)
                              </label>
                              <input
                                type="number"
                                id="monthly-income"
                                value={source.monthlyContribution}
                                onChange={(e) => {
                                  const updated = [...fundingSources];
                                  const value = e.target.value;
                                  updated[idx].monthlyContribution = value === '' ? 0 : Number(value);
                                  setFundingSources(updated);
                                }}
                                min="0"
                                disabled={!source.enabled}
                                className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-dark-border dark:bg-gray-800 dark:text-white rounded-md transition-colors duration-200"
                              />
                            </div>
                          )}

                          {source.id === 'existing_house' && (
                            <div>
                              <label htmlFor="house-appreciation" id="house-appreciation-label" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Annual Appreciation Rate (%)
                              </label>
                              <input
                                type="number"
                                step="0.1"
                                id="house-appreciation"
                                value={source.appreciationRate}
                                onChange={(e) => {
                                  const updated = [...fundingSources];
                                  const value = e.target.value;
                                  updated[idx].appreciationRate = value === '' ? 0 : Number(value);
                                  setFundingSources(updated);
                                }}
                                min="0"
                                max="100"
                                aria-labelledby="house-appreciation-label"
                                disabled={!source.enabled}
                                className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-dark-border dark:bg-gray-800 dark:text-white rounded-md transition-colors duration-200"
                              />
                            </div>
                          )}

                          {source.id === 'pledged_asset' && (
                            <div>
                              <label htmlFor="pledged-interest" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Interest Rate (%)
                              </label>
                              <input
                                type="number"
                                step="0.1"
                                id="pledged-interest"
                                value={source.interestRate}
                                onChange={(e) => {
                                  const updated = [...fundingSources];
                                  const value = e.target.value;
                                  updated[idx].interestRate = value === '' ? 0 : Number(value);
                                  setFundingSources(updated);
                                }}
                                min="0"
                                max="100"
                                disabled={!source.enabled}
                                className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-dark-border dark:bg-gray-800 dark:text-white rounded-md transition-colors duration-200"
                              />
                            </div>
                          )}

                          {source.id === 'rental_income' && (
                            <div>
                              <label htmlFor="rental-income" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Monthly Rental Income ($)
                              </label>
                              <input
                                type="number"
                                id="rental-income"
                                value={source.rentalIncome}
                                onChange={(e) => {
                                  const updated = [...fundingSources];
                                  const value = e.target.value;
                                  updated[idx].rentalIncome = value === '' ? 0 : Number(value);
                                  setFundingSources(updated);
                                }}
                                min="0"
                                disabled={!source.enabled}
                                className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-dark-border dark:bg-gray-800 dark:text-white rounded-md transition-colors duration-200"
                              />
                            </div>
                          )}

                          {source.id === 'securities' && (
                            <>
                              <div>
                                <label htmlFor="securities-appreciation" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Expected Return Rate (%)
                                </label>
                                <input
                                  type="number"
                                  step="0.1"
                                  id="securities-appreciation"
                                  value={source.appreciationRate}
                                  onChange={(e) => {
                                    const updated = [...fundingSources];
                                    const value = e.target.value;
                                    updated[idx].appreciationRate = value === '' ? 0 : Number(value);
                                    setFundingSources(updated);
                                  }}
                                  min="0"
                                  max="100"
                                  disabled={!source.enabled}
                                  className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-dark-border dark:bg-gray-800 dark:text-white rounded-md transition-colors duration-200"
                                />
                              </div>
                              <div>
                                <label htmlFor="securities-tax" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Capital Gains Tax Rate (%)
                                </label>
                                <input
                                  type="number"
                                  step="0.1"
                                  id="securities-tax"
                                  value={source.taxRate}
                                  onChange={(e) => {
                                    const updated = [...fundingSources];
                                    const value = e.target.value;
                                    updated[idx].taxRate = value === '' ? 0 : Number(value);
                                    setFundingSources(updated);
                                  }}
                                  min="0"
                                  max="100"
                                  disabled={!source.enabled}
                                  className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-dark-border dark:bg-gray-800 dark:text-white rounded-md transition-colors duration-200"
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </Tab.Panel>
                    ))}
                  </Tab.Panels>
                </Tab.Group>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                Calculate Mortgage
              </button>
            </div>
          </form>

          {showResults && (
            <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-5 space-y-6 dark:text-gray-100">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Mortgage Summary</h3>
                <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
                  <div className="bg-white dark:bg-dark-card overflow-hidden shadow rounded-lg transition-colors duration-200">
                    <div className="px-4 py-5 sm:p-6">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Monthly Payment
                      </dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                        ${monthlyPayment.toFixed(2)}
                      </dd>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-dark-card overflow-hidden shadow rounded-lg transition-colors duration-200">
                    <div className="px-4 py-5 sm:p-6">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Total Interest
                      </dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                        ${totalInterest.toFixed(2)}
                      </dd>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-dark-card overflow-hidden shadow rounded-lg transition-colors duration-200">
                    <div className="px-4 py-5 sm:p-6">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Total Cost
                      </dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                        ${(formValues.loanAmount + totalInterest).toFixed(2)}
                      </dd>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Funding Source Breakdown</h3>
                <div className="mt-5">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={paymentBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {paymentBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Monthly Payment Schedule</h3>
                <div className="mt-5">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={[
                        { name: 'Principal & Interest', amount: monthlyPayment },
                        { name: 'Property Tax', amount: formValues.propertyValue * 0.0125 / 12 },
                        { name: 'Insurance', amount: formValues.propertyValue * 0.0035 / 12 }
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                      <Legend />
                      <Bar dataKey="amount" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
