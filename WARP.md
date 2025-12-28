# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is **AgencyOS** - a full-stack Nuxt 3 + Directus project for running a digital agency. It includes a public website, CRM/project management system, and authenticated client portal. The codebase uses TypeScript, Tailwind CSS, and a custom Directus integration module.

## Development Commands

### Essential Commands
```bash
# Install dependencies (uses pnpm)
pnpm i

# Start development server (Nuxt frontend)
pnpm dev
# Runs on http://localhost:3000

# Build for production
pnpm build

# Preview production build
pnpm preview

# Type checking
pnpm typecheck

# Linting and formatting
pnpm lint          # ESLint with auto-caching
pnpm format        # Prettier formatting for .md, .yml, .json, .vue
```

### Directus Backend (Local Development)
```bash
# Start local Directus instance with Docker
cd .directus
docker compose up

# Directus runs on http://localhost:8055 or http://0.0.0.0:8055
# Default credentials: admin@example.com / d1r3ctu5
```

### Environment Setup
1. Copy `.env.example` to `.env`
2. Set `DIRECTUS_URL` (Directus Cloud URL or local instance)
3. Set `DIRECTUS_SERVER_TOKEN` (generate from Directus admin user)
4. Set `NUXT_PUBLIC_SITE_URL` (typically `http://localhost:3000` for dev)
5. Optional: Configure Stripe keys for payments in client portal

## Architecture Overview

### Layered Architecture
The project uses **Nuxt Layers** to separate concerns:

- **Root layer** (`/`): Public website, blog, services showcase
- **Portal layer** (`/layers/portal`): Authenticated client portal for viewing projects, tasks, invoices
- **Proposals layer** (`/layers/proposals`): Public/private proposal viewing with e-signatures

Each layer has its own:
- `nuxt.config.ts` (route rules, component prefixes)
- `components/` directory with auto-imported components
- `pages/` directory for route definitions
- `server/` directory (portal has server routes)

### Custom Directus Module
Located in `/modules/directus`, this provides:

**Composables:**
- `useDirectus()` - Execute Directus REST API commands
- `useDirectusAuth()` - Authentication (login, logout, fetchUser, user state)
- `useFiles()` - File handling utilities

**Middleware:**
- `auth` - Protects authenticated routes
- `guest` - Redirects logged-in users from auth pages
- `common` - Shared logic

**Plugins:**
- Auto-initializes Directus client (`$directus`) with REST API
- Configures authentication state

### Server-Side Directus Access
Use `~/server/utils/directus-server.ts` for server routes:
```typescript
import { directusServer, readItems, readItem } from '~/server/utils/directus-server';

// Always uses DIRECTUS_SERVER_TOKEN for auth
const items = await directusServer.request(readItems('collection_name'));
```

### Type System
All Directus collections are typed in `/types`:
- `schema.ts` - Auto-generated Directus schema types
- `index.ts` - Central export for all types
- Domain types: `blocks/`, `services/`, `content/`, `help/`, `meta/`, `system/`, `os/`

When adding new collections or fields:
1. Update types in `/types`
2. Export from `index.ts`
3. Schema types should match Directus data model

### Component Organization

**Base Components** (`/components/base`):
- Auto-imported **without** `Base` prefix
- Example: `<Container>`, `<Section>`, `<Button>` (if they exist)

**Block Components** (`/components/blocks`):
- Content builder blocks for page builder
- Each block has a corresponding type in `/types/blocks`
- Examples: `ServicesShowcase.vue`, `DiscoursePosts.vue`

**Portal Components** (`/layers/portal/components`):
- Auto-imported with `Portal` prefix
- Example: `<PortalNavigation>`, `<PortalProjectCard>`

**Proposal Components** (`/layers/proposals/components`):
- Auto-imported with `Proposals` prefix

