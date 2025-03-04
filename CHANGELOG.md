# Changelog

All notable changes to the Mortgage Calculator project will be documented in this file.

## [Unreleased]

### Planned Features
- Save/load functionality for different scenarios
- Amortization schedule
- Export results as PDF
- Dark mode support
- Mobile-responsive layout improvements

### Added
- Initial project setup with Vite, React, and TypeScript
- Mortgage calculator core functionality
  - Property value, loan amount, down payment, interest rate, and loan term inputs
  - Monthly payment calculation
  - Total interest calculation
  - Total cost calculation
- Multiple funding sources for mortgage payments:
  - Normal earned income
  - Selling an existing house
  - Pledged asset mortgage
  - Renting an existing house
  - Selling securities
- Dynamic parameter adjustment for all funding sources
- Interactive visualization with charts
  - Funding source breakdown pie chart
  - Monthly payment breakdown bar chart
- Tab-based interface for switching between funding sources
- Tailwind CSS for styling
- Testing setup with Vitest and React Testing Library
- Documentation with comprehensive README

### Fixed
- Form input handling for numeric values with leading zeros
- Added proper ARIA attributes for improved accessibility
- Fixed recursion issues in linked fields (property value, loan amount, down payment)

### Enhanced
- Linked Property Value, Loan Amount, and Down Payment fields
  - Automatic calculation of Loan Amount when Property Value or Down Payment changes
  - Automatic calculation of Down Payment when Property Value or Loan Amount changes
  - Explanatory text under fields to indicate relationships
- Improved test coverage for form interactions
- Enhanced input validation with min/max constraints

## [0.1.0] - 2025-03-04

### Initial Release
- First version of the mortgage calculator with basic functionality
- Compare multiple funding sources
- Dynamic parameter adjustment
- Interactive visualizations