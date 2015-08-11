var testing = require("selenium-webdriver/testing");
var assert = require("chai").assert;
var helpers = require("./e2eHelpers");
var expect = require("chai").expect;

testing.describe("end to end", function() {
    this.timeout(20000);
    testing.before(helpers.setupDriver);
    testing.beforeEach(helpers.setupServer);
    testing.afterEach(helpers.teardownServer);
    testing.after(function() {
        helpers.teardownDriver();
        helpers.reportCoverage();
    });

    testing.describe("on page load", function() {
        testing.it("displays TODO title", function() {
            helpers.navigateToSite();
            helpers.getTitleText().then(function(text) {
                assert.equal(text, "TODO List");
            });
        });
        testing.it("displays empty TODO list", function() {
            helpers.navigateToSite();
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 0);
            });
        });
        testing.it("displays an error if the request fails", function() {
            helpers.setupErrorRoute("get", "/api/todo");
            helpers.navigateToSite();
            helpers.getErrorText().then(function(text) {
                assert.equal(text, "Failed to get list. Server returned 500 - Internal Server Error");
            });
        });
    });

    testing.describe("on create todo item", function() {
        testing.it("clears the input field", function() {
            helpers.navigateToSite();
            helpers.addTodo("New todo item");
            helpers.getInputText().then(function(value) {
                assert.equal(value, "");
            });
        });
        testing.it("adds the todo item to the list", function() {
            helpers.navigateToSite();
            helpers.addTodo("New todo item");
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 1);
            });
        });
        testing.it("displays an error if the request fails", function() {
            helpers.setupErrorRoute("post", "/api/todo");
            helpers.navigateToSite();
            helpers.addTodo("New todo item");
            helpers.getErrorText().then(function(text) {
                assert.equal(text, "Failed to create item. Server returned 500 - Internal Server Error");
            });
        });
        testing.it("can be done multiple times", function() {
            helpers.navigateToSite();
            helpers.addTodo("New todo item");
            helpers.addTodo("Another new todo item");
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 2);
            });
        });
    });

    testing.describe("on delete todo item", function() {
        testing.it("removes todo item", function() {
            helpers.navigateToSite();
            helpers.addTodo("New todo item");
            helpers.deleteTodo();
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 0);
            });
        });
        testing.it("can be done multiple times", function() {
            helpers.navigateToSite();
            helpers.addTodo("New todo item");
            helpers.addTodo("Another new todo item");
            helpers.deleteTodo();
            helpers.deleteTodo();
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 0);
            });
        });
    });

    testing.describe("on complete todo item", function() {
        testing.it("does not delete completed todo item", function() {
            helpers.navigateToSite();
            helpers.addTodo("New todo item");
            helpers.completeTodo();
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 1);
            });
        });
        // testing.it("marks a todo item as complete when the completed button is pressed", function() {
        //     helpers.navigateToSite();
        //     helpers.addTodo("New todo item");
        //     helpers.completeTodo();
        //     helpers.getTodoList().then(function(elements) {
        //         console.log(elements);
        //         assert.equal(elements[0].class, "completed");
        //     });
        //     helpers.getCompleted().then(function(elements) {
        //         assert.equal(elements.length, 1);
        //     });
        //});
    });

    testing.describe("correctly counts the incomplete items", function() {
        testing.it("counts multiple incomplete", function() {
            helpers.navigateToSite();
            helpers.addTodo("New todo item");
            helpers.addTodo("New todo item");
            helpers.addTodo("New todo item");
            helpers.addTodo("New todo item");
            helpers.getIncompleteText().then(function(text) {
                assert.equal(text, "Number of incomplete items remaining: 4");
            });
        });
        testing.it("decrements the count with completed", function() {
            helpers.navigateToSite();
            helpers.addTodo("New todo item");
            helpers.addTodo("New todo item");
            helpers.addTodo("New todo item");
            helpers.completeTodo();
            helpers.getIncompleteText().then(function(text) {
                assert.equal(text, "Number of incomplete items remaining: 2");
            });
        });
    });

    testing.describe("testing delete all complete button", function() {
        testing.it("removes whole list when completed", function() {
            helpers.navigateToSite();
            helpers.addTodo("New todo item");
            helpers.addTodo("New todo item");
            helpers.completeTodo();
            helpers.completeTodo();
            helpers.deleteCompleted();
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 0);
            });
        });
        testing.it("removes only the completed items", function() {
            helpers.navigateToSite();
            helpers.addTodo("New todo item");
            helpers.addTodo("New todo item");
            helpers.addTodo("New todo item");
            helpers.completeTodo();
            helpers.deleteCompleted();
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 2);
            });
        });
    });

    testing.describe("testing the filter buttons", function() {
        testing.it("shows the incomplete only when pressed", function() {
            helpers.navigateToSite();
            helpers.addTodo("New todo item");
            helpers.addTodo("New todo item");
            helpers.addTodo("New todo item");
            helpers.completeTodo();
            helpers.filterIncomplete();
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 2);
            });
        });
        testing.it("shows the complete only when pressed", function() {
            helpers.navigateToSite();
            helpers.addTodo("New todo item");
            helpers.addTodo("New todo item");
            helpers.addTodo("New todo item");
            helpers.completeTodo();
            helpers.filterComplete();
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 1);
            });
        });
    });
});
