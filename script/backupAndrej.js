/*board.js */

let currentDraggedElement;
let taskIdCounter = 0;
let subtaskIdCounter = 0;
let addCount = 0;
let selectedPriority = null;
let isContactsVisible = false;
let selectedContactIcons = [];

async function init() {
  await includeHTML();
  displayLoggedInUser();
  updateHTML();
  AddPriorities();
  populateContactsDropdown();
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

    const contactsContainer = document.getElementById("contactsContainerTask");
    const selectToAssignInput = document.querySelector(".select-to-assign");
    const arrowDrop = document.getElementById("arrowDropImage");
    const selectedContactsContainer = document.getElementById("selectedContactsContainer");

    let contactColors = {}; // Store colors for each contact

    selectToAssignInput.addEventListener("click", toggleContactsVisibility);

    contactsContainer.innerHTML = '';
    renderContacts(userContacts, contactsContainer, selectedContactsContainer, contactColors);

  } catch (error) {
    console.error("Error loading contacts:", error);
  }
}

function toggleContactsVisibility() {
  const contactsContainer = document.getElementById("contactsContainerTask");
  const arrowDrop = document.getElementById("arrowDropImage");
  const selectedContactsContainer = document.getElementById("selectedContactsContainer");

  contactsContainer.style.display = (contactsContainer.style.display === "none") ? "flex" : "none";
  arrowDrop.style.transform = (contactsContainer.style.display === "none") ? "rotate(0deg)" : "rotate(180deg)";

  if (contactsContainer.style.display === "none") {
    updateSelectedContactsContainer(selectedContactsContainer);
    updateSelectedContactIcons(); // Update selectedContactIcons when the container is hidden
  }
}


function renderContacts(userContacts, contactsContainer, selectedContactsContainer, contactColors) {
  userContacts.forEach((contact) => {
    const { name, color } = contact;

    if (!name) {
      return;
    }

    const contactDiv = createContactDiv(name, color, contactColors);
    contactsContainer.appendChild(contactDiv);
  });
}


function createContactDiv(name, color, contactColors) {
  const contactDiv = document.createElement("div");
  contactDiv.classList.add("contact");
  contactDiv.style.display = "flex";
  contactDiv.style.marginBottom = "4px";
  contactDiv.style.marginTop = "4px";
  contactDiv.style.alignItems = "center";

  const contactIcon = document.createElement("div");
  contactIcon.classList.add("contact-icon");
  contactIcon.textContent = name.charAt(0).toUpperCase();

  // Generate and store color for each contact
  contactColors[name] = color || getRandomColor();
  contactIcon.style.backgroundColor = contactColors[name];
  contactIcon.style.color = "white";

  const contactName = document.createElement("span");
  contactName.textContent = name;

  const contactCheckbox = document.createElement("input");
  contactCheckbox.type = "checkbox";
  contactCheckbox.value = name;
  contactCheckbox.dataset.color = contactColors[name];
  contactCheckbox.classList.add("contact-checkbox");

  const spacer = document.createElement("div");
  spacer.style.flexGrow = 1;

  contactDiv.appendChild(contactIcon);
  contactDiv.appendChild(contactName);
  contactDiv.appendChild(spacer);
  contactDiv.appendChild(contactCheckbox);

  contactDiv.addEventListener("mouseover", function () {
    contactDiv.classList.add("hovered");
  });

  contactDiv.addEventListener("mouseout", function () {
    contactDiv.classList.remove("hovered");
  });

  contactDiv.addEventListener("click", function (event) {
    event.stopPropagation();

    contactCheckbox.checked = !contactCheckbox.checked;

    contactCheckbox.dispatchEvent(new Event("change"));
  });

  contactCheckbox.addEventListener("change", function () {
    let contactName = contactCheckbox.value;
  
    if (contactCheckbox.checked) {
      const contactDetails = {
        name: contactName,
        color: contactColors[contactName],
        letter: contactName.charAt(0).toUpperCase(),
      };
  
      selectedContactIcons.push(contactDetails);

      contactDiv.style.backgroundColor = "rgb(42,54,71)";
      contactDiv.style.color = "white";
    } else {

      selectedContactIcons = selectedContactIcons.filter((details) => details.name !== contactName);
  
      contactDiv.style.backgroundColor = "";
      contactDiv.style.color = "";
    }

    selectedContactsContainer.innerHTML = '';
  
    selectedContactIcons.forEach((details) => {
      const selectedContactIcon = document.createElement("div");
      selectedContactIcon.classList.add("contact-icon");
      selectedContactIcon.textContent = details.letter;
      selectedContactIcon.style.backgroundColor = details.color;
      selectedContactIcon.style.color = "white";
  
      selectedContactsContainer.appendChild(selectedContactIcon);
    });
  
    console.log("Selected Contact Icons:", selectedContactIcons);
  });

  return contactDiv;
}


