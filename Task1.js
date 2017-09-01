var request = require('request');
var fs = require('fs');

function GetMyResourceData(i){
    request('http://visualizedata.github.io/datastructures/data/m'+ i +'.html ', function (error, response, body) {
    if (!error && response.statusCode == 200) { 
       //console.log(i);
       //console.log('/home/ubuntu/workspace/data/m0' +i +'.txt');
       //fs.writeFileSync('/home/ubuntu/workspace/data/m' + i + '.txt', '/home/ubuntu/workspace/data/m' + i + '.txt' + body);
       fs.writeFileSync('/home/ubuntu/workspace/data/m' + i + '.txt', body);
    }
    else {console.error('request failed')}
    });
}

var async_function = function(val, callback){
  var i = 1;
  for (; i < 10; i++) { 
    GetMyResourceData('0' + i)
  }
  GetMyResourceData(10);
};

async_function(42, function(val) {
  //console.log(val)
});
//console.log(43);




