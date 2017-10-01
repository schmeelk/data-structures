// npm install cheerio
var fs = require('fs');             //use file system
var cheerio = require('cheerio');   //use cheerio
var request = require('request');   //npm install request
var async = require('async');       //npm install async
var row_address = "";
var lines = 0;
var content = fs.readFileSync('data/m06.txt'); //load the thesis text file into a variable, `content`
var $ = cheerio.load(content);                 //load `content` into a cheerio object
var replace = '';
var apiKey =  process.env.GMAKEY;
var meetings = [];

$('div table tbody tr').each(function(f, e) {
    var meeting = new Object;
    meeting.locations = $(e).find('td').first().text();  //find each location row and put in a list/array
    meeting.details = $(e).find('td').find('div').first().text(); //special details
    meeting.times = $(e).find('td').next().text().replace('Get Directions', ''); //times
    meetings.push(meeting); //store
    });
//console.log(meetings.length);
//console.log(meetings);
//process.exit(0);

for (var j = 0; j < meetings.length; j++){  //parse each row
    lines = meetings[j].locations.split('\n').length; //number of lines for address
    if(meetings[j].locations.includes('10025'))
        meetings[j].zipcode = '10025';
    else if (meetings[j].locations.includes('10024'))
        meetings[j].zipcode ='10024';
    else if (meetings[j].locations.includes('10023'))
        meetings[j].zipcode = '10023';
    if(meetings[j].locations.includes('Wheelchair access'))
        meetings[j].wheelchairaccess = 'true';
    else
        meetings[j].wheelchairaccess = 'false';
    meetings[j].name =  meetings[j].locations.split('\n')[1];
    meetings[j].title = meetings[j].locations.split('\n')[2];
    //process.exit(0);
    switch(lines) {    // to parse out full address in future for maps
        case 0: break; // no lines to parse
        case 1:        // one line to parse for address if want zipcode in future for maps
            row_address = meetings[j].locations.split('\n')[3].split(',')[0].trim();
            if (row_address.includes(".")){
                replace = row_address.split('.')[0].trim() +", New York, NY";
                meetings[j].new_york_addresses = replace;
            }else if (row_address.includes("-")){
                replace = row_address.split('-')[0].trim()+", New York, NY";
                meetings[j].new_york_addresses = replace;
            }else{
                replace = row_address + ", New York, NY";
                meetings[j].new_york_addresses = replace;
            }
            break;
        case 2:         // two lines to parse for address if want zipcode in future for maps
            replace = meetings[j].locations.split('\n')[3].split(',')[0].trim() + ", New York, NY";
            meetings[j].new_york_addresses = replace ;
            break;
        default:        // more than two lines to parse for address if want zipcode in future for maps (the m06.txt file has max 3 lines)
            replace = meetings[j].locations.split('\n')[3].split(',')[0].trim()+", New York, NY";
            meetings[j].new_york_addresses = replace;
            break;
            } 
}

//console.log(meetings.length);
//console.log(meetings);
//process.exit(0);


async.eachSeries(meetings, function(value, callback) {
    var apiRequest = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + value.new_york_addresses.split(' ').join('+') + '&key=' + apiKey;
    request(apiRequest, function(err, resp, body) {
        if (err) {throw err;}
        value.latLong = JSON.parse(body).results[0].geometry.location;
    });
    setTimeout(callback, 2000);
}, function() {
    console.log(meetings.length);
    fs.writeFileSync('/home/ubuntu/workspace/data/meetings-zone6.txt', JSON.stringify(meetings));
});

