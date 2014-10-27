var fs = require ('fs');

exports.list = function(socket) {
	var files = fs.readdirSync('minecart');
	var onlyJSON = [];
	files.forEach( function(el) {
		if ( (el.indexOf('-tweets') >= 0)  && (el.indexOf('.json') == el.length - 5)) {
			var filename = el.substring(0,el.length-12);
			var date = filenameToDate(filename);
			var searchquery = fs.readFileSync('minecart/'+filename+'-meta.json');
			var tweets = JSON.parse(fs.readFileSync('minecart/'+filename+'-tweets.json'));
			
			searchquery = JSON.parse(searchquery);
			onlyJSON.push({
				'query'    : searchquery.query,
				'filename' : filename,
				'label'    : date.toDateString()+" "+date.toTimeString().split(" ")[0],
				'length'   : tweets.length
			});
		}
	});

	var sortedByTerms = {};
	onlyJSON.forEach( function(el){
		if(! sortedByTerms.hasOwnProperty(el.query)){
			sortedByTerms[el.query] = [];
		}
		sortedByTerms[el.query].push(el);
	});

	socket.emit('filemanager/get', {
		'fileList' : sortedByTerms
	});
}

function filenameToDate(filename) {
	var a = filename.split("-");
	return new Date(a[0], a[1], a[2], a[3], a[4], a[5]);
}