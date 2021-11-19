
// mongosh script

let db = db.getSiblingDB("techSupport")
let ticketCol = db.getCollection("ticket")
let usersCol = db.getCollection("users")

let users = ticketCol.distinct("ticketOwner")

usersCol.drop()
for (i = 0; i < users.length; i++) {
	usersCol.insertOne({userId : i + 1, firstName : users[i], lastName: null})

}

let replaceUserWithUserIdPipeline = [{$match: {
 ticketOwner: {
  $type: 'string'
 }
}}, {$lookup: {
 from: 'users',
 localField: 'ticketOwner',
 foreignField: 'firstName',
 as: 'user'
}}, {$set: {
 ticketOwner: {
  $let: {
   vars: {
    userObj: {
     $first: '$user'
    }
   },
   'in': '$$userObj.userId'
  }
 },
 comments: {
  $let: {
   vars: {
    userObj: {
     $first: '$user'
    }
   },
   'in': [
    {
     userId: '$$userObj.userId',
     date: '$$NOW',
     comment: '$description'
    }
   ]
  }
 }
}}, {$unset: 'user'},
{$out: {db : 'techSupport', coll: 'ticket'}}
]

ticketCol.aggregate(replaceUserWithUserIdPipeline).toArray()

