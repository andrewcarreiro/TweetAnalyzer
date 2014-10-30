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
		"seven" : {
			count   : 0,
			percent : 0
		},
		"fifteen" : {
			count   : 0,
			percent : 0
		},
		"thirty" : {
			count   : 0,
			percent : 0
		},
		"sixty" : {
			count   : 0,
			percent : 0
		},
		"greater" : {
			count   : 0,
			percent : 0
		}
	}
	var now = new Date();
	for ( var i=0; i<uniqueUsers.length; i++ ) {
		var d = new Date(uniqueUsers[i].created_at);
		var difference = now.valueOf() - d.valueOf();
		var daysSinceCreation = difference / (1000*60*60*24);

		if(daysSinceCreation > 60) {
			days.greater.count ++;
		} else if(daysSinceCreation > 30) {
			days.sixty.count ++;
		} else if(daysSinceCreation > 15) {
			days.thirty.count ++;
		} else if(daysSinceCreation > 7) {
			days.fifteen.count ++;
		} else {
			days.seven.count ++;
		}
	}

	for(key in days) {
		days[key].percent = Math.round(days[key].count / uniqueUsers.length * 100);
	}

	var chartFormattedData = {
		series : ["Age of Accounts"],
		data   : [
			{ 
				x       : "seven", 
				y       : [days.seven.count],
				tooltip : "seven ("+days.seven.percent+"%)"
			},
			{ 
				x       : "fifteen", 
				y       : [days.fifteen.count],
				tooltip : "fifteen ("+days.fifteen.percent+"%)"
			},
			{ 
				x       : "thirty", 
				y       : [days.thirty.count],
				tooltip : "thirty ("+days.thirty.percent+"%)"
			},
			{ 
				x       : "sixty", 
				y       : [days.sixty.count],
				tooltip : "sixty ("+days.sixty.percent+"%)"
			},
			{ 
				x       : "greater", 
				y       : [days.greater.count],
				tooltip : "greater ("+days.greater.percent+"%)"
			}
  		]
	}

	socket.emit('report', {
		type : 'sockpuppet',
		data : days,
		chart : chartFormattedData
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