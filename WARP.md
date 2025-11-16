# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a documentation site built with [Zensical](https://zensical.org/), a documentation generator based on Material for MkDocs. Content is written in Markdown and configured via TOML.

## Development Commands

### Setup
```powershell
# Create and activate virtual environment (Windows)
python -m venv .venv
.venv\Scripts\activate

# Install Zensical
pip install zensical
```

### Core Commands
- **Preview site locally**: `zensical serve` (opens at http://localhost:8000)
- **Build static site**: `zensical build` (output in `site/` directory)

### Working with Content
- All documentation lives in `docs/` directory
- Configuration is in `zensical.toml`
- Site structure can be implicit (based on file structure) or explicit (defined in `zensical.toml` nav section)

## Architecture

### Project Structure
```
docs/           - All Markdown documentation content
site/           - Generated static site (git-ignored, created by zensical build)
zensical.toml   - Central configuration file
.github/        - GitHub Actions workflows
```

### Configuration (zensical.toml)

The `zensical.toml` file controls:
- **Site metadata**: `site_name`, `site_description`, `site_author`, `copyright`
- **Theme settings**: Variant (modern/classic), color schemes, fonts, icons
- **Features**: Navigation behavior, code block features, search, content tabs
- **Color schemes**: Multiple palettes defined (light/dark mode toggle)

Key features currently enabled:
- Code annotations, copy, and selection buttons
- Instant navigation with prefetching
- Navigation sections, footer, paths, and top button
- Search highlighting
- Content tabs linking and footnote tooltips

### Deployment

The site auto-deploys via GitHub Actions (`.github/workflows/deploy.yml`):
- Triggers on push to `main` or `master` branches
- Builds with Zensical and deploys to GitHub Pages
- Can also be deployed to Netlify, Vercel, Cloudflare Pages, or any static host

## Working with Zensical

### Content Authoring
Zensical supports extended Markdown features:
- **Admonitions**: `!!! note`, `!!! warning`, etc.
- **Collapsible sections**: `???` prefix
- **Code blocks**: With highlighting, line numbers, annotations
- **Content tabs**: `=== "Tab Name"`
- **Mermaid diagrams**: Fenced code blocks with `mermaid`
- **Icons/Emojis**: `:icon-name:` or icon paths
- **Math**: LaTeX via MathJax (requires configuration)
- **Task lists**: `- [x]` and `- [ ]`

### Navigation
Navigation can be:
1. **Implicit**: Derived from `docs/` directory structure
2. **Explicit**: Defined in `zensical.toml` under `nav` array

To modify navigation structure, edit the `nav` section in `zensical.toml`.

### Theme Customization
- Override templates via `custom_dir` setting
- Add custom CSS via `extra_css` (relative to `docs/`)
- Add custom JavaScript via `extra_javascript`
- Modify color schemes in `[[project.theme.palette]]` sections
- Change fonts in `[project.theme.font]` section

## Important Notes

- Python 3.10+ required
- Always work in virtual environment (`.venv`)
- Built site (`site/`) is git-ignored
- Preview server runs on port 8000 by default
- Changes are live-reloaded during `zensical serve`
