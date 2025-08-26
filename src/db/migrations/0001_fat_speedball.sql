CREATE TABLE "nano_banana_tasks" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "nano_banana_tasks_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"task_id" varchar(255) NOT NULL,
	"request_id" varchar(255) NOT NULL,
	"user_uuid" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"prompt" text NOT NULL,
	"image_urls" text,
	"num_images" integer DEFAULT 1 NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"result" text,
	"credits_used" integer DEFAULT 0 NOT NULL,
	"credits_refunded" integer DEFAULT 0 NOT NULL,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "nano_banana_tasks_task_id_unique" UNIQUE("task_id"),
	CONSTRAINT "nano_banana_tasks_request_id_unique" UNIQUE("request_id")
);
