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
   MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/
   ```
   
   - Get your Gemini API key from: https://makersuite.google.com/app/apikey
   - MongoDB URI format: `mongodb+srv://user:password@cluster.mongodb.net/` (database name will be added automatically)
   - The app will use database `WikiVsGrokipediaKA` (created automatically if it doesn't exist)

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Open Browser**
   Navigate to http://localhost:3000

## DKG Publishing (Optional)

To enable DKG publishing, add these to `.env.local`:
```env
# Required for DKG publishing
DKG_PRIVATE_KEY=your_private_key_here

# Optional - defaults to public OriginTrail node
DKG_NODE_ENDPOINT=https://v6-pegasus-node-03.origin-trail.network
DKG_NODE_PORT=8900
DKG_BLOCKCHAIN_NAME=otp:20430
```

**Important**: 
- Get your private key from your Ethereum wallet (the one you use for OriginTrail)
- The private key should start with `0x`
- Never commit your private key to version control
- If not configured, the app will generate JSON-LD that can be manually published

The DKG publishing uses the `dkg-publish` module in this repository, which connects to OriginTrail public nodes.

## MongoDB (Knowledge Assets Storage)

The app uses MongoDB to store published Knowledge Assets. When a Community Note is successfully published to DKG, it's automatically saved to MongoDB with the following information:

- Topic name
- UAL (Unique Asset Locator)
- Dataset Root
- Publication date
- Summary and statistics
- Full JSON-LD data

**Database**: `WikiVsGrokipediaKA`  
**Collection**: `knowledgeassets`

You can view all published assets at `/assets` page.

## Project Structure

- `app/` - Next.js app directory with pages and API routes
  - `api/assets/` - API route to fetch published Knowledge Assets
  - `api/publish/` - API route to publish to DKG and save to MongoDB
  - `assets/` - Page to browse all published Knowledge Assets
- `components/` - React components (SearchBox, DiffViewer, NoteEditor, Header)
- `lib/` - Core utilities and services
  - `wikipedia.ts` - Wikipedia API client
  - `grokipedia.ts` - Grokipedia scraper
  - `embeddings.ts` - Gemini embeddings service
  - `similarity.ts` - Similarity comparison engine
  - `dkg.ts` - DKG publishing client
  - `mongodb.ts` - MongoDB connection utility
  - `utils.ts` - Text processing utilities
- `models/` - MongoDB models
  - `KnowledgeAsset.ts` - Schema for published Knowledge Assets
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

