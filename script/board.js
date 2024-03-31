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
let urgentTaskCount = 0;
let selectedPriorityName = null;
let currentlyEditingSubtaskId = null;


/**
 * Initializes the application.
 * - Loads necessary HTML files.
 * - Displays the logged-in user.
 * - Updates the HTML elements.
 * - Populates the contacts dropdown.
 * - Loads tasks.
 * - Renders tasks.
 * - Updates the display of task containers.
 * - Adds event listener for finding tasks.
 * @returns {Promise<void>} A Promise that resolves when initialization is complete.
 */
async function init() {
  await includeHTML();
  displayLoggedInUser();
  updateHTML();
  await populateContactsDropdown();
  await loadTasks();
  await renderTasks();
  updateNoTaskDivs();
  addFindTaskEventListener();
}


/**
 * Counts the number of tasks in each category.
 * @returns {Object} An object containing the count of tasks in each category.
 */
function countTasks() {
  return {
      todo: allTasks.filter(task => task.category === 'todo').length,
      inProgress: allTasks.filter(task => task.category === 'in-progress').length,
      testing: allTasks.filter(task => task.category === 'testing').length,
      done: allTasks.filter(task => task.category === 'done').length
  };
}


/**
 * Checks if the application is being used by a guest (without logged-in user).
 * @returns {boolean} True if the application is being used by a guest, otherwise false.
 */
function guestUsesLocalStorage() {
  const loggedInUserName = localStorage.getItem('loggedInUserName');
  return !loggedInUserName;
}


/**
 * Saves tasks either to local storage or server based on user status.
 * @returns {Promise<void>} A Promise that resolves after tasks are saved.
 */
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
    } catch (error) {
      console.error('Error saving tasks to server:', error);
    }
  }
}


/**
 * Loads tasks either from local storage or server based on user status.
 * @returns {Promise<void>} A Promise that resolves after tasks are loaded.
 */
async function loadTasks() {
  allTasks = [];
  if (guestUsesLocalStorage()) {
    await loadTasksFromLocalStorage();
  } else {
    await loadTasksFromServer();
  }
}


/**
 * Loads tasks from local storage.
 * @returns {Promise<void>} A Promise that resolves after tasks are loaded from local storage.
 */
async function loadTasksFromLocalStorage() {
  try {
    const tasks = localStorage.getItem('allTasks');
    allTasks = tasks ? JSON.parse(tasks) : [];
    console.log('Tasks loaded successfully from localStorage');
  } catch (error) {
    console.error('Error loading tasks from localStorage:', error);
  }
}


/**
 * Loads tasks from the server.
 * @returns {Promise<void>} A Promise that resolves after tasks are loaded from the server.
 */
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


/**
 * Renders all tasks on the board.
 */
async function renderTasks() {
  clearTaskContainers(['todo', 'inprogress', 'done', 'awaitingfeedback']);
  allTasks.forEach(renderTask);
}


/**
 * Clears the task containers specified by IDs.
 * @param {string[]} containers - An array of container IDs to be cleared.
 */
function clearTaskContainers(containers) {
  containers.forEach(containerId => {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = '';
    }
  });
}


/**
 * Renders a single task element.
 * @param {Object} task - The task object to be rendered.
 */
function renderTask(task) {
  const taskElement = initializeTaskElement(task);
  attachTaskToContainer(taskElement, task);
}


/**
 * Initializes a task element.
 * @param {Object} task - The task object for which the element is being initialized.
 * @returns {HTMLElement} The initialized task element.
 */
function initializeTaskElement(task) {
  const taskElement = document.createElement('div');
  setTaskElementAttributes(taskElement, task.id);
  taskElement.innerHTML = createTaskElementInnerHTML(task);
  return taskElement;
}


/**
 * Sets attributes for a task element.
 * @param {HTMLElement} taskElement - The task element to set attributes for.
 * @param {string} taskId - The ID of the task.
 */
function setTaskElementAttributes(taskElement, taskId) {
  taskElement.setAttribute('id', taskId);
  taskElement.className = 'board-task-card pointer';
  taskElement.setAttribute('draggable', 'true');
  taskElement.setAttribute('ondragstart', 'startDragging(event)');
}


/**
 * Creates inner HTML content for a task element.
 * @param {Object} task - The task object for which HTML content is being generated.
 * @returns {string} The generated HTML content for the task element.
 */
function createTaskElementInnerHTML(task) {
  const priorityImage = getPriorityImage(task.priority);
  const categoryClass = getCategoryClass(task.category);
  const contactsHtml = getContactsHtml(task.contacts);
  const completedSubtasks = task.subtasks.length;
  const totalSubtasks = 2;
  const progressPercent = (completedSubtasks / totalSubtasks) * 100;
  return generateTaskHTMLContent(task.id, categoryClass, task.category, task.title, task.description, task.dueDate, contactsHtml, priorityImage, progressPercent, completedSubtasks, totalSubtasks);
}


/**
 * Generates HTML content for a task.
 * @param {string} taskId - The ID of the task.
 * @param {string} categoryClass - The category class for styling.
 * @param {string} category - The category of the task.
 * @param {string} title - The title of the task.
 * @param {string} description - The description of the task.
 * @param {string} dueDate - The due date of the task.
 * @param {string} contactsHtml - The HTML content for contacts.
 * @param {string} priorityImage - The URL of the priority image.
 * @param {number} progressPercent - The percentage of completed subtasks.
 * @param {number} completedSubtasks - The count of completed subtasks.
 * @param {number} totalSubtasks - The total count of subtasks.
 * @returns {string} The generated HTML content for the task.
 */
function generateTaskHTMLContent(taskId, categoryClass, category, title, description, dueDate, contactsHtml, priorityImage, progressPercent, completedSubtasks, totalSubtasks) {
  return `
    <div class="board-task-card-title ${categoryClass}">${category}</div>
    <div class="board-task-card-description">${title}</div>
    <div class="board-task-card-task">${description}</div>
    <div class="board-task-card-date d-none">${dueDate}</div>
    <div class="icon-container task-icon-added">${contactsHtml}</div>
    <div class="board-task-card-priority"><img src="${priorityImage}"></div>
    <div class="board-task-card-subtasks">
      <div class="board-task-card-subtasks-bar">
        <div id="bar-fill-${taskId}" class="bar-fill" style="width: ${progressPercent}%;"></div>
      </div>
      <div id="subtasks-amount-${taskId}" class="board-task-card-subtasks-amount">${completedSubtasks}/${totalSubtasks} Subtasks</div>
    </div>
  `;
}


/**
 * Attaches a task element to its container.
 * @param {HTMLElement} taskElement - The task element.
 * @param {Object} task - The task object.
 */
function attachTaskToContainer(taskElement, task) {
  const { id: taskId, title, description, category, dueDate, subtasks, priorityName, priorityImage, container } = task;
  const taskContainer = document.getElementById(task.container || 'todo');
  if (taskContainer) {
    taskContainer.appendChild(taskElement);
    taskElement.addEventListener('click', () => {
      openTaskInfos(taskId, title, description, category, dueDate, subtasks, priorityName, priorityImage);
      populateContactsPlaceholder(task.contacts);
    });
  } else {
    console.error(`Container not found for task ID ${taskId} with container ID '${container}'`);
  }
}


/**
 * Updates the display of urgent task count.
 */
function updateUrgentTaskCountDisplay() {
  const urgentElement = document.querySelector('.summary-urgent-number');
  if (urgentElement) {
    urgentElement.textContent = urgentTaskCount;
  }
  updateUrgentTaskCountDisplay();
}


/**
 * Fetches and filters contacts data.
 * @returns {Promise<Object[]>} A Promise that resolves with the filtered contacts array.
 */
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


/**
 * Generates HTML content for displaying contacts.
 * @param {Object[]} contacts - The array of contact objects.
 * @returns {string} The HTML content for displaying contacts.
 */
function getContactsHtml(contacts) {
  if (!contacts || contacts.length === 0) {
    return 'None';
  }
  return contacts.map(contact => {
    const contactInitial = contact.name.charAt(0).toUpperCase();
    const backgroundColor = contact.color || '#ddd';
    return `<div class="task-contact-icon" style="background-color: ${backgroundColor};">${contactInitial}</div>`;
  }).join('');
}


/**
 * Calculates the progress percentage of subtasks.
 * @param {Object[]} subtasks - The array of subtask objects.
 * @returns {number} The progress percentage of subtasks.
 */
function calculateSubtaskProgress(subtasks) {
  if (!subtasks || subtasks.length === 0) return 0;
  const completedSubtasks = subtasks.filter(st => st.completed).length;
  return (completedSubtasks / subtasks.length) * 100;
}


/**
 * Populates the contacts dropdown.
 * @returns {Promise<void>} A Promise that resolves when the dropdown is populated.
 */
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


/**
 * Checks if the contacts list is empty.
 * @param {Object[]} taskContacts - The array of contact objects.
 * @returns {boolean} `true` if the contacts list is empty, otherwise `false`.
 */
function isContactsListEmpty(taskContacts) {
    if (taskContacts.length === 0) {
        console.log("No contacts found or an error occurred while fetching contacts.");
        return true;
    }
    return false;
}


