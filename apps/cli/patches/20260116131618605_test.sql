-- ==================================================
-- SCRIPT AUTHOR: Dimas
-- CREATED ON: 2026-01-16T13:16:18.605Z
-- ==================================================

-- ============================================
-- TABLES: Start (32 table(s) to create)
-- ============================================
CREATE TABLE IF NOT EXISTS "public"."form_case_four_actors_groups_values" (
	"id" UUID NOT NULL DEFAULT gen_random_uuid(),
	"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	"name" TEXT NOT NULL,
	"form_case_four_actor_group_id" UUID NOT NULL DEFAULT gen_random_uuid(),
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."form_case_four_actors_relations" (
	"id" UUID NOT NULL DEFAULT gen_random_uuid(),
	"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	"form_case_four_actors_groups_values_id" UUID NOT NULL DEFAULT gen_random_uuid(),
	"form_case_four_id" UUID NOT NULL DEFAULT gen_random_uuid(),
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."simulation_case" (
	"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	"name" TEXT,
	"description" TEXT,
	"id" UUID NOT NULL DEFAULT gen_random_uuid(),
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."form_case_four_target_population_groups" (
	"id" UUID NOT NULL DEFAULT gen_random_uuid(),
	"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	"name" TEXT NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."simulation_event_state" (
	"id" UUID NOT NULL DEFAULT gen_random_uuid(),
	"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	"state" JSONB NOT NULL DEFAULT '[]'::jsonb,
	"status" TEXT,
	"case_id" UUID,
	"simulation_id" UUID NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."form_case_four_traget_population_groups_values" (
	"id" UUID NOT NULL DEFAULT gen_random_uuid(),
	"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	"name" TEXT NOT NULL,
	"form_case_four_target_population_group_id" UUID NOT NULL DEFAULT gen_random_uuid(),
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."form_case_four_target_population_relation" (
	"id" UUID NOT NULL DEFAULT gen_random_uuid(),
	"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	"form_case_four_target_population_groups_values_id" UUID NOT NULL DEFAULT gen_random_uuid(),
	"form_case_four_id" UUID NOT NULL DEFAULT gen_random_uuid(),
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."form_case_five" (
	"id" UUID NOT NULL DEFAULT gen_random_uuid(),
	"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	"name" TEXT,
	"description" UUID DEFAULT gen_random_uuid(),
	"metadata" JSONB,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."form_case_five_extend_docs" (
	"id" UUID NOT NULL DEFAULT gen_random_uuid(),
	"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	"name" TEXT,
	"path" TEXT,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."form_case_four_topics" (
	"id" UUID NOT NULL DEFAULT gen_random_uuid(),
	"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	"name" TEXT NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."form_case_four_extended_docs" (
	"id" UUID NOT NULL DEFAULT gen_random_uuid(),
	"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	"updated_at" TIMESTAMP WITH TIME ZONE,
	"name" TEXT NOT NULL,
	"path" TEXT NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."form_case_four_policy_objective" (
	"id" UUID NOT NULL DEFAULT gen_random_uuid(),
	"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	"name" TEXT NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."form_case_one_group_comunity" (
	"id" UUID NOT NULL DEFAULT gen_random_uuid(),
	"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	"name" TEXT NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."form_case_three_extend_docs" (
	"id" UUID NOT NULL DEFAULT gen_random_uuid(),
	"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	"name" TEXT NOT NULL,
	"path" TEXT NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."form_case_three_goals" (
	"id" UUID NOT NULL DEFAULT gen_random_uuid(),
	"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	"name" TEXT NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."form_case_three" (
	"id" UUID NOT NULL DEFAULT gen_random_uuid(),
	"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	"improve_description" UUID NOT NULL DEFAULT gen_random_uuid(),
	"goal_percentage" NUMERIC,
	"conditions_to_consider" UUID NOT NULL DEFAULT gen_random_uuid(),
	"goal_id" UUID NOT NULL DEFAULT gen_random_uuid(),
	"time_period_to_achive_goal" UUID NOT NULL DEFAULT gen_random_uuid(),
	"metadata" JSONB,
	"name" TEXT,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."form_case_three_improve_politically_relation" (
	"id" UUID NOT NULL DEFAULT gen_random_uuid(),
	"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	"form_case_three_id" UUID NOT NULL DEFAULT gen_random_uuid(),
	"form_case_three_improve_politically_id" UUID NOT NULL DEFAULT gen_random_uuid(),
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."form_case_four_policy_sub_objective" (
	"id" UUID NOT NULL DEFAULT gen_random_uuid(),
	"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	"name" TEXT NOT NULL,
	"form_case_four_policy_objective_id" UUID NOT NULL DEFAULT gen_random_uuid(),
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."form_case_three_location" (
	"id" UUID NOT NULL DEFAULT gen_random_uuid(),
	"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	"address" TEXT NOT NULL,
	"lat" NUMERIC NOT NULL,
	"lon" NUMERIC NOT NULL,
	"form_case_three_id" UUID NOT NULL DEFAULT gen_random_uuid(),
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."form_case_three_group_comunity_relation" (
	"id" UUID NOT NULL DEFAULT gen_random_uuid(),
	"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	"form_case_three_id" UUID NOT NULL DEFAULT gen_random_uuid(),
	"form_case_three_group_comunity_value_id" UUID NOT NULL DEFAULT gen_random_uuid(),
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."form_case_three_sub_topics" (
	"id" UUID NOT NULL DEFAULT gen_random_uuid(),
	"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	"name" TEXT NOT NULL,
	"form_case_three_topic_id" UUID NOT NULL DEFAULT gen_random_uuid(),
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."form_case_three_time_period" (
	"id" UUID NOT NULL DEFAULT gen_random_uuid(),
	"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	"name" TEXT NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."form_case_three_topics" (
	"id" UUID NOT NULL DEFAULT gen_random_uuid(),
	"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	"name" TEXT NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."form_case_three_topics_relation" (
	"id" UUID NOT NULL DEFAULT gen_random_uuid(),
	"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	"form_case_three_id" UUID NOT NULL DEFAULT gen_random_uuid(),
	"form_case_three_sub_topics_id" UUID NOT NULL DEFAULT gen_random_uuid(),
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."form_case_four" (
	"id" UUID NOT NULL DEFAULT gen_random_uuid(),
	"topic_id" UUID NOT NULL DEFAULT gen_random_uuid(),
	"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	"name" TEXT NOT NULL,
	"description" UUID NOT NULL DEFAULT gen_random_uuid(),
	"constraint" UUID DEFAULT gen_random_uuid(),
	"estimated_budget_amount" NUMERIC,
	"estimated_budget_currency" TEXT,
	"estimated_budget_explain" UUID DEFAULT gen_random_uuid(),
	"metadata" JSONB,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."form_case_two_target_population_groups" (
	"id" UUID NOT NULL DEFAULT gen_random_uuid(),
	"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	"name" TEXT NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."form_case_four_policy_objective_relation" (
	"id" UUID NOT NULL DEFAULT gen_random_uuid(),
	"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	"form_case_four_policy_sub_objective_id" UUID NOT NULL DEFAULT gen_random_uuid(),
	"form_case_four_id" UUID NOT NULL DEFAULT gen_random_uuid(),
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."form_case_two_target_population_groups_values" (
	"id" UUID NOT NULL DEFAULT gen_random_uuid(),
	"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	"name" TEXT NOT NULL,
	"form_case_two_target_population_group_id" UUID NOT NULL DEFAULT gen_random_uuid(),
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."form_case_four_locations" (
	"id" UUID NOT NULL DEFAULT gen_random_uuid(),
	"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	"address" TEXT NOT NULL,
	"lat" DOUBLE PRECISION NOT NULL,
	"lon" DOUBLE PRECISION NOT NULL,
	"form_case_four_id" UUID NOT NULL DEFAULT gen_random_uuid(),
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."form_case_four_actors_groups" (
	"id" UUID NOT NULL DEFAULT gen_random_uuid(),
	"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	"name" TEXT NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "public"."form_case_two_template" (
	"uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
	"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	"name" TEXT NOT NULL,
	"topic_id" UUID DEFAULT gen_random_uuid(),
	"description" UUID NOT NULL DEFAULT gen_random_uuid(),
	"estimated_budget_amount" NUMERIC,
	"estimated_budget_explain" UUID DEFAULT gen_random_uuid(),
	"estimated_budget_currency" TEXT,
	"aditional_financing" UUID DEFAULT gen_random_uuid(),
	"aditional_financing_amount" NUMERIC,
	"aditional_financing_currency" TEXT,
	"constraint_custom" UUID DEFAULT gen_random_uuid(),
	"metadata" JSONB,
	PRIMARY KEY ("uuid")
);

CREATE TABLE IF NOT EXISTS "public"."form_case_one_group_comunity_values" (
	"id" UUID NOT NULL DEFAULT gen_random_uuid(),
	"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
	"name" TEXT NOT NULL,
	"form_case_one_group_comunity_id" UUID NOT NULL DEFAULT gen_random_uuid(),
	PRIMARY KEY ("id")
);

-- ============================================
-- TABLES: End
-- ============================================
-- ============================================
-- COLUMNS: Start (4 column change(s))
-- ============================================
ALTER TABLE "public"."form_case_three_group_comunity_values" ADD COLUMN "form_case_three_group_comunity_id" UUID NOT NULL DEFAULT gen_random_uuid();

ALTER TABLE "public"."form_case_two" ADD COLUMN "metadata" JSONB;

ALTER TABLE "public"."form_case_two" ADD COLUMN "estimated_budget_explain" UUID;

ALTER TABLE "public"."form_case_two" ADD COLUMN "topic_id" UUID DEFAULT gen_random_uuid();

-- ============================================
-- COLUMNS: End
-- ============================================
-- ============================================
-- VIEWS: Start (5 view(s) to create)
-- ============================================
CREATE VIEW "public"."form_case_five_status_view" AS  SELECT fcth.id,
    fcth.created_at,
    fcth.name,
    fcth.description,
    fcth.metadata,
    es.status
   FROM (form_case_five fcth
     LEFT JOIN simulation_event_state es ON ((fcth.id = es.simulation_id)));;

CREATE VIEW "public"."form_case_one_status_view" AS  SELECT fco.id,
    fco.description,
    fco.time_existence_error_id,
    fco.final_goal,
    fco.pressure_id,
    fco.previous_measures,
    fco.created_at,
    fco.updated_at,
    fco.cause_custom,
    fco.constraint_custom,
    fco.metadata,
    fco.name,
    es.status
   FROM (form_case_one fco
     LEFT JOIN simulation_event_state es ON ((fco.id = es.simulation_id)));;

CREATE VIEW "public"."form_case_four_status_view" AS  SELECT fcth.id,
    fcth.created_at,
    fcth.name,
    fcth.description,
    fcth.aditional_financing,
    fcth.constraint_custom,
    fcth.estimated_budget_amount,
    fcth.estimated_budget_currency,
    fcth.aditional_financing_amount,
    fcth.aditional_financing_currency,
    fcth.metadata,
    fcth.estimated_budget_explain,
    fcth.topic_id,
    es.status
   FROM (form_case_two fcth
     LEFT JOIN simulation_event_state es ON ((fcth.id = es.simulation_id)))
  WHERE (fcth.topic_id = '3e131f49-7b15-4dc6-908a-49e7c1cdd75c'::uuid);;

CREATE VIEW "public"."form_case_three_status_view" AS  SELECT fcth.id,
    fcth.created_at,
    fcth.improve_description,
    fcth.goal_percentage,
    fcth.conditions_to_consider,
    fcth.goal_id,
    fcth.time_period_to_achive_goal,
    fcth.metadata,
    fcth.name,
    es.status
   FROM (form_case_three fcth
     LEFT JOIN simulation_event_state es ON ((fcth.id = es.simulation_id)));;

CREATE VIEW "public"."form_case_two_status_view" AS  SELECT fct.id,
    fct.created_at,
    fct.name,
    fct.description,
    fct.aditional_financing,
    fct.constraint_custom,
    fct.estimated_budget_amount,
    fct.estimated_budget_currency,
    fct.aditional_financing_amount,
    fct.aditional_financing_currency,
    fct.metadata,
    fct.estimated_budget_explain,
    fct.topic_id,
    es.status
   FROM (form_case_two fct
     LEFT JOIN simulation_event_state es ON ((fct.id = es.simulation_id)))
  WHERE (fct.topic_id IS NULL);;

-- ============================================
-- VIEWS: End
-- ============================================
-- ============================================
-- NOTE: 91 function(s) with superuser languages (c, internal) were excluded
-- These functions require superuser permissions and cannot be created by regular users
-- ============================================
-- ============================================
-- FUNCTIONS: Start (4 function(s) to create)
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.proname = 'match_documents'
    ) THEN
        CREATE FUNCTION public.match_documents(match_count integer, match_threshold double precision, metric text, query_embedding vector)
 RETURNS SETOF knowledge.documents
 LANGUAGE sql
AS $function$
  WITH params AS (
    SELECT CASE
      WHEN lower(metric) IN ('cosine','cos','cosine_similarity') THEN 'cosine'
      WHEN lower(metric) IN ('ip','inner_product') THEN 'ip'
      WHEN lower(metric) IN ('l2','euclidean') THEN 'l2'
      ELSE 'cosine'
    END AS m
  )
  SELECT d.*
  FROM knowledge.documents d, params p
  WHERE (
    CASE
      WHEN p.m = 'cosine' THEN (d.embedding <=> query_embedding) < (1 - match_threshold)
      WHEN p.m = 'ip'     THEN (d.embedding <#> query_embedding) < (1 - match_threshold)
      WHEN p.m = 'l2'     THEN (d.embedding <-> query_embedding) < (1 - match_threshold)
      ELSE (d.embedding <=> query_embedding) < (1 - match_threshold)
    END
  )
  ORDER BY
    CASE
      WHEN (SELECT m FROM params) = 'cosine' THEN (d.embedding <=> query_embedding)
      WHEN (SELECT m FROM params) = 'ip'     THEN (d.embedding <#> query_embedding)
      WHEN (SELECT m FROM params) = 'l2'     THEN (d.embedding <-> query_embedding)
      ELSE (d.embedding <=> query_embedding)
    END ASC
  LIMIT LEAST(match_count, 200);
$function$;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.proname = 'match_knowledge'
    ) THEN
        CREATE FUNCTION public.match_knowledge(query_embedding vector, match_count integer DEFAULT 5, match_threshold double precision DEFAULT 0.0, metric text DEFAULT 'cosine'::text)
 RETURNS TABLE(id bigint, content text, metadata jsonb, similarity double precision)
 LANGUAGE plpgsql
 STABLE
AS $function$BEGIN
  -- Limita la ejecución de la consulta a 10 minutos durante esta llamada
  PERFORM set_config('statement_timeout', '60min', true);

  RETURN QUERY
  SELECT
    d.id,
    d.content,
    d.metadata,
    CASE
      WHEN metric = 'cosine' THEN 1 - (d.embedding <=> query_embedding)
      WHEN metric = 'l2'     THEN d.embedding <-> query_embedding
      WHEN metric = 'inner'  THEN -(d.embedding <#> query_embedding)
    END AS similarity
  FROM knowledge.documents AS d
  WHERE
    CASE
      WHEN metric = 'cosine' THEN 1 - (d.embedding <=> query_embedding) > match_threshold
      WHEN metric = 'l2'     THEN d.embedding <-> query_embedding < match_threshold
      WHEN metric = 'inner'  THEN -(d.embedding <#> query_embedding) > match_threshold
    END
  ORDER BY
    CASE
      WHEN metric = 'cosine' THEN d.embedding <=> query_embedding
      WHEN metric = 'l2'     THEN d.embedding <-> query_embedding
      WHEN metric = 'inner'  THEN d.embedding <#> query_embedding
    END
  LIMIT match_count;
END;$function$;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.proname = 'match_knowledge_v3'
    ) THEN
        CREATE FUNCTION public.match_knowledge_v3(match_count integer, match_threshold double precision, metric text, query_embedding vector, filter_flow text DEFAULT NULL::text)
 RETURNS TABLE(id bigint, content text, metadata jsonb, similarity double precision, flow text)
 LANGUAGE plpgsql
AS $function$
#variable_conflict use_variable
BEGIN
  -- Limita la ejecución de la consulta a 60 minutos durante esta llamada
  PERFORM set_config('statement_timeout', '60min',false);
   RETURN QUERY
  SELECT
    d.id,
    d.content,
    d.metadata,
    CASE
      WHEN metric = 'cosine' THEN 1 - (d.embedding <=> query_embedding)
      WHEN metric = 'l2'     THEN d.embedding <-> query_embedding
      WHEN metric = 'inner'  THEN -(d.embedding <#> query_embedding)
    END AS similarity,
    d.flow
  FROM knowledge.documents AS d
  WHERE
    (filter_flow IS NULL OR d.flow = filter_flow OR d.flow = '@' OR d.flow = 'Global')
    AND
    CASE
      WHEN metric = 'cosine' THEN 1 - (d.embedding <=> query_embedding) > match_threshold
      WHEN metric = 'l2'     THEN d.embedding <-> query_embedding < match_threshold
      WHEN metric = 'inner'  THEN -(d.embedding <#> query_embedding) > match_threshold
    END
  ORDER BY
    CASE
      WHEN metric = 'cosine' THEN d.embedding <=> query_embedding
      WHEN metric = 'l2'     THEN d.embedding <-> query_embedding
      WHEN metric = 'inner'  THEN d.embedding <#> query_embedding
    END
  LIMIT match_count;
END;
$function$;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.proname = 'show_statement_timeout'
    ) THEN
        CREATE FUNCTION public.show_statement_timeout()
 RETURNS text
 LANGUAGE sql
 STABLE
AS $function$
  SELECT current_setting('statement_timeout', true);
$function$;
    END IF;
END $$;

-- ============================================
-- FUNCTIONS: End
-- ============================================
-- ============================================
-- FOREIGN KEYS: Start (38 foreign key(s) to create)
-- ============================================
ALTER TABLE "public"."form_case_five" ADD CONSTRAINT "form_case_five_description_fkey" FOREIGN KEY ("description") REFERENCES "public"."form_case_five_extend_docs" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "public"."form_case_four" ADD CONSTRAINT "form_case_four_constraint_fkey" FOREIGN KEY ("constraint") REFERENCES "public"."form_case_four_extended_docs" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "public"."form_case_four" ADD CONSTRAINT "form_case_four_description_fkey" FOREIGN KEY ("description") REFERENCES "public"."form_case_four_extended_docs" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "public"."form_case_four" ADD CONSTRAINT "form_case_four_estimated_budget_explain_fkey" FOREIGN KEY ("estimated_budget_explain") REFERENCES "public"."form_case_four_extended_docs" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "public"."form_case_four" ADD CONSTRAINT "form_case_four_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "public"."form_case_four_topics" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "public"."form_case_four_actors_groups_values" ADD CONSTRAINT "form_case_four_actors_groups__form_case_four_actor_group_i_fkey" FOREIGN KEY ("form_case_four_actor_group_id") REFERENCES "public"."form_case_four_actors_groups" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "public"."form_case_four_actors_relations" ADD CONSTRAINT "form_case_four_actors_relatio_form_case_four_actors_groups_fkey" FOREIGN KEY ("form_case_four_actors_groups_values_id") REFERENCES "public"."form_case_four_actors_groups_values" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "public"."form_case_four_actors_relations" ADD CONSTRAINT "form_case_four_actors_relations_form_case_four_fkey" FOREIGN KEY ("form_case_four_id") REFERENCES "public"."form_case_four" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "public"."form_case_four_locations" ADD CONSTRAINT "form_case_four_locations_form_case_four_id_fkey" FOREIGN KEY ("form_case_four_id") REFERENCES "public"."form_case_four" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "public"."form_case_four_policy_objective_relation" ADD CONSTRAINT "form_case_four_policy_objecti_form_case_four_policy_sub_ob_fkey" FOREIGN KEY ("form_case_four_policy_sub_objective_id") REFERENCES "public"."form_case_four_policy_sub_objective" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "public"."form_case_four_policy_objective_relation" ADD CONSTRAINT "form_case_four_policy_objective_relation_form_case_four_fkey" FOREIGN KEY ("form_case_four_id") REFERENCES "public"."form_case_four" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "public"."form_case_four_policy_sub_objective" ADD CONSTRAINT "form_case_four_policy_sub_obj_form_case_four_policy_object_fkey" FOREIGN KEY ("form_case_four_policy_objective_id") REFERENCES "public"."form_case_four_policy_objective" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "public"."form_case_four_target_population_relation" ADD CONSTRAINT "form_case_four_target_populat_form_case_four_target_popula_fkey" FOREIGN KEY ("form_case_four_target_population_groups_values_id") REFERENCES "public"."form_case_four_traget_population_groups_values" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "public"."form_case_four_target_population_relation" ADD CONSTRAINT "form_case_four_target_population_relatio_form_case_four_id_fkey" FOREIGN KEY ("form_case_four_id") REFERENCES "public"."form_case_four" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "public"."form_case_four_traget_population_groups_values" ADD CONSTRAINT "form_case_four_traget_populat_form_case_four_target_popula_fkey" FOREIGN KEY ("form_case_four_target_population_group_id") REFERENCES "public"."form_case_four_target_population_groups" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "public"."form_case_one_group_comunity_values" ADD CONSTRAINT "form_case_one_group_comunity__form_case_one_group_comunity_fkey" FOREIGN KEY ("form_case_one_group_comunity_id") REFERENCES "public"."form_case_one_group_comunity" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "public"."form_case_three" ADD CONSTRAINT "form_case_three_conditions_to_consider_fkey" FOREIGN KEY ("conditions_to_consider") REFERENCES "public"."form_case_three_extend_docs" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "public"."form_case_three" ADD CONSTRAINT "form_case_three_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "public"."form_case_three_goals" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "public"."form_case_three" ADD CONSTRAINT "form_case_three_improve_description_fkey" FOREIGN KEY ("improve_description") REFERENCES "public"."form_case_three_extend_docs" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "public"."form_case_three" ADD CONSTRAINT "form_case_three_time_period_to_achive_goal_fkey" FOREIGN KEY ("time_period_to_achive_goal") REFERENCES "public"."form_case_three_time_period" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "public"."form_case_three_group_comunity_relation" ADD CONSTRAINT "form_case_three_group_comunit_form_case_three_group_comuni_fkey" FOREIGN KEY ("form_case_three_group_comunity_value_id") REFERENCES "public"."form_case_three_group_comunity_values" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "public"."form_case_three_group_comunity_relation" ADD CONSTRAINT "form_case_three_group_comunity_relation_form_case_three_id_fkey" FOREIGN KEY ("form_case_three_id") REFERENCES "public"."form_case_three" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "public"."form_case_three_group_comunity_values" ADD CONSTRAINT "form_case_three_group_comuni_form_case_three_group_comuni_fkey1" FOREIGN KEY ("form_case_three_group_comunity_id") REFERENCES "public"."form_case_three_group_comunity" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "public"."form_case_three_improve_politically_relation" ADD CONSTRAINT "form_case_three_improve_polit_form_case_three_improve_poli_fkey" FOREIGN KEY ("form_case_three_improve_politically_id") REFERENCES "public"."form_case_three_improve_politically" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "public"."form_case_three_improve_politically_relation" ADD CONSTRAINT "form_case_three_improve_politically_rel_form_case_three_id_fkey" FOREIGN KEY ("form_case_three_id") REFERENCES "public"."form_case_three" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "public"."form_case_three_location" ADD CONSTRAINT "form_case_three_location_form_case_three_id_fkey" FOREIGN KEY ("form_case_three_id") REFERENCES "public"."form_case_three" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "public"."form_case_three_sub_topics" ADD CONSTRAINT "form_case_three_sub_topics_form_case_three_topic_id_fkey" FOREIGN KEY ("form_case_three_topic_id") REFERENCES "public"."form_case_three_topics" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "public"."form_case_three_topics_relation" ADD CONSTRAINT "form_case_three_topics_relati_form_case_three_sub_topics_i_fkey" FOREIGN KEY ("form_case_three_sub_topics_id") REFERENCES "public"."form_case_three_sub_topics" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "public"."form_case_three_topics_relation" ADD CONSTRAINT "form_case_three_topics_relation_form_case_three_id_fkey" FOREIGN KEY ("form_case_three_id") REFERENCES "public"."form_case_three" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "public"."form_case_two" ADD CONSTRAINT "form_case_two_estimated_budget_explain_fkey" FOREIGN KEY ("estimated_budget_explain") REFERENCES "public"."form_case_two_extended_docs" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "public"."form_case_two" ADD CONSTRAINT "form_case_two_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "public"."form_case_four_topics" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "public"."form_case_two_target_population_groups_values" ADD CONSTRAINT "form_case_two_target_populat_form_case_two_target_populat_fkey1" FOREIGN KEY ("form_case_two_target_population_group_id") REFERENCES "public"."form_case_two_target_population_groups" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "public"."form_case_two_template" ADD CONSTRAINT "form_case_two_template_aditional_financing_fkey" FOREIGN KEY ("aditional_financing") REFERENCES "public"."form_case_two_extended_docs" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "public"."form_case_two_template" ADD CONSTRAINT "form_case_two_template_constraint_custom_fkey" FOREIGN KEY ("constraint_custom") REFERENCES "public"."form_case_two_extended_docs" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "public"."form_case_two_template" ADD CONSTRAINT "form_case_two_template_description_fkey" FOREIGN KEY ("description") REFERENCES "public"."form_case_two_extended_docs" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "public"."form_case_two_template" ADD CONSTRAINT "form_case_two_template_estimated_budget_explain_fkey" FOREIGN KEY ("estimated_budget_explain") REFERENCES "public"."form_case_two_extended_docs" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "public"."form_case_two_template" ADD CONSTRAINT "form_case_two_template_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "public"."form_case_four_topics" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "public"."simulation_event_state" ADD CONSTRAINT "simulation_event_state_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "public"."simulation_case" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ============================================
-- FOREIGN KEYS: End
-- ============================================
