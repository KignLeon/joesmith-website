#!/bin/bash

# Create the target directory structure
mkdir -p src/main/resources/public/about
mkdir -p src/main/resources/public/contact
mkdir -p src/main/resources/public/experience
mkdir -p src/main/resources/public/css/js
mkdir -p src/main/resources/public/imgs

# Move HTML files
# Note: Using 'mv' will overwrite if files exist in destination, which is what we want here
# to match the latest root files.

# Main index
if [ -f "index.html" ]; then
    mv index.html src/main/resources/public/
fi

# Sub-pages (checking if they are files or folders in root)
# The user seems to have folders like 'about/index.html' in root based on previous context,
# but also mentions 'about.html' files. This script handles the 'folder/index.html' structure
# which is preferred for clean URLs.

if [ -d "about" ]; then
    cp -r about/* src/main/resources/public/about/
    rm -rf about
elif [ -f "about.html" ]; then
    mv about.html src/main/resources/public/about/index.html
fi

if [ -d "contact" ]; then
    cp -r contact/* src/main/resources/public/contact/
    rm -rf contact
elif [ -f "contact.html" ]; then
    mv contact.html src/main/resources/public/contact/index.html
fi

if [ -d "experience" ]; then
    cp -r experience/* src/main/resources/public/experience/
    rm -rf experience
elif [ -f "experience.html" ]; then
    mv experience.html src/main/resources/public/experience/index.html
fi

# Move Robots and Sitemap
if [ -f "robots.txt" ]; then
    mv robots.txt src/main/resources/public/
fi
if [ -f "sitemap.xml" ]; then
    mv sitemap.xml src/main/resources/public/
fi

# Move Assets (CSS, JS, Imgs) if they exist in root
# If 'css' folder exists in root
if [ -d "css" ]; then
    cp -r css/* src/main/resources/public/css/
    rm -rf css
fi

# If 'imgs' folder exists in root
if [ -d "imgs" ]; then
    cp -r imgs/* src/main/resources/public/imgs/
    rm -rf imgs
fi

# Clean up empty directories if any remain
rmdir about contact experience css imgs 2>/dev/null

echo "Reorganization complete. Files moved to src/main/resources/public/"