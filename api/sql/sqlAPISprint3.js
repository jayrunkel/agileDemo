// ****************************************************************
// Sprint 1
//
// Description:
//
//Create a microservice for managing technical support tickets. Operations include:
// - creating a ticket
// - changing ticket status from “open”, “pending”, and “closed”
// - Updating ticket description
//
// Tickets must have the following fields:
// - ticket number
// - title
// - description
// - open date
// - close date
// - ticket owner (the person who created the ticket)
//
// ================================================================
// Sprint 2 Description:
// Allow multiple people to work on tickets. Tickets have an owner plus
// multiple other users who can work on the ticket
//
// Implementation Notes:
//  1. Need to add user table
//  2. Need to convert description field into a table with time stamped comments
//
// ****************************************************************
// Sprint 3 Description:
//
// Add the ability to search for and retrieve tickets based upon searches
// for words and phrases in ticket title and comments. Matches in ticket
// title should be weighted over matches in comments and returned first.
// Search should include typeahead completion and fuzzy search.
//
// Implementation Notes:
//
// ****************************************************************




//Postgres password is "password"
import pkg from "pg"
const { Client } = pkg
var CLIENT = null
const validTicketStatuses = ["open", "closed", "inProgress"]

/*
async function test () {
	await client.connect()
	const res = await client.query('SELECT * FROM ticket')
	for (i = 0; i < res.rows.length; i++) {
		console.log(res.rows[i])
	}
	await client.end()
}
*/

export async function connectToDatabase(connObj) {

	CLIENT = new Client(connObj)
	await CLIENT.connect()
	return CLIENT
}

export async function disconnectFromDatabase() {
	await CLIENT.end()
}

// ================================================================
// USER API
// ++ createUser
// ++ getUserId
// ================================================================

export async function createUser(first, last, title) {
	const values = [first, last, title]
		
	try {
		const res = await CLIENT.query('INSERT INTO users ("firstName", "lastName", title) VALUES ($1, $2, $3) RETURNING *', values)
		console.log(res.rows[0])
		return res.rows[0].userId
	} catch(err) {
		console.log(err.stack)
	}
}

export async function getUserId(first, last) {
	const values = [first, last]
		
	try {
		const res = await CLIENT.query('SELECT * FROM users WHERE "firstName" = $1 AND "lastName" = $2', values)
		console.log(res.rows[0])
		return res.rows[0] ? res.rows[0].userId : null
	} catch(err) {
		console.log(err.stack)
	}
}



// ================================================================
// TICKET API
// ++ createTicket
// ++ getTicket
// ++ changeTicketStatus
// ++ addTicketComment
// ++ getTicketComments
// ================================================================

export async function createTicket(owner, subject, description) {

	const executeTransaction = async function () {
		try {
			await CLIENT.query('BEGIN')
/*
			const [res1, res2] = await Promise.all([
				client.query('INSERT INTO ticket ("ticketOwnerId", subject) VALUES ($1, $2) RETURNING "ticketNumber"', values1),
				client.query('INSERT INTO comments ("ticketNumber", "userId", comment, "timeStamp") VALUES ($1, $2, $3, Cast(now() as timestamp without time zone)) RETURNING "commentNumber"', values2)
			])
*/
			const values1 = [owner, subject]
			const res1 = await CLIENT.query('INSERT INTO ticket ("ticketOwnerId", subject) VALUES ($1, $2) RETURNING "ticketNumber"', values1)
			const ticketNumber = res1.rows[0].ticketNumber

			const values2 = [ticketNumber, owner, description]
			const res2 = await CLIENT.query('INSERT INTO comments ("ticketNumber", "userId", comment, "timeStamp") VALUES ($1, $2, $3, Cast(now() as timestamp without time zone)) RETURNING "commentNumber"', values2)
			await CLIENT.query('COMMIT')
			return ticketNumber
		} catch (err) {
			await CLIENT.query('ROLLBACK')
			throw err
		}
	}

	let ticketNumber = -1
	
	try {
		ticketNumber = await executeTransaction()
	} catch (e) {
		console.log(e.stack)
	}

	return ticketNumber
}

export async function getTicket(ticketNumber) {
	try {
		const values = [ticketNumber]
		const res = await CLIENT.query('SELECT * FROM ticket WHERE "ticketNumber" = $1', values)
		console.log(res.rows[0])
		return res.rows[0]
	}
	catch (err) {
		console.log(err.stack)
	}
}

export async function changeTicketStatus(ticketNumber, newStatus) {
	let operationStatus = false
	
	if (validTicketStatuses.includes(newStatus)) {
		try {
			const values = [ticketNumber, newStatus]
			const res = (newStatus == "closed") ?
						await CLIENT.query('UPDATE ticket SET "status" = $2, "closeDate" = now() WHERE "ticketNumber" = $1 RETURNING *', values) :
						await CLIENT.query('UPDATE ticket SET "status" = $2 WHERE "ticketNumber" = $1 RETURNING *', values) 
			console.log(res.rows[0])
			if (res.rows.length == 1) operationStatus = true
		} catch (err) {
			console.log(err.stack)
		}
	} else {
		console.log("[ERROR] Attempting to change status of ticket: ", ticketNumber, " to and invalid ticket status: ", newStatus)
	}
	
	return operationStatus
}

