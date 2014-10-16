var readline = require('readline');
var helpers = require('./scripts/helpers.js');
var twittersearch = require('./scripts/twittersearch.js');
var sockpuppet = require('./scripts/sockpuppet.js');
var fs = require('fs');
var ansidown = require('ansidown');



var rl = readline.createInterface({
	input  : process.stdin,
	output : process.stdout
});

var command = process.argv.length > 2 ? process.argv[2].toLowerCase() : '';
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
	default:
		show_help();
}


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