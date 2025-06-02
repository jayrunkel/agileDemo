-- Table: public.ticket

-- DROP TABLE IF EXISTS public.ticket;

CREATE DATABASE public;

CREATE TABLE IF NOT EXISTS public.ticket
(
    subject text COLLATE pg_catalog."default",
    description text COLLATE pg_catalog."default",
    status text COLLATE pg_catalog."default",
    "openDate" date,
    "closeDate" date,
    "ticketOwner" text COLLATE pg_catalog."default",
    "ticketNumber" bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    CONSTRAINT ticket_pkey PRIMARY KEY ("ticketNumber"),
    CONSTRAINT "ValidStatusTypes" CHECK (status = ANY (ARRAY['open'::character varying::text, 'closed'::character varying::text, 'inProgress'::character varying::text])) NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.ticket
    OWNER to jayrunkel;
