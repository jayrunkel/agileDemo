-- Setting up fuzzy match
CREATE EXTENSION fuzzystrmatch;

-- Set up trigrams
CREATE EXTENSION pg_trgm;

-- search index
CREATE INDEX "commentSearch_idx" ON "comments" USING GIN (to_tsvector('english', comment));
CREATE INDEX "subjectSearch_idx" ON "ticket" USING GIN (to_tsvector('english', subject));


-- autocomplete index
CREATE INDEX subject_trgm_gin ON ticket USING gin(subject gin_trgm_ops);


-- This index was missing
CREATE INDEX "ticketNumber_idx"
    ON public.ticket USING btree
    ("ticketNumber" ASC NULLS LAST)

-- SELECT t."ticketNumber", t.subject, c.comment FROM ticket t JOIN comments c on t."ticketNumber" = c."ticketNumber"
-- WHERE to_tsvector('english', c.comment) @@ to_tsquery('computer') OR
-- to_tsvector('english', t.subject) @@ to_tsquery('computer')
-- ;

-- TEST QUERIES
-- Queries used to test search implementation
-- Provided only as a record of approaches I tried


-- EXPLAIN SELECT *
-- FROM comments
-- WHERE 'cumputer' % ANY(STRING_TO_ARRAY(comment, ' '));

-- SELECT *, levenshtein('cumputer', u.unnest)
-- FROM (SELECT "commentNumber", comment, unnest(string_to_array(comment, ' '::text))
--		  FROM comments) as u
-- WHERE levenshtein('cumputer', u.unnest) <= 2;

-- Search - no fuzzy match.
-- Uses index for search, but not for join
-- SELECT t."ticketNumber", t.subject, c.comment
-- FROM ticket t JOIN comments c on t."ticketNumber" = c."ticketNumber"
-- WHERE to_tsvector('english', c.comment) @@ to_tsquery('computer') OR
-- to_tsvector('english', t.subject) @@ to_tsquery('computer')
-- ;

-- Search with Fuzzy match, doesn't use index
-- SELECT *, levenshtein('hel', u.unnest)
-- FROM (SELECT t."ticketNumber", t.subject, c.comment, unnest(string_to_array(c.comment, ' '::text) || string_to_array(t.subject, ' '::text))
--       FROM ticket t JOIN comments c on t."ticketNumber" = c."ticketNumber") as u
-- WHERE levenshtein_less_equal('hel', u.unnest, 2) <= 2
-- ORDER BY levenshtein_less_equal('hel', u.unnest, 2) ASC
-- LIMIT 10;

SELECT *, levenshtein('hel', u.unnest)
FROM (SELECT t."ticketNumber", t.subject, c.comment, unnest(string_to_array(c.comment, ' '::text) || string_to_array(t.subject, ' '::text))
      FROM ticket t JOIN comments c on t."ticketNumber" = c."ticketNumber") as u
WHERE levenshtein_less_equal('hel', u.unnest, 2) <= 2
ORDER BY levenshtein_less_equal('hel', u.unnest, 2) ASC
LIMIT 10;


-- Autocomplete
-- SELECT * FROM ticket WHERE subject ILIKE 'hel%';
