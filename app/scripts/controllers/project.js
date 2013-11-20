'use strict';

angular.module('bmlayersApp')
  .controller('ProjectCtrl', ['$scope', '$location', 'angularFire', function ($scope, $location, angularFire) {
    
    var ref = new Firebase('https://bm.firebaseio.com/projects');
    angularFire(ref, $scope, 'projects');
    $scope.projects = {};
    $scope.getProjects = function(){
      return Object.keys($scope.projects).sort();
    };

    $scope.newProject = function(){
      $location.path( '/evolution/' + $scope.newProjectId );
      $scope.newProjectId = '';
    };
  }]);
