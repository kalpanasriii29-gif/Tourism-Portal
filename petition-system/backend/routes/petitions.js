const express = require('express');
const { query } = require('../config/database');
const { generatePetitionId } = require('../utils/petitionId');
const { verifyToken, requireOfficialOrAdmin } = require('../middleware/auth');
const {
  validatePetitionSubmission,
  validateStatusUpdate,
  validateResponseSubmission,
  validatePetitionTracking,
  validatePetitionQuery
} = require('../middleware/validation');

const router = express.Router();

/**
 * POST /api/petitions
 * Submit new petition (public access, no login required)
 */
router.post('/', validatePetitionSubmission, async (req, res) => {
  try {
    const { from_name, to_department, whatsapp_number, petition_text } = req.body;

    // Generate unique petition ID
    const petitionId = await generatePetitionId();

    // Insert petition into database
    const result = await query(
      `INSERT INTO petitions (petition_id, from_name, to_department, whatsapp_number, petition_text)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [petitionId, from_name, to_department, whatsapp_number, petition_text]
    );

    const petition = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Petition submitted successfully',
      data: {
        petition_id: petition.petition_id,
        from_name: petition.from_name,
        to_department: petition.to_department,
        status: petition.status,
        created_at: petition.created_at
      }
    });

  } catch (error) {
    console.error('Petition submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit petition. Please try again.'
    });
  }
});

/**
 * GET /api/petitions/track/:petition_id
 * Track petition by ID (public access, no login required)
 */
router.get('/track/:petition_id', validatePetitionTracking, async (req, res) => {
  try {
    const { petition_id } = req.params;

    // Get petition details
    const petitionResult = await query(
      'SELECT * FROM petitions WHERE petition_id = $1',
      [petition_id]
    );

    if (petitionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Petition not found'
      });
    }

    const petition = petitionResult.rows[0];

    // Get responses
    const responsesResult = await query(
      'SELECT response_text, response_date, is_final FROM responses WHERE petition_id = $1 ORDER BY response_date ASC',
      [petition.id]
    );

    res.json({
      success: true,
      message: 'Petition details retrieved successfully',
      data: {
        petition: {
          petition_id: petition.petition_id,
          from_name: petition.from_name,
          to_department: petition.to_department,
          petition_text: petition.petition_text,
          status: petition.status,
          priority: petition.priority,
          created_at: petition.created_at,
          updated_at: petition.updated_at
        },
        responses: responsesResult.rows
      }
    });

  } catch (error) {
    console.error('Petition tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve petition details'
    });
  }
});

/**
 * GET /api/petitions
 * Get all petitions with filters (requires authentication)
 */
router.get('/', verifyToken, requireOfficialOrAdmin, validatePetitionQuery, async (req, res) => {
  try {
    const { status, department, priority, page = 1, limit = 20 } = req.query;
    
    let whereConditions = [];
    let queryParams = [];
    let paramCounter = 1;

    // Build dynamic WHERE clause
    if (status) {
      whereConditions.push(`status = $${paramCounter++}`);
      queryParams.push(status);
    }

    if (department) {
      whereConditions.push(`to_department ILIKE $${paramCounter++}`);
      queryParams.push(`%${department}%`);
    }

    if (priority) {
      whereConditions.push(`priority = $${paramCounter++}`);
      queryParams.push(priority);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM petitions ${whereClause}`,
      queryParams
    );
    const totalCount = parseInt(countResult.rows[0].total);

    // Get petitions with pagination
    const petitionsQuery = `
      SELECT p.*, 
             COALESCE(
               (SELECT COUNT(*) FROM responses WHERE petition_id = p.id), 0
             ) as response_count
      FROM petitions p
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $${paramCounter++} OFFSET $${paramCounter++}
    `;

    queryParams.push(limit, offset);
    const petitionsResult = await query(petitionsQuery, queryParams);

    res.json({
      success: true,
      message: 'Petitions retrieved successfully',
      data: {
        petitions: petitionsResult.rows,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(totalCount / limit),
          total_count: totalCount,
          per_page: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get petitions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve petitions'
    });
  }
});

/**
 * GET /api/petitions/:id
 * Get specific petition details (requires authentication)
 */
router.get('/:id', verifyToken, requireOfficialOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Get petition details
    const petitionResult = await query(
      'SELECT * FROM petitions WHERE id = $1',
      [id]
    );

    if (petitionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Petition not found'
      });
    }

    const petition = petitionResult.rows[0];

    // Get responses
    const responsesResult = await query(
      'SELECT * FROM responses WHERE petition_id = $1 ORDER BY response_date ASC',
      [id]
    );

    res.json({
      success: true,
      message: 'Petition details retrieved successfully',
      data: {
        petition,
        responses: responsesResult.rows
      }
    });

  } catch (error) {
    console.error('Get petition details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve petition details'
    });
  }
});

/**
 * PUT /api/petitions/:id/status
 * Update petition status (requires authentication)
 */
router.put('/:id/status', verifyToken, requireOfficialOrAdmin, validateStatusUpdate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority } = req.body;

    // Check if petition exists
    const checkResult = await query('SELECT id FROM petitions WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Petition not found'
      });
    }

    // Update petition
    let updateQuery = 'UPDATE petitions SET status = $1';
    let queryParams = [status];
    let paramCounter = 2;

    if (priority) {
      updateQuery += `, priority = $${paramCounter++}`;
      queryParams.push(priority);
    }

    updateQuery += ` WHERE id = $${paramCounter} RETURNING *`;
    queryParams.push(id);

    const result = await query(updateQuery, queryParams);

    res.json({
      success: true,
      message: 'Petition status updated successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Update petition status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update petition status'
    });
  }
});

/**
 * POST /api/petitions/:id/response
 * Add response to petition (requires authentication)
 */
router.post('/:id/response', verifyToken, requireOfficialOrAdmin, validateResponseSubmission, async (req, res) => {
  try {
    const { id } = req.params;
    const { response_text, is_final = false } = req.body;
    const { role } = req.user;

    // Check if petition exists
    const checkResult = await query('SELECT id FROM petitions WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Petition not found'
      });
    }

    // Add response
    const responseResult = await query(
      `INSERT INTO responses (petition_id, response_text, is_final, responded_by)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id, response_text, is_final, role]
    );

    // If this is a final response, update petition status to resolved
    if (is_final) {
      await query(
        'UPDATE petitions SET status = $1 WHERE id = $2',
        ['resolved', id]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Response added successfully',
      data: responseResult.rows[0]
    });

  } catch (error) {
    console.error('Add response error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add response'
    });
  }
});

/**
 * GET /api/petitions/stats/overview
 * Get petition statistics (requires authentication)
 */
router.get('/stats/overview', verifyToken, requireOfficialOrAdmin, async (req, res) => {
  try {
    const statsResult = await query(`
      SELECT 
        COUNT(*) as total_petitions,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_count,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved_count,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as last_30_days
      FROM petitions
    `);

    const departmentStatsResult = await query(`
      SELECT 
        to_department,
        COUNT(*) as count
      FROM petitions
      GROUP BY to_department
      ORDER BY count DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      message: 'Statistics retrieved successfully',
      data: {
        overview: statsResult.rows[0],
        department_stats: departmentStatsResult.rows
      }
    });

  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve statistics'
    });
  }
});

module.exports = router;