export async function addTicketComment(ticketNumber, userId, description) {
	let operationStatus = false
	
	try {
		const values = [ticketNumber, userId, description]
		const res = await CLIENT.query('INSERT INTO comments ("ticketNumber", "userId", comment, "timeStamp") VALUES ($1, $2, $3, Cast(now() as timestamp without time zone)) RETURNING "commentNumber"', values)
		operationStatus = true
	} catch (err) {
		console.log(err.stack)
	}

	return operationStatus
}

export async function getTicketComments(ticketNumber) {
	const res = await CLIENT.query('SELECT "userId", "timeStamp" as date, comment FROM comments WHERE "ticketNumber" = $1', [ticketNumber])
	return  (res.rows.length > 0) ? res.rows : null
}

export async function getSearchCompletions(phrase, numCompletions) {
	let res = null
	try {
		const values = [phrase + '%', numCompletions]
		// This query accurately implements the fuzzy search logic, but can't use an index. See comment above for alternative
	  res = await CLIENT.query('SELECT DISTINCT(subject) FROM ticket WHERE subject ILIKE $1 LIMIT $2', values)
	} catch (err) {
		console.log(err.stack)
	}

	return res ? res.rows : null

}

// Alternative query version for search:
// - The SELECT query used in the search function implements fuzzy matching usinng levenshtein distance, but cannot use an index.
// - The following SELECT query implements the search without fuzzy matching, but can use an index (for the search, not the join):
//      SELECT t."ticketNumber", t.subject, c.comment
//      FROM ticket t JOIN comments c on t."ticketNumber" = c."ticketNumber"
//      WHERE to_tsvector('english', c.comment) @@ to_tsquery('computer') OR
//            to_tsvector('english', t.subject) @@ to_tsquery('computer')
//      LIMIT 10;

// Limitations of this implementation
// - Cannot use an index
// - Doesn't do any type of ranking or sorting based upon word frequency or whether the word exists in the subject or comment field
// (it probably is possible to modify this SQL query so the results are sorted so that results with the same levenshtein distance are
//  are ordered so that subject result listed before comment)
//
//
// ================
//
// This version provides ranking, but not fuzzy matching. It requires a materialized view:
// 
// CREATE MATERIALIZED VIEW "searchView" AS
//     SELECT t."ticketNumber", t.subject, c.comment
// 		FROM ticket t JOIN comments c on t."ticketNumber" = c."ticketNumber";

// CREATE INDEX ON "searchView" USING GIN(
//    to_tsvector('english', subject || ' ' || comment));

// SELECT "ticketNumber", subject, comment, ts_rank(to_tsvector('english', subject || ' ' || comment), to_tsquery('computer')) as rank
// FROM "searchView"
// ORDER BY rank DESC
// LIMIT 10;


export async function search(phrase, fuzzyDistance, numResults) {
	let res = null
	try {
		const values = [phrase, fuzzyDistance, numResults]
		// This query accurately implements the fuzzy search logic, but can't use an index. See comment above for alternative
		/*
	  res = await CLIENT.query('SELECT *, levenshtein($1, u.unnest) \
                              FROM (SELECT t."ticketNumber", t.subject, c.comment, unnest(string_to_array(c.comment, " "::text) || string_to_array(t.subject, " "::text)) \
                                    FROM ticket t JOIN comments c on t."ticketNumber" = c."ticketNumber") as u \
                              WHERE levenshtein_less_equal($1, u.unnest, $2) <= $2 \
                              ORDER BY levenshtein_less_equal($1, u.unnest, $2) \
                              ASC LIMIT $3', values)
															*/
		res = await CLIENT.query('SELECT "ticketNumber", "subject", "comment", levenshtein($1, lower(trim(both \'?\' from u.unnest))) \
                              FROM (SELECT t."ticketNumber", t.subject, c.comment, unnest(string_to_array(c.comment, \' \'::text) || string_to_array(t.subject, \' \'::text)) \
                                    FROM ticket t JOIN comments c on t."ticketNumber" = c."ticketNumber") as u \
                              WHERE levenshtein_less_equal($1, lower(trim(both \'?\' from u.unnest)), $2) <= $2 \
                              ORDER BY levenshtein_less_equal($1, lower(trim(both \'?\' from u.unnest)), $2) \
                              ASC LIMIT $3', values)
		console.log(res)
	} catch (err) {
		console.log(err.stack)
	}

	return res ? res.rows : null
}


/*
async function test () {
	let connection = await connectToDatabase()
	let newUserTom = await createUser("Tom", "Jones", "Boss")
	console.log("Bosses user id: ", newUserTom)
	let newUserTomId = await getUserId("Tom", "Jones")
	console.log("Validating Boss is in the database. User Id: ", newUserTomId)

	let ticketNum = await createTicket(newUserTomId, "Help?", "Doesn't work")
	console.log("New Ticket Number: ", ticketNum)
	console.log("New Ticket", await getTicket(ticketNum))

		
	await changeTicketStatus(ticketNum, "closed")
	console.log("Closed Ticket", await getTicket(ticketNum))

	await changeTicketStatus(ticketNum, "working on it")

	let jayId = await getUserId("Jay", "Runkel")

	await addTicketComment(ticketNum, jayId, "Made a change to the ticket")
	console.log("Updated Ticket Description:", await getTicket(ticketNum))

	await addTicketComment(9934393, jayId, "This ticket does not exist")
	
  let comments = await getTicketComments(ticketNum)
	console.log("Ticket comments: ", comments)

	console.log("The comments for a non-existant ticket are ", await getTicketComments(9934393))
	
	await disconnectFromDatabase()
}

test()
*/
