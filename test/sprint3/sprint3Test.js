import * as mongoAPI from '../../api/mongodb/mongoAPISprint3.js'
import * as postgresAPI from '../../api/sql/sqlAPISprint3.js'
import * as psqlJSONAPI from '../../api/sql/sqlJsonAPISprint3.js'

var dbAPI = null
var dbConnSetup = null
const mongoDBUri = "mongodb+srv://admin:power_low12@realmcluster.aamtz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
const postgresConnObj = {
	host: 'localhost',
	user: 'jayrunkel',
	database: 'techSupport'
}

const args = process.argv.slice(2)

function setDBAPI() {
	switch (args[0]) {
	case "MongoDB":
		dbAPI = mongoAPI
		dbConnSetup = mongoDBUri
		break
	case "SQL" :
		dbAPI = postgresAPI
		dbConnSetup = postgresConnObj
		break
  case "SQL_JSONB" :
		dbAPI = psqlJSONAPI
		dbConnSetup = postgresConnObj
		break	
	default:
		console.log("ERROR - Unknown database API")
	}
}

async function test () {
	let connection = await dbAPI.connectToDatabase(dbConnSetup)

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

	let result = await dbAPI.addTicketComment(4, newUserTom, "Made a change to the ticket")
	console.log("Updated Ticket Description [Success was ", result, "]:", await dbAPI.getTicket(4))

	result = await dbAPI.addTicketComment(9934393, newUserTom, "This ticket does not exist")
	console.log("Updated Ticket Description for Non Existing Ticket [Success was ", result, "]")

	console.log("The ticket comments are: ", await dbAPI.getTicketComments(4))

	console.log("The comments for a non-existant ticket are ", await dbAPI.getTicketComments(9934393))

	console.log("The search completions for 'hel' are : ", await dbAPI.getSearchCompletions("hel", 10))
	console.log("The search completions for 'foo' are : ", await dbAPI.getSearchCompletions("foo", 10))

	console.log("Search results for 'hel' search:")
	console.log(await dbAPI.search("hel", 1, 5))
	
	await dbAPI.disconnectFromDatabase()
}

	(() => {
		setDBAPI()
		if (dbAPI != null) test()
	})()
