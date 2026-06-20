import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core"

// ─── Better Auth Tables ───────────────────────────────────────────────────────

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
})

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt"),
  updatedAt: timestamp("updatedAt"),
})

// ─── App Tables ───────────────────────────────────────────────────────────────

export type ScaleLevel = {
  level: number
  label: string
  description: string
}

export type Domain = {
  id: string
  name: string
  questions: Question[]
}

export type Question = {
  id: string
  text: string
  type: "scale" | "text"
}

export type Visibility = "private" | "public"

export const templates = pgTable("templates", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull(),
  title: text("title").notNull(),
  topic: text("topic").notNull(),
  context: text("context"),
  targetAudience: text("targetAudience").notNull(),
  scaleLength: integer("scaleLength").notNull().default(5),
  scaleLevels: jsonb("scaleLevels").notNull().default([]).$type<ScaleLevel[]>(),
  domains: jsonb("domains").notNull().default([]).$type<Domain[]>(),
  visibility: text("visibility").notNull().default("private").$type<Visibility>(),
  clonedFromId: text("clonedFromId"),
  generatedByAi: boolean("generatedByAi").notNull().default(false),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export type AssessmentStatus = "draft" | "active" | "closed"

export const assessments = pgTable("assessments", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull(),
  templateId: text("templateId").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("draft").$type<AssessmentStatus>(),
  inviteToken: text("inviteToken").notNull().unique(),
  teamName: text("teamName"),
  dueDate: timestamp("dueDate"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

// answers: { [questionId]: number | string }
export const responses = pgTable("responses", {
  id: text("id").primaryKey(),
  assessmentId: text("assessmentId").notNull(),
  respondentName: text("respondentName"),
  respondentRole: text("respondentRole"),
  answers: jsonb("answers").notNull().default({}).$type<Record<string, number | string>>(),
  submittedAt: timestamp("submittedAt").notNull().defaultNow(),
})

export type LlmProvider = "openai" | "bedrock"
export type ApiFormat = "openai" | "anthropic"

export const llmKeys = pgTable("llm_keys", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull().unique(),
  provider: text("provider").notNull().$type<LlmProvider>(),
  encryptedKey: text("encryptedKey").notNull(),
  keyHint: text("keyHint"),
  model: text("model"),
  apiFormat: text("apiFormat").notNull().default("anthropic").$type<ApiFormat>(),
  awsRegion: text("awsRegion"),
  awsAccessKeyId: text("awsAccessKeyId"),
  encryptedAwsSecretKey: text("encryptedAwsSecretKey"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})
