import { Schema, model } from 'mongoose';
const SubTaskSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
});

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
  subtasks: [SubTaskSchema],
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
    isPublic: {
      type: Boolean,
      default: false,
    },
    // 1. Add pricing fields for marketplace monetization
    isPaid: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      default: 0,
    },
   //Finished Product & Deliverable Assets
    liveDemoUrl: {
      type: String,
      default: '',
    },
    sourceCodeUrl: {
      type: String,
      default: '',
    },
    deliverables: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);


export const ProjectWorkspace = model('ProjectWorkspace', ProjectWorkspaceSchema);