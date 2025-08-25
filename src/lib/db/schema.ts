import { pgTable, serial, text, timestamp, jsonb, boolean, integer, uuid, varchar, index, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// User table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  clerkId: varchar('clerk_id', { length: 255 }).unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  role: varchar('role', { length: 50 }).default('user').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    emailIdx: index('email_idx').on(table.email),
    clerkIdx: index('clerk_idx').on(table.clerkId),
  };
});

// Survey table
export const surveys = pgTable('surveys', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  createdBy: uuid('created_by').references(() => users.id),
  isPublished: boolean('is_published').default(false).notNull(),
  allowAnonymous: boolean('allow_anonymous').default(true).notNull(),
  multipleSubmissions: boolean('multiple_submissions').default(false).notNull(),
  expiresAt: timestamp('expires_at'),
  settings: jsonb('settings'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    createdByIdx: index('survey_created_by_idx').on(table.createdBy),
    publishedIdx: index('survey_published_idx').on(table.isPublished),
  };
});

// Survey sections
export const surveySections = pgTable('survey_sections', {
  id: uuid('id').defaultRandom().primaryKey(),
  surveyId: uuid('survey_id').references(() => surveys.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  order: integer('order').notNull(),
  conditionalLogic: jsonb('conditional_logic'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    surveyIdx: index('section_survey_idx').on(table.surveyId),
  };
});

// Survey questions
export const surveyQuestions = pgTable('survey_questions', {
  id: uuid('id').defaultRandom().primaryKey(),
  sectionId: uuid('section_id').references(() => surveySections.id, { onDelete: 'cascade' }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // dropdown, multiple_choice, text, scale, matrix
  question: text('question').notNull(),
  description: text('description'),
  required: boolean('required').default(false).notNull(),
  order: integer('order').notNull(),
  options: jsonb('options'), // For multiple choice, dropdown, etc.
  validation: jsonb('validation'), // For text validation rules
  settings: jsonb('settings'), // Additional question-specific settings
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    sectionIdx: index('question_section_idx').on(table.sectionId),
  };
});

// Survey responses
export const surveyResponses = pgTable('survey_responses', {
  id: uuid('id').defaultRandom().primaryKey(),
  surveyId: uuid('survey_id').references(() => surveys.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id),
  sessionId: varchar('session_id', { length: 255 }),
  completed: boolean('completed').default(false).notNull(),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  metadata: jsonb('metadata'), // IP, user agent, etc.
}, (table) => {
  return {
    surveyIdx: index('response_survey_idx').on(table.surveyId),
    userIdx: index('response_user_idx').on(table.userId),
    completedIdx: index('response_completed_idx').on(table.completed),
  };
});

// Survey answers
export const surveyAnswers = pgTable('survey_answers', {
  id: uuid('id').defaultRandom().primaryKey(),
  responseId: uuid('response_id').references(() => surveyResponses.id, { onDelete: 'cascade' }).notNull(),
  questionId: uuid('question_id').references(() => surveyQuestions.id).notNull(),
  answer: jsonb('answer').notNull(), // Flexible storage for different answer types
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    responseIdx: index('answer_response_idx').on(table.responseId),
    questionIdx: index('answer_question_idx').on(table.questionId),
  };
});

// Reports table
export const reports = pgTable('reports', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  type: varchar('type', { length: 50 }).notNull(), // 'csv_upload', 'survey_based', 'custom'
  createdBy: uuid('created_by').references(() => users.id),
  status: varchar('status', { length: 50 }).default('draft').notNull(),
  config: jsonb('config'), // Report configuration
  data: jsonb('data'), // Processed data for visualization
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    createdByIdx: index('report_created_by_idx').on(table.createdBy),
    statusIdx: index('report_status_idx').on(table.status),
  };
});

