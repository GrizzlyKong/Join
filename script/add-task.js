let currentDraggedElement;
let currentEditingTaskId = null;
let taskIdCounter = 0;
let subtaskIdCounter = 0;
let addCount = 0;
let selectedPriority = null;
let isContactsVisible = false;
let taskContacts = [];
let selectedContactIcons = [];
let allTasks = [];
let selectedPriorityName = null;


async function init() {
  await includeHTML();
  displayLoggedInUser();
  await populateContactsDropdown();
  await loadTasks();
  await addTask();
}


function guestUsesLocalStorage() {
  const loggedInUserName = localStorage.getItem('loggedInUserName');
  return !loggedInUserName;
}


async function saveTasks() {
  if (guestUsesLocalStorage()) {
    try {
      localStorage.setItem('allTasks', JSON.stringify(allTasks));
      console.log('Tasks saved successfully to localStorage');
    } catch (error) {
      console.error('Error saving tasks to localStorage:', error);
    }
  } else {
    try {
      await setItem('allTasks', JSON.stringify(allTasks));
      console.log('Tasks saved successfully to server');
    } catch (error) {
      console.error('Error saving tasks to server:', error);
    }
  }
}


async function loadTasks() {
  allTasks = [];
  if (guestUsesLocalStorage()) {
    await loadTasksFromLocalStorage();
  } else {
    await loadTasksFromServer();
  }
}


async function loadTasksFromLocalStorage() {
  try {
    const tasks = localStorage.getItem('allTasks');
    allTasks = tasks ? JSON.parse(tasks) : [];
    console.log('Tasks loaded successfully from localStorage');
  } catch (error) {
    console.error('Error loading tasks from localStorage:', error);
  }
}


