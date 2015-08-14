"use strict";

angular.module("myApp.todoList", ["ngRoute"])

    .config(["$routeProvider", function ($routeProvider) {
        $routeProvider.when("/todoList", {
            templateUrl: "/todoList/todoList.html",
            controller: "todoListCtrl"
        });
    }])

    .controller("todoListCtrl", ["$scope", "$http", function ($scope, $http) {
        $scope.todos = [];
        $scope.newTodo = "";
        $scope.filterFunction = function () { return true; };

        $scope.getTodoList = function () {
            $scope.completeCount = 0;
            $scope.incompleteCount = 0;

            $http.get("/api/todo").then(function (response) {
                $scope.todos = response.data;
                $scope.todos = $scope.todos.filter($scope.filterFunction);

                $scope.todos.forEach(function(todo) {
                    if (todo.isComplete === true) {
                        $scope.completeCount++;
                    }
                    else {
                        $scope.incompleteCount++;
                    }
                });

            }, function (response) {
                $scope.errorText = "Failed to get list. Server returned " +
                    response.status + " - " + response.statusText;
            });
        };

        $scope.createTodo = function () {
            $http.post("/api/todo", {
                "title": $scope.newTodo
            }).then(function (response) {
                $scope.newTodo = "";
                $scope.getTodoList();
            }, function (response) {
                $scope.errorText = "Failed to create item. Server returned " + response.status +
                " - " + response.statusText;
            });
        };

        $scope.deleteTodo = function (todo) {
            $http.delete("/api/todo/" + todo.id).then(function (response) {
                $scope.getTodoList();
            }, function (response) {
                $scope.errorText = "Failed to delete todo list item with ID " +
                todo.id + ". Server returned " + response.status + " - " + response.statusText;
            });
        };

        $scope.completeTodo = function (todo) {
            $http.put("/api/todo/" + todo.id).then(function (response) {
                $scope.getTodoList();
            }, function (response) {
                $scope.errorText = "Failed to complete todo list item with ID " +
                todo.id + ". Reason: " + response.status + " - " + response.responseText;
            });
        };

        $scope.deleteComplete = function () {
            $http.delete("/api/todo").then(function (response) {
                $scope.getTodoList();
            }, function (response) {
                $scope.errorText = "Failed to delete completed todo list items. Reason: " +
                this.status + " - " + this.responseText;
            });
        };

        $scope.applyFilter = function (filter) {
            if (filter === "complete") {
                $scope.filterFunction = function (todo) { return todo.isComplete; };
            }
            else if (filter === "incomplete") {
                $scope.filterFunction = function (todo) { return todo.isComplete === false; };
            }
            else {
                $scope.filterFunction = function () { return true; };
            }
            $scope.getTodoList();
        };

        $scope.getTodoList();
    }]);
