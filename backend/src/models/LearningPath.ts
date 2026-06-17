import { Schema, model } from 'mongoose';

const ModuleSchema = new Schema({
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
  resources: [{
    type: String,
  }],
});

const LearningPathSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    modules: [ModuleSchema],
  },
  {
    timestamps: true,
  }
);

export const LearningPath = model('LearningPath', LearningPathSchema);