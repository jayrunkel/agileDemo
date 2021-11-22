--
-- PostgreSQL database dump
--

-- Dumped from database version 14.1
-- Dumped by pg_dump version 14.0

-- Started on 2021-11-22 12:45:39 EST

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

--
-- TOC entry 3 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: jayrunkel
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO jayrunkel;

--
-- TOC entry 3600 (class 0 OID 0)
-- Dependencies: 3
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: jayrunkel
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 213 (class 1259 OID 16418)
-- Name: comments; Type: TABLE; Schema: public; Owner: jayrunkel
--

CREATE TABLE public.comments (
    "commentNumber" integer NOT NULL,
    "ticketNumber" integer NOT NULL,
    "userId" integer NOT NULL,
    comment text NOT NULL,
    "timeStamp" timestamp without time zone
);


ALTER TABLE public.comments OWNER TO jayrunkel;

--
-- TOC entry 214 (class 1259 OID 16432)
-- Name: comments_commentNumber_seq; Type: SEQUENCE; Schema: public; Owner: jayrunkel
--

ALTER TABLE public.comments ALTER COLUMN "commentNumber" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."comments_commentNumber_seq"
    START WITH 1000
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 209 (class 1259 OID 16385)
-- Name: ticket; Type: TABLE; Schema: public; Owner: jayrunkel
--

CREATE TABLE public.ticket (
    subject text,
    status text DEFAULT 'open'::text,
    "openDate" date DEFAULT CURRENT_DATE,
    "closeDate" date,
    "ticketNumber" bigint NOT NULL,
    "ticketOwnerId" integer
);


ALTER TABLE public.ticket OWNER TO jayrunkel;

--
-- TOC entry 210 (class 1259 OID 16394)
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
-- TOC entry 211 (class 1259 OID 16404)
-- Name: users; Type: TABLE; Schema: public; Owner: jayrunkel
--

CREATE TABLE public.users (
    "userId" integer NOT NULL,
    "firstName" text,
    "lastName" text,
    title text
);


ALTER TABLE public.users OWNER TO jayrunkel;

--
-- TOC entry 212 (class 1259 OID 16411)
-- Name: users_userId_seq; Type: SEQUENCE; Schema: public; Owner: jayrunkel
--

ALTER TABLE public.users ALTER COLUMN "userId" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."users_userId_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 3443 (class 2606 OID 16393)
-- Name: ticket ValidStatusTypes; Type: CHECK CONSTRAINT; Schema: public; Owner: jayrunkel
--

ALTER TABLE public.ticket
    ADD CONSTRAINT "ValidStatusTypes" CHECK ((status = ANY (ARRAY[('open'::character varying)::text, ('closed'::character varying)::text, ('inProgress'::character varying)::text]))) NOT VALID;


--
-- TOC entry 3450 (class 2606 OID 16424)
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: jayrunkel
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY ("commentNumber");


--
-- TOC entry 3446 (class 2606 OID 16401)
-- Name: ticket ticket_pkey; Type: CONSTRAINT; Schema: public; Owner: jayrunkel
--

ALTER TABLE ONLY public.ticket
    ADD CONSTRAINT ticket_pkey PRIMARY KEY ("ticketNumber");


--
-- TOC entry 3448 (class 2606 OID 16410)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: jayrunkel
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY ("userId");


--
-- TOC entry 3451 (class 1259 OID 24581)
-- Name: fki_ticketNumberForiegnKey; Type: INDEX; Schema: public; Owner: jayrunkel
--

CREATE INDEX "fki_ticketNumberForiegnKey" ON public.comments USING btree ("ticketNumber");


--
-- TOC entry 3452 (class 1259 OID 24587)
-- Name: fki_userIdForiegnKey; Type: INDEX; Schema: public; Owner: jayrunkel
--

CREATE INDEX "fki_userIdForiegnKey" ON public.comments USING btree ("userId");


--
-- TOC entry 3444 (class 1259 OID 16417)
-- Name: fki_userIdInTicket; Type: INDEX; Schema: public; Owner: jayrunkel
--

CREATE INDEX "fki_userIdInTicket" ON public.ticket USING btree ("ticketOwnerId");


--
-- TOC entry 3454 (class 2606 OID 24576)
-- Name: comments ticketNumberForiegnKey; Type: FK CONSTRAINT; Schema: public; Owner: jayrunkel
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT "ticketNumberForiegnKey" FOREIGN KEY ("ticketNumber") REFERENCES public.ticket("ticketNumber");


--
-- TOC entry 3455 (class 2606 OID 24582)
-- Name: comments userIdForiegnKey; Type: FK CONSTRAINT; Schema: public; Owner: jayrunkel
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT "userIdForiegnKey" FOREIGN KEY ("userId") REFERENCES public.users("userId");


--
-- TOC entry 3453 (class 2606 OID 16412)
-- Name: ticket userIdInTicket; Type: FK CONSTRAINT; Schema: public; Owner: jayrunkel
--

ALTER TABLE ONLY public.ticket
    ADD CONSTRAINT "userIdInTicket" FOREIGN KEY ("ticketOwnerId") REFERENCES public.users("userId");


-- Completed on 2021-11-22 12:45:39 EST

--
-- PostgreSQL database dump complete
--

