var fs = require('fs');
var twitterAPI = require('node-twitter-api');
var twitterauth = JSON.parse(fs.readFileSync('./twitterauth.json'));
var helpers = require('./helpers.js');


var notificationMessage = 'Now scanning for tweets containing "{{TOPIC}}". Press enter to end.\n============================================\nResults\n============================================\nTweets found: {{FOUND}}\nTime Elapsed: {{TIME}}';
var startTime = new Date();
var tweetCount = 0;
var userFile;
var tweetFile;
var first = true;


/*
	exports.currentNotificationText
	---------------------------------
	Need it to be externally accesible. This replaces elements in notificationMessage for printing both here and in the main app's question
*/
var currentNotificationText = function() {
	var q = notificationMessage.replace("{{FOUND}}",tweetCount);
	var timeElapsed = new Date() - startTime;
	timeElapsed = Math.round(timeElapsed/1000);
	var hours 	= Math.floor(timeElapsed / (60*60));
	var minutes = Math.floor((timeElapsed - (hours * 60)) / 60);
	var seconds = timeElapsed - ( Math.floor(hours * 60 * 60) + Math.floor(minutes * 60) );
	
	hours 	= helpers.prefix0(hours);
	minutes = helpers.prefix0(minutes);
	seconds = helpers.prefix0(seconds);

	q = q.replace("{{TIME}}",hours+":"+minutes+":"+seconds);
	return q;
}

exports.init = function(searchTerm, endOfLifeCallback) {
	
	var twitter = new twitterAPI(twitterauth.app);
	var token = twitterauth.token;

	startTime = new Date();
	var Y = startTime.getFullYear();
	var M = helpers.prefix0(startTime.getMonth());
	var D = helpers.prefix0(startTime.getDate());
	var h = helpers.prefix0(startTime.getHours());
	var m = helpers.prefix0(startTime.getMinutes());
	var s = helpers.prefix0(startTime.getSeconds());

	var path = "./minecart/";
	userFile =  Y+"-"+M+"-"+D+"-"+h+"-"+m+"-"+s+"-users.json";
	tweetFile =  Y+"-"+M+"-"+D+"-"+h+"-"+m+"-"+s+"-tweets.json";

	notificationMessage = notificationMessage.replace("{{TOPIC}}",searchTerm);


	userFile = fs.openSync(path+userFile, 'a');
	tweetFile = fs.openSync(path+tweetFile, 'a');
	var initString = "[\n";
	fs.writeSync(userFile,initString);
	fs.writeSync(tweetFile,initString);


	twitter.getStream(
		"filter", 
		{
			"track"	: searchTerm
		},
	  	token.access,
	  	token.secret,
		function(error, data, response) { //on data
			if (error) {
				console.error(error);
				exports.eol();
				endOfLifeCallback(1);
			} else {
				//console.log(data);
				tweetCount++;
				parseData(data);
				updateMessage();
			}
		},
		function(error) { //on error complete
			console.error('On complete');
			console.error(error);
			exports.eol();
			endOfLifeCallback(1);
		}
	);

	setInterval( function() {
		updateMessage();
	},1000);
}



/*
	eol
	---------------------------------
	End of life functions to finish up the JSON files.
*/
exports.eol = function() {
	var endstring = "]";
	fs.writeSync(userFile,endstring);
	fs.writeSync(tweetFile,endstring);
}


/*
	updateMessage
	---------------------------------
	Function to spit out the current status of the search
*/
var updateMessage = function() {
	process.stdout.moveCursor(-999999,0);
	if (first) { 
		first = false;
	} else {
		for(var i=0; i<5; i++){
			process.stdout.clearLine();
			process.stdout.moveCursor(0,-1);
		}
		process.stdout.clearLine();
	}
	
	
	process.stdout.write(currentNotificationText());
}



/*
	parseData
	---------------------------------
	Parse an array of results from Twitter API
*/
var parseData = function(data){
	if(data.length){
		for (var i=0; i<data.length; i++) {
			parseDatum(data[i]);
		}
	}else{
		parseDatum(data);
	}
}



/*
	parseDatum
	---------------------------------
	Record a single tweet
*/
var parseDatum = function (datum) {
	var user = datum.user;
	if(user.hasOwnProperty('id')){
		datum.user = user.id;
		fs.writeSync(tweetFile,JSON.stringify(datum)+",\n");
		fs.writeSync(userFile,JSON.stringify(user)+",\n");
	}
}