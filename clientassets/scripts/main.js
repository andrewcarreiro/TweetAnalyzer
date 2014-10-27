var socket = io.connect('http://localhost');


angular.module('tweetanalyzer', [
		'btford.socket-io'
	])
	.factory('socketComm', function (socketFactory) {
		return socketFactory();
	})
	.controller('DatasetsController', function ($scope, socketComm) {
		socketComm.forward('filemanager/get',$scope);
		socketComm.forward('twittersearch/status',$scope);
		socketComm.forward('report',$scope);

		$scope.datasets = [];


		$scope.$on('socket:filemanager/get', function (ev,data) {
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

		//run report
		$scope.runReport = function(dataset,report) {
			socketComm.emit('report', {
				"dataset" : dataset,
				"report"  : report
			});
		}

		//managing reports
		$scope.$on('socket:report', function(ev,data){
			console.log(data);
		});

	});
