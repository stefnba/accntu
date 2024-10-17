DO $$ BEGIN
 CREATE TYPE "public"."Apparance" AS ENUM('SYSTEM', 'DARK', 'LIGHT');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."ConnectedAccountType" AS ENUM('CREDIT_CARD', 'SAVING', 'CURRENT');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."Language" AS ENUM('EN');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."LoginMethod" AS ENUM('GITHUB_OAUTH', 'EMAIL_OTP');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."OAuthProvider" AS ENUM('GITHUB');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."TransactionType" AS ENUM('TRANSFER', 'CREDIT', 'DEBIT');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."UserRole" AS ENUM('USER', 'ADMIN');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bank" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"country" char(2) NOT NULL,
	"bic" text,
	"color" text,
	"logo" text,
	"providerSource" text,
	"providerId" text,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bank_upload_account" (
	"id" text PRIMARY KEY NOT NULL,
	"type" "ConnectedAccountType" NOT NULL,
	"parserKey" text NOT NULL,
	"bankId" text NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "connected_account" (
	"id" text PRIMARY KEY NOT NULL,
	"bankId" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" "ConnectedAccountType" NOT NULL,
	"parserKey" text,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "connected_bank" (
	"id" text PRIMARY KEY NOT NULL,
	"bankId" text NOT NULL,
	"userId" text NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "label" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"color" text,
	"rank" integer DEFAULT 0 NOT NULL,
	"level" integer DEFAULT 0 NOT NULL,
	"userId" text NOT NULL,
	"description" text,
	"parentId" text,
	"firstParentId" text,
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3),
	"isDeleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "login" (
	"id" text PRIMARY KEY NOT NULL,
	"method" "LoginMethod" NOT NULL,
	"userId" text,
	"identifier" text,
	"device" text,
	"ip" text,
	"location" text,
	"userAgent" text,
	"attemptedAt" timestamp (3) DEFAULT now() NOT NULL,
	"successAt" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "oauth_account" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"provider" "OAuthProvider" NOT NULL,
	"providerUserId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expiresAt" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tag" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"color" text,
	"userId" text NOT NULL,
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tag_to_transaction" (
	"transactionId" text NOT NULL,
	"tagId" text NOT NULL,
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	CONSTRAINT "tag_to_transaction_tagId_transactionId_pk" PRIMARY KEY("tagId","transactionId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transaction" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"accountId" text NOT NULL,
	"importFileId" text NOT NULL,
	"date" date NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"counterparty" text,
	"iban" text,
	"bic" text,
	"type" "TransactionType" NOT NULL,
	"spendingAmount" integer NOT NULL,
	"spendingCurrency" char(3) NOT NULL,
	"accountAmount" integer NOT NULL,
	"accountCurrency" char(3) NOT NULL,
	"userAmount" integer NOT NULL,
	"userCurrency" char(3) NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3),
	"key" text NOT NULL,
	"note" text,
	"country" char(2),
	"city" text,
	"labelId" text,
	"isNew" boolean DEFAULT true NOT NULL,
	"isDeleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "import" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"accountId" text NOT NULL,
	"importedTransactionCount" integer,
	"fileCount" integer,
	"importedFileCount" integer,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"successAt" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "import_file" (
	"id" text PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"importId" text NOT NULL,
	"filename" text NOT NULL,
	"type" text NOT NULL,
	"importedAt" timestamp (3),
	"transactionCount" integer,
	"importedTransactionCount" integer,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" text PRIMARY KEY NOT NULL,
	"firstName" text,
	"lastName" text,
	"email" text NOT NULL,
	"emailVerifiedAt" timestamp (3),
	"image" text,
	"role" "UserRole" DEFAULT 'USER' NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3),
	"isEnabled" boolean DEFAULT true NOT NULL,
	"lastLoginAt" timestamp (3),
	"loginAttempts" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_setting" (
	"userId" text NOT NULL,
	"timezone" text,
	"language" "Language" DEFAULT 'EN',
	"apparance" "Apparance" DEFAULT 'LIGHT'
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verification_token" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"code" text NOT NULL,
	"expiresAt" timestamp (3) NOT NULL,
	CONSTRAINT "verification_token_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bank_upload_account" ADD CONSTRAINT "bank_upload_account_bankId_bank_id_fk" FOREIGN KEY ("bankId") REFERENCES "public"."bank"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "connected_account" ADD CONSTRAINT "connected_account_bankId_connected_bank_id_fk" FOREIGN KEY ("bankId") REFERENCES "public"."connected_bank"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "connected_bank" ADD CONSTRAINT "connected_bank_bankId_bank_id_fk" FOREIGN KEY ("bankId") REFERENCES "public"."bank"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "connected_bank" ADD CONSTRAINT "connected_bank_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "label" ADD CONSTRAINT "label_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "label" ADD CONSTRAINT "label_parentId_label_id_fk" FOREIGN KEY ("parentId") REFERENCES "public"."label"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "label" ADD CONSTRAINT "label_firstParentId_label_id_fk" FOREIGN KEY ("firstParentId") REFERENCES "public"."label"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "login" ADD CONSTRAINT "login_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "oauth_account" ADD CONSTRAINT "oauth_account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tag" ADD CONSTRAINT "tag_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tag_to_transaction" ADD CONSTRAINT "tag_to_transaction_transactionId_transaction_id_fk" FOREIGN KEY ("transactionId") REFERENCES "public"."transaction"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tag_to_transaction" ADD CONSTRAINT "tag_to_transaction_tagId_tag_id_fk" FOREIGN KEY ("tagId") REFERENCES "public"."tag"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transaction" ADD CONSTRAINT "transaction_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transaction" ADD CONSTRAINT "transaction_accountId_connected_account_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."connected_account"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transaction" ADD CONSTRAINT "transaction_importFileId_import_file_id_fk" FOREIGN KEY ("importFileId") REFERENCES "public"."import_file"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transaction" ADD CONSTRAINT "transaction_labelId_label_id_fk" FOREIGN KEY ("labelId") REFERENCES "public"."label"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "import" ADD CONSTRAINT "import_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "import" ADD CONSTRAINT "import_accountId_connected_account_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."connected_account"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "import_file" ADD CONSTRAINT "import_file_importId_import_id_fk" FOREIGN KEY ("importId") REFERENCES "public"."import"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_setting" ADD CONSTRAINT "user_setting_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "identifier_idx" ON "login" ("identifier");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "tag_name_userId_index" ON "tag" ("name","userId");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "transaction_userId_key_isDeleted_key" ON "transaction" ("userId","key","isDeleted");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_email_key" ON "user" ("email");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_setting_userId_key" ON "user_setting" ("userId");