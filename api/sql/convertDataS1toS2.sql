-- Table: public.users

-- DROP TABLE IF EXISTS public.users;

TABLESPACE pg_default;

CREATE TABLE IF NOT EXISTS public.users
(
    "userId" integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    "firstName" text COLLATE pg_catalog."default",
    "lastName" text COLLATE pg_catalog."default",
    title text COLLATE pg_catalog."default",
    CONSTRAINT users_pkey PRIMARY KEY ("userId")
)



ALTER TABLE IF EXISTS public.users
    OWNER to jayrunkel;


--
-- Build the list of users from existing ticket table and insert them into users table
--



INSERT INTO users ("firstName") SELECT DISTINCT "ticketOwner" FROM ticket;

--
-- Replace user names with user ids in ticket table
--

-- Column: public.ticket."ticketOwnerId"

-- ALTER TABLE IF EXISTS public.ticket DROP COLUMN IF EXISTS "ticketOwnerId";

ALTER TABLE IF EXISTS public.ticket
    ADD COLUMN "ticketOwnerId" integer;

UPDATE ticket SET "ticketOwnerId"=(SELECT "userId" FROM users WHERE ticket."ticketOwner" = users."firstName");

-- Add Foreign Key reference from ticket to user

ALTER TABLE IF EXISTS public.ticket
    ADD CONSTRAINT "userIdInTicket" FOREIGN KEY ("ticketOwnerId")
    REFERENCES public.users ("userId") MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;
CREATE INDEX IF NOT EXISTS "fki_userIdInTicket"
    ON public.ticket("ticketOwnerId");


ALTER TABLE IF EXISTS public.ticket DROP COLUMN IF EXISTS "ticketOwner";

-- Create Comments Table

CREATE TABLE public.comments
(
    "commentNumber" integer NOT NULL,
    "ticketNumber" integer NOT NULL,
    "userId" integer NOT NULL,
    comment text NOT NULL,
    "timeStamp" timestamp without time zone NOT NULL,
    PRIMARY KEY ("commentNumber")
)


ALTER TABLE IF EXISTS public.comments
    OWNER to jayrunkel;


INSERT INTO comments ("commentNumber", "ticketNumber", "userId", "timeStamp", "comment")
SELECT "ticketNumber", "ticketNumber", "ticketOwnerId", Cast("openDate" as timestamp without time zone), "description"
FROM ticket;
	
ALTER TABLE IF EXISTS public.comments
    ALTER COLUMN "commentNumber" ADD GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1000 MINVALUE 1 );

ALTER TABLE IF EXISTS public.ticket DROP COLUMN IF EXISTS "description";
