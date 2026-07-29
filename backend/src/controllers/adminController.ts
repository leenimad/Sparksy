import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { User } from '../models/User';
import { ProjectWorkspace } from '../models/ProjectWorkspace';
import { asyncHandler } from '../middleware/asyncHandler';

// @desc    Get global platform analytics for admin dashboard
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = asyncHandler(async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const totalUsers = await User.countDocuments();
  const totalProjects = await ProjectWorkspace.countDocuments();
  const totalPublicProjects = await ProjectWorkspace.countDocuments({ isPublic: true });

  res.status(200).json({
    status: 'success',
    data: {
      totalUsers,
      totalProjects,
      totalPublicProjects,
    },
  });
});

// @desc    Get list of all registered platform users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = asyncHandler(async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: users,
  });
});

// @desc    Promote or demote user roles (builder <-> admin)
// @route   PATCH /api/admin/users/:userId/role
// @access  Private/Admin
export const toggleUserRole = asyncHandler(async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { role } = req.body;

  if (!['builder', 'admin'].includes(role)) {
    res.status(400).json({ status: 'fail', message: 'Invalid role specified' });
    return;
  }

  const user = await User.findById(req.params.userId);
  if (!user) {
    res.status(404).json({ status: 'fail', message: 'User not found' });
    return;
  }

  user.role = role;
  await user.save();

  res.status(200).json({
    status: 'success',
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});