### Utility Functions
Located in `/utils` - all auto-imported:
- `billing-address.ts` - Address formatting
- `color.ts` - Color manipulation
- `currency.ts` - Money formatting
- `embed.ts` - Video embed handling
- `formkit.ts` - Form utilities
- `icons.ts` - Icon helpers
- `links.ts` - Link utilities
- `lodash.ts` - Common data transformations
- `markdown.ts` - Markdown parsing (uses micromark)
- `math.ts` - Math utilities
- `navigation.ts` - Navigation helpers
- `objects.ts` - Object manipulation
- `relations.ts` - Directus relational data helpers
- `strings.ts` - String utilities
- `time.ts` - Date/time formatting
- `user-name.ts` - User display names

### Theming System
Configuration in `theme.ts` and `app.config.ts`:

- **Theme values** (`theme.ts`): Define colors, fonts, border radius
- **App config** (`app.config.ts`): Override Nuxt UI component defaults
- **Google Fonts**: Auto-downloaded and self-hosted (configured in `nuxt.config.ts`)
- **Font families**: 
  - Display: Poppins
  - Sans: Inter
  - Code: Fira Code
  - Signature: Nothing You Could Do

To change theme:
1. Edit `theme.ts` (primary color, fonts, border radius)
2. `app.config.ts` automatically applies theme to Nuxt UI components
3. Tailwind config (`tailwind.config.ts`) uses theme values

### Routing

**Public Pages** (SSR enabled):
- `/` - Home page (dynamic page builder)
- `/posts` - Blog listing
- `/posts/[slug]` - Blog post detail
- `/services` - Services showcase
- `/services/[slug]` - Service detail
- `/help` - Help center
- `/community` - Discourse posts integration
- `/projects` - Projects showcase
- `/[...permalink]` - Catch-all for dynamic pages from Directus

**Portal Routes** (SSR disabled, auth required):
- `/portal` - Dashboard
- `/portal/**` - All portal pages (projects, tasks, invoices, files)

**Auth Routes** (SSR disabled):
- `/auth/signin` - Login page
- `/auth/logout` - Logout handler

**Proposal Routes** (SSR enabled):
- `/proposals/**` - Public/private proposals with e-signatures

## Data Fetching Patterns

### Client-Side (in components/pages)
```typescript
// Fetch single item
const { data } = await useAsyncData('key', async () => {
  return await useDirectus(readItem('collection', id, { fields: ['*'] }));
});

// Fetch multiple items
const { data } = await useAsyncData('key', async () => {
  return await useDirectus(readItems('collection', {
    filter: { status: { _eq: 'published' } },
    sort: ['-date_created'],
    limit: 10
  }));
});
```

### Server-Side (in `/server/api`)
```typescript
import { directusServer, readItems } from '~/server/utils/directus-server';

export default defineEventHandler(async (event) => {
  const items = await directusServer.request(
    readItems('collection', { /* query options */ })
  );
  return items;
});
```

## Important Patterns

### Authentication Flow
1. User logs in via `/auth/signin`
2. `useDirectusAuth().login()` sets token and localStorage flag
3. `fetchUser()` retrieves user data (includes related `contacts`)
4. User redirected to `/portal` or query param `?redirect=`
5. Portal routes protected by `auth` middleware

### Dynamic Page Builder
Pages use a flexible block system:
1. Directus stores pages with `blocks` relationship
2. Each block has a `collection` field (e.g., `block_hero`, `block_services_showcase`)
3. `PageBuilder.vue` component renders blocks dynamically
4. Add new blocks: Create component in `/components/blocks`, add type to `/types/blocks`, register in `PageBuilder.vue`

### SEO Configuration
- Uses `@nuxtjs/seo` module
- OG images generated dynamically via `OgImageTemplate` component
- Sitemap auto-generated from `/api/_sitemap-urls` endpoint
- Set meta tags per page using `useSeoMeta()` or `useHead()`

## Common Workflows

