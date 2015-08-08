'use strict';
/**
 * @ngdoc overview
 * @name webSiteApp
 * @description
 * # webSiteApp
 *
 * Main module of the application.
 */
angular
  .module('webSiteApp', [
    'oc.lazyLoad',
    'ui.router',
    'ui.bootstrap',
    'angular-loading-bar',
    'restangular',
    'ngSanitize',
    'ui.select',
    'ngTable',
    'xtForm',
    'angular-jwt',
    'LocalStorageModule'
  ])
  .config([
      '$stateProvider',
      '$urlRouterProvider',
      '$ocLazyLoadProvider',
      '$httpProvider',
      'RestangularProvider',
      'xtFormConfigProvider',
      'jwtInterceptorProvider',
      function ($stateProvider,$urlRouterProvider,$ocLazyLoadProvider,
        $httpProvider, RestangularProvider, xtFormConfigProvider, jwtInterceptorProvider) {
      // jwt 配置，会在每次请求头部加上令牌
      jwtInterceptorProvider.tokenGetter = ['Storage', function(Storage) {
        return Storage.getToken();
      }];
      $httpProvider.interceptors.push('jwtInterceptor');

      // 全局配置
      xtFormConfigProvider.setErrorMessages({
        required: '该选项不能为空',
        maxlength: '该选项输入值长度不能大于{{ngMaxlength}}',
        minlength: '该选项输入值长度不能小于{{ngMinlength}}',
        email: '输入邮件的格式不正确',
        pattern: '该选项输入格式不正确',
        number: '必须输入数字',
        url: '输入URL格式不正确',
        max: '该选项输入值不能大于{{max}}',
        min: '该选项输入值不能小于{{min}}',
        date: '输入日期的格式不正确',
        datetimelocal: '输入日期的格式不正确',
        time: '输入时间的格式不正确',
        week: '输入周的格式不正确',
        month: '输入月的格式不正确',
        $$server: '(⊙o⊙)哦，遇到错误了',
        match: '两次输入的密码不匹配'
      });
      // 给所有后端 API 请求设置 baseUrl
      RestangularProvider.setBaseUrl('http://localhost:8080/jee-restful-web');
      RestangularProvider.setDefaultHeaders({
        'Content-Type' : 'application/json',
        'Accept' : 'application/hal+json'
      });
      RestangularProvider.setRestangularFields({
        selfLink : '_links.self.href'
      });
      RestangularProvider.setOnElemRestangularized(function(elem, isCollection, what, Restangular) {
        for ( var rel in elem._links) {
          if (rel !== 'curies') {
            var index = rel.indexOf(':');
            var name = rel.substring(index + 1);
            elem.addRestangularMethod(name, 'getList', elem._links[rel].href);
          }
        }
        if (isCollection) {
          // adding addRestangularMethod in setOnElemRestangularized is same as adding the following snippet in all services module :
          // see https://github.com/mgonto/restangular/issues/719
          // add custom method to remove all selected users
          // service.remove = function(elem) {
          //   Restangular.all('users').customOperation('remove', '', null, null, elem);
          // }
          // signature is (name, operation, path, params, headers, elementToPost)
          elem.addRestangularMethod('removeSelected', 'remove', '', null, null, elem);
        }
        return elem;
      });
      RestangularProvider.addResponseInterceptor(function(data, operation,
          what, url, response, deferred) {
        var returnData;
        if (_.has(data, '_embedded')) {
          returnData = _.values(data._embedded)[0];
          returnData.links = data._links;
          returnData.page = data.page;
          return returnData;
        }
        return data;
      });
      RestangularProvider.setDefaultHttpFields({withCredentials: true});

      $ocLazyLoadProvider.config({
        debug:false,
        events:true
      });

      $urlRouterProvider.otherwise('/dashboard/home');

      $stateProvider
        .state('dashboard', {
          controller: 'NavCtrl',
          url:'/dashboard',
          templateUrl: 'views/dashboard/main.html',
          resolve: {
            loadMyDirectives:['$ocLazyLoad',function($ocLazyLoad){
              return $ocLazyLoad.load(
                {
                  name:'webSiteApp',
                  files:[
                  'scripts/directives/header/resize.js',
                  'scripts/directives/header/header.js',
                  'scripts/directives/header/header-notification/header-notification.js',
                  'scripts/directives/sidebar/sidemenu.js',
                  'scripts/directives/sidebar/sidebar.js',
                  'scripts/directives/sidebar/sidebar-search/sidebar-search.js'
                  ]
                });
          }]
        }
      }).state('dashboard.home',{
          url:'/home',
          controller: 'MainCtrl',
          templateUrl:'views/dashboard/home.html',
          resolve: {
            loadMyFiles:['$ocLazyLoad',function($ocLazyLoad){
              return $ocLazyLoad.load({
                name:'webSiteApp',
                files:[
                'scripts/controllers/main.js',
                'scripts/directives/notifications/notifications.js',
                'scripts/directives/forms/forms.js',
                'scripts/directives/dashboard/stats/stats.js'
                ]
              });
            }]
          }
      }).state('login',{
          templateUrl:'views/pages/login.html',
          url:'/login',
          controller : 'LoginCtrl'
      }).state('dashboard.sys', {
          abstract: true,
          url: '/sys',
          template: '<ui-view/>'
      }).state('dashboard.sys.users', {
          abstract: true,
          url: '/users',
          template: '<ui-view/>',
          resolve : {
            rolesRes : ['Roles', function(Roles) {
              return Roles.getList();
            }],
            orgsRes :['Organizations', function(Organizations) {
              return Organizations.getList();
            }]
          }
      }).state('dashboard.sys.users.list', {
          url : '/list',
          templateUrl : 'views/sys/users/list.html',
          controller : 'UserListCtrl'
      }).state('dashboard.sys.users.detail', {
          url : '/update/:id',
          templateUrl : 'views/sys/users/edit.html',
          controller : 'UserDetailCtrl',
          resolve : {
            usersRes : ['Users', '$stateParams', function(Users, $stateParams) {
              return Users.one($stateParams.id).get();
            }]
          }
      }).state('dashboard.sys.users.create', {
          url : '/create',
          templateUrl : 'views/sys/users/edit.html',
          controller : 'UserCreationCtrl'
      }).state('dashboard.sys.roles', {
          abstract: true,
          url: '/roles',
          template: '<ui-view/>'
      }).state('dashboard.sys.roles.list', {
          url : '/list',
          templateUrl : 'views/sys/roles/list.html',
      }).state('dashboard.sys.orgs', {
          abstract: true,
          url: '/orgs',
          template: '<ui-view/>'
      }).state('dashboard.sys.orgs.list', {
          url : '/list',
          templateUrl : 'views/sys/orgs/list.html',
      }).state('dashboard.sys.menus', {
          abstract: true,
          url: '/menus',
          template: '<ui-view/>'
      }).state('dashboard.sys.menus.list', {
          url : '/list',
          templateUrl : 'views/sys/menus/list.html',
      }).state('dashboard.chart',{
          templateUrl:'views/chart.html',
          url:'/chart',
          controller:'ChartCtrl',
          resolve: {
            loadMyFile:['$ocLazyLoad',function($ocLazyLoad){
              return $ocLazyLoad.load([{
                name:'chart.js',
                files:[
                  'bower_components/angular-chart.js/dist/angular-chart.js',
                  'bower_components/angular-chart.js/dist/angular-chart.css'
                ]
              },
              {
                  name:'webSiteApp',
                  files:['scripts/controllers/chartContoller.js']
              }]);
            }]
          }
      });

  }])
  .run([
    '$window',
    '$rootScope',
    '$state',
    'Restangular',
    'jwtHelper',
    'Storage',
    function($window, $rootScope, $state, Restangular, jwtHelper, Storage) {
      //http://stackoverflow.com/questions/21445886/angularjs-change-url-in-module-config
      Restangular.setErrorInterceptor(function(response, deferred,
          responseHandler) {
        if (response.status === 401 || response.status === 403) {
          console.log('Login required... ');
          Storage.clear();
          $state.go('login');
        } else if (response.status === 404) {
          console.log('Resource not available...');
        } else {
          console.log('Response received with HTTP error code: ' + response.status);
        }
        return false; // stop the promise chain
      });
      $rootScope.$on('$stateChangeStart', function(e, to) {
        if (to.name !== 'login' && !Storage.isLoggedIn()) {
          e.preventDefault();
          $state.go('login');
        }
        //如果已经登录访问login时，跳转到home
        if (to.name === 'login' && Storage.isLoggedIn()) {
          e.preventDefault();
          $state.go('dashboard.home');
        }
      });

      //主要是在侧边栏使用 用来根据当前状态，设置菜单的激活状态
      $rootScope.$state = $state;
    } ]);
