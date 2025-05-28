CREATE INDEX "project_member_user_idx" ON "ProjectMember" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "project_member_project_idx" ON "ProjectMember" USING btree ("projectId");--> statement-breakpoint
CREATE INDEX "project_member_status_idx" ON "ProjectMember" USING btree ("status");--> statement-breakpoint
CREATE INDEX "project_member_user_status_idx" ON "ProjectMember" USING btree ("userId","status");--> statement-breakpoint
CREATE INDEX "user_role_idx" ON "User" USING btree ("role");--> statement-breakpoint
CREATE INDEX "user_email_idx" ON "User" USING btree ("email");