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
// ================================================================
// Sprint 2 Description:
//
// Allow multiple people to work on tickets. Tickets have an owner plus
// multiple other users who can work on the ticket
//
// ****************************************************************

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
	const json = {
		firstName: first,
		lastName: last,
		title: title
	}
	const values = [json]
	try {
		const res = await CLIENT.query('INSERT INTO "usersJSONB" ("userDetails") VALUES ($1) RETURNING *', values)
		return res.rows[0].userId
	} catch(err) {
		console.log(err.stack)
	}
}

export async function getUserId(first, last) {
		
	try {
		const res = await CLIENT.query(`SELECT "userId" FROM "usersJSONB" WHERE "userDetails"->>'firstName' = '${first}' AND "userDetails"->>'lastName' = '${last}'`)
//		console.log(res.rows[0])
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
	try {
		const json = [{
			ticketOwner : owner,
			subject: subject,
			description: description,
			status: "open",
			openDate: new Date()
		}]
		const res = await CLIENT.query('INSERT INTO "ticketJSONB" ("ticketDetails") VALUES ( $1 ) RETURNING *', json)
		return res.rows[0].ticketNumber
	} catch (err) {
		console.log(err.stack)
	}
}

export async function getTicket(ticketNumber) {
	try {
		const values = [ticketNumber]
		const res = await CLIENT.query('SELECT * FROM "ticketJSONB" WHERE "ticketNumber" = $1', values)
//		console.log(res.rows[0])
		return res.rows[0] ? res.rows[0] : null
	}
	catch (err) {
		console.log(err.stack)
	}
}

export async function changeTicketStatus(ticketNumber, newStatus) {
	let operationStatus = false
	
	if (validTicketStatuses.includes(newStatus)) {
		try {
			const resArray = await Promise.all([
				CLIENT.query(`UPDATE "ticketJSONB" SET "ticketDetails" = jsonb_set("ticketDetails", '{status}', to_jsonb('${newStatus}'::text), TRUE) WHERE "ticketNumber" = ${ticketNumber} RETURNING *`),
				// REQUIRES TO UPDATE Statements instead of 1 in MongoDB
				async function () {
					if (newStatus == "closed")
					CLIENT.query(`UPDATE "ticketJSONB" SET "ticketDetails" = jsonb_set("ticketDetails", '{closeDate}', to_jsonb(now()), TRUE) WHERE "ticketNumber" = ${ticketNumber} RETURNING *`)
				}()
			])

//			console.log(resArray[0].rows[0])
			if (resArray[0].rows.length == 1) operationStatus = true
		} catch (err) {
			console.log(err.stack)
		}
	} else {
		console.log("[ERROR] Attempting to change status of ticket: ", ticketNumber, " to and invalid ticket status: ", newStatus)
	}
	
	return operationStatus
}

export async function addTicketComment(ticketNumber, userid, description) {
	let operationStatus = false
	let newCommentObj = {
		userId : userid,
		date: new Date(),
		comment: description
	}
//	console.log("Stringified Object: ", JSON.stringify(newCommentObj))
	const values = [newCommentObj]
	try {
		const res = await CLIENT.query(`UPDATE "ticketJSONB" SET "ticketDetails" = jsonb_insert("ticketDetails", '{comments, 99999}', to_jsonb('${JSON.stringify(newCommentObj)}'::jsonb), true ) WHERE "ticketNumber" = ${ticketNumber} RETURNING *`)
		operationStatus = res.rowCount > 0
//		console.log(res)
	} catch (err) {
		console.log(err.stack)
	}

	return operationStatus
}

export async function getTicketComments(ticketNumber) {
	//const res = await CLIENT.query('SELECT "userId", "timeStamp" as date, comment FROM comments WHERE "ticketNumber" = $1', [ticketNumber])
  const res = await CLIENT.query(`select "ticketDetails"->'comments' as comments FROM "ticketJSONB" WHERE "ticketNumber" = ${ticketNumber}`)
	//	console.log("The comments are: ", res)
	return  (res.rows.length > 0) ? res.rows[0].comments : null
}

/*
async function test () {
	let connection = await connectToDatabase()
	
	let newUserTom = await createUser("Tom", "Jones", "Boss")
	console.log("Bosses user id: ", newUserTom)
	let newUserTomId = await getUserId("Tom", "Jones")
	console.log("Validating Boss is in the database. User Id: ", newUserTomId)

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

	await addTicketComment(ticketNum, "Made another change to the ticket")
	console.log("Updated Ticket Description:", await getTicket(ticketNum))

	await addTicketComment(9934393, "This ticket does not exist")

	await disconnectFromDatabase()
}
*/

//test()
