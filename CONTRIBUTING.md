# Contributing to Textile Company Scraper

## Future Enhancements

This project is ready to use but has room for improvements. Here are some ideas:

### 1. Email Extraction
Currently, the email extraction is not implemented. You can enhance this by:
- Adding a web scraping library (e.g., cheerio, puppeteer)
- Implementing pattern matching for email addresses
- Scraping company contact pages

Example implementation:
```javascript
async function extractEmailFromWebsite(url) {
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const text = $('body').text();
  const emails = text.match(emailRegex);
  return emails ? emails[0] : null;
}
```

### 2. Database Integration
Instead of JSON files, you could store data in a database:
- MongoDB for NoSQL approach
- PostgreSQL with PostGIS for location-based queries
- SQLite for lightweight local storage

### 3. Multiple Locations
Add support for searching multiple locations in one run:
```javascript
const locations = ['Istanbul', 'Bursa', 'Denizli', 'Gaziantep'];
for (const location of locations) {
  // Search each location
}
```

### 4. Export to CSV/Excel
Add export functionality for easier analysis:
```javascript
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvWriter = createCsvWriter({
  path: 'companies.csv',
  header: [
    {id: 'name', title: 'Company Name'},
    {id: 'address', title: 'Address'},
    {id: 'phone', title: 'Phone'},
    // ...
  ]
});
await csvWriter.writeRecords(companies);
```

### 5. Rate Limiting and Retry Logic
Improve robustness with better error handling:
- Implement exponential backoff
- Add retry logic for failed API calls
- Better rate limiting to avoid quota issues

### 6. Web Interface
Create a simple web UI:
- Express.js backend
- React/Vue frontend
- Real-time progress updates
- Interactive map display

### 7. Pagination Support
Handle more results with pagination:
```javascript
let pageToken = null;
do {
  const response = await searchPlaces({ pageToken });
  pageToken = response.next_page_token;
  // Process results
} while (pageToken);
```

### 8. Email Templates
Create customizable email templates:
- HTML email support
- Template variables
- Multiple languages
- Attachment support

### 9. Scheduling
Add cron job support for regular scans:
```javascript
const cron = require('node-cron');
cron.schedule('0 0 * * *', async () => {
  // Run daily scan
  await main();
});
```

### 10. Analytics Dashboard
Track and visualize:
- Number of companies found over time
- Geographic distribution
- Rating trends
- Email campaign success rates

## Development Setup

### Code Style
- Use ESLint for code consistency
- Follow JavaScript Standard Style
- Write descriptive comments for complex logic

### Testing
Add tests using Jest or Mocha:
```bash
npm install --save-dev jest
npm test
```

Example test:
```javascript
describe('GoogleMapsService', () => {
  it('should validate search radius', () => {
    process.env.SEARCH_RADIUS = 'invalid';
    expect(() => searchTextileCompanies()).toThrow();
  });
});
```

## Submitting Changes

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test your changes
5. Submit a pull request

## Questions?

Feel free to open an issue for:
- Bug reports
- Feature requests
- Questions about implementation
- Help with setup
