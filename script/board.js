/* const STORAGE_TOKEN = 'UK3WMTJPY9HCOS9AB0PGAT5U9XL1Y2BKP4MIYIVD';
const STORAGE_URL = 'https://remote-storage.developerakademie.org/item';
 */
let currentDraggedElement;
let taskIdCounter = 0;
let subtaskIdCounter = 0;
let addCount = 0;

async function init() {
  await includeHTML();
  displayLoggedInUser();
  updateHTML();
  AddPriorities();
  /*   loadTasks(); */
}


function displayLoggedInUser() {
  const loggedInUserName = localStorage.getItem('loggedInUserName');

  if (loggedInUserName) {
    const userNameIcon = document.getElementById('board-user-icon');
    const firstLetter = loggedInUserName.charAt(0).toUpperCase();
    userNameIcon.textContent = firstLetter;
  }
}


/* async function setItem(key, value) {
  const payload = { key, value, token: STORAGE_TOKEN };
  return fetch(STORAGE_URL, { method: 'POST', body: JSON.stringify(payload) })
      .then(res => res.json());
}

async function getItem(key) {
  const url = `${STORAGE_URL}?key=${key}&token=${STORAGE_TOKEN}`;
  return fetch(url).then(res => res.json()).then(res => {
      if (res.data) {
          return res.data.value;
      } else {
          throw `Could not find data with key "${key}".`;
      }
  });
} */

/* async function loadTasks() {
  try {
    let tasks = await getItem('tasks');
    tasks.forEach(task => {
        addTaskToDOM(task);
    });
  } catch (error) {
    console.error('Fehler beim Laden der Tasks:', error);
  }
} */

async function includeHTML() {
  let includeElements = document.querySelectorAll("[w3-include-html]");
  for (let i = 0; i < includeElements.length; i++) {
    const element = includeElements[i];
    file = element.getAttribute("w3-include-html"); // "includes/header.html"
    let resp = await fetch(file);
    if (resp.ok) {
      element.innerHTML = await resp.text();
    } else {
      element.innerHTML = "Page not found";
    }
  }
}

function findTask() {
  const inputValue = document.getElementById("findTask").value.toLowerCase();
  const allTasks = document.querySelectorAll(".board-task-card");

  allTasks.forEach((container) => {
    const taskName = container
      .querySelector(".board-task-card-title")
      .innerText.toLowerCase();

    if (taskName.includes(inputValue)) {
      container.style.display = "flex";
    } else {
      container.style.display = "none";
    }
  });
}

