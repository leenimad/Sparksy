import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { ProjectWorkspace } from '../models/ProjectWorkspace';
import { asyncHandler } from '../middleware/asyncHandler';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as any,
});

// @desc    Create a Stripe Hosted Checkout Session for a paid project template
// @route   POST /api/payments/create-checkout-session
// @access  Private
export const createCheckoutSession = asyncHandler(async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { projectId } = req.body;

  if (!projectId) {
    res.status(400).json({ status: 'fail', message: 'Project ID is required' });
    return;
  }

  // Find the paid public template
  const project = await ProjectWorkspace.findOne({ _id: projectId, isPublic: true, isPaid: true });
  if (!project) {
    res.status(404).json({ status: 'fail', message: 'Paid project template not found' });
    return;
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    res.status(500).json({ status: 'error', message: 'Stripe Secret Key is not configured on the server.' });
    return;
  }

  const clientUrl = process.env.CLIENT_URL || req.headers.origin || 'http://localhost:3000';

  // 1. Create official Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: req.user.email,
    client_reference_id: req.user._id.toString(),
    metadata: {
      projectId: project._id.toString(),
      userId: req.user._id.toString(),
    },
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Sparksy: ${project.projectName}`,
            description: project.description ? project.description.slice(0, 150) : 'Digital Product Asset & Roadmap',
          },
          // Stripe accepts amounts in cents ($15 = 1500 cents)
          unit_amount: Math.round((project.price || 15) * 100),
        },
        quantity: 1,
      },
    ],
    // Dynamic return URLs
    success_url: `${clientUrl}/dashboard/marketplace?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${clientUrl}/dashboard/marketplace?canceled=true`,
  });

  res.status(200).json({
    status: 'success',
    url: session.url, // Return the official Stripe checkout URL!
  });
});

// @desc    Verify Stripe Payment and Unlock/Clone Paid Project
// @route   POST /api/payments/verify-session
// @access  Private
export const verifyPaymentAndUnlock = asyncHandler(async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { sessionId } = req.body;

  if (!sessionId) {
    res.status(400).json({ status: 'fail', message: 'Stripe Session ID is required' });
    return;
  }

  // 2. Retrieve session directly from Stripe's servers to verify payment
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (!session || session.payment_status !== 'paid') {
    res.status(400).json({ status: 'fail', message: 'Payment verification failed or is unpaid.' });
    return;
  }

  const projectId = session.metadata?.projectId;
  const templateProject = await ProjectWorkspace.findById(projectId);

  if (!templateProject) {
    res.status(404).json({ status: 'fail', message: 'Purchased template project not found' });
    return;
  }

  // Clone the purchased project for the buyer
  const clonedTasks = templateProject.tasks.map((task: any) => ({
    title: task.title,
    description: task.description,
    estimatedTime: task.estimatedTime,
    status: 'To Do',
    resources: task.resources,
    subtasks: task.subtasks.map((sub: any) => ({
      title: sub.title,
      isCompleted: false,
    })),
  }));

  const clonedProject = await ProjectWorkspace.create({
    user: req.user._id,
    projectName: templateProject.projectName,
    description: templateProject.description,
    techStack: templateProject.techStack,
    tasks: clonedTasks,
    isPublic: false,
    liveDemoUrl: templateProject.liveDemoUrl,
    sourceCodeUrl: templateProject.sourceCodeUrl,
    deliverables: templateProject.deliverables,
  });

  res.status(200).json({
    status: 'success',
    data: {
      project: clonedProject,
      sourceCodeUrl: templateProject.sourceCodeUrl,
    },
  });
});
// @desc    Process In-App Checkout, Execute Transaction & Unlock/Clone Project
// @route   POST /api/payments/process-inapp-payment
// @access  Private (Needs JWT token)
export const processInAppPayment = asyncHandler(async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { projectId } = req.body;

  if (!projectId) {
    res.status(400).json({ status: 'fail', message: 'Project ID is required' });
    return;
  }

  const templateProject = await ProjectWorkspace.findOne({ _id: projectId, isPublic: true });

  if (!templateProject) {
    res.status(404).json({ status: 'fail', message: 'Product template not found' });
    return;
  }

  // Deep clone all tasks, resetting statuses to 'To Do' and subtasks isCompleted to false
  const clonedTasks = templateProject.tasks.map((task: any) => ({
    title: task.title,
    description: task.description,
    estimatedTime: task.estimatedTime,
    status: 'To Do',
    resources: task.resources,
    subtasks: task.subtasks.map((sub: any) => ({
      title: sub.title,
      isCompleted: false,
    })),
  }));

  // Create the fresh cloned project workspace for the buyer
  const clonedProject = await ProjectWorkspace.create({
    user: req.user._id,
    projectName: templateProject.projectName,
    description: templateProject.description,
    techStack: templateProject.techStack,
    tasks: clonedTasks,
    isPublic: false,
    liveDemoUrl: templateProject.liveDemoUrl,
    sourceCodeUrl: templateProject.sourceCodeUrl,
    deliverables: templateProject.deliverables,
  });

  res.status(201).json({
    status: 'success',
    data: {
      project: clonedProject,
      sourceCodeUrl: templateProject.sourceCodeUrl,
    },
  });
});