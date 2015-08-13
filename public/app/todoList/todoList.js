'use strict';

angular.module('myApp.view1', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/todoList', {
            templateUrl: 'todoList/todoList.html',
            controller: 'todoListCtrl'
        });
    }])

    .controller('todoListCtrl', ["$scope", "$http", function ($scope, $http) {
        $scope.todos = [];
        $scope.newTodo = "";

        $scope.getTodoList = function () {
            $http.get("/api/todo").then(function (response) {
                $scope.todos = response.data;
                console.log($scope.todos);
            }, function (response) {
                error.textContent = "Failed to get list. Server returned " +
                    response.status + " - " + response.statusText;
            });
        }

        $scope.createTodo = function () {
            $http.post("/api/todo", {
                "title": $scope.newTodo
            }).then(function (response) {
                $scope.newTodo = "";
                $scope.getTodoList();
            }, function (response) {
                error.textContent = "Failed to create item. Server returned " + response.status +
                " - " + response.statusText;
             })
        }

        $scope.deleteTodo = function (todo) {
            $http.delete("/api/todo/" + todo.id).then(function (response) {
                $scope.getTodoList();
            }, function (response) {
                error.textContent = "Failed to delete todo list item with ID " +
                todo.id + ". Server returned " + response.status + " - " + response.statusText;
            })
        }

        $scope.completeTodo = function (todo) {
            $http.put("/api/todo/" + todo.id).then(function (response) {
                $scope.getTodoList();
            }, function (response) {
                error.textContent = "Failed to complete todo list item with ID " +
                todo.id + ". Reason: " + response.status + " - " + response.responseText;
            })
        }

        $scope.deleteComplete = function () {
            $http.delete("/api/todo").then(function (response) {
                $scope.getTodoList();
            }, function (response) {
                error.textContent = "Failed to delete completed todo list items. Reason: " +
                this.status + " - " + this.responseText;
            })
        }

        $scope.applyFilter = function (filter) {
            var filterFunction;

            if (filter === "complete") {
                filterFunction = function (todo) { return todo.isComplete; };
            }
            else if (filter === "incomplete") {
                filterFunction = function (todo) { return todo.isComplete === false; };
            }
            else {
                filterFunction = function () { return true; };
            }
        }

        $scope.getTodoList();
    }]);