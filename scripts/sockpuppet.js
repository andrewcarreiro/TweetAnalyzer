var fs = require('fs');

var rl;
var cb;
var uniqueUsers = [];

					   
exports.init = function( socket, dataset ){
	var data = JSON.parse(fs.readFileSync('./minecart/'+dataset.filename+'-users.json'));

	//populate uniqueUsers with exclusively uniques
	for (var i=0; i<data.length; i++) {
		if( eval_unique(data[i]) ){
			uniqueUsers.push(data[i]);
		}
	}

	//parse out date of creation
	var days = {
		"seven" : 0,
		"fifteen" : 0,
		"thirty" : 0,
		"sixty" : 0,
		"greater" : 0
	}
	var now = new Date();
	for ( var i=0; i<uniqueUsers.length; i++ ) {
		var d = new Date(uniqueUsers[i].created_at);
		var difference = now.valueOf() - d.valueOf();
		var daysSinceCreation = difference / (1000*60*60*24);

		if(daysSinceCreation > 60) {
			days.greater ++;
		} else if(daysSinceCreation > 30) {
			days.sixty ++;
		} else if(daysSinceCreation > 15) {
			days.thirty ++;
		} else if(daysSinceCreation > 7) {
			days.fifteen ++;
		} else {
			days.seven ++;
		}
	}

	socket.emit('report', {
		type : 'sockpuppet',
		data : days
	});

}


function eval_unique(passedData) {
	for (var j=0; j<uniqueUsers.length; j++){
		if (passedData.id == uniqueUsers[j].id) {
			//duplicate
			return false;
		}
	}
	return true;
}