### Adding a New Page Block
1. Create Vue component: `/components/blocks/MyBlock.vue`
2. Define TypeScript interface: `/types/blocks/block-my-block.ts`
3. Export from `/types/blocks/index.ts`
4. Update `/types/blocks/block.ts` union type
5. Register in `PageBuilder.vue` switch statement
6. Create collection in Directus matching your interface
7. Add to page via Directus admin

### Adding a New Utility Function
1. Create file in `/utils` (e.g., `my-util.ts`)
2. Export functions (auto-imported globally by Nuxt)
3. Use anywhere without importing: `myFunction()`

### Working with Directus Collections
1. Define types in `/types`
2. Query from client: `useDirectus(readItems('collection'))`
3. Query from server: `directusServer.request(readItems('collection'))`
4. Always specify `fields` to avoid over-fetching
5. Use `filter`, `sort`, `limit` for query optimization

### Custom Integrations
The project includes:
- **Discourse integration**: Fetches community posts via Directus Flow, displays in carousel
- **Stripe payments**: Client portal invoice payment (needs Stripe env vars)
- **E-signatures**: Proposal signing via `v-perfect-signature` package

## Database & Backend

- **Database**: PostgreSQL (tested and preferred)
- **Directus Version**: 10.13.1 (in docker-compose)
- **Template**: Applied via `npx directus-template-cli@latest apply` (Agency OS template)
- **Flows**: Directus Flows automate tasks (e.g., fetching Discourse posts every 30 min)
- **Docker Compose**: Includes PostgreSQL, Redis cache, and Directus

## Technology Stack

- **Frontend**: Nuxt 3.x, Vue 3, TypeScript
- **Backend**: Directus 10.x (headless CMS)
- **Database**: PostgreSQL
- **Styling**: Tailwind CSS, Nuxt UI components
- **Icons**: Nuxt Icon module (Iconify)
- **Forms**: FormKit with auto-animate
- **Animations**: VueUse Motion
- **Images**: Nuxt Image with Directus provider
- **Markdown**: Micromark with GFM extension
- **Package Manager**: pnpm (required, see `engines` in package.json)
- **Node**: >= 20.0.0

## Deployment

### Nuxt Frontend
- **Recommended**: Vercel (one-click deploy button in README)
- **Alternative**: Netlify, or any Node.js/static hosting
- Set environment variables: `DIRECTUS_URL`, `DIRECTUS_SERVER_TOKEN`, `NUXT_PUBLIC_SITE_URL`
- Optional: Stripe keys if using payments

### Directus Backend
- **Cloud**: Directus Cloud (https://directus.cloud) - managed hosting
- **Self-hosted**: Docker with PostgreSQL (see README deployment section)
- Important: Use PostgreSQL for production (officially tested)

## ESLint Configuration

- Prettier integration enforced
- TypeScript and Vue 3 rules enabled
- Padding between statements enforced
- No console/debugger in production
- Unused vars allowed if prefixed with `_`
- Multi-word component names NOT required (disabled)

## Notes for AI Agents

- **Authentication**: User state in `useState('user')`, accessed via `useDirectusAuth()`
- **Directus queries**: Always prefer `useDirectus()` over direct `$fetch`
- **Type safety**: All Directus collections should have types in `/types/schema.ts`
- **Component prefixes**: Portal/Proposals components use prefixes, blocks/base do not
- **Server tokens**: Use `DIRECTUS_SERVER_TOKEN` for server-side, never expose to client
- **Layers**: When adding portal features, work in `/layers/portal`; proposals in `/layers/proposals`
- **Auto-imports**: Composables, utils, and components are auto-imported - no manual imports needed
- **Dark mode**: Fully supported via `@nuxtjs/color-mode` and Nuxt UI
- **Docker setup**: Only for local Directus; production typically uses Directus Cloud
- **Custom features**: Check `DISCOURSE_INTEGRATION.md` and `SERVICES_SHOWCASE_README.md` for integration examples
