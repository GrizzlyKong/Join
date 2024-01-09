let currentDraggedElement;
let taskIdCounter = 0; // Ein Zähler, um eine einzigartige ID für jedes Task zu erstellen
let addCount = 0;

async function init() {
  await includeHTML();
  updateHTML();
  AddPriorities();
}

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
  <form>
  <div class="headline-div">
    <h1>Add Task</h1>
    <img onclick="closeAddTodo()" class="goBack pointer" src="/assets/icons/close.svg">
  </div>

  <div class="add-tasks-div center">
    <div class="add-tasks-left-side-div">
      <div class="title column">
        <div><span>Title</span><span class="important">*</span></div>
        <input maxlength="22" id="title-todo" required placeholder="Enter a title">
      </div>
      <div class="description">
        <div><span>Description</span></div>
        <textarea maxlength="45" id="description-todo" placeholder="Enter a Description"></textarea>
      </div>
      <div class="assigned-to">
        <div><span>Assigned to</span></div>
        <select class="pointer" placeholder="Select contacts to assign">
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
        <input maxlength="10" id="date-todo" required placeholder="dd/mm/yyyy">
        <img onclick="getDate()" id="calendar" class="input-icon1 pointer" src="/assets/icons/date.svg" alt="">
      </div>
      <div class="all-priorities">
        <span>Prio</span>
        <div class="priorities">
          <div id="priority-urgent-todo" tabindex="1" class="prioprity-urgent pointer center">
            <div>Urgent</div>
            <div>
              <img class="urgent1" src="/assets/icons/urgent3.svg" alt="">
              <img class="urgent2 d-none" src="/assets/icons/urgent2.svg" alt="">
            </div>
          </div>
          <div id="priority-medium-todo" tabindex="2" class="prioprity-medium pointer center">
            <div>Medium</div>
            <div>
              <img class="medium1" src="/assets/icons/medium.svg" alt="">
              <img class="medium2 d-none" src="/assets/icons/medium2.svg" alt="">
            </div>
          </div>
          <div id="priority-low-todo" tabindex="3" class="prioprity-low pointer center">
            <div>Low</div>
            <div>
              <img class="low1" src="/assets/icons/low.svg" alt="">
              <img class="low2 d-none" src="/assets/icons/low2.svg" alt="">
            </div>
          </div>
        </div>
      </div>
      <div class="category">
        <div><span>Category</span><span class="important">*</span></div>
        <select id="category-todo" required class="pointer" placeholder="Select task category">
          <option value="" class="d-none">Select task category</option>
          <option>Technical Task</option>
          <option>User Story</option>
        </select>
      </div>
      <div class="subtasks">
        <div><span>Subtasks</span><span class="important">*</span></div>
      <div class="subtaskInput">
        <input oninput="addSubtasks()" id="add-subtasks" required placeholder="Add new subtask">
        <img id="subtask-add" class="input-icon2 pointer" src="/assets/icons/add.svg">
      <div class="oninput">
        <img onclick="cancelSubtask()" id="subtask-cancel" class="input-icon3 d-none pointer center" src="/assets/icons/cancelX.svg">
        <img onclick="correctSubtask()" id="subtask-correct" class="input-icon4 d-none pointer center" src="/assets/icons/correct.svg">
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
        <div class="clear pointer center">
          <span>Clear</span>
          <img class="cancel1" src="/assets/icons/cancel.svg" alt="">
          <img class="cancel2 d-none" src="/assets/icons/cancel2.svg" alt="">
        </div>
        <div onclick ="addTodo()" class="create-task pointer center">
          <span>Create Task</span>
          <img src="/assets/icons/check.svg" alt="">
        </div>
      </div>
    </div>
  </div>
