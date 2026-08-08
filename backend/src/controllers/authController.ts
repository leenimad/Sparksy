import { Request, Response } from 'express';
import { User } from '../models/User';
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../middleware/asyncHandler';
import { AuthRequest } from '../middleware/authMiddleware';
import crypto from 'crypto'; 
import { sendEmail } from '../utils/sendEmail';

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
        role: user.role,
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
        role: user.role,
        token: generateToken(user._id.toString()),
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: (error as Error).message });
  }
};
// @desc    Get current logged-in user profile
// @route   GET /api/auth/me
// @access  Private (Needs JWT token)
export const getMe = asyncHandler(async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const user = await User.findById(req.user._id).select('-password');

  if (!user) {
    res.status(404).json({ status: 'fail', message: 'User not found' });
    return;
  }

  res.status(200).json({
    status: 'success',
    data: user,
  });
});
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

// @desc    Update user profile details (name & email)
// @route   PATCH /api/auth/profile
// @access  Private (Needs JWT token)
export const updateProfile = asyncHandler(async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { name, email } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404).json({ status: 'fail', message: 'User not found' });
    return;
  }

  // If changing email, verify it is not already taken by another account
  if (email !== user.email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      res.status(400).json({ status: 'fail', message: 'Email address is already taken by another account' });
      return;
    }
  }

  user.name = name;
  user.email = email;
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

// @desc    Change user password
// @route   PATCH /api/auth/password
// @access  Private (Needs JWT token)
export const changePassword = asyncHandler(async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { currentPassword, newPassword } = req.body;

  // Select password field explicitly
  const user = await User.findById(req.user._id).select('+password');
  if (!user) {
    res.status(404).json({ status: 'fail', message: 'User not found' });
    return;
  }

  // Verify current password match using bcrypt method
  const isMatch = await (user as any).matchPassword(currentPassword);
  if (!isMatch) {
    res.status(400).json({ status: 'fail', message: 'Current password is incorrect' });
    return;
  }

  user.password = newPassword; // Mongoose pre('save') hook will hash this automatically!
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Password updated successfully',
  });
});


// @desc    Request password reset token (Forgot Password)
// @route   POST /api/auth/forgot-password
// // @access  Public
// export const forgotPassword = asyncHandler(async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   const { email } = req.body;

//   const user = await User.findOne({ email });
//   if (!user) {
//     res.status(404).json({ status: 'fail', message: 'No account found with that email address' });
//     return;
//   }

//   // Generate unhashed reset token and save hashed version in MongoDB
//   const resetToken = (user as any).getResetPasswordToken();
//   await user.save({ validateBeforeSave: false });

//   // Construct reset URL for local development/testing
//   const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

//   res.status(200).json({
//     status: 'success',
//     message: 'Reset token generated successfully',
//     resetUrl, // Returned for easy local dev testing
//   });
// });

// @desc    Reset password using cryptographic token
// @route   PUT /api/auth/reset-password/:token
// @access  Public
export const resetPassword = asyncHandler(async (
  req: Request,
  res: Response
): Promise<void> => {
  const token = req.params.token;

  if (Array.isArray(token) || !token) {
    res.status(400).json({ status: 'fail', message: 'Invalid password reset token' });
    return;
  }

  // Hash token from URL parameter to match database field
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  // Find user with matching token and unexpired timestamp
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400).json({ status: 'fail', message: 'Invalid or expired password reset token' });
    return;
  }

  // Set new password (pre-save hook will hash it with bcrypt!)
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Password reset successfully. You can now log in with your new password.',
  });
});

// @desc    Request password reset token & send transactional email
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404).json({ status: 'fail', message: 'No account found with that email address' });
    return;
  }

  // Generate unhashed reset token and save hashed version in MongoDB
  const resetToken = (user as any).getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // 1. DYNAMIC DOMAIN DETECTION: Detects localhost or Vercel production URL automatically!
  const clientUrl = process.env.CLIENT_URL || req.headers.origin || 'http://localhost:3000';
  const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

  // 2. Styled HTML Email Template
  const emailHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background-color: #0c0a09; color: #f5f5f4; border-radius: 16px; border: 1px solid #292524;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 20px;">
        <h1 style="color: #f59e0b; font-size: 24px; font-weight: bold; margin: 0;">Sparksy</h1>
      </div>
      
      <h2 style="font-size: 18px; font-weight: 600; color: #e7e5e4; margin-top: 0;">Reset Your Password</h2>
      <p style="font-size: 14px; color: #a8a29e; line-height: 1.6;">
        You requested a password reset for your Sparksy account. Click the button below to choose a new password:
      </p>
      
      <div style="margin: 28px 0;">
        <a href="${resetUrl}" style="background: linear-gradient(to right, #f59e0b, #ea580c); color: #ffffff; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
          Reset Password
        </a>
      </div>
      
      <p style="font-size: 12px; color: #78716c; line-height: 1.5; margin-top: 24px; border-top: 1px solid #292524; pt: 16px;">
        This link is valid for 10 minutes. If you did not request a password reset, you can safely ignore this email.
      </p>
    </div>
  `;

  // 3. Send email asynchronously
  try {
    await sendEmail({
      email: user.email,
      subject: 'Sparksy - Password Reset Request',
      html: emailHtml,
    });

    res.status(200).json({
      status: 'success',
      message: 'Password reset link has been sent to your email address.',
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(500).json({
      status: 'error',
      message: 'Email could not be sent. Please try again later.',
    });
  }
});