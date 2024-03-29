let currentDraggedElement;
let taskIdCounter = 0;
let subtaskIdCounter = 0;
let addCount = 0;
let selectedPriority = null;
let isContactsVisible = false;
let selectedContactIcons = [];

let selectedPriorityName = null;

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

    let contactColors = {};

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
    updateSelectedContactIcons();
  }
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
  updateNoTaskDivs();
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
  let totalSubtasks = subtasks.length; 
  const taskId = `task-${taskIdCounter++}`; 

  let priorityImage = "";
let priorityName = "";
switch (selectedPriority) {
  case "urgent":
    priorityImage = "../assets/icons/urgent3.svg";
    priorityName = "Urgent";
    break;
  case "medium":
    priorityImage = "../assets/icons/medium.svg";
    priorityName = "Medium";
    break;
  case "low":
    priorityImage = "../assets/icons/low.svg";
    priorityName = "Low";
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

  let categoryClass = "";
  if (category === "Technical Task") {
    categoryClass = "category-technical";
  } else if (category === "User Story") {
    categoryClass = "category-user-story";
  }

  let taskHTML = `
  <div id="${taskId}" class="board-task-card pointer" ondragstart="startDragging(event)" draggable="true" onclick="openTaskInfos('${taskId}', '${title}', '${description}', '${category}', '${dueDate}', ${JSON.stringify(subtasks).split('"').join("&quot;")}, '${priorityName}', '${priorityImage}')">
  <div class="board-task-card-title ${categoryClass}">${category}</div>
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
function mapContactsForDisplay(contacts) {
  return contacts.map((contact) => ({
    icon: contact.profileImage,
    name: contact.username,
  }));
}

function openTaskInfos(taskId,title,description,category,dueDate,subtasks,priorityName,priorityImage
) {
  let priorityHtml = `
  <div class="task-info-priority-name">${priorityName}</div>
  <img src="${priorityImage}" class="task-info-priority-image">
`;
  let taskElement = document.getElementById(taskId);

  document.getElementById("all-task-infos").classList.remove("d-none");
  
  let currentTitle = taskElement.querySelector(
    ".board-task-card-description"
  ).textContent;
  let currentDescription = taskElement.querySelector(".board-task-card-task").textContent;
  let currentCategory = taskElement.querySelector(
    ".board-task-card-title"
  ).textContent;
  let currentDueDate = taskElement.querySelector(
    ".board-task-card-date"
  ).textContent;

  let subtasksHtml = subtasks.map((subtask, index) =>
        `<div class="hover-subtask column pointer" onmouseover="showIcons(${index})" onmouseout="hideIcons(${index})">
    ${subtask}
    <img id="edit-icon-${index}" onclick="editExistingSubtask(${index}, ${subtask})" src="../assets/icons/edit.svg" style="display:none;">
    <img id="delete-icon-${index}" onclick="deleteExistingSubtask(${index})" src="../assets/icons/delete.svg" style="display:none;">
  </div>`
  ).join("");
  let encodedSubtasksHtml = encodeURIComponent(subtasksHtml);
  document.getElementById("all-task-infos").classList.remove("d-none");
  let allTaskInfos = document.getElementById("all-task-infos");

  let categoryClass = "";
  if (category === "Technical Task") {
    categoryClass = "category-technical";
  } else if (category === "User Story") {
    categoryClass = "category-user-story";
  }

  allTaskInfos.innerHTML = `
  <div class="whole-task-infos absolute">
  <div class="task-info-top">
  <div class="task-info-category ${categoryClass}">${currentCategory}</div>
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
    ${priorityHtml}
  </div>
  <div class="task-info-assigned-to">
        <div class="headline3">Assigned To:</div>
        <div class="here-comes-the-contact" id="selectedContactsPlaceholder">
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
    <div onclick="editTaskInfos('${taskId}', '${encodedSubtasksHtml}','${priorityName}', '${priorityImage}')" class="task-info-edit pointer center"> 
      <img class="img3" src="../assets/icons/edit2.svg" alt="">
      <img class="img4 d-none" src="../assets/icons/edit2.png" alt="">
      <span><b>Edit</b></span>
    </div>
  </div>
</div>
  `
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
  updateNoTaskDivs();
}

function editTaskInfos(taskId, encodedSubtasksHtml, priorityName, priorityImage){
  let taskInfoContainer = document.querySelector(".whole-task-infos");
  let subtasksHtml = decodeURIComponent(encodedSubtasksHtml);

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
  `
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
  let editedDescription = document.getElementById(`edit-description-${taskId}`).value;
  let editedCategory = document.getElementById(`edit-category-${taskId}`).value;
  let editedDueDate = document.getElementById(`edit-due-date-${taskId}`).value;

  let priorityElement = document.getElementById("edit-priority-" + taskId);
if (priorityElement) {
    let selectedPriority = priorityElement.value;
} else {
    console.error("Element nicht gefunden: edit-priority-" + taskId);
}
let priorityName, priorityImage;
switch (selectedPriority) {
  case 'urgent':
    priorityName = 'Urgent';
    priorityImage = "../assets/icons/urgent3.svg";
    break;
    case 'medium':
      priorityName = 'Medium';
      priorityImage = "../assets/icons/medium.svg";
      break;
    case 'low':
      priorityName = 'Low';
      priorityImage = "../assets/icons/low.svg";
      break;
  }

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
  if (taskElement) {
      let priorityElement = taskElement.querySelector(".board-task-card-priority");
      priorityElement.dataset.priorityName = priorityName;
      priorityElement.querySelector("img").src = priorityImage;
  }

  if (taskElement) {
    let priorityImgElement = taskElement.querySelector(".board-task-card-priority img");
    if (priorityImgElement) {
      priorityImgElement.src = priorityImage;
    }
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
      <div>Priority:</div>
      <div class="task-info-priority-name">${priorityName}</div>
      <img src="${priorityImage}" class="task-info-priority-image">

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
    editedTitle, // oder title, falls Sie den ursprünglichen Titel behalten
    editedDescription, // oder description
    editedCategory, // oder category
    editedDueDate, // oder dueDate
    priorityName, // Aktualisierter Wert
    priorityImage // Aktualisierter Wert
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
    // Definitionen für Hintergrundfarben und Bildklassen
    const prioritySettings = {
      'urgent': { color: '#ff3d00', textColor: 'white', imgToShow: 'urgent2', imgToHide: 'urgent1' },
      'medium': { color: '#ffa800', textColor: 'white', imgToShow: 'medium2', imgToHide: 'medium1' },
      'low': { color: '#7ae229', textColor: 'white', imgToShow: 'low2', imgToHide: 'low1' }
    };
  
    // Zurücksetzen aller Prioritäten
    document.querySelectorAll('.prioprity-urgent, .prioprity-medium, .prioprity-low').forEach(priorityElement => {
      priorityElement.style.backgroundColor = ''; // Zurücksetzen der Hintergrundfarbe
      priorityElement.style.color = 'black'; // Zurücksetzen der Textfarbe
      priorityElement.querySelectorAll('img').forEach(img => img.classList.toggle('d-none', img.classList.contains(prioritySettings[priority].imgToShow)));
    });
  
    // Aktualisieren des ausgewählten Elements
    let selectedElement = document.getElementById(`priority-${priority}-todo`);
    if (selectedElement) {
      selectedElement.style.backgroundColor = prioritySettings[priority].color;
      selectedElement.style.color = prioritySettings[priority].textColor; // Setzen der Textfarbe
      selectedElement.querySelector(`.${prioritySettings[priority].imgToHide}`).classList.add('d-none');
      selectedElement.querySelector(`.${prioritySettings[priority].imgToShow}`).classList.remove('d-none');
    }
  
  selectedPriority = priority;
  switch (priority) {
    case 'urgent':
      selectedPriorityName = 'Urgent';
      break;
    case 'medium':
      selectedPriorityName = 'Medium';
      break;
    case 'low':
      selectedPriorityName = 'Low';
      break;
  }
  console.log("Priorität gesetzt auf:", selectedPriority, selectedPriorityName);
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
    updateNoTaskDivs();
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

function updateNoTaskDivs() {
  const departmentIds = ['todo', 'inprogress', 'awaitingfeedback', 'done'];
  
  departmentIds.forEach((id, index) => {
    const taskContainer = document.getElementById(id);
    const noTaskDivs = document.getElementsByClassName('board-column-empty');
    const noTaskDiv = noTaskDivs[index]; // Wählt das entsprechende no-task div basierend auf der Reihenfolge

    if (taskContainer && noTaskDiv) {
      const tasks = taskContainer.getElementsByClassName('board-task-card');
      noTaskDiv.style.display = tasks.length > 0 ? 'none' : 'grid';
    } else {
      console.error('Task container or no task message div not found for:', id);
    }
  });
}




init();