var todoList = document.getElementById("todo-list");
var todoListPlaceholder = document.getElementById("todo-list-placeholder");
var form = document.getElementById("todo-form");
var todoTitle = document.getElementById("new-todo");
var error = document.getElementById("error");

form.onsubmit = function(event) {
    var title = todoTitle.value;
    createTodo(title, function() {
        reloadTodoList();
    });
    todoTitle.value = "";
    event.preventDefault();
};

function createTodo(title, callback) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("POST", "/api/todo");
    createRequest.setRequestHeader("Content-type", "application/json");
    createRequest.send(JSON.stringify({
        title: title
    }));
    createRequest.onload = function() {
        if (this.status === 201) {
            callback();
        } else {
            error.textContent = "Failed to create item. Server returned " + this.status + " - " + this.responseText;
        }
    };
}

function getTodoList(callback) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("GET", "/api/todo");
    createRequest.onload = function() {
        if (this.status === 200) {
            callback(JSON.parse(this.responseText));
        } else {
            error.textContent = "Failed to get list. Server returned " + this.status + " - " + this.responseText;
        }
    };
    createRequest.send();
}

function deleteTodo (event) {
    var deleteRequest = new XMLHttpRequest();
    var currentID = this.getAttribute("data-id");
    deleteRequest.open("DELETE", "/api/todo/" + currentID);
    deleteRequest.send();

    deleteRequest.onload = function() {
        if (this.status === 200) {
            //alert("Todo list item deleted");
            reloadTodoList();
        }
        else {
            error.textContent = "Failed to delete todo list item with ID " +
            currentID + ".  Reason: " + this.status + " - " + this.responseText;
        }
    };
}

function completeTodo (event) {
    var completeRequest = new XMLHttpRequest();
    var currentID = this.getAttribute("data-id");
    completeRequest.open("PUT", "/api/todo/" + currentID);
    completeRequest.send();

    completeRequest.onload = function () {
        if (this.status === 200) {
            //alert("Todo list item updated");
            reloadTodoList();
        }
        else {
            error.textContent = "Failed to update todo list item with ID " +
            currentID + ".  Reason: " + this.status + " - " + this.responseText;
        }
    };
}

function reloadTodoList() {
    while (todoList.firstChild) {
        todoList.removeChild(todoList.firstChild);
    }
    todoListPlaceholder.style.display = "block";
    getTodoList(function(todos) {
        todoListPlaceholder.style.display = "none";
        todos.forEach(function(todo) {

            var listItem = document.createElement("li");
            var deleteButton = document.createElement("button");
            var completeButton = document.createElement("button");

            deleteButton.textContent = "Delete";
            deleteButton.setAttribute ("id", "delete-todo");
            deleteButton.setAttribute("data-id", todo.id);
            deleteButton.onclick = deleteTodo;

            listItem.textContent = todo.title;

            if (todo.isComplete === false) {
                completeButton.textContent = "Complete";
                completeButton.setAttribute ("data-id", todo.id);
                completeButton.setAttribute ("id", "complete-todo");
                completeButton.onclick = completeTodo;
                listItem.appendChild(completeButton);
            } else {
                listItem.className = "completed";
            }

            listItem.appendChild(deleteButton);
            todoList.appendChild(listItem);
        });
    });
}

reloadTodoList();
