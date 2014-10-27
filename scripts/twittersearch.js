var fs = require('fs');
var twitterauth = JSON.parse(fs.readFileSync('./twitterauth.json'));
var Twit = require('twit');
var T = new Twit({
	consumer_key:         twitterauth.consumerKey,
	consumer_secret:      twitterauth.consumerSecret,
	access_token:         twitterauth.access,
	access_token_secret:  twitterauth.secret
});
var helpers = require('./helpers.js');


var startTime = new Date();
var tweetCount = 0;
var userFile;
var metaFile;
var tweetFile;
var first = true;
var socket;
var currentSearch;


/*
	currentNotificationData
	---------------------------------
	outputs all vars for search status
*/
var currentNotificationData = function() {
	var timeElapsed = new Date() - startTime;
	timeElapsed = Math.round(timeElapsed/1000);
	var hours 	= Math.floor(timeElapsed / (60*60));
	var minutes = Math.floor((timeElapsed - (hours * 60)) / 60);
	var seconds = timeElapsed - ( Math.floor(hours * 60 * 60) + Math.floor(minutes * 60) );
	
	hours 	= helpers.prefix0(hours);
	minutes = helpers.prefix0(minutes);
	seconds = helpers.prefix0(seconds);

	var returnobj = {
		time  : hours+":"+minutes+":"+seconds,
		count : tweetCount
	}

	return returnobj;
}

exports.init = function(searchTerm, s, endOfLifeCallback) {
	socket = s;

	startTime = new Date();
	var Y = startTime.getFullYear();
	var M = helpers.prefix0(startTime.getMonth()+1);
	var D = helpers.prefix0(startTime.getDate());
	var h = helpers.prefix0(startTime.getHours());
	var m = helpers.prefix0(startTime.getMinutes());
	var s = helpers.prefix0(startTime.getSeconds());

	var path = "./minecart/";
	userFile =  Y+"-"+M+"-"+D+"-"+h+"-"+m+"-"+s+"-users.json";
	tweetFile =  Y+"-"+M+"-"+D+"-"+h+"-"+m+"-"+s+"-tweets.json";
	metaFile =  Y+"-"+M+"-"+D+"-"+h+"-"+m+"-"+s+"-meta.json";


	userFile = fs.openSync(path+userFile, 'a');
	tweetFile = fs.openSync(path+tweetFile, 'a');
	var initString = "[\n";
	fs.writeSync(userFile,initString);
	fs.writeSync(tweetFile,initString);


	//meta init
	var metaInit = {
		'query' : searchTerm
	};
	fs.writeFileSync(path+metaFile,JSON.stringify(metaInit));

	currentSearch = T.stream('statuses/filter', { track: searchTerm});
	currentSearch.on('tweet', function (tweet) {
		tweetCount++;
		parseData(tweet);
		updateMessage();
	});
	currentSearch.on('error', function(msg) {
		console.log(msg);
	});

	setInterval( function() {
		updateMessage();
	},1000);
}





exports.end = function() {
	currentSearch.stop();
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
	socket.emit('twittersearch/status', currentNotificationData());
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
		if(first){
			var separator = "\n";
			first = false;
		}else{
			var separator = ",\n";
		}
		fs.writeSync(tweetFile,separator+JSON.stringify(datum));
		fs.writeSync(userFile, separator+JSON.stringify(user));
	}
}