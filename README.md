# SmartSpend

## 🔖 Project Title & Description

**Smart Expense Tracker** - An AI-powered web application that automatically extracts expense data from receipt images AND bank statements, categorizes transactions intelligently, and provides insights into spending patterns.

**Target Users**: Freelancers, small business owners, and individuals who need to track expenses for tax purposes or personal budgeting.

**Why it matters**: Manual expense tracking is time-consuming and error-prone. This app eliminates the friction by automating receipt processing AND bank statement imports, providing complete financial visibility with actionable insights.

## 🛠️ Tech Stack

**Frontend:**
- React 18 with TypeScript
- Tailwind CSS for styling
- React Hook Form for form management
- Recharts for data visualization
- React Router for navigation

**Backend:**
- Node.js with Express
- MongoDB with Mongoose
- Multer for file uploads
- JWT for authentication

**AI Services:**
- OpenAI Vision API for receipt OCR
- OpenAI GPT-4 for expense categorization and statement parsing
- Papa Parse for CSV processing
- PDF-lib/PDF2pic for PDF statement processing
- Optional: Tesseract.js for offline OCR

**Development Tools:**
- Vite for build tooling
- ESLint + Prettier for code quality
- Jest + React Testing Library for testing

## 🧠 AI Integration Strategy

### Code Generation
- **VS Code Extensions**: GitHub Copilot for autocomplete and function generation
- **CLI Agent**: Use `npx create-react-app` or Vite scaffolding, then Claude/ChatGPT for component boilerplates
- **Feature scaffolding**: Prompt AI with "Create a React component for expense list with filtering" + provide existing code structure

### Testing
- **Unit Tests**: Prompt AI with function signatures and expected behavior
  - Example: "Write Jest tests for `parseCSVStatement(file, bankType)` function that should handle Chase, BofA formats"
  - Example: "Create tests for `matchReceiptToTransaction(receipt, transactions)` fuzzy matching"
- **Integration Tests**: Provide API endpoint specs and sample bank files to AI for generating test cases
- **Test Data**: AI generates mock receipt data, bank statements, and expected parsing outputs

### Documentation
- **Docstrings**: Use AI to generate JSDoc comments for complex functions
  - Prompt: "Add JSDoc comments to this OCR processing function" + paste code
- **Inline Comments**: AI explains complex regex patterns or image processing logic
- **README Updates**: Feed current feature list to AI for maintaining project documentation
- **Code Rabbit**: For code reviews

### Context-Aware Techniques
- **API Integration**: Provide OpenAI API documentation to AI when implementing OCR and statement parsing
- **Bank Format Specs**: Share common bank CSV/PDF formats with AI for consistent parsing logic
- **File Structure**: Share project tree with AI for consistent import paths and component organization
- **Code Diffs**: When debugging parsing issues, share git diffs with AI for targeted problem-solving
- **Database Schema**: Share transaction and receipt models with AI for consistent data handling
- **Matching Algorithms**: Use AI to generate fuzzy matching logic for receipt-to-transaction linking

## 📋 Core Features (MVP)

1. **Receipt Upload**: Drag-and-drop image upload with OCR processing
2. **Bank Statement Import**: Support for CSV/PDF bank statements
3. **OCR Processing**: Extract merchant, amount, date, items from receipts
4. **Statement Parsing**: AI extracts transactions from bank statements
5. **Auto-Categorization**: AI assigns categories (Food, Transport, Office, etc.)
6. **Transaction Matching**: Link receipts to bank transactions
7. **Expense Dashboard**: Monthly/yearly spending with reconciliation status
8. **Manual Entry**: Add expenses without receipts or statements
9. **Export**: CSV/PDF export for tax purposes

## 🏦 Bank Statement Integration

### Supported Formats
- **CSV Files**: Most banks export in CSV format
- **PDF Statements**: OCR processing for scanned statements
- **Common Banks**: Chase, Bank of America, Wells Fargo, etc.

### Processing Flow
1. **Upload**: User uploads statement file
2. **Format Detection**: AI identifies bank and format
3. **Parsing**: Extract transaction data (date, amount, merchant, description)
4. **Categorization**: AI categorizes each transaction
5. **Matching**: Link transactions to existing receipts
6. **Review**: User confirms/edits categorizations

## 🎯 Success Metrics

- Successfully extract data from 90%+ of common receipt types
- Parse 95%+ of major bank statement formats (CSV/PDF)
- Categorize expenses with 85%+ accuracy
- Match receipts to transactions with 80%+ accuracy
- Process files in under 10 seconds
- Responsive design for mobile and desktop

## 🔍 AI Prompts for Development

### Statement Parsing
```
"Create a function that parses CSV bank statements. Handle these formats:
- Chase: Date,Description,Amount,Balance
- BofA: Posted Date,Reference Number,Payee,Amount
Return standardized transaction objects."
```

### Transaction Matching
```
"Write a fuzzy matching algorithm that links receipts to bank transactions.
Consider: amount (exact/close), date (±3 days), merchant name similarity.
Use fuzzy string matching for merchant names."
```
