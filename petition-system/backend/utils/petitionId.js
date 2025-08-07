const { query } = require('../config/database');

/**
 * Generate unique petition ID in format TNK-YYYY-XXX
 * @returns {Promise<string>} Generated petition ID
 */
async function generatePetitionId() {
  const currentYear = new Date().getFullYear();
  const prefix = `TNK-${currentYear}-`;
  
  try {
    // Get the highest petition number for current year
    const result = await query(
      `SELECT petition_id FROM petitions 
       WHERE petition_id LIKE $1 
       ORDER BY petition_id DESC 
       LIMIT 1`,
      [`${prefix}%`]
    );
    
    let nextNumber = 1;
    
    if (result.rows.length > 0) {
      const lastId = result.rows[0].petition_id;
      const lastNumber = parseInt(lastId.split('-')[2]);
      nextNumber = lastNumber + 1;
    }
    
    // Format number with leading zeros (3 digits)
    const formattedNumber = nextNumber.toString().padStart(3, '0');
    
    return `${prefix}${formattedNumber}`;
    
  } catch (error) {
    console.error('Error generating petition ID:', error);
    throw new Error('Failed to generate petition ID');
  }
}

/**
 * Validate petition ID format
 * @param {string} petitionId - The petition ID to validate
 * @returns {boolean} True if valid format
 */
function validatePetitionId(petitionId) {
  const pattern = /^TNK-\d{4}-\d{3}$/;
  return pattern.test(petitionId);
}

module.exports = {
  generatePetitionId,
  validatePetitionId
};