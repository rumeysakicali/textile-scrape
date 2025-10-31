const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.emailUser = process.env.EMAIL_USER;
    this.emailPassword = process.env.EMAIL_PASSWORD;
    this.emailFromName = process.env.EMAIL_FROM_NAME || 'Business Inquiry';
    
    if (!this.emailUser || !this.emailPassword) {
      console.warn('⚠️  Email credentials not configured. Email sending will be skipped.');
      this.configured = false;
      return;
    }

    this.configured = true;
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.emailUser,
        pass: this.emailPassword,
      },
    });
  }

  /**
   * Send emails to companies
   * @param {Array} companies - Array of company objects
   * @returns {Promise<Object>} Results object with success/failed counts
   */
  async sendEmailsToCompanies(companies) {
    const results = {
      success: 0,
      failed: 0,
      details: [],
    };

    if (!this.configured) {
      console.log('⚠️  Skipping email sending - credentials not configured');
      return results;
    }

    for (const company of companies) {
      try {
        // Extract email from website or skip if no contact info
        const email = this.extractEmailFromCompany(company);
        
        if (!email) {
          console.log(`⏭️  Skipping ${company.name} - no email found`);
          results.details.push({
            company: company.name,
            status: 'skipped',
            reason: 'No email found',
          });
          continue;
        }

        const emailContent = this.generateEmailContent(company);
        
        await this.sendEmail(email, emailContent);
        
        console.log(`✅ Email sent to ${company.name} (${email})`);
        results.success++;
        results.details.push({
          company: company.name,
          email: email,
          status: 'sent',
        });

        // Delay to avoid rate limiting
        await this.delay(2000);
      } catch (error) {
        console.error(`❌ Failed to send email to ${company.name}:`, error.message);
        results.failed++;
        results.details.push({
          company: company.name,
          status: 'failed',
          error: error.message,
        });
      }
    }

    return results;
  }

  /**
   * Extract email from company data
   * Note: This is a placeholder - actual email extraction would require
   * scraping the company website or using additional APIs
   * @param {Object} company - Company object
   * @returns {string|null} Email address or null
   */
  extractEmailFromCompany(company) {
    // In a real implementation, you would:
    // 1. Visit the company website
    // 2. Scrape contact page for email
    // 3. Use pattern matching to find email addresses
    // 
    // For demonstration, we'll use a placeholder approach
    if (company.website) {
      // Placeholder: would need to scrape the website
      // For now, return null to indicate email extraction is needed
      return null;
    }
    return null;
  }

  /**
   * Generate email content for a company
   * @param {Object} company - Company object
   * @returns {Object} Email content with subject and body
   */
  generateEmailContent(company) {
    const subject = process.env.EMAIL_SUBJECT || 'Business Inquiry';
    
    const body = `
Dear ${company.name} Team,

I hope this message finds you well.

I am reaching out to explore potential business opportunities with your esteemed textile company.

We would be interested in learning more about your products and services.

Company Details:
- Name: ${company.name}
- Address: ${company.formatted_address || company.address}
${company.phone ? `- Phone: ${company.phone}` : ''}
${company.website ? `- Website: ${company.website}` : ''}

We look forward to the possibility of working together.

Best regards,
${this.emailFromName}
    `.trim();

    return { subject, body };
  }

  /**
   * Send an email
   * @param {string} to - Recipient email address
   * @param {Object} content - Email content (subject and body)
   */
  async sendEmail(to, content) {
    const mailOptions = {
      from: `${this.emailFromName} <${this.emailUser}>`,
      to: to,
      subject: content.subject,
      text: content.body,
    };

    await this.transporter.sendMail(mailOptions);
  }

  /**
   * Delay helper function
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise}
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new EmailService();
