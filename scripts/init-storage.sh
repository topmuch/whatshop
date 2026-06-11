#!/bin/bash
mkdir -p /app/uploads
chmod -R 755 /app/uploads
chown -R node:node /app/uploads 2>/dev/null || true
echo "Storage initialized successfully"