# Grokipedia vs Wikipedia - Content Comparison & Trust Annotation

A web application that compares AI-generated Grokipedia content with human-curated Wikipedia articles, identifies discrepancies and potential hallucinations, and publishes structured Community Notes to the OriginTrail Decentralized Knowledge Graph (DKG).

## 🎯 Project Overview

This project is built for the **OriginTrail Hackathon - Challenge 1: Grokipedia Vs Wikipedia**.

### Core Features

- **Dual Source Fetching**: Retrieves articles from both Wikipedia (via MediaWiki API) and Grokipedia (via web scraping)
- **Intelligent Comparison**: Uses Gemini embeddings to compute sentence-level similarity
- **Discrepancy Detection**: Identifies potential hallucinations, missing context, and factual inconsistencies
- **Community Notes**: Generates structured JSON-LD Community Notes summarizing findings
- **DKG Publishing**: Publishes verified notes to OriginTrail DKG as Knowledge Assets
- **Interactive UI**: Side-by-side diff viewer with color-coded highlights

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))
- (Optional) OriginTrail DKG Node endpoint for publishing

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd wiki-vs-groki
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Gemini API key:
```
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
wiki-vs-groki/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── compare/       # Comparison endpoint
│   │   ├── fetch/         # Source fetching endpoints
│   │   └── publish/       # DKG publishing endpoint
│   ├── page.tsx           # Main search page
│   └── results/           # Results page
├── components/            # React components
│   ├── DiffViewer.tsx    # Side-by-side comparison
│   ├── NoteEditor.tsx    # Community Note editor
│   └── SearchBox.tsx     # Search input
├── lib/                  # Utilities and services
│   ├── wikipedia.ts      # Wikipedia API client
│   ├── grokipedia.ts     # Grokipedia scraper
│   ├── embeddings.ts     # Gemini embeddings service
│   ├── similarity.ts     # Similarity comparison engine
│   ├── dkg.ts            # DKG publishing client
│   └── utils.ts          # Text normalization utilities
├── types/                # TypeScript type definitions
└── public/               # Static assets
```

## 🛠️ Technical Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **AI/ML**: Google Gemini API (for embeddings and text analysis)
- **Web Scraping**: Cheerio
- **DKG**: dkg.js SDK
- **Data Format**: JSON-LD
- **Styling**: Tailwind CSS

## ⚙️ Implementation Notes

### Embeddings
The MVP uses a hybrid approach for embeddings:
- **Primary**: Attempts to use Gemini API for semantic embeddings
- **Fallback**: Uses text-based features (word frequency, n-grams, text statistics) when Gemini API is unavailable or for faster processing

For production, consider using dedicated embedding APIs (OpenAI, Cohere, or Google's text-embedding models).

### Grokipedia Scraping
Grokipedia content is scraped using Cheerio. The selectors may need adjustment based on Grokipedia's actual HTML structure. If Grokipedia provides an API or Knowledge Assets on DKG, those should be preferred.

### DKG Publishing
DKG publishing is configured but can work in "export mode" (generates JSON-LD) if DKG node is not configured. This allows the project to work for demos even without a live DKG connection.

## 📝 How It Works

1. **User Input**: User enters a topic in the search box
2. **Fetch Sources**: Backend fetches content from both Wikipedia and Grokipedia
3. **Text Processing**: Content is normalized and split into sentences
4. **Similarity Analysis**: Each Grokipedia sentence is compared with Wikipedia sentences using Gemini embeddings
5. **Discrepancy Detection**: Sentences with low similarity are flagged as potential hallucinations
6. **Note Generation**: A structured Community Note (JSON-LD) is auto-generated
7. **User Review**: User can edit and refine the note
8. **Publishing**: Note is published to DKG as a Knowledge Asset

## 🎨 Similarity Thresholds

- **Green (Match)**: Similarity > 0.85 - Exact or near-exact match
- **Yellow (Paraphrase)**: Similarity 0.60-0.85 - Similar meaning, different wording
- **Red (Unique/Hallucination)**: Similarity < 0.60 - Potential discrepancy or hallucination

## 📊 Community Note Schema

Each Community Note follows this JSON-LD structure:

```json
{
  "@context": "https://schema.org",
  "@type": "CommunityNote",
  "name": "Groki vs Wiki: <TOPIC> discrepancy summary",
  "about": "<TOPIC>",
  "author": "did:example:yourdid",
  "published": "2025-11-25T20:00:00Z",
  "summary": "Auto-detected differences...",
  "discrepancies": [...]
}
```

## 🔧 Development

### Running Tests

```bash
npm run test
```

### Building for Production

```bash
npm run build
npm start
```

## 📚 Resources

- [OriginTrail DKG Documentation](https://docs.origintrail.io/)
- [Wikipedia API](https://www.mediawiki.org/wiki/API:Main_page)
- [Gemini API](https://ai.google.dev/docs)
- [JSON-LD Specification](https://json-ld.org/)

## 🤝 Contributing

This is a hackathon project. Contributions and improvements are welcome!

## 📄 License

MIT

