let currentDraggedElement;
let taskIdCounter = 0; // Ein Zähler, um eine einzigartige ID für jedes Task zu erstellen

async function init() {
    await includeHTML();
    updateHTML();
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
  let addToTask = document.getElementById('add-task');
  document.getElementById("board-div").classList.add("background");
  document.getElementById("add-task").classList.remove("d-none");
  document.getElementById("add-task").classList.add("sign-up-animation");
  addToTask.innerHTML = `
  <div>
  <div class="headline-div">
    <h1>Add Task</h1>
    <img onclick="closeAddTodo()" class="goBack pointer" src="/assets/icons/close.svg">
  </div>

  <div class="add-tasks-div center">
    <div class="add-tasks-left-side-div">
      <div class="title column">
        <div><span>Title</span><span class="important">*</span></div>
        <input required placeholder="Enter a title">
      </div>
      <div class="description">
        <div><span>Description</span></div>
        <textarea placeholder="Enter a Description"></textarea>
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
        <input required placeholder="dd/mm/yyyy"><img class="input-icon1" src="/assets/icons/date.svg" alt="">
      </div>
      <div class="all-priorities">
        <span>Prio</span>
        <div class="priorities">
          <div tabindex="1" class="prioprity-urgent pointer center">
            <div>Urgent</div>
            <div>
              <img class="urgent1" src="/assets/icons/urgent3.svg" alt="">
              <img class="urgent2 d-none" src="/assets/icons/urgent2.svg" alt="">
            </div>
          </div>
          <div tabindex="2" class="prioprity-medium pointer center">
            <div>Medium</div>
            <div>
              <img class="medium1" src="/assets/icons/medium.svg" alt="">
              <img class="medium2 d-none" src="/assets/icons/medium2.svg" alt="">
            </div>
          </div>
          <div tabindex="3" class="prioprity-low pointer center">
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
        <select required class="pointer" placeholder="Select task category">
          <option value="" class="d-none">Select task category</option>
          <option>Technical Task</option>
          <option>User Story</option>
        </select>
      </div>
      <div class="subtasks">
        <div><span>Subtasks</span><span class="important">*</span></div>
        <input required placeholder="Add new subtask"><img class="input-icon2" src="/assets/icons/add.svg" alt="">
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
</div>
  `;
}
    
function closeAddTodo() {
  document.getElementById("add-task").classList.add("d-none");
}



function addTodo() {
  document.getElementById("add-task").classList.add("d-none");
  const taskId = `task-${taskIdCounter++}`; // Generiert eine einzigartige ID
  let taskHTML = `
    <div id="${taskId}" class="board-task-card pointer" draggable="true">
            <div class="board-task-card-title">User story</div>
            <div class="board-task-card-description">Kochwelt Page & Recipe Recommender</div>
            <div class="board-task-card-task">tekst blablablablablabla</div>
            <div class="board-task-card-subtasks">
              <div class="board-task-card-subtasks-bar">
                <div class="bar-fill" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100"></div>
              </div>
              <div class="board-task-card-subtasks-amount"></div>1/2 Subtasks
            </div>
            <div class="board-task-card-users">
              <div class="board-task-card-users-amount">M</div>
              <div class="board-task-card-priority"><img src="../assets/icons/medium-prio.png"></div>
            </div>
          </div>
  `;
  document.getElementById('todo').innerHTML += taskHTML;
  bindDragEvents(document.getElementById(taskId));

}

function bindDragEvents(element) {
  element.addEventListener('dragstart', (e) => startDragging(e, element));
}

function startDragging(event, element) {
  currentDraggedElement = element;
  event.dataTransfer.setData('text/plain', ''); // Für Firefox notwendig
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
  let taskCards = document.querySelectorAll('.board-task-card');
  taskCards.forEach(card => {
    if (!card.getAttribute('draggable')) {
      card.setAttribute('draggable', true);
      card.addEventListener('dragstart', (e) => startDragging(e, card));
    }
  });
}

function highlight(id) {
  document.getElementById(id).classList.add('drag-area-highlight');
}

function removeHighlight(id) {
  document.getElementById(id).classList.remove('drag-area-highlight');
}

init(); // Initialisieren Sie das Skript