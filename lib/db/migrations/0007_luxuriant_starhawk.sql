-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE "Project" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"createdAt" timestamp NOT NULL,
	"userId" uuid NOT NULL,
	CONSTRAINT "Project_id_pk" PRIMARY KEY("id")
);
--> statement-breakpoint
CREATE TABLE "ProjectFile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fileName" text NOT NULL,
	"contentType" varchar(100) NOT NULL,
	"url" text NOT NULL,
	"projectId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"content" text,
	"embedding" vector(768),
	"createdAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ProjectMember" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"projectId" uuid NOT NULL,
	"email" varchar(64) NOT NULL,
	"userId" uuid,
	"role" varchar DEFAULT 'member' NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"invitedAt" timestamp NOT NULL,
	"joinedAt" timestamp,
	"createdAt" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProjectFile" ADD CONSTRAINT "ProjectFile_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProjectFile" ADD CONSTRAINT "ProjectFile_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_projectId_Project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Chat" DROP COLUMN "visibility";