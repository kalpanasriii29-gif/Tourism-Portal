const express = require('express');
const { query } = require('../config/database');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * DELETE /api/admin/petitions/:id
 * Delete petition (admin only)
 */
router.delete('/petitions/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if petition exists
    const checkResult = await query('SELECT petition_id FROM petitions WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Petition not found'
      });
    }

    const petitionId = checkResult.rows[0].petition_id;

    // Delete petition (responses will be deleted automatically due to CASCADE)
    await query('DELETE FROM petitions WHERE id = $1', [id]);

    res.json({
      success: true,
      message: `Petition ${petitionId} deleted successfully`
    });

  } catch (error) {
    console.error('Delete petition error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete petition'
    });
  }
});

/**
 * GET /api/admin/analytics
 * Get comprehensive system analytics (admin only)
 */
router.get('/analytics', verifyToken, requireAdmin, async (req, res) => {
  try {
    // Overall statistics
    const overallStats = await query(`
      SELECT 
        COUNT(*) as total_petitions,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_count,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved_count,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
        COUNT(*) FILTER (WHERE priority = 'urgent') as urgent_count,
        COUNT(*) FILTER (WHERE priority = 'high') as high_priority_count,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as last_7_days,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as last_30_days,
        AVG(CASE 
          WHEN status = 'resolved' THEN EXTRACT(epoch FROM (updated_at - created_at))/3600 
          ELSE NULL 
        END) as avg_resolution_hours
      FROM petitions
    `);

    // Department-wise statistics
    const departmentStats = await query(`
      SELECT 
        to_department,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
        AVG(CASE 
          WHEN status = 'resolved' THEN EXTRACT(epoch FROM (updated_at - created_at))/3600 
          ELSE NULL 
        END) as avg_resolution_hours
      FROM petitions
      GROUP BY to_department
      ORDER BY total DESC
    `);

    // Monthly trends (last 12 months)
    const monthlyTrends = await query(`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as total_submissions,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved_count
      FROM petitions
      WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
    `);

    // Response activity
    const responseActivity = await query(`
      SELECT 
        responded_by,
        COUNT(*) as response_count,
        COUNT(*) FILTER (WHERE is_final = true) as final_responses
      FROM responses
      GROUP BY responded_by
    `);

    // Recent activity (last 50 actions)
    const recentActivity = await query(`
      SELECT 
        p.petition_id,
        p.from_name,
        p.to_department,
        p.status,
        p.updated_at as last_activity,
        'status_update' as activity_type
      FROM petitions p
      WHERE p.updated_at > p.created_at
      
      UNION ALL
      
      SELECT 
        p.petition_id,
        p.from_name,
        p.to_department,
        'response_added' as status,
        r.response_date as last_activity,
        'response' as activity_type
      FROM responses r
      JOIN petitions p ON r.petition_id = p.id
      
      ORDER BY last_activity DESC
      LIMIT 50
    `);

    res.json({
      success: true,
      message: 'Analytics retrieved successfully',
      data: {
        overall_stats: overallStats.rows[0],
        department_stats: departmentStats.rows,
        monthly_trends: monthlyTrends.rows,
        response_activity: responseActivity.rows,
        recent_activity: recentActivity.rows
      }
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve analytics'
    });
  }
});

/**
 * GET /api/admin/reports/export
 * Export petitions data (admin only)
 */