function updateSelectedContactsContainer(selectedContactsContainer) {
  selectedContactsContainer.innerHTML = '';

  selectedContacts.forEach((name) => {
    const selectedContactIcon = document.createElement("div");
    selectedContactIcon.classList.add("contact-icon");
    selectedContactIcon.textContent = name.charAt(0).toUpperCase();
    selectedContactIcon.style.backgroundColor = contactColors[name];
    selectedContactIcon.style.color = "white";

    selectedContactsContainer.appendChild(selectedContactIcon);
  });
}

function updateSelectedContactIcons() {
  selectedContactIcons = selectedContacts.map((name) => {
    return {
      name: name,
      color: contactColors[name],
      letter: name.charAt(0).toUpperCase(),
    };
  });

  console.log("Selected Contact Icons:", selectedContactIcons);
}


function displayLoggedInUser() {
  const loggedInUserName = localStorage.getItem('loggedInUserName');

  if (loggedInUserName) {
    const userNameIcon = document.getElementById('board-user-icon');
    const firstLetter = loggedInUserName.charAt(0).toUpperCase();
    userNameIcon.textContent = firstLetter;
  }
}


function revealContacts() {
  const contactsContainer = document.getElementById("contactsContainerTask");
  const arrowDrop = document.getElementById("arrowDropImage");

  isContactsVisible = !isContactsVisible;
  contactsContainer.style.display = isContactsVisible ? "flex" : "none";

  arrowDrop.style.transform = isContactsVisible ? "rotate(180deg)" : "rotate(0deg)";
}


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
        <div id="contactsDropdownTask">
          <input class="select-to-assign" placeholder="Select contacts to assign">
          <img id="arrowDropImage" class="find-contact-img" src="../assets/icons/arrowDrop.png" onclick="revealContacts()">
        </div>
          </div>
          </div>
        <div class="contacts-container" id="contactsContainerTask"></div>
        <div class="selected-contacts-container "id="selectedContactsContainer"></div>


          
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

  populateContactsDropdown("contactsDropdownTask");
  bindSubtaskEvents();
  greyOverlay();
}


function greyOverlay() {
  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.style.zIndex = '5';
  document.body.appendChild(overlay);
  document.body.classList.add('no-scroll');
}


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
  selectedContacts = [];
    removeGreyOverlay();
}

