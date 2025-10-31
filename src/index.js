require('dotenv').config();

const googleMapsService = require('./services/googleMapsService');
const emailService = require('./services/emailService');
const { saveToFile } = require('./utils/fileHandler');

async function main() {
  try {
    console.log('🚀 Starting Textile Company Scraper...\n');

    // Step 1: Fetch companies from Google Maps
    console.log('📍 Searching for textile companies...');
    const companies = await googleMapsService.searchTextileCompanies();
    console.log(`✅ Found ${companies.length} companies\n`);

    // Step 2: Filter active companies
    console.log('🔍 Filtering active companies...');
    const activeCompanies = companies.filter(company => {
      // A company is considered active if it has:
      // - business_status === 'OPERATIONAL'
      // - rating (has reviews)
      // - opening_hours information
      return company.business_status === 'OPERATIONAL' && 
             (company.rating || company.user_ratings_total > 0);
    });
    console.log(`✅ Found ${activeCompanies.length} active companies\n`);

    // Step 3: Save data
    console.log('💾 Saving company data...');
    await saveToFile('companies_all.json', companies);
    await saveToFile('companies_active.json', activeCompanies);
    console.log('✅ Data saved successfully\n');

    // Step 4: Send emails
    if (activeCompanies.length > 0) {
      console.log('📧 Sending emails to active companies...');
      const emailResults = await emailService.sendEmailsToCompanies(activeCompanies);
      console.log(`✅ Sent ${emailResults.success} emails successfully`);
      console.log(`❌ Failed to send ${emailResults.failed} emails\n`);
      
      await saveToFile('email_results.json', emailResults);
    } else {
      console.log('⚠️  No active companies found to send emails\n');
    }

    console.log('✨ Process completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