function addTask() {
  let addToTask = document.getElementById("add-task");
  document.getElementById("board-div").classList.add("background");
  document.getElementById("add-task").classList.remove("d-none");
  document.getElementById("add-task").classList.add("sign-up-animation");
  addToTask.innerHTML = `
  <form onsubmit="addTodo(); return false;" class="addTaskForm">
  <div class="headline-div">
    <h1>Add Task</h1>
    <img onclick="closeAddTodo()" class="goBack pointer" src="../assets/icons/close.svg">
  </div>

  <div class="add-tasks-div center">
    <div class="add-tasks-left-side-div">
      <div class="title column">
        <div><span>Title</span><span class="important">*</span></div>
        <input maxlength="22" id="title-todo" required type="text" placeholder="Enter a title">
      </div>
      <div class="description">
        <div><span>Description</span></div>
        <textarea required type="text" maxlength="45" id="description-todo" placeholder="Enter a Description"></textarea>
      </div>
      <div class="assigned-to">
        <div><span>Assigned to</span></div>
        <select required type="text" class="pointer" placeholder="Select contacts to assign">
          <option value="" class="d-none">Select contacts to assign</option>
          <option>1</option>
          <option>2</option>
          <option>3</option>
        </select>
      </div>
    </div>
    <div class="add-tasks-right-side-div">
      <div class="duo-date">
        <div><span>Due date</span><span class="important">*</span></div>
        <input class="calendarPicker" type="date" maxlength="10" id="date-todo" required placeholder="dd/mm/yyyy">
        
      </div>
      <div class="all-priorities">
        <span>Prio</span>
        <div class="priorities">
          <div id="priority-urgent-todo" tabindex="1" class="prioprity-urgent pointer center">
            <div>Urgent</div>
            <div>
              <img class="urgent1" src="../assets/icons/urgent3.svg" alt="">
              <img class="urgent2 d-none" src="../assets/icons/urgent2.svg" alt="">
            </div>
          </div>
          <div id="priority-medium-todo" tabindex="2" class="prioprity-medium pointer center">
            <div>Medium</div>
            <div>
              <img class="medium1" src="../assets/icons/medium.svg" alt="">
              <img class="medium2 d-none" src="../assets/icons/medium2.svg" alt="">
            </div>
          </div>
          <div id="priority-low-todo" tabindex="3" class="prioprity-low pointer center">
            <div>Low</div>
            <div>
              <img class="low1" src="../assets/icons/low.svg" alt="">
              <img class="low2 d-none" src="../assets/icons/low2.svg" alt="">
            </div>
          </div>
        </div>
      </div>
      <div class="category">
        <div><span>Category</span><span class="important">*</span></div>
        <select type="text" id="category-todo" required class="pointer" placeholder="Select task category">
          <option value="" class="d-none">Select task category</option>
          <option>Technical Task</option>
          <option>User Story</option>
        </select>
      </div>
      <div class="subtasks">
        <div><span>Subtasks</span><span class="important">*</span></div>
      <div class="subtaskInput">
        <input minlength="1" oninput="addSubtasks()" id="add-subtasks" type="text" placeholder="Add new subtask">
        <img id="subtask-add" class="input-icon2 pointer" src="../assets/icons/add.svg">
      <div class="oninput">
        <img onclick="cancelSubtask()" id="subtask-cancel" class="input-icon3 d-none pointer center" src="../assets/icons/cancelX.svg">
        <img onclick="correctSubtask()" id="subtask-correct" class="input-icon4 d-none pointer center" src="../assets/icons/correct.svg">
      </div>
    </div>
        </div>
        <div class="absolute" id="added-subtasks">
        
        </div>
    </div>
  </div>
  <div class="bottom">
    <div class="left-bottom">
      <span class="important">*</span><span>This field is required</span>
    </div>
    <div class="right-bottom">
      <div class="clear-and-create-task center">
        <button onclick="closeAddTodo()" class="clear pointer center">
          <span>Clear</span>
          <img class="cancel1" src="../assets/icons/cancel.svg" alt="">
          <img class="cancel2 d-none" src="../assets/icons/cancel2.svg" alt="">
        </button>
        <button type="submit" class="create-task pointer center">
          <span>Create Task</span>
          <img src="../assets/icons/check.svg" alt="">
        </button>
      </div>
    </div>
  </div>
</form>
  `;
  bindSubtaskEvents();
}

function bindSubtaskEvents() {
  let addedSubtasksContainer = document.getElementById("added-subtasks");
  if (addedSubtasksContainer) {
    addedSubtasksContainer.addEventListener("click", function (event) {
      let target = event.target;
      if (target.tagName === "IMG") {
        let subtaskId = target.closest(".added-subtask").id;
        let taskId = "Ihr-Task-ID"; // Ersetzen Sie dies durch die tatsächliche Task-ID
        if (target.classList.contains("subtask-img1")) {
          editSubtask(subtaskId);
        } else if (target.classList.contains("subtask-img2")) {
          deleteSubtask(taskId, subtaskId);
        }
      }
    });
  }
}

function closeAddTodo() {
  document.getElementById("add-task").classList.add("d-none");
}

