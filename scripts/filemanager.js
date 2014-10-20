var fs = require ('fs');

exports.list = function(socket) {
	var files = fs.readdirSync('minecart');
	var onlyJSON = [];
	files.forEach( function(el) {
		if ( (el.indexOf('-tweets') >= 0)  && (el.indexOf('.json') == el.length - 5)) {
			var filename = el.substring(0,el.length-12);
			var date = filenameToDate(filename);
			onlyJSON.push({
				'filename' : filename,
				'label'    : date.toDateString()
			});
		}
	});
	socket.emit('filemanager/get', {
		'fileList' 	  : onlyJSON
	});
}

function filenameToDate(filename) {
	var a = filename.split("-");
	return new Date(a[0], a[1], a[2], a[3], a[4], a[5]);
}