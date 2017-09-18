// npm install cheerio
var fs = require('fs');             //use file system
var cheerio = require('cheerio');   //use cheerio
var request = require('request');   //npm install request
var async = require('async');       //npm install async
var row_locations = [];             //place to save all row address data
var row_address = "";
var lines = 0;
var content = fs.readFileSync('data/m06.txt'); //load the thesis text file into a variable, `content`
var $ = cheerio.load(content);                 //load `content` into a cheerio object
var replace = '';
var new_york_addresses = [];
var apiKey = process.env.GMAKEY;
var meetingsData = [];

$('div table tbody tr').each(function(f, e) {
    row_locations.push($(e).find('td').first().text());  //find each location row and put in a list/array
});

for (var j = 0; j < row_locations.length; j++){  //parse each row
    lines = row_locations[j].split('\n')[4].split(',').length; //number of lines for address
    switch(lines) {    // to parse out full address in future for maps
        case 0: break; // no lines to parse
        case 1:        // one line to parse for address if want zipcode in future for maps
            row_address = row_locations[j].split('\n')[3].split(',')[0].trim();
            if (row_address.includes(".")){
                replace = row_address.split('.')[0].trim() +", New York, NY";
                //replace = (row_address.split('.')[0].trim()).replace(/ /g, "+")+",+New+York,+NY";
                new_york_addresses.push(replace);
                //console.log( replace );
            }else if (row_address.includes("-")){
                replace = row_address.split('-')[0].trim()+", New York, NY";
                //replace = (row_address.split('-')[0].trim()).replace(/ /g, "+")+",+New+York,+NY";
                new_york_addresses.push(replace);
                //console.log( replace );
            }else{
                replace = row_address + ", New York, NY";
                //replace = row_address.replace(/ /g, "+")+",+New+York,+NY";
                new_york_addresses.push(replace);
                //console.log( replace );
            }
            break;
        case 2:         // two lines to parse for address if want zipcode in future for maps
            replace = row_locations[j].split('\n')[3].split(',')[0].trim() + ", New York, NY";
            //replace = (row_locations[j].split('\n')[3].split(',')[0].trim()).replace(/ /g, "+")+",+New+York,+NY";
            //console.log(replace); // + " " + row[j].split('\n')[3].split(',')[1].trim());
            new_york_addresses.push(replace);
            break;
        default:        // more than two lines to parse for address if want zipcode in future for maps (the m06.txt file has max 3 lines)
            replace = row_locations[j].split('\n')[3].split(',')[0].trim()+", New York, NY";
            //replace = (row_locations[j].split('\n')[3].split(',')[0].trim()).replace(/ /g, "+")+",+New+York,+NY";
            //console.log(replace); //+ " " + row_locations[j].split('\n')[4].split(',')[0].trim() + " " + row_locations[j].split('\n')[4].split(',')[1].trim());
            new_york_addresses.push(replace);
            break;
    } 
}

//console.log(new_york_addresses);

async.eachSeries(new_york_addresses, function(value, callback) {
    var apiRequest = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + value.split(' ').join('+') + '&key=' + apiKey;
    //console.log(apiRequest);
    var thisMeeting = new Object;
    thisMeeting.address = value;
    request(apiRequest, function(err, resp, body) {
        if (err) {throw err;}
        thisMeeting.latLong = JSON.parse(body).results[0].geometry.location;
        meetingsData.push(thisMeeting);
    });
    setTimeout(callback, 2000);
}, function() {
    console.log(meetingsData);
});
