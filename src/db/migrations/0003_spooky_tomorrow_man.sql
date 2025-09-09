CREATE TABLE "upscaler_tasks" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "upscaler_tasks_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"task_id" varchar(255) NOT NULL,
	"request_id" varchar(255) NOT NULL,
	"user_uuid" varchar(255) NOT NULL,
	"input" text NOT NULL,
	"provider" varchar(20) DEFAULT 'kie' NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"result" text,
	"credits_used" integer DEFAULT 0 NOT NULL,
	"credits_refunded" integer DEFAULT 0 NOT NULL,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "upscaler_tasks_task_id_unique" UNIQUE("task_id"),
	CONSTRAINT "upscaler_tasks_request_id_unique" UNIQUE("request_id")
);
--> statement-breakpoint
ALTER TABLE "nano_banana_tasks" ADD COLUMN "provider" varchar(20) DEFAULT 'fal' NOT NULL;--> statement-breakpoint
ALTER TABLE "verification_tokens" ADD COLUMN "id" integer PRIMARY KEY NOT NULL GENERATED ALWAYS AS IDENTITY (sequence name "verification_tokens_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);