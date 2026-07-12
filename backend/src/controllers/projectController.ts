import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ProjectWorkspace } from '../models/ProjectWorkspace';
import {asyncHandler} from '../middleware/asyncHandler';
export const generateProjectWorkspace = asyncHandler(async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { idea } = req.body;

  if (!idea) {
    res.status(400).json({ status: 'fail', message: 'Please provide a project idea' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ 
      status: 'error', 
      message: 'API Key is missing on the server. Please check environment configuration.' 
    });
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: 'gemini-3.1-flash-lite', 
    generationConfig: { responseMimeType: 'application/json' },
  });

  const prompt = `
    Act as an AI Project Scoper, Lead Educator, and Business Consultant. You are scoping a creative, educational, or entrepreneurial project for: "${idea}".
    Identify the required tools/materials, write a motivating strategic overview, and break the project down into exactly 5 or 6 progressive tasks.
    Each task must contain exactly 3 concrete, step-by-step actionable sub-tasks (checklists). 
    
    You must respond strictly with a JSON object conforming exactly to this schema:
    {
      "projectName": "A catchy, short name for the project or learning goal",
      "description": "A high-level, motivating strategic overview of the project. Explain the core concept, key strategies for success, and how this roadmap helps them achieve their goal.",
      "techStack": "List the required tools, materials, or prerequisite skills needed (e.g., 'Figma & UI Design', or 'Espresso Machine & Sourcing')",
      "tasks": [
        {
          "title": "Brief task title",
          "description": "Provide a clean description of what needs to be done. Suggest step-by-step guidance, starter tips, or structural references tailored to this task.",
          "estimatedTime": "Estimated effort in hours or days, e.g., 5 hours, 1 week",
          "status": "To Do",
          "resources": ["Provide 2 actual resource links, official documentation, tutorials, or guides relevant to this task."],
          "subtasks": [
            { "title": "First concrete sub-task action item", "isCompleted": false },
            { "title": "Second concrete sub-task action item", "isCompleted": false },
            { "title": "Third concrete sub-task action item", "isCompleted": false }
          ]
        }
      ]
    }
    Do not wrap your response in markdown code blocks. Return only the raw JSON string.
  `;

  // Generate content using Gemini
  const result = await model.generateContent(prompt);
  const responseText = result.response.text();

  // --- 1. DEFENSIVE JSON SANITIZATION ---
  // Clean any accidental markdown backticks and trailing garbage from the AI response
  let cleanedText = responseText.trim();
  
  // Strip leading markdown wrappers if they exist
  if (cleanedText.startsWith('```json')) {
    cleanedText = cleanedText.slice(7).trim();
  } else if (cleanedText.startsWith('```')) {
    cleanedText = cleanedText.slice(3).trim();
  }

  // Split by the backtick character and take the first element.
  // This instantly discards all trailing backticks AND any malformed trailing characters (like '``}')!
  cleanedText = cleanedText.split('`')[0].trim();
  
  // --- 2. SAFE JSON PARSING ---
  let parsedData;
  try {
    parsedData = JSON.parse(cleanedText);
  } catch (error) {
    console.error('JSON Parsing failed. Raw AI response was:', responseText);
    res.status(500).json({
      status: 'error',
      message: 'AI output formatting error. Please try again.',
    });
    return;
  }

  // --- 3. DEFENSIVE DATABASE VALIDATION FALLBACKS ---
  // Ensure we provide fallbacks so Mongoose validation NEVER fails on 'required: true' fields
  const workspace = await ProjectWorkspace.create({
    user: req.user._id,
    projectName: parsedData.projectName || 'Untitled Project',
    description: parsedData.description || 'AI-generated strategic outline.',
    techStack: parsedData.techStack || 'Prerequisites pending',
    tasks: parsedData.tasks || [],
  });

  res.status(201).json({
    status: 'success',
    data: workspace,
  });
});
// @desc    Get all project workspaces for the logged-in user
// @route   GET /api/projects
// @access  Private
export const getUserProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const projects = await ProjectWorkspace.find({ user: req.user._id }).sort({ createdAt: -1 });
    
    res.status(200).json({
      status: 'success',
      results: projects.length,
      data: projects,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: (error as Error).message });
  }
};

// @desc    Get a single project workspace by ID
// @route   GET /api/projects/:id
// @access  Private
export const getProjectById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = await ProjectWorkspace.findOne({ _id: req.params.id, user: req.user._id });

    if (!project) {
      res.status(404).json({ status: 'fail', message: 'Project not found' });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: project,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: (error as Error).message });
  }
};

