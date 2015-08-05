'use strict';

angular.module('webSiteApp')
.factory('Roles', ['Restangular', function(Restangular) {
  var path = 'roles';
  var service = Restangular.service(path);
  return service;
}]);
