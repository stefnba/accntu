#!/bin/sh

# run drizzle migrations and seeding
./drizzle/scripts/run.sh

# start server
node server.js