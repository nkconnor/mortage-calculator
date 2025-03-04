# Advanced Mortgage Calculator

A flexible mortgage calculator web application that helps users compare different funding sources for their mortgage payments.

## Features

- Compare multiple funding sources:
  - Normal earned income
  - Selling an existing house
  - Pledged asset mortgage
  - Renting an existing house
  - Selling securities
- Dynamically adjust parameters for all funding sources
- Interactive visualization of funding breakdown
- Detailed mortgage payment analysis

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer)
- npm (included with Node.js)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd mortgage-calculator
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173/
   ```
   (The port might be different if 5173 is already in use)

## Usage

1. Enter your mortgage details in the top section:
   - Property value
   - Loan amount
   - Down payment
   - Interest rate
   - Loan term (years)

2. Configure your funding sources by clicking on each tab:
   - Enable/disable different funding sources
   - Set available amounts for each source
   - Configure source-specific parameters (e.g., interest rates, appreciation rates, rental income)

3. Click "Calculate Mortgage" to see your results:
   - Monthly payment
   - Total interest
   - Total cost
   - Visual breakdown of funding sources
   - Monthly payment schedule

## Development

### Running Tests

Run the test suite:
```
npm test
```

Run tests in watch mode:
```
npm run test:watch
```

Get test coverage:
```
npm run test:coverage
```

### Building for Production

Build the application for production:
```
npm run build
```

Preview the production build:
```
npm run preview
```

## Technologies Used

- React with TypeScript
- Tailwind CSS for styling
- React Hook Form for form management
- Headless UI for accessible components
- Recharts for data visualization
- Vitest and Testing Library for testing

## License

[MIT](LICENSE)

---

## Technical Details for Developers

This project was built with Vite + React + TypeScript, providing:
- Fast development server with HMR (Hot Module Replacement)
- TypeScript support for type safety
- Modern React features and patterns

### ESLint Configuration

For enhanced linting and code quality, consider updating the ESLint configuration:

```js
export default tseslint.config({
  extends: [
    ...tseslint.configs.recommendedTypeChecked,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

For React-specific lint rules, you can add:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
