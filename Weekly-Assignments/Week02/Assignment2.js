// npm install cheerio
var fs = require('fs');             //use file system
var cheerio = require('cheerio');   //use cheerio
var row_locations = [];             //place to save all row address data
var row_address = "";
var lines = 0;
var content = fs.readFileSync('data/m06.txt'); //load the thesis text file into a variable, `content`
var $ = cheerio.load(content);                 //load `content` into a cheerio object


$('div table tbody tr').each(function(f, e) {
    row_locations.push($(e).find('td').first().text());  //find each location row and put in a list/array
});

for (var j = 0; j < row_locations.length; j++){  //parse each row
    lines = row_locations[j].split('\n')[4].split(',').length; //number of lines for address
    switch(lines) {    // to parse out full address in future for maps
        case 0: break; // no lines to parse
        case 1:        // one line to parse for address if want zipcode in future for maps
            row_address = row_locations[j].split('\n')[3].split(',')[0].trim();
            if (row_address.includes("."))
                console.log( row_address.split('.')[0].trim());
            else if (row_address.includes("-"))
                console.log( row_address.split('-')[0].trim());
            else
                console.log(row_address);
            break;
        case 2:         // two lines to parse for address if want zipcode in future for maps
            console.log( row_locations[j].split('\n')[3].split(',')[0].trim()); // + " " + row[j].split('\n')[3].split(',')[1].trim());
            break;
        default:        // more than two lines to parse for address if want zipcode in future for maps (the m06.txt file has max 3 lines)
            console.log(  row_locations[j].split('\n')[3].split(',')[0].trim()); //+ " " + row_locations[j].split('\n')[4].split(',')[0].trim() + " " + row_locations[j].split('\n')[4].split(',')[1].trim());
    } 
}
