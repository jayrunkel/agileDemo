
// mongosh script

let db = db.getSiblingDB("techSupport")
let ticketCol = db.getCollection("ticket")
let usersCol = db.getCollection("users")

let users = ticketCol.distinct("ticketOwner")

usersCol.drop()
db.createCollection("users")
usersCol = db.getCollection("users")
usersCol.createIndex({userId : 1}, {unique : true})

for (i = 0; i < users.length; i++) {
	usersCol.insertOne({userId : i + 1, firstName : users[i], lastName: null, version : 2})

}

//ticketCol.updateMany({version : {$exists : false}}, {$set : {version : 1}})





