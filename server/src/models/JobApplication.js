/**
 * JobApplication Model
 * Tracks job applications with full status history, contacts, interview scheduling, and Kanban support.
 */
import mongoose from 'mongoose';

// ── Status-history entry ───────────────────────────────────────────────────
const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['Wishlist', 'Applied', 'Interview', 'Offer', 'Rejected'],
      required: true,
    },
    note: { type: String, default: '' },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

// ── Contact schema ─────────────────────────────────────────────────────────
const contactSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    linkedin: { type: String, trim: true },
    role: { type: String, trim: true },
  },
  { _id: false }
);

// ── Interview schema ───────────────────────────────────────────────────────
const interviewSchema = new mongoose.Schema(
  {
    round: { type: String, trim: true }, // e.g. "Technical Round 1"
    scheduledAt: { type: Date },
    interviewer: { type: String, trim: true },
    meetingLink: { type: String, trim: true },
    notes: { type: String, default: '' },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ── Main schema ────────────────────────────────────────────────────────────
const jobApplicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Core fields
    company: { type: String, required: true, trim: true, maxlength: 200 },
    role: { type: String, required: true, trim: true, maxlength: 200 },
    location: { type: String, trim: true, default: '' },
    jobType: {
      type: String,
      enum: ['remote', 'hybrid', 'onsite'],
      default: 'onsite',
    },
    salaryMin: { type: Number, default: null },
    salaryMax: { type: Number, default: null },
    salaryCurrency: { type: String, default: 'USD', uppercase: true },
    jobLink: { type: String, trim: true, default: '' },

    // Status & Kanban
    status: {
      type: String,
      enum: ['Wishlist', 'Applied', 'Interview', 'Offer', 'Rejected'],
      default: 'Wishlist',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
      index: true,
    },
    kanbanOrder: { type: Number, default: 0 }, // ordering within a column

    // Dates
    appliedDate: { type: Date, default: null },
    deadline: { type: Date, default: null, index: true },

    // Details
    notes: { type: String, default: '' },
    tags: [{ type: String, trim: true, lowercase: true }],
    contacts: [contactSchema],
    interviews: [interviewSchema],
    statusHistory: [statusHistorySchema],

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
jobApplicationSchema.index({ userId: 1, status: 1 });
jobApplicationSchema.index({ userId: 1, createdAt: -1 });
jobApplicationSchema.index({ userId: 1, deadline: 1 });
jobApplicationSchema.index({ company: 'text', role: 'text', notes: 'text' });

// ── Virtuals ───────────────────────────────────────────────────────────────
jobApplicationSchema.virtual('salaryRange').get(function () {
  if (!this.salaryMin && !this.salaryMax) return null;
  const fmt = (n) => `${this.salaryCurrency} ${n?.toLocaleString() ?? '?'}`;
  return `${fmt(this.salaryMin)} – ${fmt(this.salaryMax)}`;
});

// ── Pre-save: push status change to history ────────────────────────────────
jobApplicationSchema.pre('save', function (next) {
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({ status: this.status });
  }
  if (this.isNew && this.status) {
    this.statusHistory = [{ status: this.status }];
  }
  next();
});

export const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);
