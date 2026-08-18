const token = localStorage.getItem("token");


// If user is not logged in
if (!token) {
    window.location.href = "login.html";
}


// ================= LOAD TASKS =================

async function loadTasks() {

    const response = await fetch("/tasks", {

        headers: {
            "Authorization": token
        }

    });

    if (response.status === 401) {

        logout();

        return;

    }

    const tasks = await response.json();

    const taskContainer =
        document.getElementById("tasks");

    taskContainer.innerHTML = "";


    tasks.forEach(task => {

        const div = document.createElement("div");

        div.className = "task";

        div.innerHTML = `

            <h3>${task.title}</h3>

            <p>${task.description || ""}</p>

            <p>
                Status:
                <strong>${task.status}</strong>
            </p>

            <button
                onclick="completeTask('${task._id}')">
                Complete
            </button>

            <button
                onclick="editTask('${task._id}',
                                  '${task.title}',
                                  '${task.description || ""}')">
                Edit
            </button>

            <button
                class="delete"
                onclick="deleteTask('${task._id}')">
                Delete
            </button>

        `;

        taskContainer.appendChild(div);

    });

}


// ================= ADD TASK =================

async function addTask() {

    const title =
        document.getElementById("title").value;

    const description =
        document.getElementById("description").value;


    if (!title) {

        alert("Enter task title");

        return;

    }


    await fetch("/tasks", {

        method: "POST",

        headers: {

            "Content-Type": "application/json",

            "Authorization": token

        },

        body: JSON.stringify({

            title: title,

            description: description

        })

    });


    document.getElementById("title").value = "";

    document.getElementById("description").value = "";


    loadTasks();

}


// ================= COMPLETE TASK =================

async function completeTask(id) {

    await fetch("/tasks/" + id, {

        method: "PUT",

        headers: {

            "Content-Type": "application/json",

            "Authorization": token

        },

        body: JSON.stringify({

            status: "Completed"

        })

    });


    loadTasks();

}


// ================= EDIT TASK =================

async function editTask(id, oldTitle, oldDescription) {

    const title =
        prompt("Enter new title", oldTitle);

    if (title === null) {
        return;
    }


    const description =
        prompt(
            "Enter new description",
            oldDescription
        );


    await fetch("/tasks/" + id, {

        method: "PUT",

        headers: {

            "Content-Type": "application/json",

            "Authorization": token

        },

        body: JSON.stringify({

            title: title,

            description: description,

            status: "Pending"

        })

    });


    loadTasks();

}


// ================= DELETE TASK =================

async function deleteTask(id) {

    const confirmDelete =
        confirm("Delete this task?");

    if (!confirmDelete) {
        return;
    }


    await fetch("/tasks/" + id, {

        method: "DELETE",

        headers: {

            "Authorization": token

        }

    });


    loadTasks();

}


// ================= LOGOUT =================

function logout() {

    localStorage.removeItem("token");

    window.location.href = "login.html";

}


loadTasks();
