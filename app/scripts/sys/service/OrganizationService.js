'use strict';

angular.module('webSiteApp')
.factory('Organizations', ['Restangular', function(Restangular) {
  var path = 'organizations';
  var service = Restangular.service(path);
  return service;
}]);