// CSV uploads
export const csvUploads = pgTable('csv_uploads', {
  id: uuid('id').defaultRandom().primaryKey(),
  reportId: uuid('report_id').references(() => reports.id, { onDelete: 'cascade' }),
  filename: varchar('filename', { length: 255 }).notNull(),
  originalName: varchar('original_name', { length: 255 }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }),
  size: integer('size'),
  status: varchar('status', { length: 50 }).default('pending').notNull(), // pending, processing, completed, failed
  validationResult: jsonb('validation_result'),
  processedData: jsonb('processed_data'),
  uploadedBy: uuid('uploaded_by').references(() => users.id),
  uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
  processedAt: timestamp('processed_at'),
}, (table) => {
  return {
    reportIdx: index('upload_report_idx').on(table.reportId),
    statusIdx: index('upload_status_idx').on(table.status),
  };
});

// Dashboard configurations
export const dashboards = pgTable('dashboards', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  type: varchar('type', { length: 50 }).notNull(), // 'survey', 'report', 'custom'
  sourceId: uuid('source_id'), // Reference to survey or report
  createdBy: uuid('created_by').references(() => users.id),
  isPublic: boolean('is_public').default(false).notNull(),
  layout: jsonb('layout'), // Dashboard layout configuration
  widgets: jsonb('widgets'), // Widget configurations
  filters: jsonb('filters'), // Default filters
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    createdByIdx: index('dashboard_created_by_idx').on(table.createdBy),
    publicIdx: index('dashboard_public_idx').on(table.isPublic),
  };
});

// Aggregated data cache
export const aggregations = pgTable('aggregations', {
  id: uuid('id').defaultRandom().primaryKey(),
  sourceType: varchar('source_type', { length: 50 }).notNull(), // 'survey', 'report'
  sourceId: uuid('source_id').notNull(),
  aggregationType: varchar('aggregation_type', { length: 100 }).notNull(),
  filters: jsonb('filters'),
  data: jsonb('data').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'),
}, (table) => {
  return {
    sourceIdx: index('aggregation_source_idx').on(table.sourceId, table.sourceType),
    expiresIdx: index('aggregation_expires_idx').on(table.expiresAt),
  };
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  surveys: many(surveys),
  responses: many(surveyResponses),
  reports: many(reports),
  uploads: many(csvUploads),
  dashboards: many(dashboards),
}));

export const surveysRelations = relations(surveys, ({ one, many }) => ({
  creator: one(users, {
    fields: [surveys.createdBy],
    references: [users.id],
  }),
  sections: many(surveySections),
  responses: many(surveyResponses),
}));

export const surveySectionsRelations = relations(surveySections, ({ one, many }) => ({
  survey: one(surveys, {
    fields: [surveySections.surveyId],
    references: [surveys.id],
  }),
  questions: many(surveyQuestions),
}));

export const surveyQuestionsRelations = relations(surveyQuestions, ({ one, many }) => ({
  section: one(surveySections, {
    fields: [surveyQuestions.sectionId],
    references: [surveySections.id],
  }),
  answers: many(surveyAnswers),
}));

export const surveyResponsesRelations = relations(surveyResponses, ({ one, many }) => ({
  survey: one(surveys, {
    fields: [surveyResponses.surveyId],
    references: [surveys.id],
  }),
  user: one(users, {
    fields: [surveyResponses.userId],
    references: [users.id],
  }),
  answers: many(surveyAnswers),
}));

export const surveyAnswersRelations = relations(surveyAnswers, ({ one }) => ({
  response: one(surveyResponses, {
    fields: [surveyAnswers.responseId],
    references: [surveyResponses.id],
  }),
  question: one(surveyQuestions, {
    fields: [surveyAnswers.questionId],
    references: [surveyQuestions.id],
  }),
}));

export const reportsRelations = relations(reports, ({ one, many }) => ({
  creator: one(users, {
    fields: [reports.createdBy],
    references: [users.id],
  }),
  uploads: many(csvUploads),
}));

export const csvUploadsRelations = relations(csvUploads, ({ one }) => ({
  report: one(reports, {
    fields: [csvUploads.reportId],
    references: [reports.id],
  }),
  uploader: one(users, {
    fields: [csvUploads.uploadedBy],
    references: [users.id],
  }),
}));

export const dashboardsRelations = relations(dashboards, ({ one }) => ({
  creator: one(users, {
    fields: [dashboards.createdBy],
    references: [users.id],
  }),
}));