// @desc    Update a specific task's status (To Do, In Progress, Done)
// @route   PATCH /api/projects/:id/tasks/:taskId
// @access  Private
export const updateTaskStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;

    if (!status || !['To Do', 'In Progress', 'Done'].includes(status)) {
      res.status(400).json({ status: 'fail', message: 'Please provide a valid status update' });
      return;
    }

    // Find the project workspace belonging to the user
    const project = await ProjectWorkspace.findOne({ _id: req.params.id, user: req.user._id });

    if (!project) {
      res.status(404).json({ status: 'fail', message: 'Project workspace not found' });
      return;
    }

    // Robust JavaScript find (works flawlessly across all Mongoose & TS configurations!)
    const task = project.tasks.find((t: any) => t._id && t._id.toString() === req.params.taskId);
    
    if (!task) {
      res.status(404).json({ status: 'fail', message: 'Task not found in this workspace' });
      return;
    }

    task.status = status;
    await project.save(); // Persist the parent document update

    res.status(200).json({
      status: 'success',
      data: project,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: (error as Error).message });
  }
};

// @desc    Delete a project workspace
// @route   DELETE /api/projects/:id
// @access  Private
export const deleteProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = await ProjectWorkspace.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!project) {
      res.status(404).json({ status: 'fail', message: 'Project not found' });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: 'Project workspace deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: (error as Error).message });
  }
};
// @desc    Toggle a subtask's completion status
// @route   PATCH /api/projects/:id/tasks/:taskId/subtasks/:subtaskId
// @access  Private
export const toggleSubtaskStatus = asyncHandler(async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { isCompleted } = req.body;

  if (isCompleted === undefined) {
    res.status(400).json({ status: 'fail', message: 'Please provide isCompleted status' });
    return;
  }

  // Find the project workspace belonging to the user
  const project = await ProjectWorkspace.findOne({ _id: req.params.id, user: req.user._id });

  if (!project) {
    res.status(404).json({ status: 'fail', message: 'Project workspace not found' });
    return;
  }

  // Find the parent task subdocument
  const task = project.tasks.find((t: any) => t._id && t._id.toString() === req.params.taskId);
  if (!task) {
    res.status(404).json({ status: 'fail', message: 'Task not found in this workspace' });
    return;
  }

  // Find the child subtask subdocument
  const subtask = (task as any).subtasks.find((s: any) => s._id && s._id.toString() === req.params.subtaskId);
  if (!subtask) {
    res.status(404).json({ status: 'fail', message: 'Subtask not found' });
    return;
  }

  subtask.isCompleted = isCompleted;
  await project.save(); 

  res.status(200).json({
    status: 'success',
    data: project,
  });
});
// @desc    Generate a custom starter template/boilerplate for a specific task
// @route   POST /api/projects/:id/tasks/:taskId/copilot
// @access  Private (Needs JWT token)
export const generateTaskTemplate = asyncHandler(async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { id, taskId } = req.params;

  // 1. Find the project workspace belonging to the user
  const project = await ProjectWorkspace.findOne({ _id: id, user: req.user._id });
  if (!project) {
    res.status(404).json({ status: 'fail', message: 'Project workspace not found' });
    return;
  }

  // 2. Find the specific parent task subdocument
  const task = project.tasks.find((t: any) => t._id && t._id.toString() === taskId);
  if (!task) {
    res.status(404).json({ status: 'fail', message: 'Task not found in this workspace' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ 
      status: 'error', 
      message: 'API Key is missing on the server.' 
    });
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite' });

  // 3. Construct a highly context-specific prompt
  const prompt = `
    You are an expert AI Developer, Professional Consultant, and Technical Writer. 
    You are generating a highly practical, ready-to-use starter document, code boilerplate, configuration file, or action guideline tailored specifically to help the user complete this task.
    
    CONTEXT:
    - Project: "${project.projectName}"
    - Required Toolkit: "${project.techStack}"
    - Task Title: "${task.title}"
    - Task Description: "${task.description}"
    
    OBJECTIVE:
    Generate a professional, premium-grade starter template, file boilerplate (e.g., TS middleware, HTML wireframes, JSON config), or detailed structural guide.
    Provide actual code syntax or clear markdown checklist templates where applicable.
    
    OUTPUT FORMAT:
    Return the output strictly in standard, beautifully structured Markdown. 
    Do not write conversational introductions like "Sure, here is your template." Get straight to the markdown content.
  `;

  // Generate template content using Gemini
  const result = await model.generateContent(prompt);
  const templateText = result.response.text().trim();

  res.status(200).json({
    status: 'success',
    data: templateText,
  });
});