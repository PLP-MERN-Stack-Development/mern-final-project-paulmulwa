const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Get all users (NLC Admin only)
// @route   GET /api/users
// @access  Private/NLC Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, isApproved, county } = req.query;
    
    const query = {};
    if (role) query.role = role;
    if (isApproved !== undefined) query.isApproved = isApproved === 'true';
    if (county) query.county = county;

    const users = await User.find(query).select('-password -refreshToken');

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending county admins
// @route   GET /api/users/pending-admins
// @access  Private/NLC Admin
exports.getPendingAdmins = async (req, res, next) => {
  try {
    const pendingAdmins = await User.find({
      role: 'county_admin',
      isApproved: false
    }).select('-password -refreshToken');

    res.json({
      success: true,
      count: pendingAdmins.length,
      data: pendingAdmins
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create County Admin (NLC Admin or Super Admin only)
// @route   POST /api/users/county-admin
// @access  Private/NLC Admin or Super Admin
exports.createCountyAdmin = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, nationalId, kraPin, phoneNumber, county } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    const countyAdmin = await User.create({
      firstName,
      lastName,
      email,
      password,
      nationalId,
      kraPin,
      phoneNumber,
      county,
      role: 'county_admin',
      isApproved: true, // NLC creates already approved admins
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'County Admin created successfully',
      data: countyAdmin
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve/reject county admin
// @route   PUT /api/users/:id/approve
// @access  Private/NLC Admin or Super Admin
exports.approveCountyAdmin = async (req, res, next) => {
  try {
    const { approved } = req.body;
    
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role !== 'county_admin') {
      return res.status(400).json({
        success: false,
        message: 'User is not a county admin'
      });
    }
    
    // Prevent NLC admin from modifying if not authorized
    if (req.user.role === 'nlc_admin' && user.isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Cannot modify Super Admin account'
      });
    }

    user.isApproved = approved;
    await user.save();

    // Create notification
    await Notification.create({
      recipient: user._id,
      type: approved ? 'account_approved' : 'system_alert',
      title: approved ? 'Account Approved' : 'Account Application Update',
      message: approved 
        ? 'Your County Admin account has been approved. You can now access all features.'
        : 'Your County Admin application has been reviewed. Please contact support for details.'
    });

    // Emit socket event
    const io = req.app.get('io');
    io.to(user._id.toString()).emit('notification', {
      type: approved ? 'account_approved' : 'system_alert',
      message: approved ? 'Your account has been approved!' : 'Your account application has been updated'
    });

    res.json({
      success: true,
      message: `County admin ${approved ? 'approved' : 'rejected'} successfully`,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password -refreshToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search user by National ID
// @route   GET /api/users/search/national-id/:nationalId
// @access  Private
exports.getUserByNationalId = async (req, res, next) => {
  try {
    const { nationalId } = req.params;

    const user = await User.findOne({ 
      nationalId,
      role: 'user' // Only search for regular users
    }).select('firstName lastName nationalId kraPin email');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this National ID'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
exports.updateUser = async (req, res, next) => {
  try {
    // Only allow user to update their own profile (unless NLC admin)
    if (req.user.role !== 'nlc_admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile'
      });
    }

    const { firstName, lastName, phoneNumber, profileImage } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { firstName, lastName, phoneNumber, profileImage },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate user
// @route   PUT /api/users/:id/deactivate
// @access  Private/NLC Admin or Super Admin
exports.deactivateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Prevent deactivating super admin
    if (user.isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Cannot deactivate Super Admin account'
      });
    }
    
    // NLC admin can only deactivate county admins
    if (req.user.role === 'nlc_admin' && user.role === 'nlc_admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot deactivate other NLC Admin accounts'
      });
    }
    
    user.isActive = false;
    await user.save();

    res.json({
      success: false,
      message: 'User deactivated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create NLC Admin (Super Admin only)
// @route   POST /api/users/nlc-admin
// @access  Private/Super Admin
exports.createNLCAdmin = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, nationalId, kraPin, phoneNumber } = req.body;

    const nlcAdmin = await User.create({
      firstName,
      lastName,
      email,
      password,
      nationalId,
      kraPin,
      phoneNumber,
      role: 'nlc_admin',
      isApproved: true,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'NLC Admin created successfully',
      data: nlcAdmin
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all NLC Admins (Super Admin only)
// @route   GET /api/users/nlc-admins
// @access  Private/Super Admin
exports.getAllNLCAdmins = async (req, res, next) => {
  try {
    const nlcAdmins = await User.find({ role: 'nlc_admin' }).select('-password -refreshToken');

    res.json({
      success: true,
      count: nlcAdmins.length,
      data: nlcAdmins
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update NLC Admin (Super Admin only)
// @route   PUT /api/users/nlc-admin/:id
// @access  Private/Super Admin
exports.updateNLCAdmin = async (req, res, next) => {
  try {
    const { firstName, lastName, email, nationalId, kraPin, phoneNumber, isActive } = req.body;

    const nlcAdmin = await User.findById(req.params.id);

    if (!nlcAdmin || nlcAdmin.role !== 'nlc_admin') {
      return res.status(404).json({
        success: false,
        message: 'NLC Admin not found'
      });
    }

    if (firstName) nlcAdmin.firstName = firstName;
    if (lastName) nlcAdmin.lastName = lastName;
    if (email) nlcAdmin.email = email;
    if (nationalId) nlcAdmin.nationalId = nationalId;
    if (kraPin) nlcAdmin.kraPin = kraPin;
    if (phoneNumber) nlcAdmin.phoneNumber = phoneNumber;
    if (isActive !== undefined) nlcAdmin.isActive = isActive;

    await nlcAdmin.save();

    res.json({
      success: true,
      message: 'NLC Admin updated successfully',
      data: nlcAdmin
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete NLC Admin (Super Admin only)
// @route   DELETE /api/users/nlc-admin/:id
// @access  Private/Super Admin
exports.deleteNLCAdmin = async (req, res, next) => {
  try {
    const nlcAdmin = await User.findById(req.params.id);

    if (!nlcAdmin || nlcAdmin.role !== 'nlc_admin') {
      return res.status(404).json({
        success: false,
        message: 'NLC Admin not found'
      });
    }

    await nlcAdmin.deleteOne();

    res.json({
      success: true,
      message: 'NLC Admin deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
