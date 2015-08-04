'use strict';

//loads the correct sidebar on window load,
//collapses the sidebar on window resize.
// sets the min-height of #page-wrapper to window size
angular.module('webSiteApp')
.directive('resize', ['$window', function($window) {
  return {
    restrict: 'A',
    controller:function($scope){
      var w = angular.element($window);
      $scope.isCollapsed = false;
      $scope.changeState = function() {
        $scope.isCollapsed = !$scope.isCollapsed;
      };
      
      var pageEl = angular.element(document.getElementById('page-wrapper'));
      w.bind('load resize', function() {
        var topOffset = 50;
        var width = ($window.innerWidth > 0) ? $window.innerWidth : screen.width;
        if (width < 768) {
          $scope.isCollapsed = true;
          topOffset = 100; // 2-row-menu
        } else {
          $scope.isCollapsed = false;
        }

        var height = (($window.innerHeight > 0) ? $window.innerHeight : screen.height) - 1;
        height = height - topOffset;
        if (height < 1) height = 1;
        if (height > topOffset) {
          pageEl.css("min-height", (height) + "px");
        }
        // when resize apply isCollapsed change
        $scope.$apply();
      });
    }
  }
}]);