async function loadTasksFromServer() {
  const url = `${STORAGE_URL}?key=allTasks&token=${STORAGE_TOKEN}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data && data.data.value) {
      allTasks = JSON.parse(data.data.value);
    } else {
      console.log('No tasks found or empty dataset returned from server.');
    }
  } catch (error) {
    console.error('Error fetching tasks:', error);
  }
}


async function addTask() {
  let addToTask = document.getElementById("add-task");
  document.getElementById("add-task").classList.remove("d-none");
  addToTask.innerHTML = `
  <form onsubmit="addTodo(); return false;" class="addTaskForm">
  <div class="headline-div">
    <h1>Add Task</h1>
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
          <input class="select-to-assign" placeholder="Select contacts to assign" readonly="readonly">
          <img id="arrowDropImage" class="find-contact-img" src="../assets/icons/arrowDrop.png" alt"a picture of an arrow pointing downwards" onclick="revealContacts()">
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
                <img class="urgent1" src="../assets/icons/urgent3.svg" alt="an image of a thing - Urgent">
                <img class="urgent2 d-none" src="../assets/icons/urgent2.svg" alt="an image of a thing - Urgent">
              </div>
            </div>
            <div id="priority-medium-todo" tabindex="2" class="prioprity-medium pointer center" onclick="setSelectedPriority('medium')">
              <div>Medium</div>
              <div>
                <img class="medium1" src="../assets/icons/medium.svg" alt="an image of a thing - medium">
                <img class="medium2 d-none" src="../assets/icons/medium2.svg" alt="an image of a thing - medium">
              </div>
            </div>
            <div id="priority-low-todo" tabindex="3" class="prioprity-low pointer center" onclick="setSelectedPriority('low')">
              <div>Low</div>
              <div>
                <img class="low1" src="../assets/icons/low.svg" alt="an image of a thing - low">
                <img class="low2 d-none" src="../assets/icons/low2.svg" alt="an image of a thing - low">
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
        <img id="subtask-add" class="input-icon2 pointer" src="../assets/icons/add.svg" alt"an image of a plus">
      <div class="oninput">
        <img onclick="cancelSubtask()" id="subtask-cancel" class="input-icon3 d-none pointer center" src="../assets/icons/cancelX.svg" alt"a picture of a X">
        <img onclick="correctSubtask()" id="subtask-correct" class="input-icon4 d-none pointer center" src="../assets/icons/correct.svg" alt"a picture of a hook">
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
          <img class="cancel1" src="../assets/icons/cancel.svg" alt="a picture of a X">
          <img class="cancel2 d-none" src="../assets/icons/cancel2.svg" alt="a picture of a X">
        </button>
        <button type="submit" class="create-task pointer center">
          <span>Create Task</span>
          <img src="../assets/icons/check.svg" alt="a picture of a hook">
        </button>
      </div>
    </div>
  </div>
</form>
  `;
  populateContactsDropdown("contactsDropdownTask");
  bindSubtaskEvents();
}


function displayLoggedInUser() {
  const loggedInUserName = localStorage.getItem('loggedInUserName');
  if (loggedInUserName) {
    const userNameIcon = document.getElementById('board-user-icon');
    const firstLetter = loggedInUserName.charAt(0).toUpperCase();
    userNameIcon.textContent = firstLetter;
  }
}


async function populateContactsDropdown() {
  try {
      taskContacts = await fetchAndFilterContacts();
      if (isContactsListEmpty(taskContacts)) return;
      const uiElements = getUIElements();
      if (uiElementsMissing(uiElements)) return;
      setupUIEventListeners(uiElements.selectToAssignInput);
      prepareContactsContainer(uiElements.contactsContainer, taskContacts, uiElements.selectedContactsContainer);
  } catch (error) {
      console.error("Error in populateContactsDropdown:", error);
  }
}


function isContactsListEmpty(taskContacts) {
    if (taskContacts.length === 0) {
        console.log("No contacts found or an error occurred while fetching contacts.");
        return true;
    }
    return false;
}


function getUIElements() {
    const contactsContainer = document.getElementById("contactsContainerTask");
    const selectToAssignInput = document.querySelector(".select-to-assign");
    const arrowDrop = document.getElementById("arrowDropImage");
    const selectedContactsContainer = document.getElementById("selectedContactsContainer");
    return { contactsContainer, selectToAssignInput, arrowDrop, selectedContactsContainer };
}


function uiElementsMissing({ contactsContainer, selectToAssignInput, arrowDrop, selectedContactsContainer }) {
    if (!selectToAssignInput || !contactsContainer || !selectedContactsContainer || !arrowDrop) {
        return true;
    }
    return false;
}


function setupUIEventListeners(selectToAssignInput) {
    selectToAssignInput.removeEventListener("click", toggleContactsVisibility);
    selectToAssignInput.addEventListener("click", toggleContactsVisibility);
}


function prepareContactsContainer(contactsContainer, taskContacts, selectedContactsContainer) {
    let contactColors = {};
    contactsContainer.innerHTML = '';
    renderContacts(taskContacts, contactsContainer, selectedContactsContainer, contactColors);
}


async function addTodo() {
  const title = document.getElementById("title-todo").value;
  const description = document.getElementById("description-todo").value;
  const category = document.getElementById("category-todo").value;
  const dueDate = document.getElementById("date-todo").value;
  const subtasks = getSubtasks();
  const taskId = generateUniqueId();
  const priorityImage = getPriorityImage();
  const priorityName = getPriorityName();
  const task = createTask(taskId, title, description, category, dueDate, subtasks, priorityName, priorityImage);
  addToAllTasks(task);
  updateTaskHtml(task);
  resetSelections();
  await saveTasks();
  location.replace("../html/board.html");
}


function getSubtasks() {
  return Array.from(document.querySelectorAll("#added-subtasks .added-subtask")).map(subtask => subtask.textContent.trim());
}

function generateUniqueId() {
  let uniqueIdFound = false;
  let taskId;
  while (!uniqueIdFound) {
    taskId = `task-${taskIdCounter}`;
    if (!allTasks.some(task => task.id === taskId)) {
      uniqueIdFound = true;
    } else {
      taskIdCounter++;
    }
  }
  return taskId;
}

function getPriorityImage() {
  let priorityImage = "";
  switch (selectedPriority) {
    case "urgent":
      priorityImage = "../assets/icons/urgent3.svg";
      break;
    case "medium":
      priorityImage = "../assets/icons/medium.svg";
      break;
    case "low":
      priorityImage = "../assets/icons/low.svg";
      break;
  }
  return priorityImage;
}

function getPriorityName() {
  let priorityName = "";
  switch (selectedPriority) {
    case "urgent":
      priorityName = "Urgent";
      break;
    case "medium":
      priorityName = "Medium";
      break;
    case "low":
      priorityName = "Low";
      break;
  }
  return priorityName;
}

function createTask(id, title, description, category, dueDate, subtasks, priorityName, priorityImage) {
  return {
    id: id,
    title: title,
    description: description,
    category: category,
    dueDate: dueDate,
    subtasks: subtasks,
    priority: priorityName,
    priorityImage: priorityImage,
    contacts: [...selectedContactIcons]
  };
}

function addToAllTasks(task) {
  allTasks.push(task);
}

function updateTaskHtml(task) {
  const contactsHtml = task.contacts.map(contact => {
    return `<div class="task-contact-icon" style="background-color: ${contact.color};">${contact.letter}</div>`;
  }).join('');

  let categoryClass = "";
  if (task.category === "Technical Task") {
    categoryClass = "category-technical";
  } else if (task.category === "User Story") {
    categoryClass = "category-user-story";
  }

  const totalSubtasks = task.subtasks.length;
  const taskHTML = `
    <div id="${task.id}" class="board-task-card pointer" ondragstart="startDragging(event)" draggable="true" onclick="openTaskInfos('${task.id}', '${task.title}', '${task.description}', '${task.category}', '${task.dueDate}', ${JSON.stringify(task.subtasks).split('"').join("&quot;")}, '${task.priority}', '${task.priorityImage}')">
      <div class="board-task-card-title ${categoryClass}">${task.category}</div>
      <div class="board-task-card-description">${task.title}</div>
      <div class="board-task-card-task">${task.description}</div>
      <div class="board-task-card-date d-none">${task.dueDate}</div>
      <div class="board-task-card-subtasks">
        <div class="board-task-card-subtasks-bar">
          <div id="bar-fill-${task.id}" class="bar-fill" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100"></div>
        </div>
        <div id="subtasks-amount-${task.id}" class="board-task-card-subtasks-amount">${totalSubtasks}/2 Subtasks</div>
      </div>
      <div class="icon-container task-icon-added">${contactsHtml}</div>
      <div class="board-task-card-priority">
        <img id="priority-img-${task.id}" src="${task.priorityImage}">
      </div>
    </div>
  `;
}


function resetSelections() {
  selectedContactIcons = [];
  selectedPriority = null;
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


async function fetchAndFilterContacts() {
  try {
      const loggedInUserName = localStorage.getItem("loggedInUserName");
      if (!loggedInUserName) {
          console.error("No logged-in user found. Contacts cannot be loaded.");
          return [];
      }
      const contactsData = await getItem(`contacts_${loggedInUserName}`);
      const parsedContacts = JSON.parse(contactsData) || [];
      const filteredContacts = parsedContacts.filter(contact => contact.name || contact.email || contact.phone);
      return filteredContacts;
  } catch (error) {
      console.error("Error loading contacts:", error);
      return [];
  }
}


function toggleContactsVisibility() {
  const contactsContainer = document.getElementById("contactsContainerTask");
  const arrowDrop = document.getElementById("arrowDropImage");
  const selectedContactsContainer = document.getElementById("selectedContactsContainer");
  contactsContainer.style.display = (contactsContainer.style.display === "none") ? "flex" : "none";
  arrowDrop.style.transform = (contactsContainer.style.display === "none") ? "rotate(0deg)" : "rotate(180deg)";
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
  const contactDiv = createMainContactDiv();
  appendContactIcon(contactDiv, name, color, contactColors);
  appendContactName(contactDiv, name);
  appendSpacer(contactDiv);
  appendContactCheckbox(contactDiv, name, contactColors);
  setupEventListeners(contactDiv, contactColors);
  return contactDiv;
}


function createMainContactDiv() {
  const contactDiv = document.createElement("div");
  contactDiv.classList.add("contact");
  contactDiv.style = `display: flex; marginBottom: 4px; marginTop: 4px; alignItems: center;`;
  return contactDiv;
}


function appendContactIcon(contactDiv, name, color, contactColors) {
  const contactIcon = document.createElement("div");
  contactIcon.classList.add("contact-icon");
  contactIcon.textContent = name.charAt(0).toUpperCase();
  contactColors[name] = color || getRandomColor();
  contactIcon.style.backgroundColor = contactColors[name];
  contactIcon.style.color = "white";
  contactDiv.appendChild(contactIcon);
}


function appendContactName(contactDiv, name) {
  const contactName = document.createElement("span");
  contactName.textContent = name;
  contactDiv.appendChild(contactName);
}


function appendSpacer(contactDiv) {
  const spacer = document.createElement("div");
  spacer.style.flexGrow = "1";
  contactDiv.appendChild(spacer);
}


function appendContactCheckbox(contactDiv, name, contactColors) {
  const contactCheckbox = document.createElement("input");
  contactCheckbox.type = "checkbox";
  contactCheckbox.value = name;
  contactCheckbox.dataset.color = contactColors[name];
  contactCheckbox.classList.add("contact-checkbox");
  contactDiv.appendChild(contactCheckbox);
}


function setupEventListeners(contactDiv, contactColors) {
  contactDiv.addEventListener("mouseover", () => contactDiv.classList.add("hovered"));
  contactDiv.addEventListener("mouseout", () => contactDiv.classList.remove("hovered"));
  contactDiv.addEventListener("click", function(event) {
      event.stopPropagation();
      const contactCheckbox = contactDiv.querySelector(".contact-checkbox");
      contactCheckbox.checked = !contactCheckbox.checked;
      contactCheckbox.dispatchEvent(new Event("change"));
  });
  const contactCheckbox = contactDiv.querySelector(".contact-checkbox");
  contactCheckbox.addEventListener("change", () => handleCheckboxChange(contactCheckbox, contactColors));
}


function handleCheckboxChange(contactCheckbox, contactColors) {
  updateSelectedContacts(contactCheckbox, contactColors);
  renderSelectedContactIcons();
}


function renderSelectedContactIcons() {
  const selectedContactsContainer = document.getElementById("selectedContactsContainer");
  selectedContactsContainer.innerHTML = '';
  selectedContactIcons.forEach(contact => {
    const iconElement = document.createElement('div');
    iconElement.className = 'contact-icon';
    iconElement.textContent = contact.letter;
    iconElement.style.backgroundColor = contact.color;
    selectedContactsContainer.appendChild(iconElement);
  });
}


function updateSelectedContacts(contactCheckbox, contactColors) {
  const contactName = contactCheckbox.value;
  const isChecked = contactCheckbox.checked;
  const contactDetail = {
      name: contactName,
      color: contactColors[contactName],
      letter: contactName.charAt(0).toUpperCase(),
  };
  if (isChecked) {
      selectedContactIcons.push(contactDetail);
  } else {
      selectedContactIcons = selectedContactIcons.filter(detail => detail.name !== contactName);
  }
}


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


function updateProgressBar(taskId, totalSubtasks) {
  const maxSubtasks = 2;
  const progressPercent = (totalSubtasks / maxSubtasks) * 100;
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


function correctSubtask() {
  const input = document.getElementById("add-subtasks").value.trim();
  if (input !== "") {
    const currentSubtasks = countCurrentSubtasks();
    if (currentSubtasks < 2) {
      addSubtaskToDOM(input);
      resetInput();
    } else {
      handleMaxSubtasksError();
    }
  }
}


function countCurrentSubtasks() {
  return document.getElementsByClassName("added-subtask").length;
}


function addSubtaskToDOM(input) {
  const subtaskId = generateSubtaskId();
  const addedSubtasks = document.getElementById("added-subtasks");
  addedSubtasks.innerHTML += `
    <div id="${subtaskId}" class="added-subtask pointer">
        <div>&bull; ${input}</div>
      <div class="subtask-both-img d-none">
        <img onclick="editSubtask('${subtaskId}')" class="subtask-img1" src="../assets/icons/edit.svg" alt"a picture of a pen">
        <img onclick="deleteSubtask('${subtaskId}')" class="subtask-img2" src="../assets/icons/delete.svg" alt"a picture of a trash can">
      </div>
    </div>
  `;
}


function generateSubtaskId() {
  return `subtask-${subtaskIdCounter++}`;
}


function resetInput() {
  document.getElementById("add-subtasks").value = "";
}


function handleMaxSubtasksError() {
  const inputElement = document.getElementById("add-subtasks");
  inputElement.value = "Maximal 2 Subtasks";
  inputElement.classList.add("red");
  inputElement.disabled = true;
  setTimeout(() => {
    inputElement.value = "";
    inputElement.classList.remove("red");
    inputElement.disabled = false;
  }, 3000);
}


function resetPriorities(prioritySettings, priority) {
  document.querySelectorAll('.prioprity-urgent, .prioprity-medium, .prioprity-low').forEach(priorityElement => {
    priorityElement.style.backgroundColor = '';
    priorityElement.style.color = 'black';
    toggleImagesVisibility(priorityElement, prioritySettings, priority);
  });
}


function updateSelectedPriorityDisplay(prioritySettings, priority) {
  let selectedElement = document.getElementById(`priority-${priority}-todo`);
  if (selectedElement) {
    selectedElement.style.backgroundColor = prioritySettings[priority].color;
    selectedElement.style.color = prioritySettings[priority].textColor;
    selectedElement.querySelector(`.${prioritySettings[priority].imgToHide}`).classList.add('d-none');
    selectedElement.querySelector(`.${prioritySettings[priority].imgToShow}`).classList.remove('d-none');
  }
}


function toggleImagesVisibility(priorityElement, prioritySettings, priority) {
  priorityElement.querySelectorAll('img').forEach(img => {
    img.classList.toggle('d-none', img.classList.contains(prioritySettings[priority].imgToShow));
  });
}


function setPriorityName(priority) {
  switch (priority) {
    case 'urgent':
      return 'Urgent';
    case 'medium':
      return 'Medium';
    case 'low':
      return 'Low';
  }
}


function setSelectedPriority(priority) {
  const prioritySettings = {
    'urgent': { color: '#ff3d00', textColor: 'white', imgToShow: 'urgent2', imgToHide: 'urgent1' },
    'medium': { color: '#ffa800', textColor: 'white', imgToShow: 'medium2', imgToHide: 'medium1' },
    'low': { color: '#7ae229', textColor: 'white', imgToShow: 'low2', imgToHide: 'low1' }
  };
  resetPriorities(prioritySettings, priority);
  updateSelectedPriorityDisplay(prioritySettings, priority);
  selectedPriority = priority;
  selectedPriorityName = setPriorityName(priority);
}


function displaySelectedContactsIcons() {
  const selectToAssignInput = document.querySelector('.select-to-assign');
  const container = selectToAssignInput.parentElement;
  let iconsContainer = document.getElementById('selectedContactsIcons');
  if (!iconsContainer) {
    iconsContainer = document.createElement('div');
    iconsContainer.id = 'selectedContactsIcons';
    container.appendChild(iconsContainer);
  }
  iconsContainer.innerHTML = '';
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