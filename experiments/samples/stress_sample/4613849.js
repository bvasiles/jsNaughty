/**
 * Created with JetBrains WebStorm.
 * User: reznichenko
 *
 */

require('./controllers/article.table.js');
require('./directives/edit.js');

angular
    .module('ArticlesApp', ['ngRoute', 'ArticlesApp.controllers', 'App.directives'])
    .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
        $locationProvider
            .html5Mode(true)
            .hashPrefix('!');

        $routeProvider
            .when('/articles', { templateUrl: 'templates/articles.html', controller: 'ArticleTable' })
            .otherwise({ redirectTo: '/articles' });
    }]);