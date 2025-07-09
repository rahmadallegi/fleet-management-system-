import express from 'express';
import { Maintenance, Vehicle } from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { maintenanceValidations, commonValidations } from '../middleware/validation.js';

const router = express.Router();

// @route   GET /api/maintenance
// @desc    Get all maintenance records with pagination and filtering
// @access  Private (Admin, Dispatcher)
router.get('/',
  authenticate,
  authorize('admin', 'dispatcher'),
  commonValidations.pagination,
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        sort = 'desc',
        sortBy = 'scheduledDate',
        vehicle,
        status,
        type,
        priority,
        startDate,
        endDate
      } = req.query;

      // Build filter object
      const filter = {};
      
      if (vehicle) filter.vehicle = vehicle;
      if (status) filter.status = status;
      if (type) filter.type = type;
      if (priority) filter.priority = priority;
      
      if (startDate || endDate) {
        filter.scheduledDate = {};
        if (startDate) filter.scheduledDate.$gte = new Date(startDate);
        if (endDate) filter.scheduledDate.$lte = new Date(endDate);
      }

      // Build sort object
      const sortOrder = sort === 'desc' ? -1 : 1;
      const sortObj = { [sortBy]: sortOrder };

      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Execute query
      const [maintenanceRecords, total] = await Promise.all([
        Maintenance.find(filter)
          .sort(sortObj)
          .skip(skip)
          .limit(parseInt(limit))
          .populate('vehicle', 'plateNumber make model type status')
          .populate('createdBy', 'firstName lastName email')
          .populate('updatedBy', 'firstName lastName email')
          .populate('approval.approvedBy', 'firstName lastName email'),
        Maintenance.countDocuments(filter)
      ]);

      // Calculate pagination info
      const totalPages = Math.ceil(total / parseInt(limit));
      const hasNextPage = parseInt(page) < totalPages;
      const hasPrevPage = parseInt(page) > 1;

      res.json({
        success: true,
        data: {
          maintenanceRecords,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalRecords: total,
            hasNextPage,
            hasPrevPage,
            limit: parseInt(limit)
          }
        }
      });

    } catch (error) {
      console.error('Get maintenance records error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching maintenance records'
      });
    }
  }
);

// @route   GET /api/maintenance/overdue
// @desc    Get overdue maintenance records
// @access  Private (Admin, Dispatcher)
router.get('/overdue',
  authenticate,
  authorize('admin', 'dispatcher'),
  async (req, res) => {
    try {
      const overdueRecords = await Maintenance.findOverdue()
        .populate('vehicle', 'plateNumber make model type')
        .sort({ scheduledDate: 1 });

      res.json({
        success: true,
        data: { maintenanceRecords: overdueRecords }
      });

    } catch (error) {
      console.error('Get overdue maintenance error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching overdue maintenance records'
      });
    }
  }
);

// @route   GET /api/maintenance/upcoming
// @desc    Get upcoming maintenance records
// @access  Private (Admin, Dispatcher)
router.get('/upcoming',
  authenticate,
  authorize('admin', 'dispatcher'),
  async (req, res) => {
    try {
      const { days = 30 } = req.query;
      
      const upcomingRecords = await Maintenance.findUpcoming(parseInt(days))
        .populate('vehicle', 'plateNumber make model type')
        .sort({ scheduledDate: 1 });

      res.json({
        success: true,
        data: { maintenanceRecords: upcomingRecords }
      });

    } catch (error) {
      console.error('Get upcoming maintenance error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching upcoming maintenance records'
      });
    }
  }
);

// @route   GET /api/maintenance/:id
// @desc    Get maintenance record by ID
// @access  Private (Admin, Dispatcher)
router.get('/:id',
  authenticate,
  authorize('admin', 'dispatcher'),
  async (req, res) => {
    try {
      const { id } = req.params;

      const maintenanceRecord = await Maintenance.findById(id)
        .populate('vehicle', 'plateNumber make model type status odometer')
        .populate('createdBy', 'firstName lastName email')
        .populate('updatedBy', 'firstName lastName email')
        .populate('approval.approvedBy', 'firstName lastName email');

      if (!maintenanceRecord) {
        return res.status(404).json({
          success: false,
          message: 'Maintenance record not found'
        });
      }

      res.json({
        success: true,
        data: { maintenanceRecord }
      });

    } catch (error) {
      console.error('Get maintenance record error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching maintenance record'
      });
    }
  }
);