function addTodo() {
  document.getElementById("add-task").classList.add("d-none");
  let title = document.getElementById("title-todo").value;
  let description = document.getElementById("description-todo").value;
  let category = document.getElementById("category-todo").value;
  let dueDate = document.getElementById("date-todo").value;

  /*   let date = document.getElementById('date-todo').value; */
  let subtasks = Array.from(
    document.querySelectorAll("#added-subtasks .added-subtask")
  ).map((subtask) => subtask.textContent.trim());
  const taskId = `task-${taskIdCounter++}`; // Generiert eine einzigartige ID
  AddPriorities(taskId);
  let taskHTML = `
    <div id="${taskId}" class="board-task-card pointer" draggable="true" onclick="openTaskInfos('${taskId}','${title}', '${description}', '${category}', '${dueDate}', ${JSON.stringify(
    subtasks
  )
    .split('"')
    .join("&quot;")})">
            <div class="board-task-card-title">${category}</div>
            <div class="board-task-card-description">${title}</div>
            <div class="board-task-card-task">${description}</div>
            <div class="board-task-card-date d-none">${dueDate}</div>
            <div class="board-task-card-subtasks">
              <div class="board-task-card-subtasks-bar">
                <div class="bar-fill" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100"></div>
              </div>
              <div class="board-task-card-subtasks-amount"></div>
            </div>
            <div class="board-task-card-users">
              <div class="board-task-card-users-amount">M</div>
              <div class="board-task-card-priority"><img id="priorities-todo-${taskId}" src=""></img></div>
            </div>
          </div>
  `;
  document.getElementById("todo").insertAdjacentHTML("beforeend", taskHTML);

  /*   document.getElementById("todo").innerHTML += taskHTML; */
  bindDragEvents(document.getElementById(taskId));
}

/* async function saveTask(task) {
  try {
      let tasks = await getItem('tasks') || [];
      tasks.push(task);
      await setItem('tasks', tasks);
  } catch (error) {
      console.error('Fehler beim Speichern des Tasks:', error);
  }
} */

function openTaskInfos(taskId, title, description, category, dueDate, subtasks) {
  let taskElement = document.getElementById(taskId);
  if (!taskElement) {
    console.error('Task-Element nicht gefunden:', taskId);
    return;
  }
  document.getElementById("all-task-infos").classList.remove("d-none");
  let currentTitle = taskElement.querySelector('.board-task-card-description').textContent;
  let currentDescription = taskElement.querySelector('.board-task-card-task').textContent;
  let currentCategory = taskElement.querySelector('.board-task-card-title').textContent;
  let currentDueDate = taskElement.querySelector('.board-task-card-date').textContent;

  let subtasksHtml = subtasks.map((subtask, index) => // Fügen Sie den Index hier hinzu
  `<div class="hover-subtask column pointer" onmouseover="showIcons(${index})" onmouseout="hideIcons(${index})">
    ${subtask}
    <img id="edit-icon-${index}" onclick="editExistingSubtask(${index})" src="../assets/icons/edit.svg" style="display:none;"/>
    <img id="delete-icon-${index}" onclick="deleteExistingSubtask(${index})" src="../assets/icons/delete.svg" style="display:none;"/>
  </div>`
).join("");
  let encodedSubtasksHtml = encodeURIComponent(subtasksHtml);

  document.getElementById("all-task-infos").classList.remove("d-none");
  let allTaskInfos = document.getElementById("all-task-infos");
  allTaskInfos.innerHTML = `
  <div class="whole-task-infos absolute">
  <div class="task-info-top">
    <div class="task-info-category">${currentCategory}</div>
    <div><img onclick="closeTaskInfos()" src="../assets/icons/Close2.svg"></div>
  </div>
  <div class="task-info-title">${currentTitle}</div>
  <div class="task-info-description">${currentDescription}</div>
  <div class="task-info-due-date">
    <div class="headline3">Due date:</div>
    <div class="variable">${currentDueDate}</div>
  </div>
  <div class="task-info-prio">
    <div class="headline3">Priority:</div>
    <div class="task-info-current-prio">
      <span>Urgent</span>
      <img src="../assets/icons/urgent3.svg">
    </div>
  </div>
  <div class="task-info-assigned-to">
    <div class="headline3">Assigned To:</div>
    <div class="variable">
      <div class="task-info-contacts">Hier kommen die Kontakte</div>
    </div>
  </div>
  <div class="task-info-subtasks">
    <div class="headline3">Subtasks</div>
    <div>${subtasksHtml}</div>
  </div>
  <div class="task-info-delete-edit center absolute">
    <div onclick="deleteTaskInfos('${taskId}')" class="task-info-delete pointer center">
      <img class="img1" src="../assets/icons/delete2.svg" alt="">
      <img class="img2 d-none" src="../assets/icons/delete2.png" alt="">
      <span><b>Delete</b></span>
    </div>
    <div onclick="editTaskInfos('${taskId}', '${encodedSubtasksHtml}')" class="task-info-edit pointer center"> 
      <img class="img3" src="../assets/icons/edit2.svg" alt="">
      <img class="img4 d-none" src="../assets/icons/edit2.png" alt="">
      <span><b>Edit</b></span>
    </div>
  </div>
</div>
  `;
}