function removeGreyOverlay() {
    const overlay = document.querySelector('.overlay');
    if (overlay) {
        document.body.removeChild(overlay);
        document.body.classList.remove('no-scroll');
    }
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

  let selectedContactsContainer = document.getElementById("selectedContactsContainer");
  let selectedContactsHtml = selectedContactsContainer.innerHTML;

  let iconsWrapper = document.createElement('div');
  iconsWrapper.className = 'icon-container task-icon-added';
  iconsWrapper.innerHTML = selectedContactsHtml.replace(/class="/g, 'class="task-contact-icon ');

  let selectedContacts = iconsWrapper.querySelectorAll('.task-contact-icon');
  selectedContacts.forEach((icon, index) => {
    icon.style.position = 'absolute';
    icon.style.left = `${index * 20 + 20}px`;
  });

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
        ${iconsWrapper.outerHTML}
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
  removeGreyOverlay();
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


// Function to map contacts for display
function mapContactsForDisplay(contacts) {
  return contacts.map((contact) => ({
    icon: contact.profileImage,
    name: contact.username,
  }));
}



function openTaskInfos(taskId, title, description, category, dueDate, subtasks) {
  let taskElement = document.getElementById(taskId);
  if (!taskElement) {
    console.error("Task-Element not found:", taskId);
    return;
  }

  document.getElementById("all-task-infos").classList.remove("d-none");
  let currentTitle = taskElement.querySelector(".board-task-card-description").textContent;
  let currentDescription = taskElement.querySelector(".board-task-card-task").textContent;
  let currentCategory = taskElement.querySelector(".board-task-card-title").textContent;
  let currentDueDate = taskElement.querySelector(".board-task-card-date").textContent;

  let subtasksHtml = subtasks
    .map(
      (subtask, index) =>
        `<div class="hover-subtask column pointer" onmouseover="showIcons(${index})" onmouseout="hideIcons(${index})">
          ${subtask}
          <img id="edit-icon-${index}" onclick="editExistingSubtask(${index}, '${subtask}')" src="../assets/icons/edit.svg" style="display:none;">
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
        <div class="here-comes-the-contact" id="selectedContactsPlaceholder">
          <!-- Selected contacts will be added here -->
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

  let selectedContactsPlaceholder = document.getElementById("selectedContactsPlaceholder");

  if (selectedContactsPlaceholder) {
    selectedContactsPlaceholder.innerHTML = "";

    for (let contact of selectedContactIcons) {
      let contactElement = document.createElement("div");

      let iconDiv = `<div class="self-made-icon" style="background-color: ${contact.color};">${contact.letter}</div>`;

      contactElement.innerHTML = `<div class="assigned-to-edit-contact">${iconDiv} ${contact.name}</div>`;
      selectedContactsPlaceholder.appendChild(contactElement);
    }
  }
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




















































































/*contacts.js */


let contacts = [];


async function init() {
  await includeHTML();
  const loggedInUserName = localStorage.getItem("loggedInUserName");
  if (!loggedInUserName) {
    displayContactsFromLocalStorage();
    return;
  }
  await loadContacts();
  await displayUserContacts();
}


function displayContactsFromLocalStorage() {
  const loggedInUserName = localStorage.getItem("loggedInUserName");

  if (!loggedInUserName) {
    displayGuestContacts();
  } else {
    try {
      loadAndDisplayUserContacts();
    } catch (error) {
      handleDisplayError(error);
    }
  }
}


function displayGuestContacts() {
  const guestContactsKey = "guestContacts";
  const guestContacts = JSON.parse(localStorage.getItem(guestContactsKey)) || [];

  guestContacts.forEach(displayGuestContact);
}


function displayGuestContact(contact) {
  const { name, email, phone, color } = contact;
  const initialLetter = name.charAt(0).toUpperCase();
  const newContactElement = createContactElement(name, email, initialLetter, phone, color);
  insertContactElement(newContactElement, initialLetter);
}


function loadAndDisplayUserContacts() {
  loadContacts();
  displayUserContacts();
}


function handleDisplayError(error) {
  console.error("Error displaying contacts:", error);
}


async function loadContacts() {
  try {
    const loggedInUserName = localStorage.getItem("loggedInUserName");
    if (!loggedInUserName) {
      return;
    }

    contacts = JSON.parse(await getItem(`contacts_${loggedInUserName}`)) || [];
  } catch (e) {
    console.error("Loading error:", e);
  }
}


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


function addNewContact() {
  const newContact = document.getElementById("add-new-contact");
  updateElementClass("contacts-div", "background", "add");
  updateElementClass("add-new-contact", "sign-up-animation", "add");
  updateElementClass("add-new-contact", "d-none", "remove");
  greyOverlay ();

  newContact.innerHTML = generateNewContactHTML();

  const newContactElement = createNewContactElement();
  newContactElement.onclick = showContact;
}


function greyOverlay () {
    // Create overlay and prevent scrolling
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.style.zIndex = '5';
    document.body.appendChild(overlay);
    document.body.classList.add('no-scroll');
}


function updateElementClass(elementId, className, action) {
  const element = document.getElementById(elementId);
  if (action === "add") {
    element.classList.add(className);
  } else {
    element.classList.remove(className);
  }
}


function generateNewContactHTML() {
  return /* HTML */ `
    <div id="add-new-contact-id" class="addNewContactDiv">
      <div class ="left-side-add-contact column">
        <div class="items-right">
        <div><img src="../assets/icons/logo.svg"></div>
        <h1>Add contact</h1>
        <span>Tasks are better with a team!</span>
        <div class="line"></div>
      </div>
      </div>
      <div class = "right-side-add-contact">
        <div class="close-div"><img onclick="closeAddContact()" class="close pointer" src="../assets/icons/close.svg"></div>
        <div class = "account center">
          <div class="adding-contact-icon"><img src="../assets/icons/person.png"></div>
        </div>
        <div>
          <form onsubmit="addingContact(); return false;">
            <div class="form-contacs">
              <div class="center">
                <input id="contactNameInput" class="log-in-field column center pointer" required type="text" placeholder="Name">
                <img class="log-in-mail-lock-icon" src="../assets/icons/person-small.png">
              </div>
              <div class="center">
                <input id="contactEmailInput" class="log-in-field column center pointer" required type="email" placeholder="Email">
                <img class="log-in-mail-lock-icon" src="../assets/icons/mail.png">
              </div>
              <div class="center">
                <input id="contactPhoneInput" class="log-in-field column center pointer" required type="number" placeholder="Phone">
                <img class="log-in-mail-lock-icon" src="../assets/icons/call.png">
              </div>
            </div>
            <div class="right-bottom">
              <div class="clear-and-create-task">
                <div class="clear pointer center" onclick="clearInputAddingContact()">
                  <span>Clear</span>
                  <img class="cancel1" src="../assets/icons/cancel.svg" alt="">
                  <img class="cancel2 d-none" src="../assets/icons/cancel2.svg" alt="">
                </div>
                <button class="create-task pointer center">
                  <span>Create contact</span>
                  <img src="../assets/icons/check.svg" alt="">
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}


function clearInputAddingContact() {
  document.getElementById("contactNameInput").value = "";
  document.getElementById("contactEmailInput").value = "";
  document.getElementById("contactPhoneInput").value = "";
}


function insertAfter(newNode, referenceNode) {
  var nextSibling = referenceNode.nextSibling;
  if (nextSibling) {
      referenceNode.parentNode.insertBefore(newNode, nextSibling);
  } else {
      referenceNode.parentNode.appendChild(newNode);
  }
}


function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}


async function addingContact() {
  const { name, email, phone } = getInputValues();
  const initialLetter = getInitialLetter(name);
  const newContactElement = createNewContactElement(name, email, initialLetter);

  insertNewContactElement(newContactElement);
  updateLetterContacts(initialLetter);
  clearInputAddingContact();

  const loggedInUserName = localStorage.getItem("loggedInUserName");
  if (!loggedInUserName) {
    handleGuestUserContact({ name, email, phone });
  } else {
    await handleLoggedInUserContact({ name, email, phone, loggedInUserName });
  }

  closeAddContact();
  successfullyCreatedContact();
  reloadPage();
}


function handleGuestUserContact({ name, email, phone }) {
  const guestContactsKey = "guestContacts";
  let guestContacts = JSON.parse(localStorage.getItem(guestContactsKey)) || [];

  const newContact = { name, email, phone, color: getRandomColor() };
  guestContacts.push(newContact);

  localStorage.setItem(guestContactsKey, JSON.stringify(guestContacts));
}


async function handleLoggedInUserContact({ name, email, phone, loggedInUserName }) {
  try {
    const contactsKey = `contacts_${loggedInUserName}`;
    let contacts = JSON.parse(await getItem(contactsKey)) || [];

    const newContact = { name, email, phone, color: getRandomColor() };
    contacts.push(newContact);

    await setItem(contactsKey, JSON.stringify(contacts));
  } catch (error) {
    console.error("Error saving contact to the server:", error);
  }
}


function getInputValues() {
  return {
    name: document.getElementById("contactNameInput").value,
    email: document.getElementById("contactEmailInput").value,
    phone: document.getElementById("contactPhoneInput").value,
  };
}


function getInitialLetter(name) {
  return name.charAt(0).toUpperCase();
}


function createNewContactElement(name, email, initialLetter) {
  const newContactElement = document.createElement("div");
  newContactElement.className = "added-contact pointer";
  newContactElement.onclick = showContact;
  const randomColor = getRandomColor();

  newContactElement.innerHTML = generateNewContactElementHTML(initialLetter, name, email, randomColor);
  return newContactElement;
}


function insertNewContactElement(newContactElement) {
  const contactsMenu = document.getElementById("contactsMenu");
  const referenceNode = contactsMenu.childNodes[1];
  insertAfter(newContactElement, referenceNode);
}


function successfullyCreatedContact() {
  let successMessage = document.getElementById("successMessage");
  successMessage.classList.remove("d-none");
  successMessage.classList.add("successfull-contact-animation");

  setTimeout(function () {
    successMessage.classList.add("move-to-right");
  }, 1300);

  setTimeout(function () {
    successMessage.classList.add("d-none");
    successMessage.classList.remove("successfull-contact-animation", "move-to-right");
  }, 1500);
}


function reloadPage() {
  location.reload();
}


function validateInputFields(name, email, phone) {
  return name && email && phone;
}


function generateNewContactElementHTML(initialLetter, name, email, randomColor) {
  return `
    <div class="primary-contact-icon-container">
      <div class="added-contact-icon" style="background-color: ${randomColor} !important; border: 4px solid white;">${initialLetter}</div>
    </div>
    <div class="moveRight">
      <p>${name}</p>
      <a class="contact-link">${email}</a>
    </div>
  `;
}


function updateLetterContacts(firstLetter) {
  const contactsMenu = document.getElementById("contactsMenu");
  const letterContacts = getLetterContactsArray(contactsMenu);

  const existingLetterContacts = findExistingLetterContacts(letterContacts, firstLetter);

  if (!existingLetterContacts) {
    const newLetterContacts = createNewLetterContacts(firstLetter);

    const insertIndex = getInsertIndex(letterContacts, firstLetter);
    insertNewLetterContacts(contactsMenu, newLetterContacts, letterContacts, insertIndex);
  }
}


function getLetterContactsArray(contactsMenu) {
  return Array.from(contactsMenu.getElementsByClassName("letter-contacts"));
}


function findExistingLetterContacts(letterContacts, firstLetter) {
  return letterContacts.find((element) => element.getAttribute("data-letter") === firstLetter);
}


function createNewLetterContacts(firstLetter) {
  const newLetterContacts = document.createElement("div");
  newLetterContacts.className = "letter-contacts";
  newLetterContacts.setAttribute("data-letter", firstLetter);
  newLetterContacts.innerHTML = `<p>${firstLetter}</p>`;
  return newLetterContacts;
}


function getInsertIndex(letterContacts, firstLetter) {
  return letterContacts.findIndex((element) => element.getAttribute("data-letter") > firstLetter);
}


function insertNewLetterContacts(contactsMenu, newLetterContacts, letterContacts, insertIndex) {
  if (insertIndex !== -1) {
    contactsMenu.insertBefore(newLetterContacts, letterContacts[insertIndex]);
  } else {
    contactsMenu.appendChild(newLetterContacts);
  }
}


function closeAddContact() {
  document.getElementById("add-new-contact").classList.add("d-none");
  document.getElementById("add-new-contact").classList.add("sign-up-animation-close");
  closeOverlay();
}


function closeOverlay() {
  const overlay = document.querySelector('.overlay');
  if (overlay) {
    document.body.removeChild(overlay);
  }
  document.body.classList.remove('no-scroll');
}


function showContact() {
  const contactInfoDiv = document.getElementById("contact-info");
  const contactInfoName = document.querySelector(".contact-info-name");
  const contactInfoIcon = document.querySelector(".contact-info-icon");
  const contactInfoLink = document.querySelector(".contact-link");
  const contactInfoDetails = document.querySelector(".contact-information-details span");

  const { name, email, initialLetter, color, phoneNumber } = getContactInfo(this);

  updateContactInfo(contactInfoName, contactInfoIcon, contactInfoLink, contactInfoDetails, name, email, initialLetter, color, phoneNumber);
  displayContactInfo(contactInfoDiv);
  generateEditContactFormHTML(name, email, phoneNumber, initialLetter, color);
}


function displayContactInfo(contactInfoDiv) {
  contactInfoDiv.style.display = 'block';
}


function getContactInfo(contactElement) {
  return {
    name: contactElement.querySelector(".moveRight p").innerText,
    email: contactElement.querySelector(".moveRight a").innerText,
    initialLetter: contactElement.querySelector(".added-contact-icon").innerText,
    color: contactElement.querySelector(".added-contact-icon").style.backgroundColor,
    phoneNumber: contactElement.getAttribute("data-phone-number"),
  };
}


function updateContactInfo(contactInfoName, contactInfoIcon, contactInfoLink, contactInfoDetails, name, email, initialLetter, color, phoneNumber) {
  contactInfoName.innerText = name;
  contactInfoIcon.innerText = initialLetter;
  contactInfoIcon.style.backgroundColor = color;
  contactInfoLink.innerText = email;
  contactInfoDetails.innerHTML = `
    <p>Email</p>
    <a class="contact-link">${email}</a>
    <p>Phone</p>
    <span>${phoneNumber}</span>
  `;
}


async function displayUserContacts() {
  const loggedInUserName = localStorage.getItem("loggedInUserName");

  if (!loggedInUserName) {
    return;
  }

  try {
    const response = await fetch(`${STORAGE_URL}?user=${loggedInUserName}&token=${STORAGE_TOKEN}&key=contacts_${loggedInUserName}`);
    const responseText = await response.text();

    console.log("Server response status:", response.status);
    console.log("Server response body:", responseText);

    if (response.ok) {
      try {
        const serverResponse = JSON.parse(responseText);

        if (serverResponse && serverResponse.status === "success" && serverResponse.data && serverResponse.data.value) {
          const savedContacts = JSON.parse(serverResponse.data.value);

          if (Array.isArray(savedContacts)) {
            savedContacts.forEach((contact) => {
              const { name, email, phone, color } = contact;

              // Skip contacts with empty names, emails, and phones
              if (name.trim() !== "" || email.trim() !== "" || phone.trim() !== "") {
                const initialLetter = name.charAt(0).toUpperCase();
                const newContactElement = createContactElement(name, email, initialLetter, phone, color);
                insertContactElement(newContactElement, initialLetter);
              }
            });
          } else {
            console.error("Invalid contacts format received from the server. Expected an array.");
          }
        } else {
          console.error("Invalid server response. Missing 'status' or 'data' properties.");
          console.error("Server response:", serverResponse);
        }
      } catch (error) {
        console.error("Error parsing JSON:", error);
        console.error("Invalid contacts format received from the server.");
      }
    } else {
      console.error("Invalid server response:", response.status);
    }
  } catch (error) {
    console.error("Error fetching contacts from the server:", error);
  }
}



function getSortedContacts(loggedInUserName) {
  const userContactsKey = `contacts_${loggedInUserName}`;
  const savedContacts = JSON.parse(localStorage.getItem(userContactsKey)) || [];

  return savedContacts.sort((a, b) => a.name.localeCompare(b.name)); // Sort contacts alphabetically by name
}


function createContactElement(name, email, initialLetter, phone, color) {
  const newContactElement = document.createElement("div");
  newContactElement.className = "added-contact pointer";
  newContactElement.onclick = showContact;
  newContactElement.setAttribute("data-phone-number", phone);
  newContactElement.innerHTML = generateContactElementHTML(name, email, initialLetter, color);
  return newContactElement;
}


function generateContactElementHTML(name, email, initialLetter, color) {
  return `
    <div class="primary-contact-icon-container">
      <div class="added-contact-icon" style="background-color: ${color} !important; border: 4px solid white;">${initialLetter}</div>
    </div>
    <div class="moveRight">
      <p>${name}</p>
      <a class="contact-link">${email}</a>
    </div>
  `;
}


function insertContactElement(newContactElement, initialLetter) {
  const contactsMenu = document.getElementById("contactsMenu");
  const letterContacts = Array.from(contactsMenu.getElementsByClassName("letter-contacts"));
  let letterGroup = getOrCreateLetterGroup(letterContacts, initialLetter);

  letterGroup.appendChild(newContactElement);
}


function getOrCreateLetterGroup(letterContacts, initialLetter) {
  let letterGroup = letterContacts.find((element) => element.getAttribute("data-letter") === initialLetter);

  if (!letterGroup) {
    letterGroup = createLetterGroup(initialLetter);
    insertLetterGroup(letterGroup, letterContacts, initialLetter);
  }

  return letterGroup;
}


function createLetterGroup(initialLetter) {
  const letterGroup = document.createElement("div");
  letterGroup.className = "letter-contacts";
  letterGroup.setAttribute("data-letter", initialLetter);
  letterGroup.innerHTML = `<p>${initialLetter}</p>`;
  return letterGroup;
}


function insertLetterGroup(letterGroup, letterContacts, initialLetter) {
  const contactsMenu = document.getElementById("contactsMenu");
  const insertIndex = letterContacts.findIndex((element) => element.getAttribute("data-letter") > initialLetter);

  if (insertIndex !== -1) {
    contactsMenu.insertBefore(letterGroup, letterContacts[insertIndex]);
  } else {
    contactsMenu.appendChild(letterGroup);
  }
}


async function deleteContact() {
  const contactInfoDiv = document.getElementById("contact-info");
  const contactName = getContactName();
  const contactsLayout = document.getElementById("contactsLayout");

  // Remove contact from UI
  const contactToDelete = findContactToDelete(contactsLayout, contactName);
  removeContactFromLayout(contactsLayout, contactToDelete);

  // If logged in, delete contact from the server
  const loggedInUserName = getLoggedInUserName();
  if (loggedInUserName) {
    await deleteContactFromServer(contactName);
  } else {
    // If not logged in, delete contact from local storage
    const guestContactsKey = "guestContacts";
    const guestContacts = JSON.parse(localStorage.getItem(guestContactsKey)) || [];
    const guestContactIndex = guestContacts.findIndex(contact => contact.name === contactName);

    if (guestContactIndex !== -1) {
      guestContacts.splice(guestContactIndex, 1);
      localStorage.setItem(guestContactsKey, JSON.stringify(guestContacts));
    }
  }

  hideContactInfo(contactInfoDiv);
  reloadPage();
}




function getContactName() {
  return document.querySelector(".contact-info-name").innerText;
}


function findContactToDelete(contactsLayout, contactName) {
  return Array.from(contactsLayout.getElementsByClassName("added-contact"))
    .find(contact => contact.querySelector(".moveRight p").innerText === contactName);
}


function removeContactFromLayout(contactsLayout, contactToDelete) {
  if (contactToDelete) {
    contactsLayout.removeChild(contactToDelete);
  }
}


async function deleteContactFromServer(contactName) {
  const loggedInUserName = getLoggedInUserName();

  if (!loggedInUserName) {
    logError("No logged-in user found. Contact cannot be deleted from the server.");
    return;
  }

  const key = `contacts_${loggedInUserName}`;

  try {
    const contactsData = await getItem(key);
    const contacts = JSON.parse(contactsData);

    // Find the index of the contact to delete
    const contactIndex = contacts.findIndex(contact => contact.name === contactName);

    if (contactIndex !== -1) {
      contacts.splice(contactIndex, 1);
      await setItem(key, JSON.stringify(contacts));

      console.log(`Contact ${contactName} deleted successfully from the server.`);
    } else {
      console.error(`Error deleting contact ${contactName} from the server. Contact not found.`);
    }
  } catch (error) {
    console.error("Error deleting contact from the server:", error);
  }
}



function getLoggedInUserName() {
  return localStorage.getItem("loggedInUserName");
}


function logError(errorMessage) {
  console.error(errorMessage);
}


function getUserContactsKey(loggedInUserName) {
  return `contacts_${loggedInUserName}`;
}


function getExistingContacts(userContactsKey) {
  return JSON.parse(localStorage.getItem(userContactsKey)) || [];
}


function findContactIndex(existingContacts, contactName) {
  return existingContacts.findIndex(contact => contact.name === contactName);
}


function removeContact(existingContacts, contactIndex) {
  if (contactIndex !== -1) {
    existingContacts.splice(contactIndex, 1);
  }
}


function hideContactInfo(contactInfoDiv) {
  contactInfoDiv.style.display = "none";
}


function reloadPage() {
  location.reload();
}


async function editContact() {
  const contactName = document.querySelector(".contact-info-name").innerText;

  // If logged in, fetch contacts from the server
  const loggedInUserName = localStorage.getItem("loggedInUserName");
  if (loggedInUserName) {
    const key = `contacts_${loggedInUserName}`;

    try {
      const contactsData = await getItem(key);
      const existingContacts = JSON.parse(contactsData) || [];

      const contactToEdit = existingContacts.find(contact => contact.name === contactName);

      if (!contactToEdit) {
        console.error("Contact not found on the server.");
        return;
      }

      openEditContactForm(contactToEdit, existingContacts.indexOf(contactToEdit));
    } catch (error) {
      console.error("Error fetching contacts from the server:", error);
    }
  } else {
    // If not logged in, fetch contacts from local storage
    const guestContactsKey = "guestContacts";
    const guestContacts = JSON.parse(localStorage.getItem(guestContactsKey)) || [];
    const guestContactToEdit = guestContacts.find(contact => contact.name === contactName);

    if (!guestContactToEdit) {
      console.error("Contact not found in local storage.");
      return;
    }

    openEditContactForm(guestContactToEdit, guestContacts.indexOf(guestContactToEdit));
  }
}

function openEditContactForm(contactToEdit, contactIndex) {
  const { name, email, phone, color } = contactToEdit;
  const initialLetter = name.charAt(0).toUpperCase();

  const editContactDiv = document.getElementById("add-new-contact");
  const addNewContactDiv = document.getElementById("add-new-contact");

  [editContactDiv, addNewContactDiv].forEach(elem => elem.classList.add("sign-up-animation"));
  addNewContactDiv.classList.remove("d-none");

  greyOverlay();

  editContactDiv.innerHTML = generateEditContactFormHTML(contactToEdit, contactIndex);
}




function generateEditContactFormHTML(contactToEdit, contactIndex) {
  const { name, email, phone, color } = contactToEdit;
  const initialLetter = name.charAt(0).toUpperCase();

  return /* HTML */ `
    <div id="edit-contact-id" class="addNewContactDiv">
      <div class="left-side-add-contact column">
        <div class="items-right">
          <div><img src="../assets/icons/logo.svg"></div>
          <h1>Edit contact</h1>
          <span></span>
          <div class="line"></div>
        </div>
      </div>
      <div class="right-side-add-contact">
        <div class="close-div"><img onclick="closeAddContact()" class="close pointer" src="../assets/icons/close.svg"></div>
        <div class="account center">
          <div class="adding-contact-icon" style="background-color: ${color}">${initialLetter}</div>
        </div>
        <div>
          <form onsubmit="return false;">
            <div class="form-contacs">
              <div class="center">
                <input id="contactNameInput" class="log-in-field column center pointer" required type="text" placeholder="Name" value="${name}">
                <img class="log-in-mail-lock-icon" src="../assets/icons/person-small.png">
              </div>
              <div class="center">
                <input id="contactEmailInput" class="log-in-field column center pointer" required type="email" placeholder="Email" value="${email}">
                <img class="log-in-mail-lock-icon" src="../assets/icons/mail.png">
              </div>
              <div class="center">
                <input id="contactPhoneInput" class="log-in-field column center pointer" required type="number" placeholder="Phone" value="${phone}">
                <img class="log-in-mail-lock-icon" src="../assets/icons/call.png">
              </div>
            </div>
            <div class="right-bottom">
              <div class="clear-and-update-contact">
                <div class="clear pointer center" onclick="deleteContact()">
                  <span>Delete</span>
                  <img class="cancel1" src="../assets/icons/cancel.svg" alt="">
                  <img class="cancel2 d-none" src="../assets/icons/cancel2.svg" alt="">
                </div>
                <div class="update-contact pointer center" onclick="updateContact(${contactIndex})">
                  <span>Save</span>
                  <img src="../assets/icons/check.svg" alt="">
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}


async function updateContact(index) {
  const [name, email, phone] = ["contactNameInput", "contactEmailInput", "contactPhoneInput"].map(getValueById);
  if (!validateInputFields(name, email, phone)) return console.error("Please fill in all fields.");

  const loggedInUserName = localStorage.getItem("loggedInUserName");

  // If logged in, update the contact on the server
  if (loggedInUserName) {
    const key = `contacts_${loggedInUserName}`;

    try {
      const contactsData = await getItem(key);
      const contacts = JSON.parse(contactsData) || [];

      const contact = contacts[index];

      if (!contact) {
        console.error("Contact not found.");
        return;
      }

      const updatedContact = { ...contact, name, email, phone };

      // Update the contact on the server
      contacts[index] = updatedContact;
      await setItem(key, JSON.stringify(contacts));
    } catch (error) {
      console.error("Error updating contact on the server:", error);
    }
  } else {
    // If not logged in, update the contact in local storage
    const guestContactsKey = "guestContacts";
    let guestContacts = JSON.parse(localStorage.getItem(guestContactsKey)) || [];

    const guestContact = guestContacts[index];

    if (!guestContact) {
      console.error("Contact not found in local storage.");
      return;
    }

    const updatedGuestContact = { ...guestContact, name, email, phone };

    guestContacts[index] = updatedGuestContact;
    localStorage.setItem(guestContactsKey, JSON.stringify(guestContacts));
  }

  // Close the edit-contact div
  closeAddContact();

  // Reload the page or update the UI as needed
  reloadPage();
}



function getValueById(id) {
  return document.getElementById(id).value;
}


function validateInputFields(...values) {
  return values.every(value => value.trim() !== '');
}


init();