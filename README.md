# QUERY_NOIR: Forensic SQL Investigation Engine

A neo-noir interactive SQL investigation workspace across 15 forensic cases and 3 analyst clearance tiers, featuring real SQLite execution, EXPLAIN query plan profiling, animated character confrontations, and a Gemini Forensic Director.

---

## Quickstart with Docker Compose

The fastest and most reliable way to run QUERY_NOIR is with Docker Compose.

### 1. (Optional) Configure Gemini API
The game includes a deterministic evaluation engine that runs 100% offline out-of-the-box. To enable dynamic generative suspect dialogue using Google Gemini 3.8 Flash, copy `.env.example` to `.env` and add your API key:

```bash
cp .env.example .env
# Edit .env and set GEMINI_API_KEY="your_api_key_here"
```

### 2. Build and Start the Container
```bash
docker compose up --build -d
```

### 3. Open the Game
Navigate to:
```
http://localhost:3000
```

### 4. Useful Docker Commands
- **View logs:**
  ```bash
  docker compose logs -f
  ```
- **Check container health:**
  ```bash
  docker compose ps
  ```
- **Stop container:**
  ```bash
  docker compose down
  ```

---

## Running with Docker (Standalone)

You can also build and run the image directly with Docker CLI:

```bash
# Build the image
docker build -t query-noir .

# Run container (offline deterministic mode)
docker run -d -p 3000:3000 --name query_noir query-noir

# Or run with Gemini API key
docker run -d -p 3000:3000 -e GEMINI_API_KEY="your_key" --name query_noir query-noir
```

---

## Local Development (without Docker)

### Prerequisites
- Node.js 20+ (recommended Node.js 22 LTS)
- npm

### Installation & Run
```bash
# Install dependencies
npm install

# Run development server with Hot Module Replacement (HMR)
npm run dev

# Run production build and server locally
npm run build
npm start
```
