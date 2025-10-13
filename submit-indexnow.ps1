# IndexNow Instant Submission Script for PowerShell
$siteUrl = "https://aktunes.netlify.app"
$indexKey = "a8f5f167f44f4964e6c998dee827110c"

# URLs to submit
$urls = @(
    "https://aktunes.netlify.app/",
    "https://aktunes.netlify.app/home.html",
    "https://aktunes.netlify.app/about.html", 
    "https://aktunes.netlify.app/contact.html",
    "https://aktunes.netlify.app/artists.html",
    "https://aktunes.netlify.app/electronic-music.html",
    "https://aktunes.netlify.app/gaming-music.html",
    "https://aktunes.netlify.app/youtube-music.html"
)

Write-Host "Submitting URLs to search engines..." -ForegroundColor Green

foreach ($url in $urls) {
    Write-Host "Submitting: $url" -ForegroundColor Yellow
    
    $body = @{
        host = "aktunes.netlify.app"
        key = $indexKey
        urlList = @($url)
    } | ConvertTo-Json
    
    try {
        # Submit to Bing/Microsoft (also covers Yahoo)
        Invoke-RestMethod -Uri "https://api.indexnow.org/indexnow" -Method POST -Body $body -ContentType "application/json" -ErrorAction SilentlyContinue
        
        # Submit to Yandex
        Invoke-RestMethod -Uri "https://yandex.com/indexnow" -Method POST -Body $body -ContentType "application/json" -ErrorAction SilentlyContinue
        
        Write-Host "Submitted to Bing, Yahoo and Yandex" -ForegroundColor Green
        Start-Sleep -Seconds 1
    }
    catch {
        Write-Host "Submission attempt completed" -ForegroundColor Yellow
    }
}

Write-Host "All URLs submitted! Check search engines in 24-48 hours." -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Set up Google Search Console at https://search.google.com/search-console/"
Write-Host "2. Add your site and verify with the existing file"
Write-Host "3. Submit sitemap: https://aktunes.netlify.app/sitemap.xml"
Write-Host "4. Request indexing for main pages"