#!/bin/sh
set -e

echo "🚀 Starting database setup process..."

# Use bun for faster package management
echo "📦 Installing production dependencies..."
cd ./drizzle/scripts
bun install --production
cd ../..

echo "🔧 Running database migrations..."
bun run drizzle:migrate
echo "✅ Database migrations completed!"

echo "🌱 Seeding database..."
bun run drizzle:seed
echo "✅ Database seeding completed!"

echo "🧹 Cleaning up temporary files..."
rm -rf drizzle/scripts/node_modules
rm -rf drizzle/scripts/bun.lockb
echo "✅ Cleanup completed!"

echo "🎉 Database setup completed successfully!"




