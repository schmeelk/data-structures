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
var apiKey = "AIzaSyD9SAVax2EMo8GAct45QMtqGskHfdblweE";
var meetings = [];
var meeting_times = "";
var time_row_elements = "";
var time_row = "";
var final_meetings = [];

$('div table tbody tr').each(function(f, e) {
    var meeting = new Object;
    meeting.locations = $(e).find('td').first().text();  //find each location row and put in a list/array
    meeting.details = $(e).find('td').find('div').first().text().replace('\n', '').replace('\t','').trim();; //special details
    meeting.times = $(e).find('td').next().text().replace('Get Directions', ''); //times
    meetings.push(meeting); //store
    });
    
    
//console.log(meetings.length);
//console.log(meetings);
//process.exit(0);

for (var j = 0; j < meetings.length; j++){  //parse each row
    //if (j > 0)
    //    delete meetings[j-1].locations;
    lines = meetings[j].locations.split('\n')[4].split(',').length; //number of lines for address
    //lines = meetings[j].locations.split('\n').length; //number of lines for address
    if(meetings[j].locations.includes('10025'))
        meetings[j].zipcode = '10025';
    else if (meetings[j].locations.includes('10024'))
        meetings[j].zipcode ='10024';
    else if (meetings[j].locations.includes('10023'))
        meetings[j].zipcode = '10023';
    if(meetings[j].locations.includes('Wheelchair access'))
        meetings[j].wheelchairaccess = 'Yes';
    else
        meetings[j].wheelchairaccess = 'No';
    meetings[j].name =  meetings[j].locations.split('\n')[1].replace('\n', '').replace('\t','').trim();
    meetings[j].title = meetings[j].locations.split('\n')[2].replace('\n', '').replace('\t','').trim();
    //process.exit(0);
    //console.log(lines);
    switch(lines) {    // to parse out full address in future for maps
        case 0: break; // no lines to parse
        case 1:        // one line to parse for address if want zipcode in future for maps
            row_address = meetings[j].locations.split('\n')[3].split(',')[0].trim();
            meetings[j].notes = meetings[j].locations.split('\n')[3].split(',')[1].replace('\n', '').replace('\t','').trim();
            if (row_address.includes(".")){
                meetings[j].street = row_address.split('.')[0].trim();
                meetings[j].new_york_addresses = row_address.split('.')[0].trim() +", New York, NY";
                meetings[j].notes = row_address.split('.')[1].replace('\n', '').replace('\t','').trim();
            }else if (row_address.includes("-")){
                meetings[j].street = row_address.split('-')[0].trim();                
                meetings[j].new_york_addresses = row_address.split('-')[0].trim()+", New York, NY";
                meetings[j].notes = row_address.split('-')[1].replace('\n', '').replace('\t','').trim();
            }else{
                meetings[j].street = row_address;
                meetings[j].new_york_addresses = row_address + ", New York, NY";
            }
            break;
        case 2:         // two lines to parse for address if want zipcode in future for maps
            meetings[j].street = meetings[j].locations.split('\n')[3].split(',')[0].trim();
            meetings[j].new_york_addresses = meetings[j].locations.split('\n')[3].split(',')[0].trim() + ", New York, NY";
            meetings[j].notes = meetings[j].locations.split('\n')[3].split(',')[1].replace('\n', '').replace('\t','').trim();
            break;
        default:        // more than two lines to parse for address if want zipcode in future for maps 
            meetings[j].street = meetings[j].locations.split('\n')[3].split(',')[0].trim();
            meetings[j].new_york_addresses = meetings[j].locations.split('\n')[3].split(',')[0].trim()+", New York, NY";
            meetings[j].notes = meetings[j].locations.split('\n')[4].split(',')[1].trim() + ", " + meetings[j].locations.split('\n')[4].split(',')[2].replace('10024', '').replace('\n', '').replace('\t','').trim();
            break;
            } 
}

//delete meetings[meetings.length - 1].locations;
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
   //fs.unlink('/home/ubuntu/workspace/data/meetings-zone6.txt');
   //fs.writeFileSync('/home/ubuntu/workspace/data/meetings-zone6.txt', JSON.stringify(final_meetings));
   console.log('Finished latlong');
   for (var j = 0; j < meetings.length; j++){  //parse times
    meeting_times = meetings[j].times.split('\t\n\t\t\t\t');
    for (var k = 1; k < meeting_times.length - 1; k++){
            time_row = meeting_times[k].replace('\n','').replace('\t','').trim();
            //console.log(time_row);
            time_row_elements = time_row.split(' ');
            //console.log(time_row_elements);
            var final_meeting = new Object;
            final_meeting.day = time_row_elements[0];
            if (time_row_elements[4] == 'PM')
                final_meeting.start = parseInt(time_row_elements[3]) + 12;
            else
                final_meeting.start = parseInt(time_row_elements[3]);
            if (time_row_elements[7] == 'PM')
                final_meeting.end = parseInt(time_row_elements[6]) + 12;
            else
                final_meeting.end = parseInt(time_row_elements[6]);
            final_meeting.type = time_row_elements[10];
            final_meeting.details = meetings[j].details;
            final_meeting.zipcode = meetings[j].zipcode;
            final_meeting.latlong = meetings[j].latLong;
            final_meeting.street = meetings[j].street;
            final_meeting.new_york_addresses = meetings[j].new_york_addresses;
            final_meeting.notes = meetings[j].notes;
            final_meeting.title = meetings[j].title;
            final_meeting.name = meetings[j].name;
            final_meeting.wheelchairaccess = meetings[j].wheelchairaccess;
            final_meeting.zipcode = meetings[j].zipcode;
            //console.log(final_meeting);
            final_meetings.push(final_meeting);
        }
   }

fs.writeFileSync('/home/ubuntu/workspace/data/meetings-zone6.txt', JSON.stringify(final_meetings));

});


