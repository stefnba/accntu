ALTER TABLE "tag_to_transaction" DROP CONSTRAINT "tag_to_transaction_tagId_tag_id_fk";
--> statement-breakpoint
ALTER TABLE "tag" ADD COLUMN "description" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tag_to_transaction" ADD CONSTRAINT "tag_to_transaction_tagId_tag_id_fk" FOREIGN KEY ("tagId") REFERENCES "public"."tag"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
