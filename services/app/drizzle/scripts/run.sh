#!/bin/sh
set -e

# Only install dependencies for drizzle migration. Those are not bundled via `next build` as its optimized to only install dependencies that are used`
echo "Installing production dependencies"
cd ./drizzle/scripts

npm install --omit=dev
cd ../..

echo "🔧 Running database migrations..."
# Wait for migration to finish
npm run drizzle:migrate & PID=$!
wait $PID
echo "✅ Database migrations completed!"

echo "🧑‍💻 Seeding database..."
npm run drizzle:seed & PID=$!
wait $PID
echo "✅ Database seeding completed!"

rm -rf drizzle/migrate/node_modules
rm -rf drizzle/migrate/package-lock.json
echo "🗑️ Cleanup completed!"




