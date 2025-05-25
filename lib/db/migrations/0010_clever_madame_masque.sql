CREATE TABLE "ProjectFileEmbedding" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"fileId" uuid NOT NULL,
	"embedding" vector(768) NOT NULL,
	"chunkIndex" varchar(50),
	"createdAt" timestamp NOT NULL,
	CONSTRAINT "ProjectFileEmbedding_id_pk" PRIMARY KEY("id")
);
--> statement-breakpoint
ALTER TABLE "ProjectFileEmbedding" ADD CONSTRAINT "ProjectFileEmbedding_fileId_ProjectFile_id_fk" FOREIGN KEY ("fileId") REFERENCES "public"."ProjectFile"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProjectFile" DROP COLUMN "embedding";