// @route   POST /api/maintenance
// @desc    Create new maintenance record
// @access  Private (Admin, Dispatcher)
router.post('/',
  authenticate,
  authorize('admin', 'dispatcher'),
  maintenanceValidations.create,
  async (req, res) => {
    try {
      const maintenanceData = {
        ...req.body,
        createdBy: req.user._id
      };

      // Validate vehicle exists
      const vehicle = await Vehicle.findById(maintenanceData.vehicle);
      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found'
        });
      }

      // Check for conflicting maintenance schedules
      const conflictingMaintenance = await Maintenance.find({
        vehicle: maintenanceData.vehicle,
        status: { $in: ['scheduled', 'in-progress'] },
        scheduledDate: {
          $gte: new Date(maintenanceData.scheduledDate),
          $lt: new Date(new Date(maintenanceData.scheduledDate).getTime() + 24 * 60 * 60 * 1000)
        }
      });

      if (conflictingMaintenance.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Vehicle already has maintenance scheduled for this date',
          conflicts: conflictingMaintenance.map(m => ({
            type: m.type,
            scheduledDate: m.scheduledDate
          }))
        });
      }

      const maintenanceRecord = new Maintenance(maintenanceData);
      await maintenanceRecord.save();

      const populatedRecord = await Maintenance.findById(maintenanceRecord._id)
        .populate('vehicle', 'plateNumber make model type')
        .populate('createdBy', 'firstName lastName email');

      res.status(201).json({
        success: true,
        message: 'Maintenance record created successfully',
        data: { maintenanceRecord: populatedRecord }
      });

    } catch (error) {
      console.error('Create maintenance record error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating maintenance record'
      });
    }
  }
);

// @route   PUT /api/maintenance/:id
// @desc    Update maintenance record
// @access  Private (Admin, Dispatcher)
router.put('/:id',
  authenticate,
  authorize('admin', 'dispatcher'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = {
        ...req.body,
        updatedBy: req.user._id
      };

      const maintenanceRecord = await Maintenance.findById(id);
      if (!maintenanceRecord) {
        return res.status(404).json({
          success: false,
          message: 'Maintenance record not found'
        });
      }

      // Prevent updates if completed (unless admin)
      if (maintenanceRecord.status === 'completed' && req.user.role !== 'admin') {
        return res.status(400).json({
          success: false,
          message: 'Cannot update completed maintenance record'
        });
      }

      const updatedRecord = await Maintenance.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true }
      )
        .populate('vehicle', 'plateNumber make model type')
        .populate('updatedBy', 'firstName lastName email');

      res.json({
        success: true,
        message: 'Maintenance record updated successfully',
        data: { maintenanceRecord: updatedRecord }
      });

    } catch (error) {
      console.error('Update maintenance record error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating maintenance record'
      });
    }
  }
);

// @route   PUT /api/maintenance/:id/start
// @desc    Start maintenance work
// @access  Private (Admin, Dispatcher)
router.put('/:id/start',
  authenticate,
  authorize('admin', 'dispatcher'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { vehicleConditionBefore } = req.body;

      const maintenanceRecord = await Maintenance.findById(id);
      if (!maintenanceRecord) {
        return res.status(404).json({
          success: false,
          message: 'Maintenance record not found'
        });
      }

      if (maintenanceRecord.status !== 'scheduled') {
        return res.status(400).json({
          success: false,
          message: 'Maintenance cannot be started. Current status: ' + maintenanceRecord.status
        });
      }

      // Update maintenance status and start details
      maintenanceRecord.status = 'in-progress';
      maintenanceRecord.actualWork.startDate = new Date();
      
      if (vehicleConditionBefore) {
        maintenanceRecord.vehicleCondition.before = vehicleConditionBefore;
      }
      
      maintenanceRecord.updatedBy = req.user._id;
      await maintenanceRecord.save();

      // Update vehicle status to maintenance
      await Vehicle.findByIdAndUpdate(maintenanceRecord.vehicle, {
        status: 'maintenance',
        availability: 'maintenance'
      });

      res.json({
        success: true,
        message: 'Maintenance work started successfully'
      });

    } catch (error) {
      console.error('Start maintenance error:', error);
      res.status(500).json({
        success: false,
        message: 'Error starting maintenance work'
      });
    }
  }
);

