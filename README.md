# ExpenseAI

An AI-powered expense tracking application that simplifies financial management through natural language interactions. Track expenses, manage budgets, and gain insights into your spending patterns with the help of AI.

## Overview

ExpenseAI eliminates the friction of traditional expense tracking by allowing users to log transactions through conversational AI. Instead of filling out forms, simply chat with the AI to record expenses, create budgets, and analyze your financial data.

## Key Features

- **AI-Powered Chat Interface** - Log expenses and income through natural conversation
- **Smart Transaction Management** - Automatic categorization and insights
- **Budget Tracking** - Set and monitor budgets with AI-driven recommendations
- **Analytics Dashboard** - Visualize spending patterns and trends
- **Multi-Account Support** - Manage multiple bank accounts and cash sources
- **Recurring Transactions** - Automate regular expenses and income
- **Custom Categories** - Create personalized expense categories

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **AI**: Vercel AI SDK with Amazon Bedrock
- **UI Components**: Radix UI + shadcn/ui
- **Styling**: Tailwind CSS 4
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Authentication**: JWT with bcryptjs

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (create `.env.local`):
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   # Add AI SDK credentials
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

- `/app` - Next.js app router pages and API routes
- `/components` - Reusable React components
- `/lib` - Utility functions and configurations
- `/models` - MongoDB schemas

## License

MIT
