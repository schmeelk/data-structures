var fs = require('fs');

var dbName = 'aa';
var collName = 'meetings';

// Connection URL
var url = 'mongodb://' + process.env.IP + ':27017/' + dbName;

// Retrieve
var MongoClient = require('mongodb').MongoClient;

MongoClient.connect(url, function(err, db) {
    if (err) {return console.dir(err);}

    var collection = db.collection(collName);

    // Select three Meetings stations
    collection.aggregate([
        
        {
            
            $match: { day: "Tuesdays", start: { $gte: 19} } 
           
        }
         
         
        
        ]).toArray(function(err, docs) {
        if (err) {console.log(err)}
        
        else {
            console.log("Writing", docs.length, "documents as a result of this aggregation - meetings on Tuesdays on or after 7pm.");
            fs.writeFileSync('mongo_aggregation_meeting_Tuesday_7pm_result.JSON', JSON.stringify(docs, null, 4));
        }
        db.close();
        
    });

}); //MongoClient.connect