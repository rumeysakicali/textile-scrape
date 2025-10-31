# Textile Company Scraper

A Node.js application that searches for textile fabric companies using Google Maps API, identifies active companies, and can send business inquiry emails to them.

## Features

- 🔍 Search textile companies using Google Maps Places API
- 📊 Collect detailed company information (address, phone, website, ratings)
- ✅ Filter active companies based on business status and reviews
- 🌐 Automatically extract email addresses from company websites
- 📧 Send automated emails to companies (optional)
- 💾 Save results to JSON files for further analysis

## Prerequisites

- Node.js (v14 or higher)
- Google Maps API Key with Places API enabled
- Gmail account for sending emails (optional)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/rumeysakicali/textile-scrape.git
cd textile-scrape
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

4. Edit `.env` file and add your credentials:
```
GOOGLE_MAPS_API_KEY=your_actual_api_key
SEARCH_LOCATION=Istanbul, Turkey
SEARCH_RADIUS=50000
SEARCH_KEYWORD=textile fabric company

# Optional: Email configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_SUBJECT=Business Inquiry
EMAIL_FROM_NAME=Your Company Name
```

## Getting Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Places API
   - Geocoding API
4. Create credentials (API Key)
5. Copy the API key to your `.env` file

## Usage

Run the scraper:
```bash
npm start
```

The application will:
1. Search for textile companies in the specified location
2. Fetch detailed information for each company
3. Filter active companies
4. Save results to `data/` directory
5. Extract email addresses from company websites
6. Optionally send emails to companies (if configured)

## Output Files

All data is saved in the `data/` directory:

- `companies_all.json` - All companies found
- `companies_active.json` - Filtered active companies
- `email_results.json` - Email sending results (if enabled)

## Configuration Options

Environment variables in `.env`:

| Variable | Description | Default |
|----------|-------------|---------|
| `GOOGLE_MAPS_API_KEY` | Google Maps API key | Required |
| `SEARCH_LOCATION` | Center location for search | Istanbul, Turkey |
| `SEARCH_RADIUS` | Search radius in meters | 50000 |
| `SEARCH_KEYWORD` | Search keyword | textile fabric company |
| `EMAIL_USER` | Email sender address | Optional |
| `EMAIL_PASSWORD` | Email password/app password | Optional |
| `EMAIL_SUBJECT` | Email subject line | Business Inquiry |
| `EMAIL_FROM_NAME` | Sender name | Your Company Name |

## Active Company Criteria

A company is considered active if:
- Business status is "OPERATIONAL"
- Has ratings or user reviews

## Email Functionality

The email feature is optional. To use it:
1. Set up a Gmail account
2. Enable 2-factor authentication
3. Generate an App Password
4. Add credentials to `.env` file

The application automatically extracts email addresses from company websites by:
- Visiting each company's website URL (from Google Maps data)
- Scanning the website content for email addresses
- Prioritizing contact-related emails (info@, contact@, sales@, support@)
- Filtering out invalid or placeholder emails

## Project Structure

```
textile-scrape/
├── src/
│   ├── index.js                    # Main entry point
│   ├── services/
│   │   ├── googleMapsService.js    # Google Maps API integration
│   │   └── emailService.js         # Email sending service
│   └── utils/
│       ├── fileHandler.js          # File operations
│       ├── emailExtractor.js       # Website email extraction
│       └── helpers.js              # Shared utility functions
├── data/                            # Output directory (created automatically)
├── .env.example                     # Environment variables template
├── .gitignore                       # Git ignore rules
├── package.json                     # Project dependencies
└── README.md                        # This file
```

## License

ISC

## Türkçe Açıklama

Bu uygulama, Google Maps API kullanarak tekstil kumaş firmalarını tarar, aktif firmaları tespit eder ve isteğe bağlı olarak onlara e-posta gönderir.

### Özellikler:
- Google Maps Places API ile tekstil firmalarını arama
- Firma bilgilerini toplama (adres, telefon, web sitesi, değerlendirmeler)
- Aktif firmaları filtreleme
- Firmalara otomatik e-posta gönderme (opsiyonel)
- Sonuçları JSON dosyalarına kaydetme