// @route   PUT /api/maintenance/:id/complete
// @desc    Complete maintenance work
// @access  Private (Admin, Dispatcher)
router.put('/:id/complete',
  authenticate,
  authorize('admin', 'dispatcher'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { workPerformed, findings, recommendations, vehicleConditionAfter, inspection } = req.body;

      const maintenanceRecord = await Maintenance.findById(id);
      if (!maintenanceRecord) {
        return res.status(404).json({
          success: false,
          message: 'Maintenance record not found'
        });
      }

      if (maintenanceRecord.status !== 'in-progress') {
        return res.status(400).json({
          success: false,
          message: 'Maintenance cannot be completed. Current status: ' + maintenanceRecord.status
        });
      }

      // Update maintenance completion details
      maintenanceRecord.status = 'completed';
      maintenanceRecord.actualWork.endDate = new Date();
      
      if (workPerformed) maintenanceRecord.actualWork.workPerformed = workPerformed;
      if (findings) maintenanceRecord.actualWork.findings = findings;
      if (recommendations) maintenanceRecord.actualWork.recommendations = recommendations;
      if (vehicleConditionAfter) maintenanceRecord.vehicleCondition.after = vehicleConditionAfter;
      if (inspection) maintenanceRecord.inspection = { ...maintenanceRecord.inspection, ...inspection };
      
      maintenanceRecord.updatedBy = req.user._id;
      await maintenanceRecord.save();

      // Update vehicle status back to active
      await Vehicle.findByIdAndUpdate(maintenanceRecord.vehicle, {
        status: 'active',
        availability: 'available'
      });

      res.json({
        success: true,
        message: 'Maintenance work completed successfully'
      });

    } catch (error) {
      console.error('Complete maintenance error:', error);
      res.status(500).json({
        success: false,
        message: 'Error completing maintenance work'
      });
    }
  }
);

// @route   PUT /api/maintenance/:id/approve
// @desc    Approve maintenance record
// @access  Private (Admin only)
router.put('/:id/approve',
  authenticate,
  authorize('admin'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { comments } = req.body;

      const maintenanceRecord = await Maintenance.findById(id);
      if (!maintenanceRecord) {
        return res.status(404).json({
          success: false,
          message: 'Maintenance record not found'
        });
      }

      maintenanceRecord.approval.approved = true;
      maintenanceRecord.approval.approvedBy = req.user._id;
      maintenanceRecord.approval.approvedAt = new Date();
      if (comments) maintenanceRecord.approval.comments = comments;
      maintenanceRecord.updatedBy = req.user._id;

      await maintenanceRecord.save();

      res.json({
        success: true,
        message: 'Maintenance record approved successfully'
      });

    } catch (error) {
      console.error('Approve maintenance error:', error);
      res.status(500).json({
        success: false,
        message: 'Error approving maintenance record'
      });
    }
  }
);

// @route   GET /api/maintenance/vehicle/:vehicleId/history
// @desc    Get maintenance history for a vehicle
// @access  Private (Admin, Dispatcher)
router.get('/vehicle/:vehicleId/history',
  authenticate,
  authorize('admin', 'dispatcher'),
  async (req, res) => {
    try {
      const { vehicleId } = req.params;
      const { status } = req.query;

      const history = await Maintenance.findByVehicle(vehicleId, status)
        .populate('createdBy', 'firstName lastName email')
        .populate('updatedBy', 'firstName lastName email');

      res.json({
        success: true,
        data: { maintenanceHistory: history }
      });

    } catch (error) {
      console.error('Get maintenance history error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching maintenance history'
      });
    }
  }
);

// @route   GET /api/maintenance/stats/overview
// @desc    Get maintenance statistics overview
// @access  Private (Admin, Dispatcher)
router.get('/stats/overview',
  authenticate,
  authorize('admin', 'dispatcher'),
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      let matchStage = {};
      if (startDate || endDate) {
        matchStage.scheduledDate = {};
        if (startDate) matchStage.scheduledDate.$gte = new Date(startDate);
        if (endDate) matchStage.scheduledDate.$lte = new Date(endDate);
      }

      const stats = await Maintenance.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalRecords: { $sum: 1 },
            scheduledRecords: { $sum: { $cond: [{ $eq: ['$status', 'scheduled'] }, 1, 0] } },
            inProgressRecords: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
            completedRecords: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
            overdueRecords: { $sum: { $cond: [{ $eq: ['$status', 'overdue'] }, 1, 0] } },
            totalCost: { $sum: '$costs.total' },
            avgCost: { $avg: '$costs.total' },
            approvedRecords: { $sum: { $cond: ['$approval.approved', 1, 0] } }
          }
        }
      ]);

      const overview = stats[0] || {
        totalRecords: 0,
        scheduledRecords: 0,
        inProgressRecords: 0,
        completedRecords: 0,
        overdueRecords: 0,
        totalCost: 0,
        avgCost: 0,
        approvedRecords: 0
      };

      res.json({
        success: true,
        data: { overview }
      });

    } catch (error) {
      console.error('Get maintenance stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching maintenance statistics'
      });
    }
  }
);

export default router;
