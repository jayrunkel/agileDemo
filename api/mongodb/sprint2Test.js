import * as dbAPI from './mongoAPISprint2.js'


const uri = "mongodb+srv://admin:power_low12@realmcluster.aamtz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"


async function test () {
	let connection = await dbAPI.connectToDatabase(uri)

	let newUserTom = await dbAPI.createUser("Tom", "Jones", "Boss")
	console.log("Bosses user id: ", newUserTom)
	let newUserTomId = await dbAPI.getUserId("Tom", "Jones")
	console.log("Validating Boss is in the database. User Id: ", newUserTomId)

	let ticketNum = await dbAPI.createTicket(newUserTomId, "Help?", "Doesn't work")
	console.log("New Ticket Number: ", ticketNum)
	console.log("New Ticket", await dbAPI.getTicket(ticketNum))
	console.log("Another Ticket", await dbAPI.getTicket(7))

	let nonExistingTicket = await dbAPI.getTicket(13902343)
	console.log("Value of non existing ticket: ", nonExistingTicket)

	await dbAPI.changeTicketStatus(5, "closed")
	console.log("Closed Ticket:", await dbAPI.getTicket(5))

	await dbAPI.addTicketComment(4, newUserTom, "Made a change to the ticket")
	console.log("Updated Ticket Description:", await dbAPI.getTicket(4))

	await dbAPI.addTicketComment(9934393, newUserTom, "This ticket does not exist")

	console.log("The ticket comments are: ", await dbAPI.getTicketComments(4))

	console.log("The comments for a non-existant ticket are ", await dbAPI.getTicketComments(9934393))
	
	await dbAPI.disconnectFromDatabase()
}

test()
