/**
 * TaskFlow – Seed Script
 * Creates demo user + realistic sample data.
 *
 * Usage:
 *   cd server
 *   npm run seed
 *
 * Demo credentials:
 *   Email:    demo@taskflow.com
 *   Password: Demo@1234
 */

import 'dotenv/config';
import mongoose   from 'mongoose';
import bcrypt     from 'bcryptjs';
import { env }         from '../config/env.js';
import { User }         from '../models/User.js';
import { JobApplication } from '../models/JobApplication.js';
import { Task }         from '../models/Task.js';
import { Notification } from '../models/Notification.js';

/* ── Colors ── */
const c = {
  green:  (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  cyan:   (s) => `\x1b[36m${s}\x1b[0m`,
  bold:   (s) => `\x1b[1m${s}\x1b[0m`,
  red:    (s) => `\x1b[31m${s}\x1b[0m`,
};

const log  = (msg) => console.log(`  ${c.green('✓')} ${msg}`);
const info = (msg) => console.log(`  ${c.cyan('→')} ${msg}`);
const warn = (msg) => console.log(`  ${c.yellow('!')} ${msg}`);

/* ── Sample applications ── */
const APPLICATIONS = [
  {
    company: 'Google', role: 'Senior Software Engineer', location: 'Mountain View, CA',
    jobType: 'hybrid', status: 'Interview', priority: 'high',
    appliedDate: daysAgo(14), deadline: daysFromNow(7),
    salary: { min: 150000, max: 250000, currency: 'USD' },
    jobLink: 'https://careers.google.com',
    notes: 'L5 role. Great match for my backend experience. Have referral from John.',
    tags: ['backend', 'golang', 'distributed-systems'],
    kanbanOrder: 0,
  },
  {
    company: 'Stripe', role: 'Staff Engineer', location: 'Remote',
    jobType: 'remote', status: 'Applied', priority: 'high',
    appliedDate: daysAgo(7), deadline: daysFromNow(14),
    salary: { min: 200000, max: 320000, currency: 'USD' },
    jobLink: 'https://stripe.com/jobs',
    notes: 'Payments infrastructure team. Requires deep distributed systems knowledge.',
    tags: ['fintech', 'payments', 'remote'],
    kanbanOrder: 0,
  },
  {
    company: 'Figma', role: 'Senior Frontend Engineer', location: 'San Francisco, CA',
    jobType: 'hybrid', status: 'Offer', priority: 'high',
    appliedDate: daysAgo(30), deadline: daysFromNow(3),
    salary: { min: 170000, max: 230000, currency: 'USD' },
    jobLink: 'https://figma.com/careers',
    notes: '🎉 Got the offer! Negotiating salary. Need to decide by Friday.',
    tags: ['react', 'typescript', 'canvas', 'design-tools'],
    kanbanOrder: 0,
  },
  {
    company: 'Shopify', role: 'Platform Engineer', location: 'Remote',
    jobType: 'remote', status: 'Applied', priority: 'medium',
    appliedDate: daysAgo(5),
    salary: { min: 140000, max: 190000, currency: 'USD' },
    jobLink: 'https://shopify.com/careers',
    notes: 'Ruby + Go stack. Commerce platform team.',
    tags: ['ruby', 'golang', 'remote', 'ecommerce'],
    kanbanOrder: 1,
  },
  {
    company: 'Vercel', role: 'Developer Experience Engineer', location: 'Remote',
    jobType: 'remote', status: 'Wishlist', priority: 'medium',
    deadline: daysFromNow(21),
    salary: { min: 130000, max: 180000, currency: 'USD' },
    jobLink: 'https://vercel.com/careers',
    notes: 'DX role — writing docs, building tools. Very excited about this one.',
    tags: ['dx', 'nextjs', 'typescript', 'developer-tools'],
    kanbanOrder: 0,
  },
  {
    company: 'Linear', role: 'Product Engineer', location: 'Remote',
    jobType: 'remote', status: 'Wishlist', priority: 'low',
    salary: { min: 140000, max: 185000, currency: 'USD' },
    jobLink: 'https://linear.app/careers',
    notes: 'Small team, great product. Need to research more.',
    tags: ['react', 'product', 'remote'],
    kanbanOrder: 1,
  },
  {
    company: 'Notion', role: 'Full Stack Engineer', location: 'New York, NY',
    jobType: 'hybrid', status: 'Rejected', priority: 'medium',
    appliedDate: daysAgo(45),
    salary: { min: 150000, max: 200000, currency: 'USD' },
    jobLink: 'https://notion.com/careers',
    notes: 'Rejected after 2nd round. Feedback: needed more product sense.',
    tags: ['react', 'nodejs', 'collaboration-tools'],
    kanbanOrder: 0,
  },
  {
    company: 'Datadog', role: 'Backend Engineer', location: 'New York, NY',
    jobType: 'onsite', status: 'Interview', priority: 'high',
    appliedDate: daysAgo(10), deadline: daysFromNow(5),
    salary: { min: 155000, max: 210000, currency: 'USD' },
    jobLink: 'https://datadoghq.com/careers',
    notes: 'Technical screen went well. System design interview next week.',
    tags: ['golang', 'observability', 'distributed-systems'],
    kanbanOrder: 1,
  },
  {
    company: 'Cloudflare', role: 'Systems Engineer', location: 'Remote',
    jobType: 'remote', status: 'Applied', priority: 'medium',
    appliedDate: daysAgo(3),
    salary: { min: 145000, max: 200000, currency: 'USD' },
    jobLink: 'https://cloudflare.com/careers',
    notes: 'Rust + Go. Edge computing. Very exciting technology.',
    tags: ['rust', 'golang', 'edge', 'networking'],
    kanbanOrder: 2,
  },
  {
    company: 'GitHub', role: 'Senior Engineer, Actions', location: 'Remote',
    jobType: 'remote', status: 'Wishlist', priority: 'low',
    salary: { min: 150000, max: 220000, currency: 'USD' },
    jobLink: 'https://github.com/about/careers',
    notes: 'CI/CD infrastructure. Would love to work on Actions platform.',
    tags: ['devops', 'ci-cd', 'golang', 'remote'],
    kanbanOrder: 2,
  },
];

/* ── Sample tasks ── */
const TASKS = [
  {
    title: 'Update resume with latest projects',
    description: 'Add TaskFlow project, update skills section, refresh formatting.',
    priority: 'urgent', status: 'in-progress',
    dueDate: daysFromNow(1),
    labels: ['career', 'resume'],
    subtasks: [
      { title: 'Add TaskFlow project description', done: true },
      { title: 'Update skills section', done: true },
      { title: 'Refresh formatting', done: false },
      { title: 'Get feedback from mentor', done: false },
    ],
  },
  {
    title: 'Prepare for Google system design interview',
    description: 'Review distributed systems concepts. Practice designing URL shortener, Twitter feed.',
    priority: 'urgent', status: 'in-progress',
    dueDate: daysFromNow(5),
    labels: ['interview-prep', 'google'],
    subtasks: [
      { title: 'Review CAP theorem', done: true },
      { title: 'Practice URL shortener design', done: false },
      { title: 'Practice Twitter feed design', done: false },
      { title: 'Mock interview with peer', done: false },
    ],
  },
  {
    title: 'Write cover letter for Stripe application',
    description: 'Tailor cover letter highlighting payments and distributed systems experience.',
    priority: 'high', status: 'todo',
    dueDate: daysFromNow(2),
    labels: ['application', 'stripe'],
    subtasks: [
      { title: 'Research Stripe engineering blog', done: false },
      { title: 'Draft cover letter', done: false },
      { title: 'Review and edit', done: false },
    ],
  },
  {
    title: 'Complete LeetCode practice — 5 problems/day',
    description: 'Focus on arrays, trees, graphs and dynamic programming.',
    priority: 'high', status: 'in-progress',
    dueDate: daysFromNow(0),
    labels: ['coding', 'practice'],
    recurrence: { frequency: 'daily', interval: 1 },
  },
  {
    title: 'Follow up with Google recruiter',
    description: 'Send follow-up email asking for status update on the L5 role.',
    priority: 'medium', status: 'todo',
    dueDate: daysFromNow(3),
    labels: ['follow-up', 'google'],
  },
  {
    title: 'Research Figma offer compensation',
    description: 'Compare Figma offer to market data. Use Levels.fyi, Glassdoor.',
    priority: 'urgent', status: 'todo',
    dueDate: daysFromNow(2),
    labels: ['offer-negotiation', 'figma'],
    subtasks: [
      { title: 'Check Levels.fyi for Figma comp data', done: true },
      { title: 'Calculate total comp (RSU + bonus)', done: false },
      { title: 'Draft counteroffer email', done: false },
    ],
  },
  {
    title: 'Build portfolio website',
    description: 'Create a modern portfolio to showcase projects. Use Next.js + Tailwind.',
    priority: 'medium', status: 'todo',
    dueDate: daysFromNow(14),
    labels: ['portfolio', 'personal-brand'],
  },
  {
    title: 'Review Datadog take-home assignment',
    description: 'Complete the backend coding challenge. Build a metrics aggregation service.',
    priority: 'high', status: 'in-progress',
    dueDate: daysFromNow(4),
    labels: ['take-home', 'datadog'],
    subtasks: [
      { title: 'Read requirements carefully', done: true },
      { title: 'Design data model', done: true },
      { title: 'Implement core logic', done: false },
      { title: 'Write tests', done: false },
      { title: 'Add README', done: false },
    ],
  },
  {
    title: 'Network on LinkedIn with Shopify engineers',
    description: 'Find and connect with 3-5 Shopify engineers. Send personalized messages.',
    priority: 'low', status: 'todo',
    dueDate: daysFromNow(7),
    labels: ['networking', 'shopify'],
  },
  {
    title: 'Weekly job search review',
    description: 'Review all applications, update statuses, plan next week actions.',
    priority: 'medium', status: 'done',
    dueDate: daysAgo(1),
    labels: ['weekly-review'],
    recurrence: { frequency: 'weekly', interval: 1 },
  },
  {
    title: 'Mock behavioral interview practice',
    description: 'Practice STAR method answers. Record and review.',
    priority: 'medium', status: 'done',
    dueDate: daysAgo(2),
    labels: ['interview-prep', 'behavioral'],
    subtasks: [
      { title: 'Prepare 5 STAR stories', done: true },
      { title: 'Record practice session', done: true },
      { title: 'Review and improve', done: true },
    ],
  },
  {
    title: 'Send thank you note to Google interviewer',
    description: 'Personalized email within 24h of interview.',
    priority: 'high', status: 'done',
    dueDate: daysAgo(3),
    labels: ['follow-up', 'google'],
  },
];

/* ── Helpers ── */
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}
function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

