# Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Environment Variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
   ```
   
   Get your Gemini API key from: https://makersuite.google.com/app/apikey

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Open Browser**
   Navigate to http://localhost:3000

## DKG Publishing (Optional)

To enable DKG publishing, add these to `.env.local`:
```env
DKG_NODE_ENDPOINT=https://your-dkg-node-endpoint.com
DKG_PRIVATE_KEY=your_private_key_here
```

If not configured, the app will generate JSON-LD that can be manually published.

## Project Structure

- `app/` - Next.js app directory with pages and API routes
- `components/` - React components (SearchBox, DiffViewer, NoteEditor)
- `lib/` - Core utilities and services
  - `wikipedia.ts` - Wikipedia API client
  - `grokipedia.ts` - Grokipedia scraper
  - `embeddings.ts` - Gemini embeddings service
  - `similarity.ts` - Similarity comparison engine
  - `dkg.ts` - DKG publishing client
  - `utils.ts` - Text processing utilities
- `types/` - TypeScript type definitions

## How It Works

1. **Fetch**: User enters a topic → app fetches from Wikipedia (API) and Grokipedia (scraping)
2. **Process**: Text is normalized and split into sentences
3. **Compare**: Each Grokipedia sentence is compared with Wikipedia sentences using embeddings
4. **Analyze**: Similarity scores determine matches, paraphrases, or potential hallucinations
5. **Generate**: Community Note (JSON-LD) is auto-generated with discrepancies
6. **Publish**: Note can be published to OriginTrail DKG (or exported as JSON-LD)

## Troubleshooting

### Grokipedia Scraping Fails
- Grokipedia may have changed their HTML structure
- Check the actual Grokipedia URL format
- Update selectors in `lib/grokipedia.ts` if needed

### Embeddings Are Slow
- The app uses a fallback embedding method for MVP
- For production, consider using a dedicated embedding API
- Batch processing is implemented to handle multiple sentences

### DKG Publishing Not Working
- Ensure DKG node endpoint is correct
- Check that dkg.js SDK is properly configured
- For MVP, JSON-LD export is sufficient

## Next Steps

- [ ] Integrate actual DKG Edge Node
- [ ] Add MCP integration for AI agents
- [ ] Implement x402 payment protocol
- [ ] Add image/video comparison
- [ ] Improve embedding quality with dedicated API
- [ ] Add user authentication and DID management

