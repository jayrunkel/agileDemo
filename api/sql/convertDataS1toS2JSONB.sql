-- Table: public.ticketJSONB

-- DROP TABLE IF EXISTS public."uwersJSONB";

CREATE TABLE IF NOT EXISTS public."usersJSONB"
(
    "userId" bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    "userDetails" jsonb,
    CONSTRAINT "usersJSONB_pkey" PRIMARY KEY ("userId")
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."usersJSONB"
    OWNER to jayrunkel;


-- INSERT INTO usersJSONB ("userDetails") VALUES ('{"firstName" : ' ||

-- SELECT DISTINCT "ticketDetails"->>'ticketOwner', json_build_object('firstName', "ticketDetails"->>'ticketOwner'::text) FROM "ticketJSONB" t;
-- SELECT json_build_object('firstName', "ticketDetails"->>'ticketOwner'::text) FROM "ticketJSONB" t;


-- Create an entry in the usersJSONB table for each distinct ticket owner in the tickets table.
INSERT INTO "usersJSONB" ("userDetails") 
			 (SELECT json_build_object('firstName', o.owner) as userDetails FROM (SELECT DISTINCT "ticketDetails"->>'ticketOwner' as owner FROM "ticketJSONB") o);


-- Convert the ticketOwner field in ticketJSONB to a reference to userId field usersJSONB
WITH USER_TICKET AS (
		 SELECT "userId", "ticketNumber"
		 FROM "ticketJSONB"
		 JOIN "usersJSONB" ON "ticketJSONB"."ticketDetails"->>'ticketOwner' = "usersJSONB"."userDetails"->>'firstName'
		 )		 
UPDATE "ticketJSONB"
SET "ticketDetails" = jsonb_set("ticketDetails", '{ticketOwner}', USER_TICKET."userId"::text::jsonb, true)
FROM USER_TICKET
WHERE "ticketJSONB"."ticketNumber" = USER_TICKET."ticketNumber";


-- Add an empty comments array to each ticket

UPDATE "ticketJSONB"
SET "ticketDetails" = jsonb_set("ticketDetails", '{comments}', '[]'::jsonb, true)

-- Put the description in the comments field
UPDATE "ticketJSONB"
SET "ticketDetails" = jsonb_insert(
  "ticketDetails",
	'{comments, 0}',
	jsonb_build_object('userId', "ticketDetails"->'ticketOwner', 'date', now(), 'comment', "ticketDetails"->>'description'),
	true)



-- Bug Fix for buggy implementation of query above ^^^^^^^^
-- UPDATE "ticketJSONB"
-- SET "ticketDetails" = jsonb_set(
--   "ticketDetails",
-- 	'{comments, 0}',
-- 	jsonb_build_object('userId', "ticketDetails"->'ticketOwner', 'date', now(), 'comment', "ticketDetails"->>'description'),
-- 	false)


UPDATE "ticketJSONB"
SET "ticketDetails" = "ticketDetails" - 'description'


-- ================================================================
-- Test Queries
-- ================================================================


SELECT "userId"
FROM "ticketJSONB"
JOIN "usersJSONB" ON "ticketJSONB"."ticketDetails"->>'ticketOwner' = "usersJSONB"."userDetails"->>'firstName';
