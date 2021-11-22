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

import { MongoClient } from "mongodb";
const validTicketStatuses = ["open", "closed", "inProgress"]

const uri = "mongodb+srv://admin:power_low12@realmcluster.aamtz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
const dbName = "techSupport"
const collectionName = "ticket"

// Create a new MongoClient
//const client = new MongoClient(uri);
var client = null

async function connectToDatabase(uri) {
  client = new MongoClient(uri)
	await client.connect()
	return client
}

async function disconnectFromDatabase() {
	await client.close()
}

//private
async function getNextTicketNum() {
	let db = client.db(dbName)
	let col = db.collection(collectionName)
	let lastTicketNum = 0
	try {
		let lastTicket = await col.find({}, {ticketNumber : 1}).sort({ticketNumber : -1}).limit(1).toArray()
		if (lastTicket.length == 1) {
			lastTicketNum = lastTicket[0].ticketNumber 
		}
	}catch (err) {
		console.log(err.stack)
	}

	return ++lastTicketNum
}

// private
async function createUniqueTicket(owner, subject, description, tryNumber, error) {
	if (tryNumber > 5) {
		throw error

	} else {
		let db = client.db(dbName)
		let col = db.collection(collectionName)
		try {
			const newTicketNum = await getNextTicketNum()

			const res = await col.insertOne({ticketNumber: newTicketNum, ticketOwner: owner, subject: subject, description: description})
			console.log(res)
			return newTicketNum
		} catch (err) {
			return await createUniqueTicket(owner, subject, description, ++tryNumber, err)
		}
	}
	
}

async function createTicket(owner, subject, description) {
	let db = client.db(dbName)
	let col = db.collection(collectionName)
	try {
		const newTicketNum = await createUniqueTicket(owner, subject, description, 1, null)
		return newTicketNum
	} catch (err) {
		console.log(err.stack)
	}
}

async function getTicket(ticketNumber) {
	let db = client.db(dbName)
	let col = db.collection(collectionName)
	try {
		const res = await col.findOne({ticketNumber : ticketNumber})
		console.log(res)
		return res
	}
	catch (err) {
		console.log(err.stack)
	}
}

async function changeTicketStatus(ticketNumber, newStatus) {
	let operationStatus = false
	let db = client.db(dbName)
	let col = db.collection(collectionName)
	
	if (validTicketStatuses.includes(newStatus)) {
		try {
			const res = (newStatus == "closed") ?
						await col.updateOne({ticketNumber: ticketNumber},
																[{$set : {status : newStatus, closeDate : "$$NOW"}}]) :
						await col.updateOne({ticketNumber: ticketNumber},
															 {$set : {status : newStatus}})
			console.log(res)
		} catch (err) {
			console.log(err.stack)
		}
	} else {
		console.log("[ERROR] Attempting to change status of ticket: ", ticketNumber, " to and invalid ticket status: ", newStatus)
	}
	
	return operationStatus
}

async function addTicketComment(ticketNumber, description) {
	let operationStatus = false
	let db = client.db(dbName)
	let col = db.collection(collectionName)
		try {
			const res = await col.updateOne({ticketNumber : ticketNumber},
																			[{$set : {description : {$concat : ["$description", "\n", {$toString : "$$NOW"}, "\n", description]}}}])
			if (res != null) operationStatus = true
			console.log(res)
		} catch (err) {
			console.log(err.stack)
		}
	return operationStatus
}

async function test () {
	let connection = await connectToDatabase(uri)
	let ticketNum = await createTicket("Jay", "Help?", "Doesn't work")
	console.log("New Ticket Number: ", ticketNum)
	console.log("New Ticket", await getTicket(ticketNum))

	await changeTicketStatus(ticketNum, "closed")
	console.log("Closed Ticket", await getTicket(ticketNum))

	await changeTicketStatus(ticketNum, "working on it")

	await addTicketComment(ticketNum, "Made a change to the ticket")
	console.log("Updated Ticket Description:", await getTicket(ticketNum))

	await addTicketComment(9934393, jayId, "This ticket does not exist")

	await disconnectFromDatabase()
}

async function miniTest() {
	console.log(client)
	await connectToDatabase(uri)
	console.log(client)
	let ticketNum = await getNextTicketNum()
	console.log("Create New Ticket: ", ticketNum)
	await disconnectFromDatabase()
}

test()
