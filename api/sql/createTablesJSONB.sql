-- Table: public.ticketJSONB

-- DROP TABLE IF EXISTS public."ticketJSONB";

CREATE TABLE IF NOT EXISTS public."ticketJSONB"
(
    "ticketNumber" bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    "ticketDetails" jsonb,
    CONSTRAINT "ticketJSONB_pkey" PRIMARY KEY ("ticketNumber")
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."ticketJSONB"
    OWNER to jayrunkel;
