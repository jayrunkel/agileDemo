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

import { MongoClient } from "mongodb";
const validTicketStatuses = ["open", "closed", "inProgress"]

const uri = "mongodb+srv://admin:power_low12@realmcluster.aamtz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
const dbName = "techSupport"
const ticketCollectionName = "ticket"
const usersCollectionName = "users"
const currentVersion = 2

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

// ================================================================
// USER API
// ++ createUser
// ++ getUserId
// ================================================================

async function getNextUserId() {
	let db = client.db(dbName)
	let col = db.collection(usersCollectionName)
	let lastUserId = 0
	try {
		let lastUser = await col.find({}, {userId : 1}).sort({userId : -1}).limit(1).toArray()
		if (lastUser.length == 1) {
			lastUserId = lastUser[0].userId
		}
	}catch (err) {
		console.log(err.stack)
	}

	return ++lastUserId
}

async function createUniqueUser(first, last, title, tryNumber, error) {
	if (tryNumber > 5) {
		throw error

	} else {
		let db = client.db(dbName)
		let col = db.collection(usersCollectionName)
		try {
			const newUserId = await getNextUserId()

			const res = await col.insertOne({firstName: first, lastName: last, title: title, userId: newUserId})
			console.log(res)
			return newUserId
		} catch (err) {
			return await createUniqueUser(first, last, title, ++tryNumber, err)
		}
	}
	
}

async function createUser(first, last, title) {
	let db = client.db(dbName)
	let col = db.collection(usersCollectionName)
	
	try {
		const newUserId = await createUniqueUser(first, last, title, 1, null)
		return newUserId
	} catch (err) {
		console.log(err.stack)
	}
}


async function getUserId(first, last) {
	let db = client.db(dbName)
	let col = db.collection(usersCollectionName)
	
	try {
		const user = await col.findOne({firstName: first, lastName: last})
		return user ? user.userId : null
	} catch (err) {
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

async function getNextTicketNum() {
	let db = client.db(dbName)
	let col = db.collection(ticketCollectionName)
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

// This implementation assumes that there is an unique index on ticketNumber
async function createUniqueTicket(owner, subject, description, tryNumber, error) {
	if (tryNumber > 5) {
		throw error

	} else {
		let db = client.db(dbName)
		let col = db.collection(ticketCollectionName)
		try {
			const newTicketNum = await getNextTicketNum()

			const res = await col.insertOne({
				ticketNumber: newTicketNum,
				ticketOwner: owner,
				subject: subject,
				version: currentVersion,
				status: "open",
				comments: [{
					userId : owner,
					date : new Date(),
					comment: description
				}]
			})
			console.log(res)
			return newTicketNum
		} catch (err) {
			return await createUniqueTicket(owner, subject, description, ++tryNumber, err)
		}
	}
	
}

async function createTicket(owner, subject, description) {
	let db = client.db(dbName)
	let col = db.collection(ticketCollectionName)
	try {
		const newTicketNum = await createUniqueTicket(owner, subject, description, 1, null)
		return newTicketNum
	} catch (err) {
		console.log(err.stack)
	}
}



		

async function convertTicketToCurrentVersion(ticketNumber, userName, version, additionalStage = null) {
	let db = client.db(dbName)
	let col = db.collection(ticketCollectionName)

	if (version === undefined || version == 1) {
		try {
			const userId = await getUserId(userName, null)
			let convertVersion1ToVersion2Pipeline = [
				{
					$set: {
						version: currentVersion,
						ticketOwner: userId,
						comments: {
							$concatArrays : [
								[{
									userId: userId,
									date: '$$NOW',
									comment: '$description'
								}],
								{$ifNull : ["$comments", []]}
							]
						}
					}
				},
				{
					$unset: 'description'
				}
			]
			if (additionalStage) {
				convertVersion1ToVersion2Pipeline.push(additionalStage)
			}
			const res = await col.findOneAndUpdate(
				{ticketNumber : ticketNumber}, //query
				convertVersion1ToVersion2Pipeline, // update pipeline
				{returnDocument : "after"} // return the updated document
			)
			return res.value
		} catch (err) {
			console.log(err.stack)
		}
	}
	else {
		return null
	}
}

async function getTicket(ticketNumber) {
	let db = client.db(dbName)
	let col = db.collection(ticketCollectionName)
	try {
		let res = await col.findOne({ticketNumber : ticketNumber})
		res = (res == null || res.version == currentVersion) ? res : await convertTicketToCurrentVersion(ticketNumber, res.ticketOwner, res.version)
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
	let col = db.collection(ticketCollectionName)
	
	if (validTicketStatuses.includes(newStatus)) {
		try {
			let res = (newStatus == "closed") ?
						await col.findOneAndUpdate({ticketNumber: ticketNumber},
																			 {$set : {status : newStatus, closeDate : "$$NOW"}},
																			 {returnDocument : "after"}) :
						await col.findOneAndUpdate({ticketNumber: ticketNumber},
																			 {$set : {status : newStatus}},
																			 {returnDocument : "after"})
			if (res.version === undefined || res.version == 1)
				res = await convertTicketToCurrentVersion(res.ticketNumber, res.ticketOwner, res.version)
			operationStatus = true
		} catch (err) {
			console.log(err.stack)
		}
	} else {
		console.log("[ERROR] Attempting to change status of ticket: ", ticketNumber, " to and invalid ticket status: ", newStatus)
	}
	
	return operationStatus
}

async function addTicketComment(ticketNumber, userId, description) {
	let operationStatus = false
	let db = client.db(dbName)
	let col = db.collection(ticketCollectionName)
		try {
			let res = await col.findOneAndUpdate({ticketNumber : ticketNumber},
																						 [{$set : {
																							 comments: {
																								 $concatArrays : [
																									 {$ifNull : ["$comments", []]},
																									 [{
																										 userId: userId,
																										 date: '$$NOW',
																										 comment: description
																									 }]
																								 ]
																							 }
																						 }}],
																						 {returnDocument: "after"})
			if (res.version === undefined || res.version == 1)
				res = await convertTicketToCurrentVersion(res.ticketNumber, res.ticketOwner, res.version)
			operationStatus = true
		} catch (err) {
			console.log(err.stack)
		}

	return operationStatus
}

async function test () {
	let connection = await connectToDatabase(uri)

	let nextUserId = await getNextUserId()
	console.log("Next user id: ", nextUserId)

	let newUserTom = await createUser("Tom", "Jones", "Boss")
	console.log("Bosses user id: ", newUserTom)
	let newUserTomId = await getUserId("Tom", "Jones")
	console.log("Validating Boss is in the database. User Id: ", newUserTomId)

	let ticketNum = await createTicket(newUserTomId, "Help?", "Doesn't work")
	console.log("New Ticket Number: ", ticketNum)
	console.log("New Ticket", await getTicket(ticketNum))
	console.log("Another Ticket", await getTicket(7))

	let nonExistingTicket = await getTicket(13902343)
	console.log("Value of non existing ticket: ", nonExistingTicket)

	await changeTicketStatus(5, "closed")
	console.log("Closed Ticket:", await getTicket(ticketNum))

	await changeTicketStatus(ticketNum, "working on it")

	await addTicketComment(4, newUserTom, "Made a change to the ticket")
	console.log("Updated Ticket Description:", await getTicket(4))

	await disconnectFromDatabase()
}

async function miniTest() {
	console.log(client)
	await connectToDatabase(uri)

	let ticketNum = await getNextTicketNum()
	console.log("Create New Ticket: ", ticketNum)

	let userId = await getNextUserId()
	console.log("Create New User: ", userId)
	await disconnectFromDatabase()
}

test()
