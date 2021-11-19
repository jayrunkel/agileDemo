
// mongosh script

let db = db.getSiblingDB("techSupport")
let ticketCol = db.getCollection("ticket")
let usersCol = db.getCollection("users")

let users = ticketCol.distinct("ticketOwner")

for (i = 0; i < users.length; i++) {
	usersCol.insertOne({userId : i + 1, firstName : users[i], lastName: null})

}

