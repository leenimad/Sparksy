import { Request, Response } from 'express';
import { User } from '../models/User';
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../middleware/asyncHandler';
import { AuthRequest } from '../middleware/authMiddleware';


const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET || '', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

   
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ status: 'fail', message: 'User already exists' });
      return;
    }

  
    const user = await User.create({ name, email, password });

    res.status(201).json({
      status: 'success',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id.toString()),
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: (error as Error).message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Check for user email and explicitly select password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({ status: 'fail', message: 'Invalid credentials' });
      return;
    }

    // Check if password matches
    const isMatch = await (user as any).matchPassword(password);
    if (!isMatch) {
      res.status(401).json({ status: 'fail', message: 'Invalid credentials' });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id.toString()),
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: (error as Error).message });
  }
};
// @desc    Get the logged-in user's global acquired tools
// @route   GET /api/auth/toolbox
// @access  Private (Needs JWT token)
export const getUserToolbox = asyncHandler(async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404).json({ status: 'fail', message: 'User not found' });
    return;
  }

  res.status(200).json({
    status: 'success',
    data: user.acquiredTools || [],
  });
});

// @desc    Toggle a tool's ownership inside the user's global toolbox
// @route   PATCH /api/auth/toolbox
// @access  Private (Needs JWT token)))
export const toggleUserTool = asyncHandler(async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { tool } = req.body;

  if (!tool) {
    res.status(400).json({ status: 'fail', message: 'Please provide a tool name' });
    return;
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404).json({ status: 'fail', message: 'User not found' });
    return;
  }

  // If the tool is already owned, remove it; otherwise, append it!
  const index = user.acquiredTools.indexOf(tool);
  if (index > -1) {
    user.acquiredTools.splice(index, 1); // Remove
  } else {
    user.acquiredTools.push(tool);       // Add
  }

  await user.save();

  res.status(200).json({
    status: 'success',
    data: user.acquiredTools,
  });
});