function showIcons(index) {
  document.getElementById(`edit-icon-${index}`).style.display = 'inline';
  document.getElementById(`delete-icon-${index}`).style.display = 'inline';
}

function hideIcons(index) {
  document.getElementById(`edit-icon-${index}`).style.display = 'none';
  document.getElementById(`delete-icon-${index}`).style.display = 'none';
}

function deleteTaskInfos(taskId) {
  console.log("Löschversuch für Task mit ID:", taskId);
  let taskElement = document.getElementById(taskId);
  if (taskElement) {
    taskElement.remove(); // Entfernt das Element aus dem DOM
  }
  let wholeTaskInfos = document.querySelector('.whole-task-infos');
  wholeTaskInfos.classList.add('d-none')
}

function editTaskInfos(taskId, encodedSubtasksHtml) {
  let taskInfoContainer = document.querySelector('.whole-task-infos');
  let subtasksHtml = decodeURIComponent(encodedSubtasksHtml);
  let subtasks = subtasksHtml.split(",").map(subtask => subtask.trim());

  if (!taskInfoContainer) {
    console.error('Task-Info-Container nicht gefunden');
    return;
  }

  let editableSubtasksHtml = subtasks.map((subtask, index) => `
  <div class="editable-subtask" id="editable-subtask-${index}">
  <div class="subtaskInput">
  <input class="add-input-Subtasks" minlength="1" oninput="addSubtasks()" id="add-subtasks" type="text" placeholder="Add new subtask">
  <img class="add-img pointer" id="subtask-add" class="input-icon2 pointer" src="../assets/icons/add.svg">
<div class="oninput">
  <img onclick="cancelSubtask()" id="subtask-cancel" class="input-icon3 d-none pointer center" src="../assets/icons/cancelX.svg">
  <img onclick="correctSubtask()" id="subtask-correct" class="input-icon4 d-none pointer center" src="../assets/icons/correct.svg">
</div>
</div>
  <span class="hover-subtask">${subtask}</span>

  </div>
`).join("");

  // Extrahieren der aktuellen Werte
  let title = taskInfoContainer.querySelector('.task-info-title').textContent;
  let description = taskInfoContainer.querySelector('.task-info-description').textContent;
  let category = taskInfoContainer.querySelector('.task-info-category').textContent;
  let dueDate = taskInfoContainer.querySelector('.task-info-due-date .variable').textContent;
 

  taskInfoContainer.innerHTML = `
  <form onsubmit="saveEditedTaskInfo('${taskId}'); return false;">
    <div class="edit-the-category">
    <div>Category:</div>
      <select value="${category}" type="text" id="edit-category-${taskId}" required class="edit-the-category-select pointer" placeholder="Select task category">
        <option value="" class="d-none">Select task category</option>
        <option>Technical Task</option>
        <option>User Story</option>
      </select>
    </div>

    <div class="edit-the-title">
    <div>Title:</div>
    <input maxlength="60" class="edit-the-title-input" required type="text" id="edit-title-${taskId}" value="${title}">
    </div>
    <div class="edit-the-description">
    <div>Description:</div>
    <textarea maxlength="75" class="edit-the-description-textarea" required id="edit-description-${taskId}">${description}</textarea>
    </div>
    <div class="edit-the-dueDate">
    <div>Due Date:</div>
    <input class="edit-the-dueDate-input" required type="date" id="edit-due-date-${taskId}" value="${dueDate}">
    </div>
    
        <div id="edited-subtasks">
            ${editableSubtasksHtml}
        </div>
    </div>
    <div class="save-edited-task-button">
    <button type="submit" class="save-edited-Task pointer center">
      <span>OK</span>
      <img src="../assets/icons/check.svg" alt="">
    </button>
    </div>
  </form>
  `;
}