</form>
  `;
}

function closeAddTodo() {
  document.getElementById("add-task").classList.add("d-none");
}

function addTodo() {
  let title = document.getElementById("title-todo").value;
  let description = document.getElementById("description-todo").value;
  let category = document.getElementById("category-todo").value;
  /*   let date = document.getElementById('date-todo').value; */

  document.getElementById("add-task").classList.add("d-none");
  const taskId = `task-${taskIdCounter++}`; // Generiert eine einzigartige ID
  AddPriorities(taskId);
  let taskHTML = `
    <div id="${taskId}" class="board-task-card pointer" draggable="true">
            <div class="board-task-card-title">${category}</div>
            <div class="board-task-card-description">${title}</div>
            <div class="board-task-card-task">${description}</div>
            <div class="board-task-card-subtasks">
              <div class="board-task-card-subtasks-bar">
                <div class="bar-fill" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100"></div>
              </div>
              <div class="board-task-card-subtasks-amount"></div>1/2 Subtasks
            </div>
            <div class="board-task-card-users">
              <div class="board-task-card-users-amount">M</div>
              <div class="board-task-card-priority"><img id="priorities-todo-${taskId}" src=""></img></div>
            </div>
          </div>
  `;
  document.getElementById("todo").innerHTML += taskHTML;
  bindDragEvents(document.getElementById(taskId));
}

function AddPriorities(taskId) {
  document
    .getElementById("priority-urgent-todo")
    .addEventListener("click", function () {
      setPriority("urgent", taskId);
    });
  document
    .getElementById("priority-medium-todo")
    .addEventListener("click", function () {
      setPriority("medium", taskId);
    });
  document
    .getElementById("priority-low-todo")
    .addEventListener("click", function () {
      setPriority("low", taskId);
    });
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
  currentDraggedElement = element;
  event.dataTransfer.setData("text/plain", ""); // Für Firefox notwendig
}

function allowDrop(event) {
  event.preventDefault();
}

function drop(event, targetId) {
  event.preventDefault();
  let target = document.getElementById(targetId);
  if (target && currentDraggedElement) {
    target.appendChild(currentDraggedElement);
  }
}

function updateHTML() {
  let taskCards = document.querySelectorAll(".board-task-card");
  taskCards.forEach((card) => {
    if (!card.getAttribute("draggable")) {
      card.setAttribute("draggable", true);
      card.addEventListener("dragstart", (e) => startDragging(e, card));
    }
  });
}

function highlight(id) {
  document.getElementById(id).classList.add("drag-area-highlight");
}

function removeHighlight(id) {
  document.getElementById(id).classList.remove("drag-area-highlight");
}

function getDate() {
  let today = new Date();
  let yyyy = today.getFullYear();
  let mm = today.getMonth() + 1; // Der Monat beginnt mit der 0
  let dd = today.getDate();

  if (dd < 10) dd = "0" + dd;
  if (mm < 10) mm = "0" + mm;

  let formattedToday = dd + "/" + mm + "/" + yyyy;

  document.getElementById("date-todo").value = formattedToday;
}

function addSubtasks() {
  let input = document.getElementById("add-subtasks");
  if (input.value.length > 0) {
    document.getElementById("subtask-add").classList.add("d-none");
    document.getElementById("subtask-cancel").classList.remove("d-none");
    document.getElementById("subtask-correct").classList.remove("d-none");
    document.getElementById("subtask-stroke").classList.remove("d-none");
  } else {
    document.getElementById("subtask-add").classList.remove("d-none");
    document.getElementById("subtask-cancel").classList.add("d-none");
    document.getElementById("subtask-correct").classList.add("d-none");
    document.getElementById("subtask-stroke").classList.add("d-none");
  }
}

function cancelSubtask() {
  let input = document.getElementById("add-subtasks");
  input.value = "";
  document.getElementById("subtask-add").classList.remove("d-none");
  document.getElementById("subtask-cancel").classList.add("d-none");
  document.getElementById("subtask-correct").classList.add("d-none");
  document.getElementById("subtask-stroke").classList.add("d-none");
}

function correctSubtask() {
  let input = document.getElementById("add-subtasks").value.trim();
  if (input !== "") {
    // Zählt die aktuell vorhandenen Subtasks
    const currentSubtasks = document.getElementsByClassName("added-subtask").length;
    
    // Erlaubt das Hinzufügen, wenn weniger als 2 Subtasks vorhanden sind
    if (currentSubtasks < 2) {
      const subtaskId = `task-${taskIdCounter++}`;
      let addedSubtasks = document.getElementById("added-subtasks");
      addedSubtasks.innerHTML += `
        <div id="${subtaskId}" class="added-subtask pointer">
            <div>&bull; ${input}</div>
          <div class="subtask-both-img d-none">
            <img onclick="editSubtask('${subtaskId}')" class="subtask-img1" src="/assets/icons/edit.svg">
            <img onclick="deleteSubtask('${subtaskId}')" class="subtask-img2" src="/assets/icons/delete.svg">
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
}

function editSubtask(subtaskId) {
  let subtaskElement = document.getElementById(subtaskId);
  //querySelector('div') greift auf das erste div element
  //textContent wandelt das div Element in einen String
  let subtaskContent = subtaskElement.querySelector('div').textContent;

  subtaskElement.innerHTML = `
    <input type="text" id="edit-${subtaskId}" class="edit-input" value="${subtaskContent.trim()}">
    <button onclick="saveEdit('${subtaskId}')">Speichern</button>
  `;
  // Die Trim Funktion entfernt Leerzeichen am Anfang und am Ende eines Strings
}

function saveEdit(subtaskId) {
  let inputElement = document.getElementById(`edit-${subtaskId}`);
  let updatedText = inputElement.value;

  // Aktualisiert das Subtask-Element mit dem neuen Text
  let subtaskElement = document.getElementById(subtaskId);
  subtaskElement.innerHTML = `
    <div>&bull; ${updatedText}</div>
    <div class="subtask-both-img d-none">
      <img onclick="editSubtask('${subtaskId}')" class="subtask-img1" src="/assets/icons/edit.svg">
      <img onclick="deleteSubtask('${subtaskId}')" class="subtask-img2" src="/assets/icons/delete.svg">
    </div>
  `;
}

function deleteSubtask(subtaskId){
  let currentSubtask = document.getElementById(subtaskId);
  if (currentSubtask) {
    currentSubtask.remove();
  }
}

init(); // Initialisieren Sie das Skript
