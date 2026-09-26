# VisaVerse AI Hackathon

VisaVerse is an AI-assisted visa application workflow built with React, TypeScript, Vite, and Node.js. The app allows a user to upload a visa PDF or document image, run OCR, extract form fields with an AI layer, autofill values from a saved profile, and generate a completed PDF for download.

This project is designed as a practical end-to-end workflow for document understanding and form completion rather than a generic demo. It focuses on a real user journey: detect form fields, interpret OCR text, combine it with profile data, and produce a corrected document.

## Features

- PDF and image upload workflow
- OCR extraction using Tesseract.js and PDF.js
- AI-powered field detection via OpenAI-compatible backend proxy
- Profile editor for reusable applicant information
- Field review and value editing before export
- PDF population and download generation
- Lightweight Node.js/Express backend for API proxying

## Tech Stack

- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express
- OCR: Tesseract.js + pdfjs-dist
- PDF generation: pdf-lib
- AI integration: OpenAI SDK via a local proxy endpoint

## Project Structure

```text
VisaVerse-AI-Hackathon/
├── src/
│   ├── api/
│   ├── components/
│   ├── lib/
│   ├── types/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── server/
│   └── index.js
├── public/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── index.html
├── eslint.config.js
└── README.md
```

## Prerequisites

- Node.js 18+
- npm
- An OpenAI API key for the backend AI workflow

## Environment Setup

Create a `.env` file in the project root with:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

The backend reads this key from the environment and proxies AI requests to OpenAI.

## Local Development

Install dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev -- --host 0.0.0.0
```

Then, in a second terminal, start the API proxy:

```bash
npm run start:server
```

The frontend is typically served at:

```text
http://localhost:5173
```

The backend server runs by default on:

```text
http://localhost:3001
```

## Production Build

```bash
npm run build
```

This produces a static build in the `dist` folder.

## How the App Works

1. User uploads a PDF or image.
2. OCR extracts text content from the document.
3. AI identifies likely form fields from the OCR text.
4. The app matches those fields with profile values such as name, passport number, and contact details.
5. User reviews and edits values.
6. The project generates a filled PDF for download.

## Notes

- The AI behavior is intentionally routed through a backend proxy so secrets never leak into the browser.
- OCR and PDF handling are separated into provider-level utilities in `src/lib` to keep the UI logic clean.
- This project is a learning and prototype-oriented system, not a production-grade document-processing platform.

## Troubleshooting

- If the frontend cannot reach the AI backend, make sure the Express server is running and the OpenAI key is set correctly.
- If PDF generation fails, check that the uploaded file is valid and in a supported PDF format.
- If Vite cannot start, reinstall dependencies with `npm install` and retry.

## License

This project is provided for educational and hackathon use. Use and adapt it according to your project requirements and local licensing constraints.

