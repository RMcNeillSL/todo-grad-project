var todoList = document.getElementById("todo-list");
var todoListPlaceholder = document.getElementById("todo-list-placeholder");
var form = document.getElementById("todo-form");
var todoTitle = document.getElementById("new-todo");
var error = document.getElementById("error");
var countLable = document.getElementById("count-label");
var deleteCompleted = document.getElementById("delete-complete");

form.onsubmit = function(event) {
    var title = todoTitle.value;
    createTodo(title, function() {
        reloadTodoList();
    });
    todoTitle.value = "";
    event.preventDefault();
};

function createTodo (title, callback) {     // FETCH
    var createRequest = document.querySelector("createRequest");

    fetch("/api/todo", {
        method: "post",
        headers: {
            "Accept": "application/json",
            "Content-type": "application/json"
        },
        body: JSON.stringify({
            "title": title,
        })
    }).then(function (response) {
        if (response.status === 201) {
            callback();
        } else {
            error.textContent = "Failed to create item. Server returned " + response.status +
            " - " + response.statusText;
        }
    }).catch(function (error) {
        error.textContent = "Failed to create item";
        console.log (error.statusText);
    });
}

function getTodoList (callback) {       // FETCH
    var createRequest = document.querySelector("createRequest");

    fetch("/api/todo", {
        method: "get"}).then(function (response) {
            if (response.status === 200) {
                return (response.json());
            } else {
                error.textContent = "Failed to get list. Server returned " +
                response.status + " - " + response.statusText;
            }
        }).then(function (json) {
            callback (json);
        }).catch(function (error) {
            console.log ("Failed to get list");
        });
}

function deleteTodo (event) {           // FETCH
    var deleteRequest = document.querySelector("deleteRequest");
    var currentID = this.getAttribute("data-id");

    fetch("/api/todo/" + currentID, {
        method: "delete"
    }).then(function (response) {
        if (response.status === 200) {
            reloadTodoList();
        } else {
            error.textContent = "Failed to delete todo list item with ID " +
            currentID + ". Server returned " + response.status + " - " + response.statusText;
        }
    }).catch(function (error) {
        console.log ("Failed to delete item");
    });
}

function deleteComplete (event) {       // FETCH
    var deleteCompleteRequest = document.querySelector("deleteCompleteRequest");

    fetch("/api/todo", {
        method: "delete"
    }).then(function (response) {
        if (response.status === 200) {
            deleteCompleted.style.display = "none";
            reloadTodoList();
        } else {
            error.textContent = "Failed to delete completed todo list items. Reason: " +
            this.status + " - " + this.responseText;
        }
    }).catch(function (error) {
        console.log ("Failed to delete completed items");
    });
}

function completeTodo (event) {
    var completeRequest = document.querySelector("completeRequest");
    var currentID = this.getAttribute("data-id");

    fetch("/api/todo/" + currentID, {
        method: "put"
    }).then(function (response) {
        if (response.status === 200) {
            reloadTodoList();
        } else {
            error.textContent = "Failed to delete completed todo list items. Reason: " +
            response.status + " - " + response.responseText;
        }
    }).catch(function (error) {
        console.log ("Failed to get list");
    });
}

function applyFilter (filter, event) {
    var filterFunction;

    if (filter === "complete") {
        filterFunction = function (todo) { return todo.isComplete; };
    }
    else if (filter === "incomplete") {
        filterFunction = function (todo) { return todo.isComplete === false; };
    }
    else {
        filterFunction = function (todo) { return true; };
    }

    reloadTodoList(filterFunction);
}

function reloadTodoList(filterFunction) {
    while (todoList.firstChild) {
        todoList.removeChild(todoList.firstChild);
    }

    if (typeof filterFunction === "undefined") {
        filterFunction = function(todo) { return true; };
    }

    var incomplete = 0;
    var complete = 0;
    todoListPlaceholder.style.display = "block";
    getTodoList(function(todos) {
        todos = todos.filter(filterFunction);
        todoListPlaceholder.style.display = "none";
        todos.forEach(function(todo) {

            var listItem = document.createElement("li");
            var titleDiv = document.createElement("div");
            var deleteButton = document.createElement("button");
            var completeButton = document.createElement("button");

            deleteButton.textContent = "Delete";
            deleteButton.setAttribute ("id", "delete-todo");
            deleteButton.setAttribute("data-id", todo.id);
            deleteButton.onclick = deleteTodo;
            deleteButton.className = "btn btn-danger";
            completeButton.className = "btn btn-success";

            titleDiv.textContent = todo.title;
            titleDiv.id = "title-div";
            listItem.appendChild(titleDiv);
            if (todo.isComplete === false) {
                completeButton.textContent = "Complete";
                completeButton.setAttribute ("data-id", todo.id);
                completeButton.setAttribute ("id", "complete-todo");
                completeButton.onclick = completeTodo;
                listItem.appendChild(completeButton);
            } else {
                titleDiv.className = "completed";
            }

            listItem.appendChild(deleteButton);
            todoList.appendChild(listItem);

            if (todo.isComplete === false) {
                incomplete++;
            }
            else {
                complete++;
            }

        });

        if (complete > 0) {
            deleteCompleted.style.display = "inline";
        }
        else {
            deleteCompleted.style.display = "none";
        }
        countLable.textContent = ("Number of incomplete items remaining: " + incomplete);
    });
}

reloadTodoList();

// setInterval(reloadTodoList, 5000);
