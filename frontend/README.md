# WebAnalyzer – Website Analysis Tool

Analyze your website for SEO, performance, security, accessibility, uptime, and get AI-powered insights. Improve your web presence with actionable recommendations.

## Features
- Performance, SEO, Security, Accessibility, and Uptime analysis
- AI-powered insights and recommendations
- Modern, accessible UI with tooltips and loading skeletons
- Granular backend logging
- Export and share analysis results

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm, yarn, pnpm, or bun

### Setup
1. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```
2. Start the development server:
   ```bash
   npm run dev
   # or yarn dev, pnpm dev, bun dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Documentation

### Analyze a Website
- **POST** `/api/website-analysis/analyze`
  - **Body:** `{ url: string, options: string[] }`
  - **Response:** `{ success: boolean, data: AnalysisResult }`

### Get Analysis Result
- **GET** `/api/website-analysis/:id`
  - **Response:** `{ success: boolean, data: AnalysisResult }`

## Analysis Result Structure

```ts
interface AnalysisResult {
  _id: string;
  url: string;
  status: string;
  selectedOptions: string[];
  results: {
    performance?: { score: number; metrics: object; recommendations: object[] };
    seo?: { score: number; issues: object[] };
    security?: { score: number; issues: object[] };
    accessibility?: { score: number; issues: object[] };
    uptime?: { score: number; metrics: object };
    ai_insights?: { score: number; summary: string; recommendations: object[]; insights: object[] };
  };
  createdAt: string;
  completedAt?: string;
}
```

## Contributing

1. Fork the repo and create your branch from `main`.
2. Run `npm run lint` and `npm run build` before submitting a PR.
3. Add tests for new features if possible.
4. Ensure your code is accessible and follows best practices.

## License
MIT
