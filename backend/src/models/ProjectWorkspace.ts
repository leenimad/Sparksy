import { Schema, model } from 'mongoose';

const TaskSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  estimatedTime: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['To Do', 'In Progress', 'Done'],
    default: 'To Do',
  },
  resources: [{
    type: String,
  }],
});

const ProjectWorkspaceSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    projectName: {
      type: String,
      required: true,
    },
     description: {
      type: String,
      required: true,
    },
    techStack: {
      type: String,
      required: true,
    },
    tasks: [TaskSchema], 
  },
  {
    timestamps: true,
  }
);

export const ProjectWorkspace = model('ProjectWorkspace', ProjectWorkspaceSchema);