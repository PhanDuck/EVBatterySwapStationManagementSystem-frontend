#!/bin/bash
set -e

echo "Building app..."
npm run build

echo "Deploying files to server..."
scp -r -i ./swp-key.pem dist/* root@103.200.20.190:/var/www/html/

echo "Done!"

