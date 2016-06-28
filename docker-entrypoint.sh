#!/bin/bash
set -e

# check env variables
if [ -z "$WORDPRESS_FEED_URL" ]; then
  echo "WORDPRESS_FEED_URL environment variable required.";
  exit 1;
fi
echo "USING WORDPRESS BLOG: ${WORDPRESS_FEED_URL}"

# execute nodejs application
exec npm start