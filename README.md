# DuckLab 🦆

**Learn anything. Prove it by teaching.**

DuckLab is an AI-powered learning platform that helps you master any topic using the Feynman Technique. It builds personalized knowledge graphs, curates high-quality resources, and tests your understanding by having you "teach" concepts back to a skeptical AI duck.

![DuckLab Knowledge Graph](public/graph-preview.png)

## ✨ Features

- **Dynamic Knowledge Graphs**: Visualize any topic as a dependency graph. Nodes light up as you master concepts.
- **AI-Curated Courses**: Generates structured study modules with intuition, definitions, examples, and edge cases using **Exa** search and **MiniMax** LLMs.
- **"Teach the Duck" Assessment**: Prove your understanding by explaining concepts to an AI persona that catches jargon and probes for depth.
- **Visual Learning**: Rich study materials with AI-generated illustrations, Mermaid diagrams, and interactive analogies.
- **Spaced Repetition**: Tracks your mastery level (Confused, Getting it, Got it) and schedules reviews.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [Framer Motion](https://www.framer.com/motion/)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage)
- **AI & Data**:
  - **MiniMax**: Text and Image generation models.
  - **Exa**: Neural search for high-quality educational resources.
- **Visualization**: `react-force-graph-2d`, `d3-force`, `mermaid`.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- A [Supabase](https://supabase.com/) project
- API keys for MiniMax and Exa

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ducklab.git
   cd ducklab
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up Environment Variables**
   Create a `.env` file in the root directory and add the following keys:

   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # AI Providers
   MINIMAX_API_KEY=your_minimax_key
   MINIMAX_GROUP_ID=your_minimax_group_id
   EXA_API_KEY=your_exa_key

   # App URL (for Auth redirects)
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Run Database Migrations**
   Apply the SQL migrations found in `migrations/` to your Supabase project (SQL Editor).

5. **Run the Development Server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

```
├── app/                  # Next.js App Router pages and layouts
├── components/           # React components
│   ├── graph/            # Knowledge graph visualization
│   ├── study/            # Study course modules & interactive elements
│   ├── ui/               # Reusable UI components (shadcn)
│   └── ...
├── lib/                  # Utilities and clients
│   ├── agents/           # AI agent logic (curriculum, scorer, etc.)
│   ├── exa/              # Exa search client
│   ├── minimax/          # MiniMax LLM & Image client
│   ├── supabase/         # Database queries & clients
│   └── schemas/          # Zod validation schemas
├── migrations/           # SQL migration files
└── public/               # Static assets
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
