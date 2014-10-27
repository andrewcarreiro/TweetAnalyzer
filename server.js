var  readline = require('readline')
	,helpers = require('./scripts/helpers.js')
	,twittersearch = require('./scripts/twittersearch.js')
	,sockpuppet = require('./scripts/sockpuppet.js')
	,wordcount = require('./scripts/wordcount.js')
	,filemanager = require('./scripts/filemanager.js')
	,fs = require('fs')
	,ansidown = require('ansidown')
	,open = require('open')
	,express = require('express')
	,app = express();


/*
	routing
	---------------------------------
*/
app.get('/', function(req,res) {
	res.render('index');
});

app.use('/assets', express.static(__dirname+"/.public"));
app.set('view engine','ejs');


var server = app.listen(3000, function() {
	//open("http://"+server.address().address+":"+server.address().port);
	console.log('server running');
});


var io = require('socket.io')(server);


io.sockets.on('connection', function(socket) {
	//socket.emit('someEvent', { hello: 'world' });
	filemanager.list(socket);
	
	//socket.on('fromclient', function (data) {
	//	var toSend;
	//	console.log('fromclient');
	//	switch(data.request) {
	//		case 'get/files':
	//			console.log('get/files');
	//			filemanager.list(socket);
	//			break;
	//	}
	//});

	socket.on('twittersearch/start', function(data) {
		twittersearch.init ( 
			data.term, //term to search for
			socket,
			function (code) { //end of life actions
				console.log('eol');
				console.log(code);
				//if(!code) { code = 0; }
				//rl.close();
				//process.exit(code);
			}
		);
	});

	socket.on('twittersearch/stop', function(data) {
		twittersearch.end();
		filemanager.list(socket);
	});

	socket.on('report', function(data) {
		switch(data.report) {
			case 'sockpuppet' : 
				sockpuppet.init(socket,data.dataset);
				break;
		}
	});


});



//var rl = readline.createInterface({
//	input  : process.stdin,
//	output : process.stdout
//});

/*var command = process.argv.length > 2 ? process.argv[2].toLowerCase() : '';
switch (command) {
	case "":
		show_help();
		break;

	case "help":
		show_help();
		break;

	case "search":
		search_twitter();
		break;

	case "sockpuppet":
		sockpuppet.init(
			rl,
			function() {
				process.exit();
			}
		);
	case "wordcount":
		wordcount.init(
			rl,
			function() {
				process.exit();
			}
		);
	default:
		show_help();
}*/


function search_twitter () {
	var searchTerm;
	rl.question("Please enter a search term: ", function(ans) {
		searchTerm = ans;
		
		process.stdout.moveCursor(0,1);
		rl.question("", function(ans) { 
			rl.close();
			twittersearch.eol();
			process.exit(1);
		});
		process.stdout.moveCursor(0,1);
		
		twittersearch.init ( 
			searchTerm, //term to search for
			function (code) { //end of life actions
				if(!code) { code = 0; }
				rl.close();
				process.exit(code);
			}
		);
	});
};


function show_help () {
	var parsed = new ansidown(String(fs.readFileSync('./readme.md')))
	console.log(parsed.toString());
	process.exit();
}