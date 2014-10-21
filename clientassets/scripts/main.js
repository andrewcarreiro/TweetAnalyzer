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
		socketComm.forward('twittersearch/status',$scope);

		$scope.datasets = [];


		$scope.$on('socket:filemanager/get', function (ev,data) {
			console.log(data);
			$scope.datasets = data.fileList;
		});

		$scope.status = {
			count : 0,
			time  : "00:00:00"
		};
		$scope.$on('socket:twittersearch/status', function (ev,data) {
			$scope.status.count	= data.count;
			$scope.status.time	= data.time;
		});

		//add a new dataset
		$scope.dataset_watching = false;
		$scope.startDataCollection = function() {
			$scope.dataset_watching = true;
			socketComm.emit('twittersearch/start', {'term' : $scope.dataset_to_add});
		}

		//stop dataset collection
		$scope.stopDataCollection = function() {
			$scope.dataset_watching = false;
			socketComm.emit('twittersearch/stop', {});
		}

	});
