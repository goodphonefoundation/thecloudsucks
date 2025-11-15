# The Cloud Sucks

Documentation site built with [Zensical](https://zensical.org/).

## Local Development

### Prerequisites

- Python 3.10 or higher

### Setup

1. Create and activate a virtual environment:

\\\powershell
# Windows
python -m venv .venv
.venv\Scripts\activate
\\\`n
\\\ash
# macOS/Linux
python3 -m venv .venv
source .venv/bin/activate
\\\`n
2. Install Zensical:

\\\ash
pip install zensical
\\\`n
### Commands

- **Preview locally**: \zensical serve\ - Opens at http://localhost:8000
- **Build site**: \zensical build\ - Generates static site in \site/\ directory

## Documentation

All documentation content is in the \docs/\ directory written in Markdown.

Configuration is in \zensical.toml\.

## Deployment

This site can be deployed to:
- GitHub Pages
- Any static hosting service (Netlify, Vercel, Cloudflare Pages, etc.)
- CDN or web server
