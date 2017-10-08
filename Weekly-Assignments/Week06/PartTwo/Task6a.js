// npm install mongodb

var request = require('request');
// IN MONGO exists a database `aa` with a collection `meetings`
var dbName = 'aa'; // name of Mongo database (created in the Mongo shell)
var collName = 'meetings'; // name of Mongo collection (created in the Mongo shell)

// Request the JSON data on citibike stations
// Insert the list of aa meetings (contained in an array) in the Mongo collection
request('https://raw.githubusercontent.com/schmeelk/data-structures/master/Weekly-Assignments/Week06/PartOne/meetings-zone6.json', function(error, response, body) {
    var meetingData = JSON.parse(body);
    // Connection URL
    var url = 'mongodb://' + process.env.IP + ':27017/' + dbName;
    // Retrieve
    var MongoClient = require('mongodb').MongoClient; 
    MongoClient.connect(url, function(err, db) {
        if (err) {return console.dir(err);}

        var collection = db.collection(collName);

        // THIS IS WHERE THE DOCUMENT(S) IS/ARE INSERTED TO MONGO:
        meetingData.forEach(function(element) {
            collection.insert(element);
        });
        db.close();
    }); //MongoClient.connect
}); //request