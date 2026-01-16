#!/bin/sh

# Runtime environment variable injection for Vite
# This script replaces MY_APP_* placeholders with actual environment variables

for i in $(env | grep MY_APP_)
do
    key=$(echo $i | cut -d '=' -f 1)
    value=$(echo $i | cut -d '=' -f 2-)
    echo "Replacing $key with $value"

    # Replace in JS and CSS files only
    find /usr/share/nginx/html -type f \( -name '*.js' -o -name '*.css' \) -exec sed -i "s|${key}|${value}|g" '{}' +
done
