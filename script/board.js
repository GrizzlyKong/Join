/* const STORAGE_TOKEN = 'UK3WMTJPY9HCOS9AB0PGAT5U9XL1Y2BKP4MIYIVD';
const STORAGE_URL = 'https://remote-storage.developerakademie.org/item';
 */
let currentDraggedElement;
let taskIdCounter = 0;
let subtaskIdCounter = 0;
let addCount = 0;
let selectedPriority = null;

async function init() {
  await includeHTML();
  displayLoggedInUser();
  updateHTML();
<<<<<<< HEAD
}

=======
  AddPriorities();
  populateContactsDropdown();
  /*   loadTasks(); */
}


async function populateContactsDropdown() {
  try {
    const loggedInUserName = localStorage.getItem("loggedInUserName");
    if (!loggedInUserName) {
      console.error("No logged-in user found. Contacts cannot be loaded.");
      return;
    }

    const contactsData = await getItem(`contacts_${loggedInUserName}`);
    const userContacts = JSON.parse(contactsData) || [];

    const selectedContact = document.getElementById("selectedContact");
    const contactsDropdown = document.getElementById("contactsDropdownTask");
    const contactsContainer = document.getElementById("contactsContainerTask");
    contactsDropdown.innerHTML = '<option value="" selected disabled>Select contacts to assign</option>';

    contactsContainer.innerHTML = '';


    userContacts.forEach((contact, index) => {
      const { name, color } = contact;
      if (!name) {
        return;
      }

      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;

      contactsDropdown.appendChild(option);

      const contactElement = createContactIcon(contact);
      contactsContainer.appendChild(contactElement);
    });
    contactsDropdown.addEventListener("change", () => {
      selectedContact.textContent = contactsDropdown.value;
    });
  } catch (error) {
    console.error("Error loading contacts:", error);
  }
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

>>>>>>> 9f1854aee5815d39b4e73831a49eaf36696c02b6
async function includeHTML() {
  let includeElements = document.querySelectorAll("[w3-include-html]");
  for (let i = 0; i < includeElements.length; i++) {
    const element = includeElements[i];
    file = element.getAttribute("w3-include-html"); 
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
<<<<<<< HEAD
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
        <div id="priority-urgent-todo" tabindex="1" class="prioprity-urgent pointer center" onclick="setSelectedPriority('urgent')">
            <div>Urgent</div>
            <div>
              <img class="urgent1" src="../assets/icons/urgent3.svg" alt="">
              <img class="urgent2 d-none" src="../assets/icons/urgent2.svg" alt="">
            </div>
          </div>
          <div id="priority-medium-todo" tabindex="2" class="prioprity-medium pointer center" onclick="setSelectedPriority('medium')">
            <div>Medium</div>
            <div>
              <img class="medium1" src="../assets/icons/medium.svg" alt="">
              <img class="medium2 d-none" src="../assets/icons/medium2.svg" alt="">
            </div>
          </div>
          <div id="priority-low-todo" tabindex="3" class="prioprity-low pointer center" onclick="setSelectedPriority('low')">
            <div>Low</div>
            <div>
              <img class="low1" src="../assets/icons/low.svg" alt="">
              <img class="low2 d-none" src="../assets/icons/low2.svg" alt="">
            </div>
=======
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
          <label for="contactsDropdownTask"><span>Assigned to</span></label>
          <div class="custom-dropdown" id="contactsDropdownContainer">
            <select id="contactsDropdownTask">
              <option value="" selected disabled>Select contacts to assign</option>
              <!-- Options will be dynamically added here using JavaScript -->
            </select>
>>>>>>> 9f1854aee5815d39b4e73831a49eaf36696c02b6
          </div>
        </div>
        <div class="contacts-container" id="contactsContainerTask"></div>


          <div class="contacts-container" id="contactsContainerTask"></div>
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
          <div class="bottom">
          <div class="left-bottom">
            <span class="important">*</span><span>This field is required</span>
          </div>
          <div class="absolute" id="added-subtasks"></div>
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
<<<<<<< HEAD
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
=======
      
          </div>
 
    </form>
>>>>>>> 9f1854aee5815d39b4e73831a49eaf36696c02b6
  `;
  bindSubtaskEvents();
}

<<<<<<< HEAD
=======

function displayAssignedContacts() {
  const loggedInUserName = localStorage.getItem("loggedInUserName");
  const contactsData = getItem(`contacts_${loggedInUserName}`);
  const userContacts = JSON.parse(contactsData) || [];

  const contactsContainer = document.getElementById("contactsContainerTask");
  userContacts.forEach((contact) => {
    const contactElement = createContactIcon(contact);
    contactsContainer.appendChild(contactElement);
  });
}

function createContactIcon(contact) {
  const { name, color } = contact;

  if (!name) {
    return null;
  }

  const contactElement = document.createElement("div");
  contactElement.className = "contact-icon";
  contactElement.style.backgroundColor = color;

  const nameElement = document.createElement("div");
  nameElement.className = "contact-icon-name";
  nameElement.textContent = name.charAt(0).toUpperCase();

  contactElement.appendChild(nameElement);

  return contactElement;
}



>>>>>>> 9f1854aee5815d39b4e73831a49eaf36696c02b6
function bindSubtaskEvents() {
  let addedSubtasksContainer = document.getElementById("added-subtasks");
  if (addedSubtasksContainer) {
    addedSubtasksContainer.addEventListener("click", function (event) {
      let target = event.target;
      if (target.tagName === "IMG") {
        let subtaskId = target.closest(".added-subtask").id;
        let taskId = "Ihr-Task-ID"; 
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
  let title = document.getElementById("title-todo").value;
  let description = document.getElementById("description-todo").value;
  let category = document.getElementById("category-todo").value;
  let dueDate = document.getElementById("date-todo").value;

  let subtasks = Array.from(
    document.querySelectorAll("#added-subtasks .added-subtask")
  ).map((subtask) => subtask.textContent.trim());
  let totalSubtasks = subtasks.length; // Gesamtzahl der Subtasks
  const taskId = `task-${taskIdCounter++}`; // Generiert eine einzigartige ID

  let priorityImage = "";
  switch (selectedPriority) {
    case "urgent":
      priorityImage = "../assets/icons/urgent3.svg";
      break;
    case "medium":
      priorityImage = "../assets/icons/medium.svg"
      break;
    case "low":
      priorityImage = "../assets/icons/low.svg";
      break;
  }
  console.log("Prioritätsbild:", priorityImage);

  let taskHTML = `
    <div id="${taskId}" class="board-task-card pointer" ondragstart="startDragging(event)" draggable="true" onclick="openTaskInfos('${taskId}', '${title}', '${description}', '${category}', '${dueDate}', ${JSON.stringify(
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
          <div id="bar-fill-${taskId}" class="bar-fill" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100"></div>
        </div>
        <div id="subtasks-amount-${taskId}" class="board-task-card-subtasks-amount">${totalSubtasks}/2 Subtasks</div>
      </div>
      <div class="board-task-card-users">
        <div class="board-task-card-users-amount">M</div>
        <div class="board-task-card-priority">
        <img id="priority-img-${taskId}" src="${priorityImage}">
    </div>
      </div>
    </div>
  `;
  selectedPriority = null;
  document.getElementById("todo").insertAdjacentHTML("beforeend", taskHTML);
  updateProgressBar(taskId, totalSubtasks);

  let newTaskElement = document.getElementById(taskId);
  bindDragEvents(newTaskElement);

  // Formular und Modalfenster schließen
  document.getElementById("add-task").classList.add("d-none");
  document.getElementById("board-div").classList.remove("background");
}

function updateProgressBar(taskId, totalSubtasks) {
  const maxSubtasks = 2; // Maximale Anzahl der Subtasks
  const progressPercent = (totalSubtasks / maxSubtasks) * 100; // Prozent der abgeschlossenen Subtasks

  let progressBar = document.getElementById(`bar-fill-${taskId}`);
  if (progressBar) {
    progressBar.style.width = `${progressPercent}%`;
  }

  let subtaskText = document.getElementById(`subtasks-amount-${taskId}`);
  if (subtaskText) {
    subtaskText.textContent = `${totalSubtasks}/${maxSubtasks} Subtasks`;
  }
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

function openTaskInfos(
  taskId,
  title,
  description,
  category,
  dueDate,
  subtasks
) {
  let taskElement = document.getElementById(taskId);
  if (!taskElement) {
    console.error("Task-Element nicht gefunden:", taskId);
    return;
  }
  document.getElementById("all-task-infos").classList.remove("d-none");
  let currentTitle = taskElement.querySelector(
    ".board-task-card-description"
  ).textContent;
  let currentDescription = taskElement.querySelector(
    ".board-task-card-task"
  ).textContent;
  let currentCategory = taskElement.querySelector(
    ".board-task-card-title"
  ).textContent;
  let currentDueDate = taskElement.querySelector(
    ".board-task-card-date"
  ).textContent;

  let subtasksHtml = subtasks
    .map(
      (
        subtask,
        index 
      ) =>
        `<div class="hover-subtask column pointer" onmouseover="showIcons(${index})" onmouseout="hideIcons(${index})">
    ${subtask}
    <img id="edit-icon-${index}" onclick="editExistingSubtask(${index}, ${subtask})" src="../assets/icons/edit.svg" style="display:none;">
    <img id="delete-icon-${index}" onclick="deleteExistingSubtask(${index})" src="../assets/icons/delete.svg" style="display:none;">
  </div>`
    )
    .join("");
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

function editExistingSubtask(index, subtask) {
  let subtaskElement = document.getElementById(`subtask-${index}`);


  if (!subtaskElement) {
    console.error("Subtask-Element nicht gefunden:", index);
    return;
  }

  let editableSubtaskHtml = `
    <div>
      <input id="input-subtask-${index}" class="subtask-input" type="text" value="${subtask}">
      <img id="save-icon-${index}" onclick="saveEditedSubtask()" src="../assets/icons/correct.svg" style="display:inline;"/>
      <img id="cancel-icon-${index}" onclick="cancelEditSubtask()" src="../assets/icons/delete.svg" style="display:inline;"/>
    </div>`;

  subtaskElement.innerHTML = editableSubtaskHtml;
}

function showIcons(index) {
  document.getElementById(`edit-icon-${index}`).style.display = "inline";
  document.getElementById(`delete-icon-${index}`).style.display = "inline";
}

function hideIcons(index) {
  document.getElementById(`edit-icon-${index}`).style.display = "none";
  document.getElementById(`delete-icon-${index}`).style.display = "none";
}

function deleteTaskInfos(taskId) {
  console.log("Löschversuch für Task mit ID:", taskId);
  let taskElement = document.getElementById(taskId);
  if (taskElement) {
    taskElement.remove(); // Entfernt das Element aus dem DOM
  }
  let wholeTaskInfos = document.querySelector(".whole-task-infos");
  wholeTaskInfos.classList.add("d-none");
}

function editTaskInfos(taskId, encodedSubtasksHtml) {
  let taskInfoContainer = document.querySelector(".whole-task-infos");
  let subtasksHtml = decodeURIComponent(encodedSubtasksHtml);

  if (!taskInfoContainer) {
    console.error("Task-Info-Container nicht gefunden");
    return;
  }

  // Extrahiert die aktuellen Werte
  let title = taskInfoContainer.querySelector(".task-info-title").textContent;
  let description = taskInfoContainer.querySelector(
    ".task-info-description"
  ).textContent;
  let category = taskInfoContainer.querySelector(
    ".task-info-category"
  ).textContent;
  let dueDate = taskInfoContainer.querySelector(
    ".task-info-due-date .variable"
  ).textContent;

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
            ${subtasksHtml}
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
  // Löscht eine bestehende Subtask
  let subtaskElement = document.getElementById(`editable-subtask-${index}`);
  if (subtaskElement) {
    subtaskElement.remove();
  }
}

function saveEditedTaskInfo(taskId) {
  // Extrahiert die bearbeiteten Werte
  let editedTitle = document.getElementById(`edit-title-${taskId}`).value;
  let editedDescription = document.getElementById(
    `edit-description-${taskId}`
  ).value;
  let editedCategory = document.getElementById(`edit-category-${taskId}`).value;
  let editedDueDate = document.getElementById(`edit-due-date-${taskId}`).value;

  let taskElement = document.getElementById(taskId);
  if (taskElement) {
    taskElement.querySelector(".board-task-card-description").textContent =
      editedTitle;
    taskElement.querySelector(".board-task-card-task").textContent =
      editedDescription;
    taskElement.querySelector(".board-task-card-title").textContent =
      editedCategory;
    taskElement.querySelector(".board-task-card-date").textContent =
      editedDueDate;
  }


  let taskInfoContainer = document.querySelector(".whole-task-infos");
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
  openTaskInfos(
    taskId,
    editedTitle,
    editedDescription,
    editedCategory,
    editedDueDate
  );
}

function correctSubtask(taskId) {
  // taskId hinzugefügt
  let input = document.getElementById("add-subtasks").value.trim();
  if (input !== "") {
    const currentSubtasks = document.querySelectorAll(
      `#${taskId} .added-subtask`
    ).length;
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
      updateTaskProgress(taskId, 0, currentSubtasks + 1);
    } else {
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

function closeTaskInfos() {
  document.getElementById("all-task-infos").classList.add("d-none");
}

function setSelectedPriority(priority) {
  selectedPriority = priority;
  console.log("Priorität gesetzt auf:", selectedPriority);
}

/* function setPriority(priority, taskId) {
  let prioritySrc = {
    urgent: "../assets/icons/urgent3.svg",
    medium: "../assets/icons/medium.svg",
    low: "../assets/icons/low.svg",
  };

  let src = prioritySrc[priority] || "";
  document.getElementById(`priorities-todo-${taskId}`).src = src;
} */

function bindDragEvents(element) {
  element.addEventListener("dragstart", (e) => startDragging(e, element));
}

function startDragging(event, element) {
  event.dataTransfer.setData("text", event.target.id);
}

function allowDrop(event) {
  event.preventDefault();
}

function drop(event, targetId) {
  event.preventDefault();
  let data = event.dataTransfer.getData("text");
  let draggedElement = document.getElementById(data);
  let target = document.getElementById(targetId);
  if (target && draggedElement) {
    target.appendChild(draggedElement);
  }
}

function addTaskToDOM(task) {

  let newCard = document.getElementById(task.id);
  newCard.setAttribute("draggable", true);
  newCard.addEventListener("dragstart", (e) => startDragging(e, newCard));
}

function updateHTML() {
  let taskCards = document.querySelectorAll(".board-task-card");
  taskCards.forEach((card, index) => {
    card.setAttribute("draggable", true);
    card.setAttribute("id", "task-card-" + index); 
    card.addEventListener("dragstart", (e) => startDragging(e, card));
  });
}

function highlight(id) {
  document.getElementById(id).classList.add("drag-area-highlight");
}

function removeHighlight(id) {
  document.getElementById(id).classList.remove("drag-area-highlight");
}

function updateAssignedUserIcon(taskId, userIconPath) {
  let assignedToDiv = document.getElementById(`assigned-to-icon-${taskId}`);

  if (assignedToDiv && userIconPath) {
    assignedToDiv.innerHTML = "";  // Clear existing content

    let assignedUserIcon = document.createElement("img");
    assignedUserIcon.src = userIconPath;
    assignedUserIcon.alt = "Assigned User";
    assignedToDiv.appendChild(assignedUserIcon);
  }
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
  updateProgressBar();
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
  }
}

init();

