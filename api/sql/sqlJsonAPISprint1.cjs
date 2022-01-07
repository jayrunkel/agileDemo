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

async function createTicket(owner, subject, description) {
	try {
		const json = [{
			ticketOwner : owner,
			subject: subject,
			description: description,
			status: "open",
			openDate: new Date()
		}]
		const res = await client.query('INSERT INTO "ticketJSONB" ("ticketDetails") VALUES ( $1 ) RETURNING *', json)
		return res.rows[0].ticketNumber
	} catch (err) {
		console.log(err.stack)
	}
}

async function getTicket(ticketNumber) {
	try {
		const values = [ticketNumber]
		const res = await client.query('SELECT * FROM "ticketJSONB" WHERE "ticketNumber" = $1', values)
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
			const resArray = await Promise.all([
				client.query(`UPDATE "ticketJSONB" SET "ticketDetails" = jsonb_set("ticketDetails", '{status}', to_jsonb('${newStatus}'::text), TRUE) WHERE "ticketNumber" = ${ticketNumber} RETURNING *`),
				async function () {
					if (newStatus == "closed")
					client.query(`UPDATE "ticketJSONB" SET "ticketDetails" = jsonb_set("ticketDetails", '{closeDate}', to_jsonb(now()), TRUE) WHERE "ticketNumber" = ${ticketNumber} RETURNING *`)
				}()
			])

			console.log(resArray[0].rows[0])
			if (resArray[0].rows.length == 1) operationStatus = true
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
//			const values = [ticketNumber, description]
//			const res = await client.query('UPDATE ticket SET "description" = ("description" || \'\n\' || now() || \'\n\' || $2) WHERE "ticketNumber" = $1 RETURNING *', values)
			const res = await client.query(`UPDATE "ticketJSONB" SET "ticketDetails" = jsonb_set("ticketDetails", '{description}', to_jsonb(concat(trim(both '"' from "ticketDetails"->'description'->>0), '\n', now(), '\n', '${description}'))) WHERE "ticketNumber" = ${ticketNumber} RETURNING *`)
			//console.log(res.rows[0])
		} catch (err) {
			console.log(err.stack)
		}

}

async function test () {
	let connection = await connectToDatabase()
	let ticketNum = await createTicket("Jay", "Help?", "Doesn't work")
	console.log("New Ticket Number: ", ticketNum)
	console.log("New Ticket", await getTicket(ticketNum))

	await changeTicketStatus(ticketNum, "closed")
	console.log("Closed Ticket", await getTicket(ticketNum))

	await changeTicketStatus(ticketNum, "working on it")
	
	await addTicketComment(ticketNum, "Made a change to the ticket")
	console.log("Updated Ticket Description:", await getTicket(ticketNum))

	await addTicketComment(ticketNum, "Made another change to the ticket")
	console.log("Updated Ticket Description:", await getTicket(ticketNum))

	await addTicketComment(9934393, "This ticket does not exist")
  
	await disconnectFromDatabase()
}

test()
