# Accntu - Personal Finance Manager

A modern web application for managing and analyzing personal finances across multiple bank accounts and credit cards.

## Features

- Import transactions from CSV files with support for different bank formats
- API integration for supported banks
- Transaction management and categorization
- Financial analytics dashboard
- Multi-account support
- Secure authentication with multiple providers

## Tech Stack

- **Framework:** Next.js 15
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **UI Components:** shadcn/ui
- **State Management:** Zustand, nuqs
- **Database:** PostgreSQL with Drizzle ORM
- **API:** Hono
- **Authentication:** Custom implementation with social providers
- **Package Manager:** Bun
- **Deployment:** Docker with Coolify

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/accntu.git
   cd accntu
   ```

2. Install dependencies:

   ```bash
   bun install
   ```

3. Copy the environment variables:

   ```bash
   cp .env.example .env
   ```

4. Update the environment variables in `.env` with your configuration

5. Start the development server:

   ```bash
   bun dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Setup

1. Start the database:

   ```bash
   docker-compose up -d db
   ```

2. Run migrations:
   ```bash
   bun db:push
   ```

## Development

- `bun dev` - Start the development server
- `bun build` - Build the production application
- `bun start` - Start the production server
- `bun test` - Run tests
- `bun db:push` - Push database changes
- `bun db:studio` - Open Drizzle Studio

## Docker Deployment

1. Build the image:

   ```bash
   docker-compose build
   ```

2. Start the services:
   ```bash
   docker-compose up -d
   ```

## Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # Reusable UI components
├── features/         # Feature-based modules
│   ├── auth/        # Authentication
│   ├── accounts/    # Account management
│   ├── transactions/# Transaction management
│   └── dashboard/   # Analytics dashboard
├── lib/             # Shared utilities
└── types/           # TypeScript type definitions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
