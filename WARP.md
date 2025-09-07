# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Development Environment
```bash
# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

### Database Setup
The application uses MySQL for data persistence. Database connection is configured through environment variables in `next.config.ts` or through local environment variables:
- `DB_HOST`: Database host (default: 127.0.0.1)
- `DB_PORT`: Database port (default: 3306)
- `DB_USER`: Database username (default: root)
- `DB_NAME`: Database name (default: panama)

Initialize database using the SQL schema in `blogs.sql` (note: schema is written for PostgreSQL but application uses MySQL).

## Architecture Overview

This is a **Next.js 15 blog management application** built with React 19 and TypeScript, using MySQL as the database. The application follows Next.js App Router conventions.

### Key Technology Stack
- **Framework**: Next.js 15 with App Router and React 19
- **Database**: MySQL with connection pooling via mysql2
- **Styling**: TailwindCSS v4
- **Editor**: Jodit React WYSIWYG editor for rich content
- **File Uploads**: Cloudinary integration
- **UI Libraries**: Lucide React icons, React Hot Toast, SweetAlert2

### Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin panel routes
│   │   ├── blogs/         # Blog management pages
│   │   └── categories/    # Category management pages
│   ├── api/               # API routes
│   │   └── blogs/         # Blog-related endpoints
│   ├── blog/              # Public blog pages
│   ├── post/              # Post creation/editing pages
│   └── posts/             # Post listing pages
├── components/            # Reusable React components
│   ├── UI/               # UI-specific components
│   └── NewPostFormJodit.jsx # Main blog post creation form
├── lib/                   # Utility libraries
│   ├── db.js             # Database connection helpers
│   ├── mysql.js          # MySQL connection pooling
│   └── joditConfig.js    # Jodit editor configuration
└── schema/               # Database schemas
    └── BlogSchema.js     # Mongoose schema (legacy)
```

### Database Architecture
The application uses a **dual database approach**:
1. **MySQL**: Primary database for production data (connected via mysql2)
2. **Mongoose Schema**: Legacy MongoDB schema exists but is not actively used

**MySQL Database Design**:
- Posts with full blog functionality (title, slug, content, SEO fields)
- Categories with hierarchical support
- Tags with many-to-many relationships
- Rich metadata support (featured images, status, scheduling)
- Full SEO optimization (canonical URLs, meta descriptions)

### API Architecture
RESTful API structure under `/api/blogs/`:
- `GET/POST /api/blogs/categories` - Category management
- `GET/POST /api/blogs/posts` - Post operations
- `POST /api/blogs/upload` - File upload handling
- `GET/PUT/DELETE /api/blogs/[id]` - Individual resource operations

All API routes use:
- `export const runtime = "nodejs"`
- `export const dynamic = "force-dynamic"`
- Connection pooling with proper connection release
- Comprehensive error handling

### Component Architecture
**NewPostFormJodit.jsx** is the primary content creation component featuring:
- Rich text editing via Jodit React
- Real-time slug generation from titles
- Tag management with visual feedback
- Category selection with multi-select
- Featured image upload via Cloudinary
- Status management (draft/scheduled/published)
- Keyboard shortcuts (Ctrl/Cmd+S to save)
- SEO field management
- Responsive design with Tailwind

### Key Development Patterns
1. **Database Connection Pattern**: Use connection pooling with proper release in finally blocks
2. **API Error Handling**: Consistent error responses with status codes and descriptive messages
3. **Slug Generation**: Automatic slug creation from titles with sanitization
4. **File Uploads**: Cloudinary integration with folder organization
5. **State Management**: React hooks with form validation
6. **Styling**: Tailwind v4 with custom gradients and backdrop blur effects

### Configuration Files
- **next.config.ts**: Cloudinary domains, environment variables (contains hardcoded DB credentials)
- **tsconfig.json**: TypeScript configuration with path mapping (@/* -> ./src/*)
- **eslint.config.mjs**: ESLint configuration
- **postcss.config.mjs**: PostCSS configuration for TailwindCSS

### Development Notes
- The app uses both .jsx and .tsx files (mixed JavaScript/TypeScript)
- Database credentials are hardcoded in multiple places and should be moved to environment variables
- The application has both old Mongoose schemas and new MySQL implementation
- Jodit editor requires client-side rendering (dynamic import with ssr: false)
- File uploads are handled via FormData with Cloudinary backend