function deleteExistingSubtask(index) {
  // Logik zum Löschen einer bestehenden Subtask
  let subtaskElement = document.getElementById(`editable-subtask-${index}`);
  if (subtaskElement) {
    subtaskElement.remove();
  }
}

function saveEditedTaskInfo(taskId) {
  // Extrahieren der bearbeiteten Werte
  let editedTitle = document.getElementById(`edit-title-${taskId}`).value;
  let editedDescription = document.getElementById(`edit-description-${taskId}`).value;
  let editedCategory = document.getElementById(`edit-category-${taskId}`).value;
  let editedDueDate = document.getElementById(`edit-due-date-${taskId}`).value;

  let taskElement = document.getElementById(taskId);
  if (taskElement) {
    taskElement.querySelector('.board-task-card-description').textContent = editedTitle;
    taskElement.querySelector('.board-task-card-task').textContent = editedDescription;
    taskElement.querySelector('.board-task-card-title').textContent = editedCategory;
    taskElement.querySelector('.board-task-card-date').textContent = editedDueDate;
  }

  // Aktualisieren der Ansicht in whole-task-infos mit den neuen Informationen
  let taskInfoContainer = document.querySelector('.whole-task-infos');
  if (taskInfoContainer) {
    taskInfoContainer.innerHTML = `
      <div class="task-info-top">
        <div class="task-info-category">${editedCategory}</div>
        <div><img onclick="closeTaskInfos()" src="../assets/icons/Close2.svg"></div>
      </div>
      <div class="task-info-title">${editedTitle}</div>
      <div class="task-info-description">${editedDescription}</div>
      <div class="task-info-due-date">
        <div class="headline3">Due date:</div>
        <div class="variable">${editedDueDate}</div>
      </div>
      <div class="task-info-prio">
        <div class="headline3">Priority:</div>
        <div class="task-info-current-prio">

        </div>
      </div>
      <div class="task-info-assigned-to">
        <div class="headline3">Assigned To:</div>
        <div class="variable">
          <div class="task-info-contacts">Kontakte aktualisieren</div>
        </div>
      </div>
      <div class="task-info-subtasks">
        <div class="headline3">Subtasks</div>

      </div>
      <div class="task-info-delete-edit center absolute">
        <div onclick="deleteTaskInfos('${taskId}')" class="task-info-delete pointer center">
          <img class="img1" src="../assets/icons/delete2.svg" alt="">
          <img class="img2 d-none" src="../assets/icons/delete2.png" alt="">
          <span><b>Delete</b></span>
        </div>
        <div onclick="editTaskInfos('${taskId}')" class="task-info-edit pointer center"> 
          <img class="img3" src="../assets/icons/edit2.svg" alt="">
          <img class="img4 d-none" src="../assets/icons/edit2.png" alt="">
          <span><b>Edit</b></span>
        </div>
      </div>
    `;
  }
  openTaskInfos(taskId, editedTitle, editedDescription, editedCategory, editedDueDate);
}



function correctSubtask() {
  let input = document.getElementById("add-subtasks").value.trim();
  if (input !== "") {
    // Zählt die aktuell vorhandenen Subtasks
    const currentSubtasks =
      document.getElementsByClassName("added-subtask").length;

    // Erlaubt das Hinzufügen, wenn weniger als 2 Subtasks vorhanden sind
    if (currentSubtasks < 2) {
      const subtaskId = `subtask-${subtaskIdCounter++}`;
      let addedSubtasks = document.getElementById("added-subtasks");
      addedSubtasks.innerHTML += `
        <div id="${subtaskId}" class="added-subtask pointer">
            <div> ${input}</div>
          <div class="subtask-both-img d-none">
            <img onclick="editSubtask('${subtaskId}')" class="subtask-img1" src="../assets/icons/edit.svg">
            <img onclick="deleteSubtask('${subtaskId}')" class="subtask-img2" src="../assets/icons/delete.svg">
          </div>
        </div>
      `;
      document.getElementById("add-subtasks").value = "";
    } else {
      // Benachrichtigung, wenn das Limit von 2 Subtasks erreicht ist
      let inputElement = document.getElementById("add-subtasks");
      inputElement.value = "Maximal 2 Subtasks";
      inputElement.classList.add("red");
      inputElement.disabled = true;
      setTimeout(() => {
        inputElement.value = "";
        inputElement.classList.remove("red");
        inputElement.disabled = false;
      }, 3000);
    }
  }
  /*   updateProgress(); */
}

