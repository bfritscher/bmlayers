'use strict';
angular.module('LocalStorageModule').value('prefix', 'bmlayers');
angular.module('bmlayersApp',
  ['ui.bootstrap', 'LocalStorageModule', 'ngRoute', 'firebase', 'uuid4','omr.angularFileDnD'])
.config(function ($routeProvider) {
  $routeProvider
  .when('/main', {
    templateUrl: 'views/main.html',
    controller: 'MainCtrl'
  })
  .when('/rules', {
    templateUrl: 'views/rules.html',
    controller: 'MainCtrl'
  })
  .when('/evolution', {
    templateUrl: 'views/project.html',
    controller: 'ProjectCtrl'
  })
  .when('/evolution/:projectid', {
    templateUrl: 'views/evolution.html',
    controller: 'EvolutionCtrl'
  })
  .otherwise({
    redirectTo: '/evolution'
  });
});

function hexToRgba(hex, a) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return 'rgba(' + parseInt(result[1], 16) + ',' + parseInt(result[2], 16) + ',' + parseInt(result[3], 16) + ', ' + a +')';
}