var socket = io.connect('http://localhost');
/*
socket.on('fromserver', function (data) {
	if (!data.destination) {
		console.log(data);
		return;
	}
	switch( data.destination ){
		case 'filemanager':
			if( data.fileList ) {
				fileManager.load(data.fileList);
			}
			break;
	}
});


socket.emit( 'fromclient', { 'request' : 'get/files' });


var fileManager = {
	$div : $('#data_collected').children('div'),
	load : function(data) { 
		var content = "<table class='table'>";
		data.forEach(function (item) {
			content += "<li>"+item+"</li>";
		});
		content += "</ul>";
		this.$div.html(content);
	}
}*/

angular.module('tweetanalyzer', [
		'btford.socket-io'
	])
	.factory('socketComm', function (socketFactory) {
		return socketFactory();
	})
	.controller('DatasetsController', function ($scope, socketComm) {
		socketComm.forward('filemanager/get',$scope);

		$scope.datasets = [];
		
		$scope.$on('socket:filemanager/get', function (ev,data) {
			console.log(data);
			$scope.datasets = data.fileList;
		});
	});
