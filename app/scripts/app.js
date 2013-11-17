'use strict';
angular.module('LocalStorageModule').value('prefix', 'bmlayers');
angular.module('bmlayersApp',
  ['ui.bootstrap', 'LocalStorageModule', 'ngRoute', 'firebase', 'uuid4'])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/rules', {
        templateUrl: 'views/rules.html',
        controller: 'MainCtrl'
      })
      .when('/evolution', {
        templateUrl: 'views/evolution.html',
        controller: 'EvolutionCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
