'use strict';

/**
 * @ngdoc directive
 * @name izzyposWebApp.directive:adminPosHeader
 * @description
 * # adminPosHeader
 */

angular.module('webSiteApp')
  .directive('sidebarSearch',function() {
    return {
      templateUrl:'scripts/directives/sidebar/sidebar-search/sidebar-search.html',
      restrict: 'E',
      replace: true,
      scope: {
      },
      controller:['$scope', function($scope){
        $scope.selectedMenu = 'home';
      }]
    };
  });
