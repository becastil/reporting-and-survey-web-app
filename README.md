# Survey & Reporting Platform

A modern, cloud-native survey and reporting platform with interactive dashboards, real-time analytics, and CSV-based reporting capabilities.

## Features

### 📊 Survey Module
- **Dynamic Survey Builder**: Drag-and-drop interface with multiple question types (dropdown, multiple choice, text, scale, matrix)
- **Real-time Response Collection**: Automatic aggregation and storage in the cloud
- **Interactive Dashboards**: 20-40 customizable charts, tables, and benchmarks
- **Advanced Analytics**: Filtering, comparison, drill-down capabilities
- **Admin Portal**: Comprehensive survey management and response viewing

### 📈 Reporting Module
- **CSV Template System**: Download templates, populate, and upload for processing
- **Automatic Validation**: Data validation, normalization, and aggregation
- **Interactive Visualizations**: Generate dashboards from uploaded data
- **PDF Export**: Export dashboards and reports for sharing
- **Flexible Reporting**: Support for various data sources and formats

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **State Management**: Zustand, TanStack Query
- **Charts**: Recharts, Tremor
- **Animations**: Framer Motion
- **Backend**: Node.js, Drizzle ORM
- **Database**: PostgreSQL
- **Authentication**: Clerk (demo mode)
- **File Processing**: Papa Parse (CSV)

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd survey-reporting-platform
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your configuration:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/survey_platform"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
```

4. Set up the database:
```bash
# Generate database migrations
npm run db:generate

# Run migrations
npm run db:migrate

# Seed with demo data
npm run db:seed
```

5. Start the development server:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
survey-reporting-platform/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── api/                # API routes
│   │   ├── survey/             # Survey module pages
│   │   └── reporting/          # Reporting module pages
│   ├── components/             # React components
│   │   ├── ui/                 # Base UI components
│   │   ├── survey/             # Survey-specific components
│   │   └── reporting/          # Reporting-specific components
│   ├── lib/                    # Utilities and configurations
│   │   ├── db/                 # Database schema and config
│   │   └── utils.ts            # Helper functions
│   └── types/                  # TypeScript type definitions
├── public/                     # Static assets
└── drizzle/                    # Database migrations
```

## Development

### Database Management
```bash
# View database in Drizzle Studio
npm run db:studio

# Generate new migrations after schema changes
npm run db:generate

# Apply migrations
npm run db:migrate

# Reset and reseed database
npm run db:seed
```

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

## Demo Credentials

For demo mode:
- **Admin**: admin@demo.com / demo123
- **User**: user@demo.com / demo123

## API Endpoints

### Survey Endpoints
- `GET /api/surveys` - List all surveys
- `POST /api/surveys` - Create new survey
- `GET /api/surveys/:id` - Get survey details
- `POST /api/surveys/:id/responses` - Submit survey response
- `GET /api/surveys/:id/analytics` - Get survey analytics

### Reporting Endpoints
- `POST /api/reports/upload` - Upload CSV file
- `GET /api/reports` - List all reports
- `GET /api/reports/:id` - Get report details
- `GET /api/reports/:id/export` - Export report as PDF

## Production Deployment

### Environment Variables
```env
NODE_ENV=production
DATABASE_URL=your_production_database_url
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=production_clerk_key
CLERK_SECRET_KEY=production_clerk_secret
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Build for Production
```bash
npm run build
npm start
```

### Deployment Options
- **Vercel**: Automatic deployment with GitHub integration
- **Railway/Render**: Full-stack deployment with PostgreSQL
- **Docker**: Containerized deployment (Dockerfile included)

## Security Considerations

- Enable HTTPS in production
- Configure CORS properly
- Implement rate limiting
- Use environment variables for sensitive data
- Enable audit logging
- Regular security updates

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions, please open a GitHub issue or contact support@example.com