/**
 * Gets UI elements required for contact dropdown.
 * @returns {Object} An object containing references to UI elements.
 */
function getUIElements() {
    const contactsContainer = document.getElementById("contactsContainerTask");
    const selectToAssignInput = document.querySelector(".select-to-assign");
    const arrowDrop = document.getElementById("arrowDropImage");
    const selectedContactsContainer = document.getElementById("selectedContactsContainer");
    return { contactsContainer, selectToAssignInput, arrowDrop, selectedContactsContainer };
}


/**
 * Checks if required UI elements are missing.
 * @param {Object} uiElements - An object containing UI elements.
 * @returns {boolean} `true` if any required UI elements are missing, otherwise `false`.
 */
function uiElementsMissing({ contactsContainer, selectToAssignInput, arrowDrop, selectedContactsContainer }) {
    if (!selectToAssignInput || !contactsContainer || !selectedContactsContainer || !arrowDrop) {
        return true;
    }
    return false;
}


/**
 * Sets up event listeners for UI elements.
 * @param {HTMLElement} selectToAssignInput - The input element for selecting contacts.
 */
function setupUIEventListeners(selectToAssignInput) {
    selectToAssignInput.removeEventListener("click", toggleContactsVisibility);
    selectToAssignInput.addEventListener("click", toggleContactsVisibility);
}


/**
 * Prepares the contacts container for displaying contacts.
 * @param {HTMLElement} contactsContainer - The container element for contacts.
 * @param {Object[]} taskContacts - The array of contact objects.
 * @param {HTMLElement} selectedContactsContainer - The container element for selected contacts.
 */
function prepareContactsContainer(contactsContainer, taskContacts, selectedContactsContainer) {
    let contactColors = {};
    contactsContainer.innerHTML = '';
    renderContacts(taskContacts, contactsContainer, selectedContactsContainer, contactColors);
}


/**
 * Toggles the visibility of the contacts dropdown.
 */
function toggleContactsVisibility() {
  const contactsContainer = document.getElementById("contactsContainerTask");
  const arrowDrop = document.getElementById("arrowDropImage");
  const selectedContactsContainer = document.getElementById("selectedContactsContainer");
  contactsContainer.style.display = (contactsContainer.style.display === "none") ? "flex" : "none";
  arrowDrop.style.transform = (contactsContainer.style.display === "none") ? "rotate(0deg)" : "rotate(180deg)";
  if (contactsContainer.style.display === "none") {
    updateSelectedContactIcons();
  }
}


/**
 * Displays selected contacts icons.
 */
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


/**
 * Updates the selected contacts container.
 * @param {HTMLElement} selectedContactsContainer - The container element for selected contacts.
 */
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


/**
 * Updates the selected contact icons based on checkbox changes.
 */
