import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ProjectWorkspace } from '../models/ProjectWorkspace';

// @desc    Generate a new technical project workspace with an active task list
// @route   POST /api/projects/generate
// @access  Private (Needs JWT token)
export const generateProjectWorkspace = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
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
      Act as a Universal AI Project Scoper, Lead Educator, and Business Strategist. You are scoping a creative, educational, or entrepreneurial project for: "${idea}".
      Identify the required tools, materials, or prerequisites, and break down the project into exactly 4 or 5 progressive actionable tasks.
      
      You must respond strictly with a JSON object conforming exactly to this schema:
      {
        "projectName": "A catchy, short name for the project or learning goal",
        "techStack": "List the required tools, materials, or prerequisite skills needed (e.g., 'Figma & UI Design', or 'Espresso Machine & Sourcing', or 'React & Tailwind')",
        "tasks": [
          {
            "title": "Brief task title",
            "description": "Provide a clean description of what needs to be done. Suggest step-by-step guidance, starter tips, or structural references tailored to this task.",
            "estimatedTime": "Estimated effort in hours or days, e.g., 5 hours, 1 week",
            "status": "To Do",
            "resources": ["Provide 2 actual resource links, official documentation, tutorials, or guides relevant to this task."]
          }
        ]
      }
      Do not wrap your response in markdown code blocks. Return only the raw JSON string.
    `;
    
    // Generate content using Gemini
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse the JSON string sent back by Gemini
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to process AI architect output. Please try again.',
      });
      return;
    }

    // Save the parsed workspace to MongoDB under the user's ID
    const workspace = await ProjectWorkspace.create({
      user: req.user._id,
      projectName: parsedData.projectName,
      techStack: parsedData.techStack,
      tasks: parsedData.tasks, // Updated field
    });

    res.status(201).json({
      status: 'success',
      data: workspace,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: (error as Error).message });
  }
};
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

    // Normalize route parameter type and find the subdocument task
    const taskId = Array.isArray(req.params.taskId) ? req.params.taskId[0] : req.params.taskId;
    const task = project.tasks.id(taskId);
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