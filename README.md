# The Cloud Sucks

Documentation site built with [Zensical](https://zensical.org/).

## Local Development

### Prerequisites

- Python 3.10 or higher

### Setup

1. Create and activate a virtual environment:

**Windows:**
```powershell
python -m venv .venv
.venv\Scripts\activate
```

**macOS/Linux:**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

2. Install Zensical:

```bash
pip install zensical
```

### Commands

- **Preview locally**: `zensical serve` - Opens at http://localhost:8000
- **Build site**: `zensical build` - Generates static site in `site/` directory

## Documentation

All documentation content is in the `docs/` directory written in Markdown.

Configuration is in `zensical.toml`.

## Deployment

This site can be deployed to:
- GitHub Pages (see `.github/workflows/deploy.yml`)
- Any static hosting service (Netlify, Vercel, Cloudflare Pages, etc.)
- CDN or web server