/* ── Main ── */
async function seed() {
  console.log('\n' + c.bold('━'.repeat(50)));
  console.log(c.bold('  🌱 TaskFlow Seed Script'));
  console.log(c.bold('━'.repeat(50)) + '\n');

  /* Connect */
  info('Connecting to MongoDB…');
  await mongoose.connect(env.mongoUri);
  log(`Connected: ${env.mongoUri}`);

  /* ── Clear existing demo data ── */
  info('Clearing existing demo data…');
  const existingDemo = await User.findOne({ email: 'demo@taskflow.com' });
  if (existingDemo) {
    await JobApplication.deleteMany({ userId: existingDemo._id });
    await Task.deleteMany({ userId: existingDemo._id });
    await Notification.deleteMany({ userId: existingDemo._id });
    await User.deleteOne({ _id: existingDemo._id });
    log('Previous demo data cleared');
  } else {
    log('No previous demo data found');
  }

  /* ── Create demo user ── */
  info('Creating demo user…');
  const passwordHash = await bcrypt.hash('Demo@1234', 12);
  const demoUser = await User.create({
    name:     'Alex Johnson',
    email:    'demo@taskflow.com',
    password: passwordHash,
    role:     'user',
  });
  log(`Created user: ${c.cyan('demo@taskflow.com')} / ${c.cyan('Demo@1234')}`);

  /* ── Create applications ── */
  info(`Creating ${APPLICATIONS.length} job applications…`);
  const createdApps = await JobApplication.insertMany(
    APPLICATIONS.map((app) => ({
      ...app,
      userId: demoUser._id,
    }))
  );
  log(`Created ${createdApps.length} applications across all Kanban columns`);

  /* ── Add a sample interview to Google application ── */
  const googleApp = createdApps.find((a) => a.company === 'Google');
  if (googleApp) {
    googleApp.interviews.push({
      round:        'Technical Interview Round 2',
      scheduledAt:  daysFromNow(5),
      interviewers: ['Jane Smith', 'Bob Lee'],
      meetingLink:  'https://meet.google.com/abc-defg-hij',
      notes:        'System design focus. 45 min coding, 45 min system design.',
    });
    await googleApp.save();
    log('Added interview schedule to Google application');
  }

  /* ── Create tasks ── */
  info(`Creating ${TASKS.length} tasks…`);
  const appMap = {
    google:  createdApps.find((a) => a.company === 'Google')?._id,
    stripe:  createdApps.find((a) => a.company === 'Stripe')?._id,
    figma:   createdApps.find((a) => a.company === 'Figma')?._id,
    datadog: createdApps.find((a) => a.company === 'Datadog')?._id,
  };

  const tasksWithLinks = TASKS.map((t, i) => {
    let linkedApplication;
    if (t.labels?.includes('google'))  linkedApplication = appMap.google;
    if (t.labels?.includes('stripe'))  linkedApplication = appMap.stripe;
    if (t.labels?.includes('figma'))   linkedApplication = appMap.figma;
    if (t.labels?.includes('datadog')) linkedApplication = appMap.datadog;
    return {
      ...t,
      userId: demoUser._id,
      boardOrder: i,
      linkedApplication,
      completedAt: t.status === 'done' ? new Date() : undefined,
    };
  });

  const createdTasks = await Task.insertMany(tasksWithLinks);
  log(`Created ${createdTasks.length} tasks`);

  /* ── Create sample notifications ── */
  info('Creating sample notifications…');
  await Notification.insertMany([
    {
      userId:  demoUser._id,
      title:   'Welcome to TaskFlow!',
      message: '🎉 Welcome to TaskFlow! Start by adding your first job application.',
      type:    'info',
      isRead:  false,
    },
    {
      userId:  demoUser._id,
      title:   'Interview Reminder',
      message: '⏰ Interview at Google in 5 days — System Design Round',
      type:    'reminder',
      isRead:  false,
    },
    {
      userId:  demoUser._id,
      title:   'Offer Deadline',
      message: '📋 Figma offer deadline in 3 days — Don\'t forget to respond!',
      type:    'reminder',
      isRead:  false,
    },
    {
      userId:  demoUser._id,
      title:   'Application Updated',
      message: '✅ Application to Figma moved to Offer — Congratulations!',
      type:    'success',
      isRead:  true,
    },
  ]);
  log('Created 4 sample notifications');

  /* ── Summary ── */
  console.log('\n' + c.bold('━'.repeat(50)));
  console.log(c.bold(c.green('  ✅ Seed completed successfully!\n')));
  console.log(`  ${c.bold('Demo credentials:')}`);
  console.log(`    Email:    ${c.cyan('demo@taskflow.com')}`);
  console.log(`    Password: ${c.cyan('Demo@1234')}`);
  console.log(`\n  ${c.bold('Created:')}`);
  console.log(`    ${c.cyan(APPLICATIONS.length)} job applications (all 5 statuses)`);
  console.log(`    ${c.cyan(TASKS.length)} tasks (todo / in-progress / done)`);
  console.log(`    ${c.cyan(4)} notifications`);
  console.log('\n' + c.bold('━'.repeat(50)) + '\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error(c.red('\n✗ Seed failed:'), err.message);
  process.exit(1);
});
