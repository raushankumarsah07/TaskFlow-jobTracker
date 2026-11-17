/**
 * Task Model
 * Full-featured task manager: subtasks, labels, recurrence, linked job applications.
 */
import mongoose from 'mongoose';

// ── Subtask schema ─────────────────────────────────────────────────────────
const subtaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// ── Recurrence schema ──────────────────────────────────────────────────────
const recurrenceSchema = new mongoose.Schema(
  {
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly'], required: true },
    interval: { type: Number, default: 1, min: 1 }, // every N days/weeks/months
    endDate: { type: Date, default: null },
    nextDue: { type: Date },
  },
  { _id: false }
);

// ── Main schema ────────────────────────────────────────────────────────────
const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Link to a job application (optional)
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobApplication',
      default: null,
      index: true,
    },

    title: { type: String, required: true, trim: true, maxlength: 500 },
    description: { type: String, default: '', maxlength: 5000 },

    status: {
      type: String,
      enum: ['todo', 'in-progress', 'done'],
      default: 'todo',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true,
    },

    dueDate: { type: Date, default: null, index: true },
    completedAt: { type: Date, default: null },
    reminderAt: { type: Date, default: null },

    labels: [{ type: String, trim: true, lowercase: true }],
    subtasks: [subtaskSchema],
    attachments: [
      {
        filename: { type: String },
        url: { type: String },
        mimetype: { type: String },
        size: { type: Number },
      },
    ],

    // Recurrence
    isRecurring: { type: Boolean, default: false },
    recurrence: { type: recurrenceSchema, default: null },

    // Board ordering
    boardOrder: { type: Number, default: 0 },

    // Soft delete
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ────────────────────────────────────────────────────────────────
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, dueDate: 1 });
taskSchema.index({ userId: 1, createdAt: -1 });
taskSchema.index({ title: 'text', description: 'text' });

// ── Virtuals ───────────────────────────────────────────────────────────────
taskSchema.virtual('isOverdue').get(function () {
  return this.dueDate && this.dueDate < new Date() && this.status !== 'done';
});

taskSchema.virtual('subtaskProgress').get(function () {
  if (!this.subtasks?.length) return null;
  const done = this.subtasks.filter((s) => s.completed).length;
  return { done, total: this.subtasks.length, pct: Math.round((done / this.subtasks.length) * 100) };
});

// ── Pre-save: set completedAt when status moves to done ───────────────────
taskSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    if (this.status === 'done' && !this.completedAt) {
      this.completedAt = new Date();
    } else if (this.status !== 'done') {
      this.completedAt = null;
    }
  }
  next();
});

export const Task = mongoose.model('Task', taskSchema);
