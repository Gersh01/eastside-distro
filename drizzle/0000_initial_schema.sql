CREATE TYPE "public"."ingredient_class" AS ENUM('kratom', 'kava', 'hemp_thc', 'caffeine');--> statement-breakpoint
CREATE TYPE "public"."product_status" AS ENUM('active', 'coming_soon', 'draft', 'archived');--> statement-breakpoint
CREATE TYPE "public"."variant_status" AS ENUM('active', 'coming_soon', 'archived');--> statement-breakpoint
CREATE TYPE "public"."contact_message_status" AS ENUM('new', 'replied', 'closed');--> statement-breakpoint
CREATE TYPE "public"."wholesale_application_status" AS ENUM('submitted', 'in_review', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_type" text NOT NULL,
	"actor_id" text,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "price_lists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "price_lists_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "product_variants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"sku" text NOT NULL,
	"name" text NOT NULL,
	"flavor" text,
	"strain" text,
	"strength" text,
	"size" text,
	"form" text,
	"pack_label" text NOT NULL,
	"units_per_pack" integer DEFAULT 1 NOT NULL,
	"status" "variant_status" DEFAULT 'active' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_variants_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"brand" text NOT NULL,
	"category_id" uuid NOT NULL,
	"tagline" text NOT NULL,
	"details" text[] DEFAULT '{}'::text[] NOT NULL,
	"specs" text NOT NULL,
	"order_unit" text NOT NULL,
	"option_label" text NOT NULL,
	"option_values" text[] DEFAULT '{}'::text[] NOT NULL,
	"ingredient_classes" "ingredient_class"[] NOT NULL,
	"status" "product_status" DEFAULT 'active' NOT NULL,
	"quote_only" boolean DEFAULT false NOT NULL,
	"image_path" text,
	"catalog_page" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "variant_prices" (
	"variant_id" uuid NOT NULL,
	"price_list_id" uuid NOT NULL,
	"min_quantity" integer DEFAULT 1 NOT NULL,
	"amount_cents" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "variant_prices_variant_id_price_list_id_min_quantity_pk" PRIMARY KEY("variant_id","price_list_id","min_quantity")
);
--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" "contact_message_status" DEFAULT 'new' NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"topic" text NOT NULL,
	"message" text NOT NULL,
	"product_slug" text,
	"submitter_ip_hash" text,
	"user_agent" text,
	"notified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wholesale_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" "wholesale_application_status" DEFAULT 'submitted' NOT NULL,
	"full_name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"title_role" text,
	"business_name" text NOT NULL,
	"address_line1" text NOT NULL,
	"address_line2" text,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"postal_code" text NOT NULL,
	"resale_certificate_number" text,
	"business_types" text[] NOT NULL,
	"business_type_other" text,
	"number_of_locations" integer,
	"years_in_business" integer,
	"current_suppliers" text,
	"products_of_interest" text[] NOT NULL,
	"products_of_interest_other" text,
	"product_notes" text,
	"order_frequency" text,
	"order_frequency_other" text,
	"estimated_order_volume" text,
	"fulfillment_preferences" text[] NOT NULL,
	"goals" text[] NOT NULL,
	"goals_other" text,
	"next_steps" text[] NOT NULL,
	"next_steps_other" text,
	"follow_up_date" date,
	"assigned_to" text,
	"internal_notes" text,
	"source" text DEFAULT 'web' NOT NULL,
	"submitter_ip_hash" text,
	"user_agent" text,
	"notified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variant_prices" ADD CONSTRAINT "variant_prices_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variant_prices" ADD CONSTRAINT "variant_prices_price_list_id_price_lists_id_fk" FOREIGN KEY ("price_list_id") REFERENCES "public"."price_lists"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_events_entity_type_entity_id_index" ON "audit_events" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "audit_events_created_at_index" ON "audit_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "product_variants_product_id_sort_order_index" ON "product_variants" USING btree ("product_id","sort_order");--> statement-breakpoint
CREATE INDEX "products_category_id_sort_order_index" ON "products" USING btree ("category_id","sort_order");--> statement-breakpoint
CREATE INDEX "products_status_index" ON "products" USING btree ("status");--> statement-breakpoint
CREATE INDEX "contact_messages_status_created_at_index" ON "contact_messages" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "contact_messages_submitter_ip_hash_created_at_index" ON "contact_messages" USING btree ("submitter_ip_hash","created_at");--> statement-breakpoint
CREATE INDEX "wholesale_applications_status_created_at_index" ON "wholesale_applications" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "wholesale_applications_email_index" ON "wholesale_applications" USING btree ("email");--> statement-breakpoint
CREATE INDEX "wholesale_applications_submitter_ip_hash_created_at_index" ON "wholesale_applications" USING btree ("submitter_ip_hash","created_at");