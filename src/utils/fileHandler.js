const fs = require('fs').promises;
const path = require('path');

/**
 * Save data to a JSON file
 * @param {string} filename - Name of the file
 * @param {Object|Array} data - Data to save
 */
async function saveToFile(filename, data) {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    
    // Create data directory if it doesn't exist
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }

    const filePath = path.join(dataDir, filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`📁 Saved to: ${filePath}`);
  } catch (error) {
    console.error(`Error saving to file ${filename}:`, error.message);
    throw error;
  }
}

/**
 * Load data from a JSON file
 * @param {string} filename - Name of the file
 * @returns {Promise<Object|Array>} Loaded data
 */
async function loadFromFile(filename) {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    const filePath = path.join(dataDir, filename);
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error loading from file ${filename}:`, error.message);
    throw error;
  }
}

module.exports = {
  saveToFile,
  loadFromFile,
};