function closeTaskInfos() {
  document.getElementById("all-task-infos").classList.add("d-none");
}

function AddPriorities(taskId) {
  const urgentElement = document.getElementById("priority-urgent-todo");
  const mediumElement = document.getElementById("priority-medium-todo");
  const lowElement = document.getElementById("priority-low-todo");

  if (urgentElement && mediumElement && lowElement) {
    urgentElement.addEventListener("click", function () {
      setPriority("urgent", taskId);
    });
    mediumElement.addEventListener("click", function () {
      setPriority("medium", taskId);
    });
    lowElement.addEventListener("click", function () {
      setPriority("low", taskId);
    });
  }
}

function setPriority(priority, taskId) {
  let prioritySrc = {
    urgent: "../assets/icons/urgent3.svg",
    medium: "../assets/icons/medium.svg",
    low: "../assets/icons/low.svg",
  };

  let src = prioritySrc[priority] || "";
  document.getElementById(`priorities-todo-${taskId}`).src = src;
}

function bindDragEvents(element) {
  element.addEventListener("dragstart", (e) => startDragging(e, element));
}

function startDragging(event, element) {
  console.log("Drag Start:", element.id); // Zum Debuggen
  currentDraggedElement = element;
  event.dataTransfer.setData("text/plain", element);
}

function allowDrop(event) {
  event.preventDefault();
}

function drop(event, targetId) {
  event.preventDefault();
  let target = document.getElementById(targetId);
  if (target && currentDraggedElement) {
    target.appendChild(currentDraggedElement);
    document.getElementById(targetId).classList.remove("drag-area-highlight");
  }
}

function addTaskToDOM(task) {
  // ... (Ihr bestehender Code)
  let newCard = document.getElementById(task.id);
  newCard.setAttribute("draggable", true);
  newCard.addEventListener("dragstart", (e) => startDragging(e, newCard));
}

function updateHTML() {
  let taskCards = document.querySelectorAll(".board-task-card");
  taskCards.forEach((card, index) => {
    card.setAttribute("draggable", true);
    card.setAttribute("id", "task-card-" + index); // Stellen Sie sicher, dass jede Karte eine eindeutige ID hat
    card.addEventListener("dragstart", (e) => startDragging(e, card));
  });
}

function highlight(id) {
  document.getElementById(id).classList.add("drag-area-highlight");
}

function removeHighlight(id) {
  document.getElementById(id).classList.remove("drag-area-highlight");
}

/* function getDate() {
  let today = new Date();
  let yyyy = today.getFullYear();
  let mm = today.getMonth() + 1; // Der Monat beginnt mit der 0
  let dd = today.getDate();

  if (dd < 10) dd = "0" + dd;
  if (mm < 10) mm = "0" + mm;

  let formattedToday = dd + "/" + mm + "/" + yyyy;

  document.getElementById("date-todo").value = formattedToday;
} */
function addSubtasks() {
  let input = document.getElementById("add-subtasks");
  if (input.value.length > 0) {
    document.getElementById("subtask-add").classList.add("d-none");
    document.getElementById("subtask-cancel").classList.remove("d-none");
    document.getElementById("subtask-correct").classList.remove("d-none");
  } else {
    document.getElementById("subtask-add").classList.remove("d-none");
    document.getElementById("subtask-cancel").classList.add("d-none");
    document.getElementById("subtask-correct").classList.add("d-none");
  }
  /*   updateProgress(); */
}

