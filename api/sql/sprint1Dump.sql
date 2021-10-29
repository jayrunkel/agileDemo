--
-- PostgreSQL database dump
--

-- Dumped from database version 14.0
-- Dumped by pg_dump version 14.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ticket; Type: TABLE; Schema: public; Owner: jayrunkel
--

CREATE TABLE public.ticket (
    subject text,
    description text,
    status text DEFAULT 'open'::text,
    "openDate" date DEFAULT CURRENT_DATE,
    "closeDate" date,
    "ticketOwner" text,
    "ticketNumber" bigint NOT NULL
);


ALTER TABLE public.ticket OWNER TO jayrunkel;

--
-- Name: ticket_ticketNumber_seq; Type: SEQUENCE; Schema: public; Owner: jayrunkel
--

ALTER TABLE public.ticket ALTER COLUMN "ticketNumber" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."ticket_ticketNumber_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Data for Name: ticket; Type: TABLE DATA; Schema: public; Owner: jayrunkel
--

COPY public.ticket (subject, description, status, "openDate", "closeDate", "ticketOwner", "ticketNumber") FROM stdin;
printer problems	my printer will not print	open	2021-10-21	\N	Jay	1
printer problems	my printer will not print	open	2021-10-21	\N	Jay	2
computer broken	my computer will not boot	open	2021-10-21	\N	Jeff	3
microphone issue	no one can hear me	open	2021-10-21	\N	Mark	4
computer upgrade	my computer is really old and slow	open	2021-10-21	\N	Mary	5
new mouse	my mouse is broken	open	2021-10-21	\N	Angela	6
printer problems	my printer will not print	open	2021-10-21	\N	Jay	7
computer broken	my computer will not boot	open	2021-10-21	\N	Jeff	8
microphone issue	no one can hear me	open	2021-10-21	\N	Mark	9
computer upgrade	my computer is really old and slow	open	2021-10-21	\N	Mary	10
new mouse	my mouse is broken	open	2021-10-21	\N	Angela	11
printer problems	my printer will not print	open	2021-10-21	\N	Jay	12
computer broken	my computer will not boot	open	2021-10-21	\N	Jeff	13
microphone issue	no one can hear me	open	2021-10-21	\N	Mark	14
computer upgrade	my computer is really old and slow	open	2021-10-21	\N	Mary	15
new mouse	my mouse is broken	open	2021-10-21	\N	Angela	16
printer problems	my printer will not print	open	2021-10-21	\N	Jay	17
computer broken	my computer will not boot	open	2021-10-21	\N	Jeff	18
microphone issue	no one can hear me	open	2021-10-21	\N	Mark	19
computer upgrade	my computer is really old and slow	open	2021-10-21	\N	Mary	20
new mouse	my mouse is broken	open	2021-10-21	\N	Angela	21
printer problems	my printer will not print	open	2021-10-21	\N	Jay	22
computer broken	my computer will not boot	open	2021-10-21	\N	Jeff	23
microphone issue	no one can hear me	open	2021-10-21	\N	Mark	24
computer upgrade	my computer is really old and slow	open	2021-10-21	\N	Mary	25
new mouse	my mouse is broken	open	2021-10-21	\N	Angela	26
printer problems	my printer will not print	open	2021-10-21	\N	Jay	27
computer broken	my computer will not boot	open	2021-10-21	\N	Jeff	28
microphone issue	no one can hear me	open	2021-10-21	\N	Mark	29
computer upgrade	my computer is really old and slow	open	2021-10-21	\N	Mary	30
new mouse	my mouse is broken	open	2021-10-21	\N	Angela	31
printer problems	my printer will not print	open	2021-10-21	\N	Jay	32
computer broken	my computer will not boot	open	2021-10-21	\N	Jeff	33
microphone issue	no one can hear me	open	2021-10-21	\N	Mark	34
computer upgrade	my computer is really old and slow	open	2021-10-21	\N	Mary	35
new mouse	my mouse is broken	open	2021-10-21	\N	Angela	36
printer problems	my printer will not print	open	2021-10-21	\N	Jay	37
computer broken	my computer will not boot	open	2021-10-21	\N	Jeff	38
microphone issue	no one can hear me	open	2021-10-21	\N	Mark	39
computer upgrade	my computer is really old and slow	open	2021-10-21	\N	Mary	40
new mouse	my mouse is broken	open	2021-10-21	\N	Angela	41
Help?	Doesn't work	open	2021-10-21	\N	Jay	42
Help?	Doesn't work	open	2021-10-21	\N	Jay	43
Help?	Doesn't work	open	2021-10-21	\N	Jay	44
Help?	Doesn't work	open	2021-10-21	\N	Jay	45
Help?	Doesn't work	closed	2021-10-21	\N	Jay	46
Help?	Doesn't work	open	2021-10-21	\N	Jay	47
Help?	Doesn't work	open	2021-10-21	\N	Jay	48
Help?	Doesn't workhello there\\nhello there\\n2021-10-21 14:15:29.789621-04\\nhello there	open	2021-10-21	\N	Jay	49
Help?	Doesn't work\n2021-10-21 14:21:06.980201-04\nMade a change to the ticket	open	2021-10-21	\N	Jay	50
Help?	Doesn't work\n2021-10-21 14:26:52.033954-04\nMade a change to the ticket	open	2021-10-21	\N	Jay	51
Help?	Doesn't work\n2021-10-21 14:28:35.395268-04\nMade a change to the ticket	open	2021-10-21	\N	Jay	52
Help?	Doesn't work\n2021-10-21 14:29:15.891212-04\nMade a change to the ticket	closed	2021-10-21	2021-10-21	Jay	53
\.



--
-- Name: ticket_ticketNumber_seq; Type: SEQUENCE SET; Schema: public; Owner: jayrunkel
--

SELECT pg_catalog.setval('public."ticket_ticketNumber_seq"', 53, true);



--
-- Name: ticket ValidStatusTypes; Type: CHECK CONSTRAINT; Schema: public; Owner: jayrunkel
--

ALTER TABLE public.ticket
    ADD CONSTRAINT "ValidStatusTypes" CHECK ((status = ANY (ARRAY[('open'::character varying)::text, ('closed'::character varying)::text, ('inProgress'::character varying)::text]))) NOT VALID;


--
-- Name: ticket ticket_pkey; Type: CONSTRAINT; Schema: public; Owner: jayrunkel
--

ALTER TABLE ONLY public.ticket
    ADD CONSTRAINT ticket_pkey PRIMARY KEY ("ticketNumber");


--
-- PostgreSQL database dump complete
--