router.get('/reports/export', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { format = 'json', status, department, start_date, end_date } = req.query;

    let whereConditions = [];
    let queryParams = [];
    let paramCounter = 1;

    // Build dynamic WHERE clause
    if (status) {
      whereConditions.push(`p.status = $${paramCounter++}`);
      queryParams.push(status);
    }

    if (department) {
      whereConditions.push(`p.to_department ILIKE $${paramCounter++}`);
      queryParams.push(`%${department}%`);
    }

    if (start_date) {
      whereConditions.push(`p.created_at >= $${paramCounter++}`);
      queryParams.push(start_date);
    }

    if (end_date) {
      whereConditions.push(`p.created_at <= $${paramCounter++}`);
      queryParams.push(end_date);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get petitions with responses
    const exportQuery = `
      SELECT 
        p.petition_id,
        p.from_name,
        p.to_department,
        p.whatsapp_number,
        p.petition_text,
        p.status,
        p.priority,
        p.created_at,
        p.updated_at,
        COALESCE(
          (SELECT COUNT(*) FROM responses WHERE petition_id = p.id), 0
        ) as response_count,
        COALESCE(
          (SELECT STRING_AGG(response_text, ' | ' ORDER BY response_date) FROM responses WHERE petition_id = p.id), 
          'No responses yet'
        ) as all_responses
      FROM petitions p
      ${whereClause}
      ORDER BY p.created_at DESC
    `;

    const result = await query(exportQuery, queryParams);

    if (format === 'csv') {
      // Convert to CSV format
      const csvHeader = 'Petition ID,Name,Department,WhatsApp,Petition Text,Status,Priority,Created At,Updated At,Response Count,Responses\n';
      const csvData = result.rows.map(row => {
        return [
          row.petition_id,
          `"${row.from_name}"`,
          `"${row.to_department}"`,
          row.whatsapp_number,
          `"${row.petition_text.replace(/"/g, '""')}"`,
          row.status,
          row.priority,
          row.created_at,
          row.updated_at,
          row.response_count,
          `"${row.all_responses.replace(/"/g, '""')}"`
        ].join(',');
      }).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=petitions-export-${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csvHeader + csvData);
    } else {
      // JSON format
      res.json({
        success: true,
        message: 'Export data retrieved successfully',
        data: {
          export_date: new Date().toISOString(),
          total_records: result.rows.length,
          filters_applied: { status, department, start_date, end_date },
          petitions: result.rows
        }
      });
    }

  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export data'
    });
  }
});

/**
 * POST /api/admin/system/cleanup
 * Clean up old resolved petitions (admin only)
 */
router.post('/system/cleanup', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { days_old = 365 } = req.body;

    // Delete petitions older than specified days and resolved
    const cleanupResult = await query(`
      DELETE FROM petitions 
      WHERE status = 'resolved' 
        AND updated_at < CURRENT_DATE - INTERVAL '${days_old} days'
      RETURNING petition_id
    `);

    res.json({
      success: true,
      message: `Cleanup completed successfully`,
      data: {
        deleted_count: cleanupResult.rows.length,
        deleted_petition_ids: cleanupResult.rows.map(row => row.petition_id)
      }
    });

  } catch (error) {
    console.error('System cleanup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform system cleanup'
    });
  }
});

/**
 * GET /api/admin/system/health
 * Get detailed system health information (admin only)
 */
router.get('/system/health', verifyToken, requireAdmin, async (req, res) => {
  try {
    // Database health check
    const dbHealthQuery = await query('SELECT NOW() as current_time, version() as db_version');
    
    // Table sizes
    const tableSizes = await query(`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
        pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
    `);

    // Connection info
    const connectionInfo = await query(`
      SELECT 
        count(*) as total_connections,
        count(*) filter (where state = 'active') as active_connections,
        count(*) filter (where state = 'idle') as idle_connections
      FROM pg_stat_activity
    `);

    res.json({
      success: true,
      message: 'System health retrieved successfully',
      data: {
        database: {
          status: 'healthy',
          current_time: dbHealthQuery.rows[0].current_time,
          version: dbHealthQuery.rows[0].db_version,
          connections: connectionInfo.rows[0]
        },
        tables: tableSizes.rows,
        server: {
          uptime: process.uptime(),
          memory_usage: process.memoryUsage(),
          node_version: process.version,
          environment: process.env.NODE_ENV
        }
      }
    });

  } catch (error) {
    console.error('System health error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve system health'
    });
  }
});

module.exports = router;