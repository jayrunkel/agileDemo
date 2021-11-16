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

const { Client } = require('pg')
const client = new Client({
	host: 'localhost',
	user: 'jayrunkel',
	database: 'techSupport'
})
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

async function connectToDatabase() {
	await client.connect()
	return client
}

async function disconnectFromDatabase() {
	await client.end()
}

// ================================================================
// USER API
// -- createUser
// -- getUserId
// ================================================================

async function createUser(first, last, title) {
	const values = [first, last, title]
		
	try {
		const res = await client.query('INSERT INTO users ("firstName", "lastName", title) VALUES ($1, $2, $3) RETURNING *', values)
		console.log(res.rows[0])
		return res.rows[0].userId
	} catch(err) {
		console.log(err.stack)
	}
}

async function getUserId(first, last) {
	const values = [first, last]
		
	try {
		const res = await client.query('SELECT * FROM users WHERE "firstName" = $1 AND "lastName" = $2', values)
		console.log(res.rows[0])
		return res.rows[0].userId
	} catch(err) {
		console.log(err.stack)
	}
}



// ================================================================
// TICKET API
// -- createTicket
// -- getTicket
// -- changeTicketStatus
// -- addTicketComment
// ================================================================

async function createTicket(owner, subject, description) {
		try {
			const values1 = [owner, subject]
			await client.query('BEGIN')
			const res1 = await client.query('INSERT INTO ticket ("ticketOwnerId", subject) VALUES ($1, $2) RETURNING "ticketNumber"', values1)
			const ticketNumber = res1.rows[0].ticketNumber
			const values2 = [ticketNumber, owner, description]
			const res2 = await client.query('INSERT INTO comments ("ticketNumber", "userId", comment, "timeStamp") VALUES ($1, $2, $3, Cast(now() as timestamp without time zone)) RETURNING "commentNumber"', values2)
			await client.query('COMMIT')
			return ticketNumber
		} catch (err) {
			await client.query('ROLLBACK')
			throw err
		}
}

async function getTicket(ticketNumber) {
	try {
		const values = [ticketNumber]
		const res = await client.query('SELECT * FROM ticket WHERE "ticketNumber" = $1', values)
		console.log(res.rows[0])
		return res.rows[0]
	}
	catch (err) {
		console.log(err.stack)
	}
}

async function changeTicketStatus(ticketNumber, newStatus) {
	let operationStatus = false
	
	if (validTicketStatuses.includes(newStatus)) {
		try {
			const values = [ticketNumber, newStatus]
			const res = (newStatus == "closed") ?
						await client.query('UPDATE ticket SET "status" = $2, "closeDate" = now() WHERE "ticketNumber" = $1 RETURNING *', values) :
						await client.query('UPDATE ticket SET "status" = $2 WHERE "ticketNumber" = $1 RETURNING *', values) 
			console.log(res.rows[0])
		} catch (err) {
			console.log(err.stack)
		}
	} else {
		console.log("[ERROR] Attempting to change status of ticket: ", ticketNumber, " to and invalid ticket status: ", newStatus)
	}
	
	return operationStatus
}

async function addTicketComment(ticketNumber, description) {
		try {
			const values = [ticketNumber, description]
			const res = await client.query('UPDATE ticket SET "description" = ("description" || \'\n\' || now() || \'\n\' || $2) WHERE "ticketNumber" = $1 RETURNING *', values)
			console.log(res.rows[0])
		} catch (err) {
			console.log(err.stack)
		}

}

async function test () {
	let connection = await connectToDatabase()
	let newUserTom = await createUser("Tom", "Jones", "Boss")
	console.log("Bosses user id: ", newUserTom)
	let newUserTomId = await getUserId("Tom", "Jones")
	console.log("Validating Boss is in the database. User Id: ", newUserTomId)

	let ticketNum = await createTicket(newUserTomId, "Help?", "Doesn't work")
	console.log("New Ticket Number: ", ticketNum)
	console.log("New Ticket", await getTicket(ticketNum))

	/*	
	await changeTicketStatus(ticketNum, "closed")
	console.log("Closed Ticket", await getTicket(ticketNum))

	await changeTicketStatus(ticketNum, "working on it")

	await addTicketComment(ticketNum, "Made a change to the ticket")
	console.log("Updated Ticket Description:", await getTicket(ticketNum))
	*/
	
	await disconnectFromDatabase()
}

test()
