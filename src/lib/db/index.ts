import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

// For query purposes
const queryClient = postgres(connectionString);
export const db = drizzle(queryClient, { schema });

// Type exports
export type User = typeof schema.users.$inferSelect;
export type NewUser = typeof schema.users.$inferInsert;

export type Survey = typeof schema.surveys.$inferSelect;
export type NewSurvey = typeof schema.surveys.$inferInsert;

export type SurveySection = typeof schema.surveySections.$inferSelect;
export type NewSurveySection = typeof schema.surveySections.$inferInsert;

export type SurveyQuestion = typeof schema.surveyQuestions.$inferSelect;
export type NewSurveyQuestion = typeof schema.surveyQuestions.$inferInsert;

export type SurveyResponse = typeof schema.surveyResponses.$inferSelect;
export type NewSurveyResponse = typeof schema.surveyResponses.$inferInsert;

export type SurveyAnswer = typeof schema.surveyAnswers.$inferSelect;
export type NewSurveyAnswer = typeof schema.surveyAnswers.$inferInsert;

export type Report = typeof schema.reports.$inferSelect;
export type NewReport = typeof schema.reports.$inferInsert;

export type CsvUpload = typeof schema.csvUploads.$inferSelect;
export type NewCsvUpload = typeof schema.csvUploads.$inferInsert;

export type Dashboard = typeof schema.dashboards.$inferSelect;
export type NewDashboard = typeof schema.dashboards.$inferInsert;

export type Aggregation = typeof schema.aggregations.$inferSelect;
export type NewAggregation = typeof schema.aggregations.$inferInsert;