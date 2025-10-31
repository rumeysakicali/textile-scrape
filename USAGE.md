# Textile Company Scraper - Usage Examples

## Quick Start

### 1. Basic Setup
```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env and add your API key
nano .env
```

### 2. Minimal Configuration
For a basic run, you only need:
```env
GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

### 3. Run the Application
```bash
npm start
```

## Configuration Examples

### Example 1: Search in Istanbul
```env
GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
SEARCH_LOCATION=Istanbul, Turkey
SEARCH_RADIUS=50000
SEARCH_KEYWORD=textile fabric company
```

### Example 2: Search in Bursa
```env
GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
SEARCH_LOCATION=Bursa, Turkey
SEARCH_RADIUS=30000
SEARCH_KEYWORD=kumaş imalat
```

### Example 3: Search Multiple Textile Types
```env
GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
SEARCH_LOCATION=Denizli, Turkey
SEARCH_RADIUS=25000
SEARCH_KEYWORD=textile manufacturer
```

### Example 4: With Email Configuration
```env
GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
SEARCH_LOCATION=Istanbul, Turkey
SEARCH_RADIUS=50000
SEARCH_KEYWORD=textile fabric company

# Email settings
EMAIL_USER=mycompany@gmail.com
EMAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx
EMAIL_SUBJECT=İşbirliği Fırsatı / Business Opportunity
EMAIL_FROM_NAME=My Textile Company
```

## Expected Output

### Console Output
```
🚀 Starting Textile Company Scraper...

📍 Searching for textile companies...
Searching for: textile fabric company
Location: Istanbul, Turkey
Radius: 50000 meters
Coordinates: 41.0082, 28.9784

✅ Found 15 companies

🔍 Filtering active companies...
✅ Found 12 active companies

💾 Saving company data...
📁 Saved to: /path/to/textile-scrape/data/companies_all.json
📁 Saved to: /path/to/textile-scrape/data/companies_active.json
✅ Data saved successfully

📧 Sending emails to active companies...
🔍 Extracting email from https://www.abctextile.com...
✉️  Found email: info@abctextile.com
✅ Email sent to ABC Textile (info@abctextile.com)
🔍 Extracting email from https://www.xyztextile.com...
✉️  Found email: contact@xyztextile.com
✅ Email sent to XYZ Textile (contact@xyztextile.com)
⏭️  Skipping DEF Fabrics - no email found
...
✅ Sent 8 emails successfully
❌ Failed to send 0 emails

✨ Process completed successfully!
```

### Output Files

#### companies_all.json
```json
[
  {
    "name": "ABC Tekstil Ltd.",
    "place_id": "ChIJ...",
    "address": "Merter, Istanbul",
    "location": {
      "lat": 41.0082,
      "lng": 28.9784
    },
    "rating": 4.5,
    "user_ratings_total": 23,
    "business_status": "OPERATIONAL",
    "types": ["store", "point_of_interest"],
    "formatted_address": "Merter Mah. ..., Istanbul, Turkey",
    "phone": "+90 212 XXX XXXX",
    "website": "https://www.abctekstil.com"
  }
]
```

#### companies_active.json
Same format, but only includes companies with:
- `business_status === "OPERATIONAL"`
- Has ratings or reviews (`rating > 0` or `user_ratings_total > 0`)

## Common Issues

### Issue: "GOOGLE_MAPS_API_KEY is not set"
**Solution:** Make sure you have created a `.env` file and added your API key.

### Issue: "REQUEST_DENIED"
**Solution:** 
1. Check if Places API is enabled in Google Cloud Console
2. Verify your API key is correct
3. Check if billing is enabled for your Google Cloud project

### Issue: "Zero results"
**Solution:**
- Try increasing the `SEARCH_RADIUS`
- Try a different `SEARCH_LOCATION`
- Use different keywords (e.g., "kumaş", "tekstil", "fabric")

### Issue: No emails sent
**Solution:** 
- Make sure companies have websites in their Google Maps data
- The application automatically extracts emails from company websites
- If a website doesn't contain email addresses, that company will be skipped
- Check the console output to see which emails were found
- Email credentials must be configured in `.env` file

## Advanced Usage

### Email Extraction Feature

The application automatically extracts email addresses from company websites:

**How it works:**
1. For each company found on Google Maps, the app checks if they have a website
2. If a website exists, the app visits it and scans for email addresses
3. Email addresses are extracted from:
   - `mailto:` links
   - Plain text on the page (contact info, footer, etc.)
4. The app prioritizes contact emails like:
   - `info@company.com`
   - `contact@company.com`
   - `sales@company.com`
   - `support@company.com`
5. Invalid emails are filtered out (example.com, image files, etc.)

**What to expect:**
- Some websites may not have email addresses → company will be skipped
- Some websites may be inaccessible (timeout, DNS errors) → logged and skipped
- Email extraction includes a 500ms delay per website to be respectful
- The first valid email found is used for communication

**Example output:**
```
🔍 Extracting email from https://textile-company.com...
✉️  Found email: info@textile-company.com
```

### Running Demo Mode
```bash
npm run demo
```

### Processing Results
After running, you can analyze the JSON files with any tool:
```bash
# Count active companies
cat data/companies_active.json | jq 'length'

# Get companies with websites
cat data/companies_active.json | jq '[.[] | select(.website != null)]'

# Sort by rating
cat data/companies_active.json | jq 'sort_by(.rating) | reverse'
```

## Türkçe Örnekler

### Bursa'da Arama
```env
GOOGLE_MAPS_API_KEY=your_key
SEARCH_LOCATION=Bursa, Türkiye
SEARCH_RADIUS=30000
SEARCH_KEYWORD=tekstil kumaş
```

### İstanbul'da Arama
```env
GOOGLE_MAPS_API_KEY=your_key
SEARCH_LOCATION=Merter, İstanbul
SEARCH_RADIUS=10000
SEARCH_KEYWORD=toptan kumaş
```
