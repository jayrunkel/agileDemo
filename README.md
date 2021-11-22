# agileDemo
# 
# Sprint 1 API

## Sprint Description

Create a microservice for managing technical support tickets. Operations include:

* creating a ticket
* changing ticket status from “open”, “pending”, and “closed”
* Updating ticket description

 Tickets must have the following fields:
 
* ticket number
* title
* description
* open date
* close date
* ticket owner (the person who created the ticket)

## Relational Schema

```
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
```

## MongoDB Schema

```
{ _id: ObjectId("617857f6fec3b5e2bd8dfb09"),
  ticketNumber: 2,
  ticketOwner: 'Jay',
  subject: 'Help?',
  description: 'Doesn\'t work',
  status: 'closed',
  closeDate: 2021-10-26T19:33:10.674Z }
```

## Database Connection

1. connectToDatabase(connectionString) returns databaseClient
2. disconnectFromDatabase()

## Tickets

3. createTicket(owner, title, description) returns newTicketNum
4. getTicket(ticketNumber) returns ticket (__object__)
5. changeTicketStatus(ticketNumber, newStatus) returns boolean (__true is success__)
6. addTicketComment(ticketNumber, newComment)



# Sprint 2 API

## Sprint Description

Allow multiple people to work on tickets. Tickets have an owner plus
multiple other users who can work on the ticket. Each user that works on a ticket should be able to add their own comments.

## Relational Schema

(Complete schema can be found in ../api/sql/sprint2CreateTables.sql)

```
CREATE TABLE public.comments (
    "commentNumber" integer NOT NULL,
    "ticketNumber" integer NOT NULL,
    "userId" integer NOT NULL,
    comment text NOT NULL,
    "timeStamp" timestamp without time zone
);

ALTER TABLE public.comments ALTER COLUMN "commentNumber" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."comments_commentNumber_seq"
    START WITH 1000
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE public.ticket (
    subject text,
    status text DEFAULT 'open'::text,
    "openDate" date DEFAULT CURRENT_DATE,
    "closeDate" date,
    "ticketNumber" bigint NOT NULL,
    "ticketOwnerId" integer
);

ALTER TABLE public.ticket ALTER COLUMN "ticketNumber" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."ticket_ticketNumber_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE public.users (
    "userId" integer NOT NULL,
    "firstName" text,
    "lastName" text,
    title text
);

ALTER TABLE public.users ALTER COLUMN "userId" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."users_userId_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

ALTER TABLE public.ticket
    ADD CONSTRAINT "ValidStatusTypes" CHECK ((status = ANY (ARRAY[('open'::character varying)::text, ('closed'::character varying)::text, ('inProgress'::character varying)::text]))) NOT VALID;
	
```

## MongoDB Schema

```
{ _id: ObjectId("617858b34ba6cb297ebffd18"),
  ticketNumber: 4,
  ticketOwner: 1,
  subject: 'Help?',
  status: 'closed',
  closeDate: 2021-10-26T19:36:19.689Z,
  comments: 
   [ { userId: 1,
       date: 2021-11-19T21:33:53.957Z,
       comment: 'Doesn\'t work' },
     { userId: 2,
       date: 2021-11-19T21:33:53.895Z,
       comment: 'Made a change to the ticket' },
     { userId: 4,
       date: 2021-11-22T17:13:35.298Z,
       comment: 'Made a change to the ticket' } ],
  version: 2 }
  
{ _id: ObjectId("619bcfbf5acb47f30333d3b6"),
  firstName: 'Tom',
  lastName: 'Jones',
  title: 'Boss',
  userId: 4 }

```


The API is the same as Sprint 1 with the following changes/additions

## Users

1. createUser(first, last, title) returns userId (__integer__)
2. getUserId(first, last) returns userId (__integer)

## Ticket

3. getTicketComments(ticketNumber) returns comments (__array of comment objects {userId: integer, date: date, comment: string}__)
4. (__API modified__) addTicketComment(ticketNumber, **userId**, comment)
