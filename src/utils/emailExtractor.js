const axios = require('axios');
const cheerio = require('cheerio');
const { delay } = require('./helpers');

class EmailExtractor {
  constructor() {
    // Email regex pattern to match email addresses
    this.emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    
    // Configure axios with timeouts and headers
    this.axiosConfig = {
      timeout: 10000, // 10 second timeout
      maxRedirects: 5,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      maxContentLength: 5 * 1024 * 1024, // 5MB max response size
      validateStatus: function (status) {
        return status >= 200 && status < 400; // Accept 2xx and 3xx status codes
      },
    };
  }

  /**
   * Extract emails from a single page
   * @param {string} url - URL to extract emails from
   * @returns {Promise<Array<string>>} Array of email addresses found
   */
  async extractEmailsFromPage(url) {
    try {
      const response = await axios.get(url, this.axiosConfig);
      const html = response.data;
      
      // Load HTML into cheerio
      const $ = cheerio.load(html);
      
      // Remove script and style elements
      $('script, style, noscript').remove();
      
      // Get all text content
      const textContent = $('body').text();
      
      // Also check href attributes in mailto links
      const mailtoLinks = [];
      $('a[href^="mailto:"]').each((i, elem) => {
        const href = $(elem).attr('href');
        if (href) {
          const email = href.replace('mailto:', '').split('?')[0].trim();
          mailtoLinks.push(email);
        }
      });
      
      // Extract emails from text content using regex
      const emailsFromText = textContent.match(this.emailPattern) || [];
      
      // Combine all emails
      const allEmails = [...mailtoLinks, ...emailsFromText];
      
      return allEmails;
    } catch (error) {
      return [];
    }
  }

  /**
   * Get potential contact page URLs from a base URL
   * @param {string} baseUrl - Base website URL
   * @returns {Array<string>} Array of potential contact page URLs
   */
  getContactPageUrls(baseUrl) {
    const normalized = this.normalizeUrl(baseUrl);
    const baseUrlObj = new URL(normalized);
    const base = baseUrlObj.origin;
    
    // Common contact page paths in both English and Turkish
    const contactPaths = [
      '',  // Homepage
      '/contact',
      '/contact-us',
      '/contactus',
      '/iletisim',
      '/contact.html',
      '/contact.php',
      '/about',
      '/about-us',
      '/hakkimizda',
      '/about.html',
      '/footer',
      '/company',
      '/info',
    ];
    
    return contactPaths.map(path => base + path);
  }

  /**
   * Extract emails from a company's website (enhanced version)
   * @param {string} websiteUrl - URL of the company website
   * @returns {Promise<Array<string>>} Array of unique email addresses found
   */
  async extractEmailsFromWebsite(websiteUrl) {
    if (!websiteUrl) {
      return [];
    }

    try {
      const allEmails = [];
      
      // Get potential contact page URLs
      const contactUrls = this.getContactPageUrls(websiteUrl);
      
      // Extract emails from multiple pages
      for (const url of contactUrls) {
        try {
          const emails = await this.extractEmailsFromPage(url);
          allEmails.push(...emails);
          
          // If we found emails, we can be less aggressive
          if (emails.length > 0) {
            // Small delay between requests
            await delay(300);
          } else {
            // Shorter delay if no emails found
            await delay(100);
          }
        } catch (error) {
          // Continue with next URL
          continue;
        }
      }
      
      // Remove duplicates
      const uniqueEmails = [...new Set(allEmails)];
      
      // Filter out common false positives and invalid emails
      const validEmails = uniqueEmails.filter(email => this.isValidEmail(email));
      
      // Small delay after successful scraping to be respectful
      await delay(500);
      
      return validEmails;
    } catch (error) {
      // Log error but don't throw - return empty array for failed extractions
      if (error.code === 'ECONNABORTED') {
        console.log(`⏱️  Timeout accessing ${websiteUrl}`);
      } else if (error.response) {
        console.log(`⚠️  HTTP ${error.response.status} for ${websiteUrl}`);
      } else if (error.code === 'ENOTFOUND' || error.code === 'EAI_AGAIN') {
        console.log(`🔍 Domain not found: ${websiteUrl}`);
      } else {
        console.log(`⚠️  Error accessing ${websiteUrl}: ${error.message}`);
      }
      return [];
    }
  }

  /**
   * Normalize URL to include protocol
   * @param {string} url - URL to normalize
   * @returns {string} Normalized URL with protocol
   */
  normalizeUrl(url) {
    if (!url) return '';
    
    // Remove whitespace
    url = url.trim();
    
    // Add protocol if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    return url;
  }

  /**
   * Validate email address and filter out common false positives
   * @param {string} email - Email address to validate
   * @returns {boolean} True if email appears valid
   */
  isValidEmail(email) {
    if (!email) return false;
    
    // Basic validation
    const basicPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!basicPattern.test(email)) {
      return false;
    }
    
    // Filter out common false positives
    const invalidPatterns = [
      /\.png$/i,
      /\.jpg$/i,
      /\.jpeg$/i,
      /\.gif$/i,
      /\.svg$/i,
      /\.css$/i,
      /\.js$/i,
      /example\.com$/i,
      /domain\.com$/i,
      /email\.com$/i,
      /test\.com$/i,
      /sample\.com$/i,
      /@sentry\.io$/i,
      /@googleusercontent\.com$/i,
      /@w3\.org$/i,
      /@schema\.org$/i,
    ];
    
    for (const pattern of invalidPatterns) {
      if (pattern.test(email)) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Extract the first valid email from a website
   * Prioritizes contact-related emails
   * @param {string} websiteUrl - URL of the company website
   * @returns {Promise<string|null>} First valid email or null
   */
  async extractFirstEmail(websiteUrl) {
    const emails = await this.extractEmailsFromWebsite(websiteUrl);
    
    if (emails.length === 0) {
      return null;
    }
    
    console.log(`📧 Found ${emails.length} email(s) on website`);
    
    // Prioritize emails that look like contact emails (enhanced list)
    const contactEmailPatterns = [
      /^info@/i,
      /^contact@/i,
      /^iletisim@/i,  // Turkish for contact
      /^sales@/i,
      /^satis@/i,  // Turkish for sales
      /^support@/i,
      /^destek@/i,  // Turkish for support
      /^hello@/i,
      /^inquiry@/i,
      /^business@/i,
      /^office@/i,
      /^admin@/i,
    ];
    
    for (const pattern of contactEmailPatterns) {
      const contactEmail = emails.find(email => pattern.test(email));
      if (contactEmail) {
        return contactEmail;
      }
    }
    
    // If no contact email found, return the first valid email
    return emails[0];
  }
}

module.exports = new EmailExtractor();