function cancelSubtask() {
  let input = document.getElementById("add-subtasks");
  input.value = "";
  document.getElementById("subtask-add").classList.remove("d-none");
  document.getElementById("subtask-cancel").classList.add("d-none");
  document.getElementById("subtask-correct").classList.add("d-none");
}
function correctSubtask() {
  let input = document.getElementById("add-subtasks").value.trim();
  if (input !== "") {
    // Zählt die aktuell vorhandenen Subtasks
    const currentSubtasks =
      document.getElementsByClassName("added-subtask").length;

    // Erlaubt das Hinzufügen, wenn weniger als 2 Subtasks vorhanden sind
    if (currentSubtasks < 2) {
      const subtaskId = `subtask-${subtaskIdCounter++}`;
      let addedSubtasks = document.getElementById("added-subtasks");
      addedSubtasks.innerHTML += `
        <div id="${subtaskId}" class="added-subtask pointer">
            <div>&bull; ${input}</div>
          <div class="subtask-both-img d-none">
            <img onclick="editSubtask('${subtaskId}')" class="subtask-img1" src="../assets/icons/edit.svg">
            <img onclick="deleteSubtask('${subtaskId}')" class="subtask-img2" src="../assets/icons/delete.svg">
          </div>
        </div>
      `;
      document.getElementById("add-subtasks").value = "";
    } else {
      // Benachrichtigung, wenn das Limit von 2 Subtasks erreicht ist
      let inputElement = document.getElementById("add-subtasks");
      inputElement.value = "Maximal 2 Subtasks";
      inputElement.classList.add("red");
      inputElement.disabled = true;
      setTimeout(() => {
        inputElement.value = "";
        inputElement.classList.remove("red");
        inputElement.disabled = false;
      }, 3000);
    }
  }
  /*   updateProgress(); */
}

function editSubtask(subtaskId) {
  let subtaskElement = document.getElementById(subtaskId);
  let subtaskContent = subtaskElement.querySelector("div").textContent;
  const taskId = `task-${taskIdCounter++}`;

  subtaskElement.innerHTML = `
    <input type="text" id="edit-${subtaskId}" class="edit-input" value="${subtaskContent.trim()}">
    <div>
      <img onclick="deleteSubtask('${taskId}', '${subtaskId}')" src="../assets/icons/delete.svg">
      <img onclick="saveEdit('${subtaskId}')" src="../assets/icons/correct.svg">
    </div>
  `;
  document.getElementById(subtaskId).classList.add("border-bottom-blue");
  document.getElementById(subtaskId).classList.add("added-subtask-unset");
  document.getElementById(subtaskId).classList.add("border-radius-unset");
}

function saveEdit(subtaskId) {
  let inputElement = document.getElementById(`edit-${subtaskId}`);
  let updatedText = inputElement.value;

  let subtaskElement = document.getElementById(subtaskId);
  subtaskElement.innerHTML = `
    <div>&bull; ${updatedText}</div>
    <div class="subtask-both-img d-none">
      <img onclick="editSubtask('${subtaskId}')" class="subtask-img1" src="../assets/icons/edit.svg">
      <img onclick="deleteSubtask('${subtaskId}')" class="subtask-img2" src="../assets/icons/delete.svg">
    </div>
  `;
  document.getElementById(subtaskId).classList.remove("border-bottom-blue");
  document.getElementById(subtaskId).classList.remove("added-subtask-unset");
  document.getElementById(subtaskId).classList.remove("border-radius-unset");
}

function deleteSubtask(taskId, subtaskId) {
  let currentSubtask = document.getElementById(subtaskId);
  if (currentSubtask) {
    currentSubtask.remove();
    /*     updateProgress(taskId); */
  }
}

/* function updateProgress() {
  const maxSubtasks = 2;
  const currentSubtasks = document.getElementsByClassName("added-subtask").length;

  // Berechnen des Fortschritts in Prozent
  const progressPercent = (currentSubtasks / maxSubtasks) * 100;

  // Aktualisieren der Fortschrittsleiste
  const progressBar = document.querySelector(".bar-fill");
  if (progressBar) {
    progressBar.style.width = `${progressPercent}%`;
  }

  // Aktualisieren des Subtask-Textes
  const subtaskText = document.querySelector(".board-task-card-subtasks-amount");
  if (subtaskText) {
    subtaskText.textContent = `${currentSubtasks}/${maxSubtasks} Subtasks`;
  }
} */

init(); // Initialisieren Sie das Skript