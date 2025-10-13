#!/bin/bash
# IndexNow Instant Submission Script

# Your site details
SITE_URL="https://aktunes.netlify.app"
INDEX_KEY="a8f5f167f44f4964e6c998dee827110c"

# URLs to submit (add your main pages)
URLS=(
    "https://aktunes.netlify.app/"
    "https://aktunes.netlify.app/home.html"
    "https://aktunes.netlify.app/about.html"
    "https://aktunes.netlify.app/contact.html"
    "https://aktunes.netlify.app/artists.html"
    "https://aktunes.netlify.app/electronic-music.html"
    "https://aktunes.netlify.app/gaming-music.html"
    "https://aktunes.netlify.app/youtube-music.html"
)

echo "🚀 Submitting URLs to search engines..."

for url in "${URLS[@]}"; do
    echo "📤 Submitting: $url"
    
    # Microsoft Bing (Also indexes for Yahoo)
    curl -X POST "https://api.indexnow.org/indexnow" \
         -H "Content-Type: application/json" \
         -d "{
            \"host\": \"aktunes.netlify.app\",
            \"key\": \"$INDEX_KEY\",
            \"urlList\": [\"$url\"]
         }" > /dev/null 2>&1
    
    # Yandex
    curl -X POST "https://yandex.com/indexnow" \
         -H "Content-Type: application/json" \
         -d "{
            \"host\": \"aktunes.netlify.app\",
            \"key\": \"$INDEX_KEY\", 
            \"urlList\": [\"$url\"]
         }" > /dev/null 2>&1
         
    echo "✅ Submitted to Bing, Yahoo & Yandex"
    sleep 1
done

echo "🎉 All URLs submitted! Check search console in 24-48 hours."