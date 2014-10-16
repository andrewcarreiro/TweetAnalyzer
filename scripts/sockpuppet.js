var fs = require('fs');

var rl;
var cb;
var uniqueUsers = [];


exports.init = function(questionInterface, endOfLifeCallback) {
	rl = questionInterface;
	cb = endOfLifeCallback;

	var data = JSON.parse(fs.readFileSync('./minecart/a/2014-10-15-01-10-12-users.json'));

	var outputString = "";

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

	outputString+="=========   sockpuppet report    ===========\n";
	outputString+="\n";
	outputString+="TWEET OVERVIEW\n";
	outputString+="------------------\n";
	outputString+="Total tweets sampled:           "+data.length+"\n";
	outputString+="Unique participants:            "+uniqueUsers.length+"\n";
	outputString+="Average Tweets per participant: "+data.length/uniqueUsers.length+"\n";
	outputString+="\n";
	outputString+="DATE OF CREATION\n";
	outputString+="------------------\n";
	outputString+="Number of accounts created in the past n days:\n";
	outputString+="Seven         "+days.seven+" ("+(days.seven/uniqueUsers.length * 100).toFixed(2)+"%)\n";
	outputString+="Fifteen       "+days.fifteen+" ("+(days.fifteen/uniqueUsers.length * 100).toFixed(2)+"%)\n";
	outputString+="Thirty        "+days.thirty+" ("+(days.thirty/uniqueUsers.length * 100).toFixed(2)+"%)\n";
	outputString+="Sixty         "+days.sixty+" ("+(days.sixty/uniqueUsers.length * 100).toFixed(2)+"%)\n";
	outputString+="Older account "+days.greater+" ("+(days.greater/uniqueUsers.length * 100).toFixed(2)+"%)\n";
	outputString+="\n";
	outputString+="=======   end sockpuppet report    ==========\n";


	console.log(outputString);

	endOfLifeCallback();
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