function updateSelectedContactIcons() {
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
document.querySelectorAll('.contact-checkbox').forEach(checkbox => {
  checkbox.addEventListener('change', (event) => {
      updateSelectedContactIcons();
  });
});


/**
 * Renders contacts on the contacts container.
 * @param {Object[]} userContacts - The array of user contact objects.
 * @param {HTMLElement} contactsContainer - The container element for contacts.
 * @param {HTMLElement} selectedContactsContainer - The container element for selected contacts.
 * @param {Object} contactColors - An object containing contact colors.
 */
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


/**
 * Creates a contact div with various elements inside.
 * @param {string} name - The name of the contact.
 * @param {string} color - The color associated with the contact.
 * @param {Object} contactColors - An object containing contact colors.
 * @returns {HTMLElement} The created contact div.
 */
function createContactDiv(name, color, contactColors) {
  const contactDiv = createMainContactDiv();
  appendContactIcon(contactDiv, name, color, contactColors);
  appendContactName(contactDiv, name);
  appendSpacer(contactDiv);
  appendContactCheckbox(contactDiv, name, contactColors);
  setupEventListeners(contactDiv, contactColors);
  return contactDiv;
}


/**
 * Creates the main contact div element.
 * @returns {HTMLElement} The created main contact div element.
 */
function createMainContactDiv() {
  const contactDiv = document.createElement("div");
  contactDiv.classList.add("contact");
  contactDiv.style = `display: flex; marginBottom: 4px; marginTop: 4px; alignItems: center;`;
  return contactDiv;
}


/**
 * Appends a contact icon to the contact div.
 * @param {HTMLElement} contactDiv - The contact div element.
 * @param {string} name - The name of the contact.
 * @param {string} color - The color associated with the contact.
 * @param {Object} contactColors - An object containing contact colors.
 */
function appendContactIcon(contactDiv, name, color, contactColors) {
  const contactIcon = document.createElement("div");
  contactIcon.classList.add("contact-icon");
  contactIcon.textContent = name.charAt(0).toUpperCase();
  contactColors[name] = color || getRandomColor();
  contactIcon.style.backgroundColor = contactColors[name];
  contactIcon.style.color = "white";
  contactDiv.appendChild(contactIcon);
}


/**
 * Appends a contact name element to the contact div.
 * @param {HTMLElement} contactDiv - The contact div element.
 * @param {string} name - The name of the contact.
 */
function appendContactName(contactDiv, name) {
  const contactName = document.createElement("span");
  contactName.textContent = name;
  contactDiv.appendChild(contactName);
}


/**
 * Appends a spacer element to the contact div.
 * @param {HTMLElement} contactDiv - The contact div element.
 */
function appendSpacer(contactDiv) {
  const spacer = document.createElement("div");
  spacer.style.flexGrow = "1";
  contactDiv.appendChild(spacer);
}


/**
 * Appends a contact checkbox element to the contact div.
 * @param {HTMLElement} contactDiv - The contact div element.
 * @param {string} name - The name of the contact.
 * @param {Object} contactColors - An object containing contact colors.
 */
function appendContactCheckbox(contactDiv, name, contactColors) {
  const contactCheckbox = document.createElement("input");
  contactCheckbox.type = "checkbox";
  contactCheckbox.value = name;
  contactCheckbox.dataset.color = contactColors[name];
  contactCheckbox.classList.add("contact-checkbox");
  contactDiv.appendChild(contactCheckbox);
}


/**
 * Sets up event listeners for the contact div.
 * @param {HTMLElement} contactDiv - The contact div element.
 * @param {Object} contactColors - An object containing contact colors.
 */
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


/**
 * Handles the change event of the contact checkbox.
 * @param {HTMLInputElement} contactCheckbox - The contact checkbox element.
 * @param {Object} contactColors - An object containing contact colors.
 */
function handleCheckboxChange(contactCheckbox, contactColors) {
  updateSelectedContacts(contactCheckbox, contactColors);
  renderSelectedContacts();
  const contactElement = contactCheckbox.closest('.contact');
  if (contactCheckbox.checked) {
    contactElement.style.backgroundColor = 'rgb(42,54,71)';
    contactElement.style.color = 'white';
  } else {
    contactElement.style.backgroundColor = '';
    contactElement.style.color = '';
  }
}


/**
 * Updates the list of selected contacts.
 * @param {HTMLInputElement} contactCheckbox - The contact checkbox element.
 * @param {Object} contactColors - An object containing contact colors.
 */
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


/**
 * Displays the logged-in user's initial.
 */
function displayLoggedInUser() {
  const loggedInUserName = localStorage.getItem('loggedInUserName');
  if (loggedInUserName) {
    const userNameIcon = document.getElementById('board-user-icon');
    const firstLetter = loggedInUserName.charAt(0).toUpperCase();
    userNameIcon.textContent = firstLetter;
  }
}


/**
 * Toggles the visibility of the contacts container.
 */
function revealContacts() {
  const contactsContainer = document.getElementById("contactsContainerTask");
  const arrowDrop = document.getElementById("arrowDropImage");
  isContactsVisible = !isContactsVisible;
  contactsContainer.style.display = isContactsVisible ? "flex" : "none";
  arrowDrop.style.transform = isContactsVisible ? "rotate(180deg)" : "rotate(0deg)";
}


/**
 * Includes HTML content from external files.
 * @returns {Promise<void>} A Promise that resolves when HTML content is included.
 */
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


/**
 * Finds and displays tasks matching the search query.
 */
function findTask() {
  const inputValue = document.getElementById("findTask").value.trim().toLowerCase();
  const allTasks = document.querySelectorAll(".board-task-card");
  let isAnyTaskVisible = false;
  allTasks.forEach((container) => {
    const taskDescription = container.querySelector(".board-task-card-description").innerText.trim().toLowerCase();
    if (taskDescription.includes(inputValue)) {
      container.style.display = "flex";
      isAnyTaskVisible = true;
    } else {
      container.style.display = "none";
    }
  });
}


/**
 * Adds an event listener to the find task input field.
 */
function addFindTaskEventListener() {
  document.getElementById('findTask').addEventListener('input', findTask);
}


/**
 * Displays assigned contacts on the task creation form.
 */
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


/**
 * Creates a contact icon element based on contact details.
 * @param {Object} contact - The contact object containing name and color.
 * @param {string} contact.name - The name of the contact.
 * @param {string} contact.color - The color associated with the contact.
 * @returns {HTMLElement|null} The created contact icon element, or null if name is empty.
 */
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


/**
 * Adds a new task to the board.
 */
function addTask() {
  let addToTask = document.getElementById("add-task");
  document.getElementById("board-div").classList.add("background");
  document.getElementById("add-task").classList.remove("d-none");
  document.getElementById("add-task").classList.add("sign-up-animation");
  addToTask.innerHTML = `
  <form onsubmit="addTodo(); return false;" class="addTaskForm">
  <div class="headline-div">
    <h1>Add Task</h1>
    <img onclick="closeAddTodo()" class="goBack pointer" src="../assets/icons/close.svg" alt"an picture of a X">
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
  greyOverlay();
  updateNoTaskDivs();
}


/**
 * Applies a grey overlay to the document body.
 */
function greyOverlay() {
  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.style.zIndex = '7';
  document.body.appendChild(overlay);
  document.body.classList.add('no-scroll');
}


/**
 * Closes the task creation form.
 */
function closeAddTodo() {
  document.getElementById("add-task").classList.add("d-none");
  selectedContacts = [];
    removeGreyOverlay();
}


/**
 * Removes the grey overlay from the document body.
 */
function removeGreyOverlay() {
  const overlay = document.querySelector('.overlay');
  if (overlay) {
      document.body.removeChild(overlay);
      document.body.classList.remove('no-scroll');
  }
}


/**
 * Retrieves task details from the task creation form.
 * @returns {Object} An object containing task details.
 */
function getTaskDetailsFromForm() {
  return {
    title: document.getElementById("title-todo").value,
    description: document.getElementById("description-todo").value,
    category: document.getElementById("category-todo").value,
    dueDate: document.getElementById("date-todo").value,
  };
}


/**
 * Processes subtasks from the task creation form.
 * @returns {string[]} An array of subtask strings.
 */
function processSubtasks() {
  return Array.from(document.querySelectorAll("#added-subtasks .added-subtask"))
              .map(subtask => subtask.textContent.trim());
}


/**
 * Generates a unique ID for a task.
 * @returns {string} The generated unique ID.
 */
function generateUniqueId() {
  let uniqueIdFound = false, taskId;
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


/**
 * Determines the priority of the task.
 * @returns {Object} An object containing priority information.
 */
function determinePriority() {
  const priorityMappings = {
    urgent: { priorityImage: "../assets/icons/urgent3.svg", priorityName: "Urgent" },
    medium: { priorityImage: "../assets/icons/medium.svg", priorityName: "Medium" },
    low: { priorityImage: "../assets/icons/low.svg", priorityName: "Low" },
  };
  return priorityMappings[selectedPriority] || {};
}


/**
 * Creates a task object from task details.
 * @param {string} taskId - The ID of the task.
 * @param {Object} details - Details of the task.
 * @param {string[]} subtasks - Subtasks of the task.
 * @param {Object} priority - Priority information of the task.
 * @returns {Object} The created task object.
 */
function createTaskObject(taskId, details, subtasks, priority) {
  return {
    id: taskId,
    ...details,
    subtasks,
    priority: priority.priorityName,
    priorityImage: priority.priorityImage,
    contacts: [...selectedContactIcons]
  };
}


/**
 * Creates HTML content for a task.
 * @param {Object} task - The task object.
 * @returns {string} The HTML content for the task.
 */
function createTaskHTML(task) {
  const { id, category, title, description, dueDate, subtasks, priorityImage } = task;
  const totalSubtasks = subtasks.length;
  const contactsHtml = generateContactsHtml(task.contacts);
  const categoryClass = getCategoryClass(category);
  return `
    <div id="${id}" class="board-task-card pointer" draggable="true">
      <div class="board-task-card-title ${categoryClass}">${category}</div>
      <div class="board-task-card-description">${title}</div>
      <div class="board-task-card-task">${description}</div>
      <div class="board-task-card-date d-none">${dueDate}</div>
      <div class="board-task-card-subtasks">${totalSubtasks}/2 Subtasks</div>
      <div class="icon-container task-icon-added">${contactsHtml}</div>
      <div class="board-task-card-priority"><img src="${priorityImage}"></div>
    </div>
  `;
}


/**
 * Inserts task HTML into the DOM.
 * @param {string} taskHTML - The HTML content for the task.
 */
function insertTaskIntoDOM(taskHTML) {
  document.getElementById("todo").insertAdjacentHTML("beforeend", taskHTML);
}


/**
 * Cleans up after adding a task.
 */
function cleanupAfterTaskAddition() {
  selectedContactIcons = [];
  selectedPriority = null;
  document.getElementById("add-task").classList.add("d-none");
  document.getElementById("board-div").classList.remove("background");
  removeGreyOverlay();
  location.reload();
}


/**
 * Generates HTML content for displaying contacts.
 * @param {Object[]} contacts - The array of contact objects.
 * @returns {string} The HTML content for displaying contacts.
 */
function generateContactsHtml(contacts) {
  return contacts.map(contact => `<div class="task-contact-icon" style="background-color: ${contact.color};">${contact.letter}</div>`).join('');
}


/**
 * Gets the CSS class for the task category.
 * @param {string} category - The category of the task.
 * @returns {string} The CSS class for the task category.
 */
function getCategoryClass(category) {
  const categoryClassMappings = {
    "Technical Task": "category-technical",
    "User Story": "category-user-story",
  };
  return categoryClassMappings[category] || "";
}


/**
 * Adds a new todo task to the task list.
 * @returns {Promise<void>} A promise that resolves after the task is added.
 */
async function addTodo() {
  const details = getTaskDetailsFromForm();
  const subtasks = processSubtasks();
  const taskId = generateUniqueId();
  const priority = determinePriority();
  const task = createTaskObject(taskId, details, subtasks, priority);
  allTasks.push(task);
  const taskHTML = createTaskHTML(task);
  insertTaskIntoDOM(taskHTML);
  await saveTasks();
  cleanupAfterTaskAddition();
}


/**
 * Updates the progress bar for a specific task.
 * @param {string} taskId - The ID of the task.
 * @param {number} totalSubtasks - The total number of subtasks.
 */
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


/**
 * Maps contacts for display purposes.
 * @param {Array<Object>} contacts - The array of contacts to map.
 * @returns {Array<Object>} The mapped contacts array.
 */
function mapContactsForDisplay(contacts) {
  return contacts.map((contact) => ({
    icon: contact.profileImage,
    name: contact.username,
  }));
}


/**
 * Generates HTML for displaying task priority.
 * @param {string} priorityName - The name of the priority.
 * @param {string} priorityImage - The image URL for the priority.
 * @returns {string} The HTML for displaying task priority.
 */
function generatePriorityHtml(priorityName, priorityImage) {
  return `
    <div class="task-info-priority-name">${priorityName}</div>
    <img src="${priorityImage}" class="task-info-priority-image">
  `;
}


/**
 * Prepares task information display.
 * @param {string} category - The category of the task.
 * @returns {Object} An object containing information about task display.
 */
function prepareTaskInfoDisplay(category) {
  let allTaskInfos = document.getElementById("all-task-infos");
  allTaskInfos.classList.remove("d-none");
  return { allTaskInfos, categoryClass: getCategoryClass(category) };
}


/**
 * Assembles HTML for displaying task information.
 * @param {Object} task - The task object.
 * @param {Object} taskInfos - Information about task display.
 * @param {string} priorityHtml - HTML for task priority.
 * @param {string} subtasksHtml - HTML for task subtasks.
 */
function assembleTaskInfoHtml(task, taskInfos, priorityHtml, subtasksHtml) {
  const { allTaskInfos, categoryClass } = taskInfos;
  allTaskInfos.innerHTML = `
    <div class="whole-task-infos">
      <div class="task-info-top">
        <div class="task-info-category ${categoryClass}">${task.category}</div>
        <div><img onclick="closeTaskInfos()" src="../assets/icons/Close2.svg"></div>
      </div>
      <div class="task-info-title">${task.title}</div>
      <div class="task-info-description">${task.description}</div>
      <div class="task-info-due-date">
        <div class="headline3">Due date:</div>
        <div class="variable">${task.dueDate}</div>
      </div>
      <div class="task-info-prio">${priorityHtml}</div>
      <div class="task-info-assigned-to">
        <div class="headline3">Assigned To:</div>
        <div class="here-comes-the-contact" id="selectedContactsPlaceholder"></div>
      </div>
      <div class="task-info-subtasks">
        <div class="headline3">Subtasks</div>
        <div>${subtasksHtml}</div>
      </div>
      <div class="task-info-delete-edit center absolute">
        <div onclick="deleteTaskInfos('${task.id}')" class="task-info-delete pointer center">
          <img class="img1" src="../assets/icons/delete2.svg" alt="">
          <img class="img2 d-none" src="../assets/icons/delete2.png" alt="">
          <span><b>Delete</b></span>
        </div>
        <div onclick="editTaskInfos('${task.id}')" class="task-info-edit pointer center"> 
          <img class="img3" src="../assets/icons/edit2.svg" alt="">
          <img class="img4 d-none" src="../assets/icons/edit2.png" alt="">
          <span><b>Edit</b></span>
        </div>
      </div>
    </div>
  `;
  greyOverlay();
}


/**
 * Opens task information display for a specific task.
 * @param {string} taskId - The ID of the task.
 */
function openTaskInfos(taskId) {
  let task = findTaskById(taskId);
  currentEditingTaskId = taskId;
  if (task) {
    let priorityName = task.priority;
    let priorityImage = getPriorityImage(priorityName);
    let subtasks = task.subtasks;
    let category = task.category;
    let title = task.title;
    let description = task.description;
    let dueDate = task.dueDate;
    let priorityHtml = generatePriorityHtml(priorityName, priorityImage);
    let subtasksHtml = generateSubtasksHtml1(subtasks);
    let taskInfos = prepareTaskInfoDisplay(category, title, description, dueDate);
    assembleTaskInfoHtml(task, taskInfos, priorityHtml, subtasksHtml);
  }
}


/**
 * Retrieves the image URL for a given priority name.
 * @param {string} priorityName - The name of the priority.
 * @returns {string} The image URL for the priority.
 */
function getPriorityImage(priorityName) {
  const priorityImageMap = {
    'urgent': 'path/to/urgent.svg',
    'medium': 'path/to/medium.svg',
    'low': 'path/to/low.svg'
  };
  return priorityImageMap[priorityName] || '';
}


/**
 * Populates selected contacts placeholder with contact information.
 * @param {Array<Object>} contacts - The array of contacts to populate.
 */
function populateContactsPlaceholder(contacts) {
  let selectedContactsPlaceholder = document.getElementById("selectedContactsPlaceholder");
  selectedContactsPlaceholder.innerHTML = contacts.map(contact => {
    let iconDiv = `<div class="self-made-icon" style="background-color: ${contact.color};">${contact.letter}</div>`;
    return `<div class="assigned-to-edit-contact">${iconDiv} ${contact.name}</div>`;
  }).join('');
}


/**
 * Finds a task by its ID.
 * @param {string} taskId - The ID of the task to find.
 * @returns {Object | undefined} The task object if found, otherwise undefined.
 */
function findTaskById(taskId) {
  return allTasks.find(task => task.id === taskId);
}


/**
 * Populates selected contacts placeholder for a specific task.
 * @param {string} taskId - The ID of the task.
 */
function populateSelectedContactsPlaceholder(taskId) {
  let task = findTaskById(taskId);
  if (task) {
    let selectedContactsPlaceholder = document.getElementById('selectedContactsPlaceholder');
    selectedContactsPlaceholder.innerHTML = '';
    task.contacts.forEach(contact => {
      let contactDiv = createContactElement(contact);
      selectedContactsPlaceholder.appendChild(contactDiv);
    });
  }
}


/**
 * Logs task ID and finds its index in the task list.
 * @param {string} taskId - The ID of the task.
 * @returns {number} The index of the task in the task list.
 */
function logTaskIdAndFindIndex(taskId) {
  console.log("Received task ID to delete:", taskId);
  const taskIndex = allTasks.findIndex(task => task.id === taskId);
  console.log("Task IDs before deletion:", allTasks.map(task => task.id));
  return taskIndex;
}


/**
 * Removes a task if it exists and updates the DOM.
 * @param {number} taskIndex - The index of the task to remove.
 * @param {string} taskId - The ID of the task to remove.
 */
async function removeTaskIfExists(taskIndex, taskId) {
  if (taskIndex > -1) {
    allTasks.splice(taskIndex, 1);
    console.log(`Task ${taskId} removed successfully from allTasks.`);
    await saveTasksAndUpdateDOM(taskId);
  } else {
    console.error(`Task ${taskId} not found in allTasks.`);
  }
}


/**
 * Saves tasks and updates the DOM after removing a task.
 * @param {string} taskId - The ID of the task removed.
 */
async function saveTasksAndUpdateDOM(taskId) {
  await saveTasks();
  removeTaskElement(taskId);
  hideTaskInfo();
  updateNoTaskDivs();
  removeGreyOverlay();
}


/**
 * Removes a task element from the DOM.
 * @param {string} taskId - The ID of the task element to remove.
 */
function removeTaskElement(taskId) {
  let taskElement = document.getElementById(taskId);
  if (taskElement) {
    taskElement.remove();
  } else {
    console.error(`DOM element for task ${taskId} not found.`);
  }
}


/**
 * Hides task information display.
 */
function hideTaskInfo() {
  let wholeTaskInfos = document.querySelector(".whole-task-infos");
  if (wholeTaskInfos) {
    wholeTaskInfos.classList.add("d-none");
  }
}


/**
 * Deletes task information for a specific task.
 * @param {string} taskId - The ID of the task to delete.
 */
async function deleteTaskInfos(taskId) {
  const taskIndex = logTaskIdAndFindIndex(taskId);
  await removeTaskIfExists(taskIndex, taskId);
}


/**
 * Sets up a container for displaying task information.
 * @param {string} containerId - The ID of the container element.
 * @returns {HTMLElement | null} The container element or null if not found.
 */
function setupContainer(containerId) {
  if (!currentEditingTaskId) {
    return null;
  }
  const container = document.getElementById(containerId);
  if (!container) {
    return null;
  }
  container.innerHTML = '';
  return container;
}


/**
 * Retrieves task information for the currently editing task.
 * @returns {Object | null} The task object or null if not found.
 */
function retrieveTask() {
  const task = allTasks.find(task => task.id === currentEditingTaskId);
  if (!task) {
    console.error("Task not found with ID:", currentEditingTaskId);
    return null;
  }
  return task;
}


/**
 * Creates a contact element for display.
 * @param {Object} contact - The contact object.
 * @param {boolean} isSelected - Whether the contact is selected.
 * @returns {HTMLElement} The contact element.
 */
function createContactElement(contact, isSelected) {
  const contactElement = document.createElement('div');
  contactElement.classList.add('contact-display');
  Object.assign(contactElement.style, {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    cursor: 'pointer', marginBottom: '8px', padding: '10px', borderRadius: '5px'
  });
  const iconDiv = createIconDiv(contact);
  const nameSpan = createNameSpan(contact.name);
  const checkbox = createCheckbox(contact, isSelected);
  contactElement.append(iconDiv, nameSpan, checkbox);


  /**
 * Updates the style of a contact element based on the checked state of a checkbox.
 */
function updateContainerStyle() {
    if (checkbox.checked) {
      contactElement.style.backgroundColor = "rgb(42, 54, 71)";
      contactElement.style.color = "white";
    } else {
      contactElement.style.backgroundColor = "transparent";
      contactElement.style.color = "inherit";
    }}
  updateContainerStyle();
  contactElement.addEventListener('click', function(event) {
    if (event.target !== checkbox) {
      checkbox.checked = !checkbox.checked;
      updateContainerStyle();
      checkbox.dispatchEvent(new Event('change'));
    }});
  return contactElement;
}


/**
 * Creates a div element for displaying contact icon.
 * @param {Object} contact - The contact object.
 * @returns {HTMLElement} The created div element.
 */
function createIconDiv(contact) {
  const div = document.createElement('div');
  div.classList.add('contact-icon');
  div.textContent = contact.name.charAt(0).toUpperCase();
  Object.assign(div.style, {
    backgroundColor: contact.color || '#ddd', color: 'white',
    width: '32px', height: '32px', display: 'flex', justifyContent: 'center',
    alignItems: 'center', borderRadius: '50%'
  });
  return div;
}


/**
 * Creates a span element for displaying contact name.
 * @param {string} name - The name of the contact.
 * @returns {HTMLElement} The created span element.
 */
function createNameSpan(name) {
  const span = document.createElement('span');
  span.textContent = name;
  span.classList.add('contact-name');
  span.style.flexGrow = '1';
  return span;
}


/**
 * Creates a checkbox element for selecting a contact.
 * @param {Object} contact - The contact object.
 * @param {boolean} isSelected - Whether the contact is selected.
 * @returns {HTMLInputElement} The created checkbox element.
 */
function createCheckbox(contact, isSelected) {
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = isSelected;
  checkbox.classList.add('contact-checkbox');
  return checkbox;
}


/**
 * Sets up a change event listener for the checkbox to update task contacts.
 * @param {HTMLInputElement} checkbox - The checkbox element.
 * @param {Object} contact - The contact object.
 * @param {Object} task - The task object.
 */
function setupCheckboxListener(checkbox, contact, task) {
  checkbox.addEventListener('change', function() {
    const index = task.contacts.findIndex(c => c.name === contact.name);
    if (checkbox.checked && index === -1) {
      task.contacts.push({
        name: contact.name,
        color: contact.color,
        letter: contact.name.charAt(0).toUpperCase()
      });
    } else if (!checkbox.checked && index !== -1) {
      task.contacts.splice(index, 1);
    }
  });
}


/**
 * Renders selected contacts in a specified container.
 * @param {string} containerId - The ID of the container element.
 */
function renderSelectedContacts(containerId) {
  const container = setupContainer(containerId);
  if (!container) return;
  const task = retrieveTask();
  if (!task) return;
  taskContacts.forEach(contact => {
    const isSelected = task.contacts.some(c => c.name === contact.name);
    const contactElement = createContactElement(contact, isSelected);
    setupCheckboxListener(contactElement.querySelector('.contact-checkbox'), contact, task);
    container.appendChild(contactElement);
  });
}


/**
 * Updates the style of a contact element based on the checked state.
 * @param {HTMLElement} contactElement - The contact element.
 * @param {boolean} isChecked - Whether the contact is checked.
 */
function updateContactElementStyle(contactElement, isChecked) {
  contactElement.style.backgroundColor = isChecked ? "rgb(42, 54, 71)" : "transparent";
  contactElement.style.color = isChecked ? "white" : "inherit";
}


/**
 * Edits task information for a specific task.
 * @param {string} taskId - The ID of the task to edit.
 * @param {string} [priorityName] - The name of the priority.
 * @param {string} [priorityImage] - The image URL for the priority.
 */
function editTaskInfos(taskId, priorityName, priorityImage) {
  let task = allTasks.find(task => task.id === taskId);
  if (task) {
    let subtasks = task.subtasks || [];
    let taskInfoContainer = document.querySelector(".whole-task-infos");
    let { title, description, category, dueDate } = getTaskInfoElements(taskInfoContainer);
    let subtasksHtml = generateSubtasksHtml2(subtasks, taskId);
    renderTaskForm(taskId, title, description, category, dueDate, subtasksHtml);
    bindSubtaskEvents(subtasks);
    bindSelectToAssignEvent();
    renderSelectedContacts('selectedContactsContainer2');
  }
  if (!priorityName) {
    setSelectedPriority('medium');
  } else {
    setSelectedPriority(priorityName, priorityImage);
  }
}


/**
 * Retrieves task information elements from the task info container.
 * @param {HTMLElement} taskInfoContainer - The task info container element.
 * @returns {Object} Object containing task information.
 */
function getTaskInfoElements(taskInfoContainer) {
  return {
    title: taskInfoContainer.querySelector(".task-info-title").textContent,
    description: taskInfoContainer.querySelector(".task-info-description").textContent,
    category: taskInfoContainer.querySelector(".task-info-category").textContent,
    dueDate: taskInfoContainer.querySelector(".task-info-due-date .variable").textContent
  };
}


/**
 * Generates HTML for displaying subtasks.
 * @param {Array<string>} subtasks - The array of subtasks.
 * @param {string} taskId - The ID of the task.
 * @returns {string} The HTML for displaying subtasks.
 */
function generateSubtasksHtml1(subtasks, taskId) {
  return subtasks.map((subtask, index) =>
    `<div id="hoverSubtask-${index}" class="hover-subtask">
      <span>${subtask}</span>
      <div class="edit-subtask-images">
      </div>
    </div>`
  ).join("");
}


/**
 * Generates HTML for displaying editable subtasks.
 * @param {Array<string>} subtasks - The array of subtasks.
 * @param {string} taskId - The ID of the task.
 * @returns {string} The HTML for displaying editable subtasks.
 */
function generateSubtasksHtml2(subtasks, taskId) {
  return subtasks.map((subtask, index) =>
    `<div id="hoverSubtask-${index}" class="hover-subtask hover-subtask2 pointer" onmouseover="showIcons(${index})" onmouseout="hideIcons(${index})">
      <span>${subtask}</span>
      <div class="edit-subtask-images">
        <img id="edit-icon-${index}" onclick="startEditingSubtask('hoverSubtask-${index}', '${subtask}', '${taskId}')" src="../assets/icons/edit.svg" style="display:none">
        <img id="delete-icon-${index}" onclick="deleteExistingSubtask(${index}, '${taskId}')" src="../assets/icons/delete.svg" style="display:none">
      </div>
    </div>`
  ).join("");
}


/**
 * Renders a form for editing task information.
 * @param {string} taskId - The ID of the task being edited.
 * @param {string} title - The title of the task.
 * @param {string} description - The description of the task.
 * @param {string} category - The category of the task.
 * @param {string} dueDate - The due date of the task.
 * @param {string} subtasksHtml - The HTML for displaying subtasks.
 */
function renderTaskForm(taskId, title, description, category, dueDate, subtasksHtml) {
  let formHtml = `
    <form onsubmit="saveEditedTaskInfo('${taskId}'); return false;">
      <div class="edit-the-category">
        <div>Category:</div>
        <select type="text" id="edit-category-${taskId}" required class="edit-the-category-select pointer">
          <option value="Technical Task" ${category === "Technical Task" ? "selected" : ""}>Technical Task</option>
          <option value="User Story" ${category === "User Story" ? "selected" : ""}>User Story</option>
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
      <div class="assigned-to">
        <label for="contactsDropdownTask"><span>Assigned to</span></label>
        <div class="custom-dropdown" id="contactsDropdownContainer2">
          <div id="contactsDropdownTask2">
            <input class="select-to-assign" placeholder="Select contacts to assign" readonly="readonly">
            <img id="arrowDropImage2" class="find-contact-img" src="../assets/icons/arrowDrop.png" alt"a picture of an arrow pointing downwards" onclick="revealContacts()">
          </div>
        </div>
      </div>
      <div class="contacts-container" id="contactsContainerTask2"></div>
      <div class="selected-contacts-container "id="selectedContactsContainer2"></div>
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
      <div class="subtasks">
        <div><span>Subtasks</span><span class="important">*</span></div>
        <input minlength="1" id="add-subtasks-edit" type="text" placeholder="Add new subtask">
        <img onclick="correctSubtaskEdit()" id="subtask-add-edit" class="input-icon2 pointer" src="../assets/icons/add.svg" alt="an image of a plus">
        <div id="edited-subtasks">${subtasksHtml}</div>
      </div>
      <div class="save-edited-task-button">
        <button type="submit" class="save-edited-Task pointer center">
          <span>OK</span>
          <img src="../assets/icons/check.svg" alt="an image of a hook">
        </button>
      </div>
    </form>
  `;
  document.querySelector(".whole-task-infos").innerHTML = formHtml;
}


/**
 * Binds mouseover and mouseout events to display/hide icons for subtasks.
 * @param {Array<HTMLElement>} subtasks - The array of subtask elements.
 */
function bindSubtaskEvents(subtasks) {
  subtasks.forEach((_, index) => {
    let hoverSubtask = document.getElementById(`hoverSubtask-${index}`);
    hoverSubtask.onmouseover = () => {
      document.getElementById(`edit-icon-${index}`).style.display = 'inline';
      document.getElementById(`delete-icon-${index}`).style.display = 'inline';
    };
    hoverSubtask.onmouseout = () => {
      document.getElementById(`edit-icon-${index}`).style.display = 'none';
      document.getElementById(`delete-icon-${index}`).style.display = 'none';
    };
  });
}


/**
 * Binds click event to toggle display of selected contacts container.
 */
function bindSelectToAssignEvent() {
  let selectToAssignInput = document.getElementById("contactsDropdownTask2").querySelector(".select-to-assign");
  selectToAssignInput.addEventListener("click", function() {
    let selectedContactsContainer = document.getElementById("selectedContactsContainer2");
    let arrowDropImage2 = document.getElementById("arrowDropImage2");
    if (selectedContactsContainer.style.display === "none" || selectedContactsContainer.style.display === "") {
      selectedContactsContainer.style.display = "block";
      arrowDropImage2.style.transform = "rotate(180deg)";
    } else {
      selectedContactsContainer.style.display = "none";
      arrowDropImage2.style.transform = "rotate(0deg)";
    }
  });
}


/**
 * Corrects the editing of a subtask by updating its content.
 */
function correctSubtaskEdit() {
  let inputElement = document.getElementById("add-subtasks-edit");
  let input = inputElement.value.trim();
  let subtasksContainer = document.getElementById("edited-subtasks");
  inputElement.classList.remove("input-warning");
  inputElement.placeholder = "Add new subtask";
  if (currentlyEditingSubtaskId !== null && input !== "") {
    updateExistingSubtask(input);
  } else if (input !== "" && subtasksContainer.getElementsByClassName('hover-subtask').length < 2) {
    addNewSubtask(input, subtasksContainer);
  } else if (subtasksContainer.getElementsByClassName('hover-subtask').length >= 2) {
    handleMaxSubtasksReached(inputElement);
  }
}


/**
 * Updates the content of an existing subtask.
 * @param {string} input - The new content of the subtask.
 */
function updateExistingSubtask(input) {
  let existingSubtask = document.getElementById(currentlyEditingSubtaskId);
  if (existingSubtask) {
    existingSubtask.querySelector("span").textContent = `• ${input}`;
    clearInputFieldAndResetEditingSubtask();
  }
}


/**
 * Adds a new subtask to the list of subtasks.
 * @param {string} input - The content of the new subtask.
 * @param {HTMLElement} subtasksContainer - The container element for subtasks.
 */
function addNewSubtask(input, subtasksContainer) {
  if (!canAddNewSubtask(subtasksContainer)) {
    handleMaxSubtasksReached(inputElement);
    return;
  }
  let newSubtaskId = createUniqueSubtaskId();
  let newSubtaskHtml = createNewSubtaskElement(input, newSubtaskId);
  subtasksContainer.appendChild(newSubtaskHtml);
  bindSubtaskEvents(newSubtaskHtml);
  clearInputFieldAndResetEditingSubtask();
}


/**
 * Checks if a new subtask can be added.
 * @param {HTMLElement} subtasksContainer - The container element for subtasks.
 * @returns {boolean} True if a new subtask can be added, otherwise false.
 */
function canAddNewSubtask(subtasksContainer) {
  return subtasksContainer.getElementsByClassName('hover-subtask').length < 2;
}


/**
 * Handles the case when maximum subtasks are reached.
 * @param {HTMLElement} inputElement - The input field element.
 */
function handleMaxSubtasksReached(inputElement) {
  inputElement.classList.add("input-warning");
  inputElement.placeholder = "Maximum of 2 subtasks reached";
  setTimeout(() => {
    inputElement.classList.remove("input-warning");
    inputElement.placeholder = "Add new subtask";
    inputElement.value = "";
  }, 2000);
}


/**
 * Generates a unique ID for a new subtask element.
 * @returns {string} The unique subtask ID.
 */
function createUniqueSubtaskId() {
  return `hoverSubtask-new-${Date.now()}`;
}


/**
 * Creates a new subtask element.
 * @param {string} input - The content of the new subtask.
 * @param {string} subtaskId - The ID of the new subtask.
 * @returns {HTMLElement} The created subtask element.
 */
function createNewSubtaskElement(input, subtaskId) {
  let newSubtaskHtml = document.createElement("div");
  newSubtaskHtml.id = subtaskId;
  newSubtaskHtml.className = "hover-subtask hover-subtask2 pointer";
  newSubtaskHtml.innerHTML = `<span>• ${input}</span>
                              <div class="edit-subtask-images">
                                  <img src="../assets/icons/edit.svg" style="display:none;" onclick="startEditingSubtask('${subtaskId}')">
                                  <img src="../assets/icons/delete.svg" style="display:none;" onclick="deleteExistingSubtask('${subtaskId}')">
                              </div>`;
  return newSubtaskHtml;
}


/**
 * Binds mouseover and mouseout events to display/hide icons for a subtask element.
 * @param {HTMLElement} subtaskElement - The subtask element.
 */
function bindSubtaskEvents(subtaskElement) {
  subtaskElement.onmouseover = function() {
    let icons = this.querySelector(".edit-subtask-images").children;
    Array.from(icons).forEach(icon => icon.style.display = 'block');
  };
  subtaskElement.onmouseout = function() {
    let icons = this.querySelector(".edit-subtask-images").children;
    Array.from(icons).forEach(icon => icon.style.display = 'none');
  };
}


/**
 * Clears the input field and resets the currently editing subtask ID.
 */
function clearInputFieldAndResetEditingSubtask() {
  let inputElement = document.getElementById("add-subtasks-edit");
  inputElement.value = "";
  currentlyEditingSubtaskId = null;
}


/**
 * Starts editing a subtask by populating the input field with its content.
 * @param {string} subtaskId - The ID of the subtask being edited.
 */
function startEditingSubtask(subtaskId, taskId) {
  let inputElement = document.getElementById("add-subtasks-edit");
  let currentSubtaskElement = document.getElementById(subtaskId);
  let currentSubtaskContent = currentSubtaskElement ? currentSubtaskElement.querySelector("span").textContent : '';
  let subtaskContentWithoutBullet = currentSubtaskContent.startsWith('• ') ? currentSubtaskContent.substring(2) : currentSubtaskContent;
  inputElement.value = subtaskContentWithoutBullet;
  currentlyEditingSubtaskId = subtaskId;
  inputElement.focus();
}


/**
 * Edits the content of a subtask.
 * @param {number} index - The index of the subtask.
 * @param {string} subtask - The content of the subtask.
 */
function editSubtask(index, subtask) {
  const subtaskContainer = document.getElementById('edited-subtasks');
  const subtasks = subtaskContainer.getElementsByClassName('hover-subtask');
  const subtaskToEdit = subtasks[index];
  const inputField = createInputField(subtask);
  if (subtaskToEdit) {
    insertInputBeforeSubtask(inputField, subtaskToEdit, subtaskContainer);
  } else {
    appendInputField(inputField, subtaskContainer);
  }
  inputField.addEventListener('blur', function() {
    replaceInputWithText(inputField, index, subtaskContainer);
  });
  inputField.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      inputField.blur();
    }
  });
  inputField.focus();
}


/**
 * Creates an input field element for editing subtasks.
 * @param {string} subtask - The content of the subtask.
 * @returns {HTMLInputElement} The created input field element.
 */
function createInputField(subtask) {
  const inputField = document.createElement('input');
  inputField.type = 'text';
  inputField.value = subtask;
  inputField.className = 'edit-input';
  inputField.style.border = '1px solid #ccc';
  return inputField;
}


/**
 * Inserts an input field before a specified subtask element.
 * @param {HTMLInputElement} inputField - The input field element.
 * @param {HTMLElement} subtaskToEdit - The subtask element before which the input field will be inserted.
 * @param {HTMLElement} subtaskContainer - The container element for subtasks.
 */
function insertInputBeforeSubtask(inputField, subtaskToEdit, subtaskContainer) {
  subtaskContainer.insertBefore(inputField, subtaskToEdit);
}


/**
 * Appends an input field to the end of the subtask container.
 * @param {HTMLInputElement} inputField - The input field element.
 * @param {HTMLElement} subtaskContainer - The container element for subtasks.
 */
function appendInputField(inputField, subtaskContainer) {
  subtaskContainer.appendChild(inputField);
}


/**
 * Replaces an input field with text content in the subtask container.
 * @param {HTMLInputElement} inputField - The input field element.
 * @param {number} index - The index of the subtask.
 * @param {HTMLElement} subtaskContainer - The container element for subtasks.
 */
function replaceInputWithText(inputField, index, subtaskContainer) {
  const editedText = createEditedTextElement(inputField.value, index);
  const subtaskToEdit = findSubtaskByIndex(index, subtaskContainer);
  if (subtaskToEdit) {
    subtaskContainer.replaceChild(editedText, subtaskToEdit);
  } else {
    subtaskContainer.appendChild(editedText);
  }
}


/**
 * Creates an edited text element for displaying subtask content.
 * @param {string} text - The content of the subtask.
 * @param {number} index - The index of the subtask.
 * @returns {HTMLElement} The created edited text element.
 */
function createEditedTextElement(text, index) {
  const editedText = document.createElement('span');
  editedText.textContent = text;
  editedText.className = 'hover-subtask pointer';
  const iconsContainer = createIconsContainer(index);
  editedText.appendChild(iconsContainer);
  return editedText;
}


/**
 * Creates a container for edit and delete icons of a subtask.
 * @param {number} index - The index of the subtask.
 * @returns {HTMLElement} The created icons container element.
 */
function createIconsContainer(index) {
  const iconsContainer = document.createElement('div');
  iconsContainer.style.display = 'none';
  const editIcon = createEditIcon(index);
  const deleteIcon = createDeleteIcon(index);
  iconsContainer.appendChild(editIcon);
  iconsContainer.appendChild(deleteIcon);
  editedText.addEventListener('mouseover', function() {
    iconsContainer.style.display = 'flex';
  });
  editedText.addEventListener('mouseout', function() {
    iconsContainer.style.display = 'none';
  });
  return iconsContainer;
}


/**
 * Creates an edit icon element for editing subtasks.
 * @param {number} index - The index of the subtask.
 * @returns {HTMLImageElement} The created edit icon element.
 */
function createEditIcon(index) {
  const editIcon = document.createElement('img');
  editIcon.id = `edit-icon-${index}`;
  editIcon.src = "../assets/icons/edit.svg";
  editIcon.addEventListener('click', function() {
    editSubtask(index, inputField.value);
  });
  return editIcon;
}


/**
 * Creates a delete icon element for deleting subtasks.
 * @param {number} index - The index of the subtask.
 * @returns {HTMLImageElement} The created delete icon element.
 */
function createDeleteIcon(index) {
  const deleteIcon = document.createElement('img');
  deleteIcon.id = `delete-icon-${index}`;
  deleteIcon.src = "../assets/icons/delete.svg";
  deleteIcon.addEventListener('click', function() {
    deleteSubtask(index);
  });
  return deleteIcon;
}


/**
 * Displays icons for editing and deleting a subtask.
 * @param {number} index - The index of the subtask.
 */
function showIcons(index) {
  document.getElementById(`edit-icon-${index}`).style.display = "flex";
  document.getElementById(`delete-icon-${index}`).style.display = "flex";
}


/**
 * Hides icons for editing and deleting a subtask.
 * @param {number} index - The index of the subtask.
 */
function hideIcons(index) {
  document.getElementById(`edit-icon-${index}`).style.display = "none";
  document.getElementById(`delete-icon-${index}`).style.display = "none";
}


/**
 * Deletes an existing subtask by its index.
 * @param {number} index - The index of the subtask.
 * @param {string} taskId - The ID of the task to which the subtask belongs.
 */
function deleteExistingSubtask(index, taskId) {
  let editedSubtasksDiv = document.getElementById('edited-subtasks');
  let subtasks = editedSubtasksDiv.querySelectorAll('.hover-subtask');
  if (subtasks.length > index && index >= 0) {
    let subtaskToRemove = subtasks[index];
    subtaskToRemove.remove();
    let task = allTasks.find(task => task.id === taskId);
    if (task) {
      task.subtasks.splice(index, 1);
      saveTasks()
    }}
}


/**
 * Updates the properties of a task object.
 * @param {object} task - The task object to update.
 * @param {string} taskId - The ID of the task.
 * @param {string} editedTitle - The edited title of the task.
 * @param {string} editedDescription - The edited description of the task.
 * @param {string} editedCategory - The edited category of the task.
 * @param {string} editedDueDate - The edited due date of the task.
 * @param {string} priorityName - The name of the priority for the task.
 * @param {string} priorityImage - The URL of the priority image for the task.
 */
function updateTaskProperties(task, taskId, editedTitle, editedDescription, editedCategory, editedDueDate, priorityName, priorityImage) {
  task.title = editedTitle;
  task.description = editedDescription;
  task.category = editedCategory;
  task.dueDate = editedDueDate;
  task.priority = priorityName;
  task.priorityImage = priorityImage;
  const editedSubtasksDiv = document.getElementById('edited-subtasks');
  const subtaskElements = editedSubtasksDiv.getElementsByClassName('hover-subtask');
  let updatedSubtasks = [];
  for (const element of subtaskElements) {
    updatedSubtasks.push(element.textContent.trim());
  }
  task.subtasks = updatedSubtasks;
}


/**
 * Updates the HTML elements representing a task with new information.
 * @param {object} task - The task object.
 * @param {string} taskId - The ID of the task.
 * @param {string} editedTitle - The edited title of the task.
 * @param {string} editedCategory - The edited category of the task.
 * @param {string} editedDueDate - The edited due date of the task.
 * @param {string} priorityImage - The URL of the priority image for the task.
 * @param {string} iconContainerHtml - The HTML content of the icon container.
 */
function updateTaskElement(task, taskId, editedTitle, editedCategory, editedDueDate, priorityImage, iconContainerHtml) {
  let taskElement = document.getElementById(taskId);
  if (taskElement) {
    taskElement.querySelector(".board-task-card-description").textContent = editedTitle;
    taskElement.querySelector(".board-task-card-title").textContent = editedCategory;
    taskElement.querySelector(".board-task-card-date").textContent = editedDueDate;
    let priorityElement = taskElement.querySelector(".board-task-card-priority img");
    if (priorityElement) {
      priorityElement.src = priorityImage;
    }
    let iconContainer = taskElement.querySelector(".icon-container.task-icon-added");
    if (iconContainer) {
      iconContainer.innerHTML = iconContainerHtml;
    }
  }
}


/**
 * Updates the task information container with new task information.
 * @param {string} editedCategory - The edited category of the task.
 * @param {string} editedTitle - The edited title of the task.
 * @param {string} editedDescription - The edited description of the task.
 * @param {string} editedDueDate - The edited due date of the task.
 * @param {string} priorityName - The name of the priority for the task.
 * @param {string} priorityImage - The URL of the priority image for the task.
 * @param {string} contactsHtml - The HTML content of assigned contacts.
 * @param {string} subtasksHtml - The HTML content of subtasks.
 * @param {string} taskId - The ID of the task.
 */
function updateTaskInfoContainer(editedCategory, editedTitle, editedDescription, editedDueDate, priorityName, priorityImage, contactsHtml, subtasksHtml, taskId) {
  let taskInfoContainer = document.querySelector(".whole-task-infos");
  if (taskInfoContainer) {
    const categoryClass = getCategoryClass(editedCategory);
    taskInfoContainer.innerHTML = `
      <div class="task-info-top">
        <!-- Apply the categoryClass here -->
        <div class="task-info-category ${categoryClass}">${editedCategory}</div>
        <div><img onclick="closeTaskInfos()" src="../assets/icons/Close2.svg"></div>
      </div>
      <div class="task-info-title">${editedTitle}</div>
      <div class="task-info-description">${editedDescription}</div>
      <div class="task-info-due-date">
        <div class="headline3">Due date:</div>
        <div class="variable">${editedDueDate}</div>
      </div>
      <div class="task-info-prio">
        <div class="task-info-priority-name">${priorityName}</div>
        <img src="${priorityImage}" class="task-info-priority-image">
      </div>
      <div class="task-info-assigned-to">
        <div class="headline3">Assigned To:</div>
        <div class="saved-edited-contact-icons">${contactsHtml}</div>
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
        <div onclick="editTaskInfos('${taskId}')" class="task-info-edit pointer center"> 
          <img class="img3" src="../assets/icons/edit2.svg" alt="">
          <img class="img4 d-none" src="../assets/icons/edit2.png" alt="">
          <span><b>Edit</b></span>
        </div>
      </div>
    `;
  }
}


/**
 * Saves the edited task information.
 * @param {string} taskId - The ID of the task.
 * @param {string} contactsIconHtml - The HTML content of contacts icons.
 */
async function saveEditedTaskInfo(taskId, contactsIconHtml) {
  let editedTitle = document.getElementById(`edit-title-${taskId}`).value;
  let editedDescription = document.getElementById(`edit-description-${taskId}`).value;
  let editedCategory = document.getElementById(`edit-category-${taskId}`).value;
  let editedDueDate = document.getElementById(`edit-due-date-${taskId}`).value;
  let priorityName = selectedPriorityName;
  let priorityImage = getPriorityImage(priorityName);
  let task = findTaskById(taskId);
  if (task) {
    updateTaskProperties(task, taskId, editedTitle, editedDescription, editedCategory, editedDueDate, priorityName, priorityImage);
    let { contactsHtml, subtasksHtml } = generateContactAndSubtaskHtml(task);
    let iconContainerHtml = getIconContainerHtml(contactsIconHtml);
    updateTaskElement(task, taskId, editedTitle, editedCategory, editedDueDate, priorityImage, iconContainerHtml);
    updateTaskInfoContainer(editedCategory, editedTitle, editedDescription, editedDueDate, priorityName, priorityImage, contactsHtml, subtasksHtml, taskId);
    await saveTasks();
    await loadTasks();
    await renderTasks();
  }
}


/**
 * Retrieves the URL of the priority image based on the priority name.
 * @param {string} priorityName - The name of the priority.
 * @returns {string} The URL of the priority image.
 */
function getPriorityImage(priorityName) {
  switch (priorityName) {
    case 'Urgent':
      return '../assets/icons/urgent.svg';
    case 'Medium':
      return '../assets/icons/medium.svg';
    case 'Low':
      return '../assets/icons/low.svg';
  }
}


/**
 * Generates HTML content for contacts and subtasks.
 * @param {object} task - The task object.
 * @returns {object} Object containing HTML content for contacts and subtasks.
 */
function generateContactAndSubtaskHtml(task) {
  let subtasksHtml = task.subtasks.map((subtask, index) =>
    `<div class="hover-subtask column pointer">${subtask}</div>`
  ).join("");
  let contactsHtml = task.contacts.map(contact => {
    return `<div class="assigned-contact-display">
              <div class="contact-icon" style="background-color: ${contact.color};">${contact.letter}</div>
              <span class="contact-name">${contact.name}</span>
            </div>`;
  }).join('');
  return { contactsHtml, subtasksHtml };
}


/**
 * Retrieves the HTML content of the icon container.
 * @param {string} contactsIconHtml - The HTML content of contacts icons.
 * @returns {string} The HTML content of the icon container.
 */
function getIconContainerHtml(contactsIconHtml) {
  let iconContainerHtml = "";
  if (contactsIconHtml) {
    iconContainerHtml = contactsIconHtml;
  }
  return iconContainerHtml;
}


/**
 * Adds a subtask to the DOM.
 * @param {string} subtaskId - The ID of the subtask.
 * @param {string} input - The content of the subtask.
 */
function addSubtaskToDOM(subtaskId, input) {
  let addedSubtasks = document.getElementById("added-subtasks");
  addedSubtasks.innerHTML += `
    <div id="${subtaskId}" class="added-subtask pointer">
      <div>${input}</div>
      <div class="subtask-both-img d-none">
        <img onclick="editSubtask('${subtaskId}')" class="subtask-img1" src="../assets/icons/edit.svg" alt"a picture of a pen">
        <img onclick="deleteSubtask('${subtaskId}')" class="subtask-img2" src="../assets/icons/delete.svg" alt"a picture of a trash can">
      </div>
    </div>
  `;
}


/**
 * Handles the display of error message when maximum subtasks are reached.
 */
function handleMaxSubtasksError() {
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


/**
 * Closes the task information container.
 */
function closeTaskInfos() {
  document.getElementById("all-task-infos").classList.add("d-none");
  removeGreyOverlay();
}


/**
 * Resets the priority settings based on the selected priority.
 * @param {object} prioritySettings - The settings for different priorities.
 * @param {string} priority - The selected priority.
 */
function resetPriorities(prioritySettings, priority) {
  document.querySelectorAll('.prioprity-urgent, .prioprity-medium, .prioprity-low').forEach(priorityElement => {
    priorityElement.style.backgroundColor = '';
    priorityElement.style.color = 'black';
    toggleImagesVisibility(priorityElement, prioritySettings, priority);
  });
}


/**
 * Updates the display of the selected priority.
 * @param {object} prioritySettings - The settings for different priorities.
 * @param {string} priority - The selected priority.
 */
function updateSelectedPriorityDisplay(prioritySettings, priority) {
  let selectedElement = document.getElementById(`priority-${priority}-todo`);
  if (selectedElement) {
    selectedElement.style.backgroundColor = prioritySettings[priority].color;
    selectedElement.style.color = prioritySettings[priority].textColor;
    selectedElement.querySelector(`.${prioritySettings[priority].imgToHide}`).classList.add('d-none');
    selectedElement.querySelector(`.${prioritySettings[priority].imgToShow}`).classList.remove('d-none');
  }
}


/**
 * Toggles the visibility of priority images based on the selected priority.
 * @param {HTMLElement} priorityElement - The HTML element representing the priority.
 * @param {object} prioritySettings - The settings for different priorities.
 * @param {string} priority - The selected priority.
 */
function toggleImagesVisibility(priorityElement, prioritySettings, priority) {
  priorityElement.querySelectorAll('img').forEach(img => {
    img.classList.toggle('d-none', img.classList.contains(prioritySettings[priority].imgToShow));
  });
}


/**
 * Sets the name of the priority based on the selected priority.
 * @param {string} priority - The selected priority.
 * @returns {string} The name of the priority.
 */
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


/**
 * Sets the selected priority and updates its display.
 * @param {string} priority - The selected priority.
 */
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


/**
 * Binds drag events to a specified element.
 * @param {HTMLElement} element - The HTML element to bind drag events.
 */
function bindDragEvents(element) {
  element.addEventListener("dragstart", (e) => startDragging(e, element));
}


/**
 * Starts dragging an element.
 * @param {Event} event - The drag start event.
 * @param {HTMLElement} element - The HTML element being dragged.
 */
function startDragging(event, element) {
  event.dataTransfer.setData("text", event.target.id);
}


/**
 * Allows dropping of dragged elements.
 * @param {Event} event - The drop event.
 */
function allowDrop(event) {
  event.preventDefault();
}


/**
 * Handles dropping of dragged elements.
 * @param {Event} event - The drop event.
 * @param {string} targetId - The ID of the drop target.
 */
function drop(event, targetId) {
  event.preventDefault();
  let data = event.dataTransfer.getData("text");
  let draggedElement = document.getElementById(data);
  let target = document.getElementById(targetId);
  if (target && draggedElement) {
    target.appendChild(draggedElement);
    updateNoTaskDivs();
    let movedTask = allTasks.find(task => task.id === draggedElement.id);
    if (movedTask) {
      movedTask.container = targetId;
      saveTasks();
    }
  }
}


/**
 * Adds a task to the DOM.
 * @param {object} task - The task object to add.
 */
function addTaskToDOM(task) {
  let newCard = document.getElementById(task.id);
  newCard.setAttribute("draggable", true);
  newCard.addEventListener("dragstart", (e) => startDragging(e, newCard));
}


/**
 * Updates the HTML elements representing tasks.
 */
function updateHTML() {
  let taskCards = document.querySelectorAll(".board-task-card");
  taskCards.forEach((card, index) => {
    card.setAttribute("draggable", true);
    card.setAttribute("id", "task-card-" + index); 
    card.addEventListener("dragstart", (e) => startDragging(e, card));
  });
}


/**
 * Adds subtasks to a task.
 */
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


/**
 * Cancels adding a subtask.
 */
function cancelSubtask() {
  let input = document.getElementById("add-subtasks");
  input.value = "";
  document.getElementById("subtask-add").classList.remove("d-none");
  document.getElementById("subtask-cancel").classList.add("d-none");
  document.getElementById("subtask-correct").classList.add("d-none");
}


/**
 * Checks if the input is not empty.
 * @param {string} input - The input value.
 * @returns {boolean} True if input is not empty, otherwise false.
 */
function checkInputNotEmpty(input) {
  return input !== "";
}


/**
 * Retrieves the current count of subtasks.
 * @returns {number} The current count of subtasks.
 */
function getCurrentSubtasksCount() {
  return document.getElementsByClassName("added-subtask").length;
}


/**
 * Adds a subtask.
 * @param {string} input - The content of the subtask.
 * @param {number} currentSubtasks - The current count of subtasks.
 */
function addSubtask(input, currentSubtasks) {
  if (currentSubtasks < 2) {
    const subtaskId = `subtask-${subtaskIdCounter++}`;
    let addedSubtasks = document.getElementById("added-subtasks");
    addedSubtasks.innerHTML += `
      <div id="${subtaskId}" class="added-subtask pointer">
          <div>&bull; ${input}</div>
        <div class="subtask-both-img d-none">
          <img onclick="editSubtask('${subtaskId}')" class="subtask-img1" src="../assets/icons/edit.svg" alt="a picture of a pen">
          <img onclick="deleteSubtask('${subtaskId}')" class="subtask-img2" src="../assets/icons/delete.svg" alt="a picture of a trash can">
        </div>
      </div>
    `;
    document.getElementById("add-subtasks").value = "";
  } else {
    disableInputTemporarily();
  }
}


/**
 * Disables the input field temporarily.
 */

function disableInputTemporarily() {
  let inputElement = document.getElementById("add-subtasks");
  inputElement.value = "Maximal 2 Subtasks";
  inputElement.classList.add("red");
  inputElement.disabled = true;
  setTimeout(() => resetInputField(inputElement), 3000);
}


/**
 * Resets the input field after temporary disablement.
 * @param {HTMLElement} inputElement - The input field element.
 */
function resetInputField(inputElement) {
  inputElement.value = "";
  inputElement.classList.remove("red");
  inputElement.disabled = false;
}


/**
 * Handles the correction of subtasks.
 * @param {object} options - Options for correction.
 */
function correctSubtask({ taskId = null } = {}) {
  const inputElement = document.getElementById("add-subtasks");
  const input = inputElement.value.trim();
  if (!input) return;
  const isTaskSpecific = taskId !== null;
  const containerSelector = isTaskSpecific ? `#${taskId} .added-subtask` : ".added-subtask";
  const currentSubtasksCount = getCurrentSubtasksCount(containerSelector);
  if (currentSubtasksCount < 2) {
    handleSubtaskAddition(inputElement, input, currentSubtasksCount, taskId);
  } else {
    handleMaxSubtasksError(isTaskSpecific, inputElement, taskId);
  }
}


/**
 * Handles the display of error message when maximum subtasks are reached.
 * @param {boolean} isTaskSpecific - Indicates if the error is task-specific.
 * @param {HTMLElement} inputElement - The input field element.
 * @param {string} taskId - The ID of the task.
 */
function handleMaxSubtasksError(isTaskSpecific, inputElement, taskId) {
  inputElement.value = "";
  inputElement.placeholder = "Maximum of 2 subtasks reached";
  inputElement.classList.add("input-warning");
  setTimeout(() => {
    inputElement.placeholder = "Add new subtask";
    inputElement.classList.remove("input-warning");
  }, 3000);
  if (isTaskSpecific) {
    handleMaxSubtasksError(taskId);
  } else {
    handleMaxSubtasksReached(inputElement);
  }
}


/**
 * Retrieves the current count of subtasks.
 * @param {string} containerSelector - The selector for the subtask container.
 * @returns {number} The current count of subtasks.
 */
function getCurrentSubtasksCount(containerSelector) {
  return document.querySelectorAll(containerSelector).length;
}


/**
 * Handles the addition of a subtask.
 * @param {HTMLElement} inputElement - The input field element.
 */
function handleSubtaskAddition(inputElement, input, currentSubtasksCount, taskId) {
  const isTaskSpecific = taskId !== null;
  const subtaskId = generateSubtaskId();
  if (isTaskSpecific) {
    addSubtaskToDOM(subtaskId, input, taskId);
    inputElement.value = "";
    updateTaskProgress(taskId, 0, currentSubtasksCount + 1);
  } else {
    addSubtask(input, currentSubtasksCount);
  }
}


/**
 * Generates a unique ID for a new subtask.
 * @returns {string} The unique subtask ID.
 */
function generateSubtaskId() {
  return `subtask-${subtaskIdCounter++}`;
}


/**
 * Handles the display of error message when maximum subtasks are reached.
 * @param {HTMLElement} inputElement - The input field element.
 */
function handleMaxSubtasksErrorDisplay(inputElement) {
  inputElement.value = "";
  inputElement.placeholder = "Maximum of 2 subtasks reached";
  inputElement.classList.add("input-warning");
  setTimeout(() => {
    inputElement.placeholder = "Add new subtask";
    inputElement.classList.remove("input-warning");
  }, 3000);
}


/**
 * Updates the display of "No task" divs based on tasks in each department.
 */
function updateNoTaskDivs() {
  const departmentIds = ['todo', 'inprogress', 'awaitingfeedback', 'done'];
  departmentIds.forEach((id, index) => {
    const taskContainer = document.getElementById(id);
    const noTaskDivs = document.getElementsByClassName('board-column-empty');
    const noTaskDiv = noTaskDivs[index];
    if (taskContainer && noTaskDiv) {
      const tasks = taskContainer.getElementsByClassName('board-task-card');
      noTaskDiv.style.display = tasks.length > 0 ? 'none' : 'grid';
    } else {
      console.error('Task container or no task message div not found for:', id);
    }
  });
}


init();