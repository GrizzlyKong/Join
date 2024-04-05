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


/**
 * Initializes the application by including HTML files, displaying logged-in user, populating contacts dropdown, loading tasks, and adding a task.
 */
async function init() {
  await includeHTML();
  displayLoggedInUser();
  await populateContactsDropdown();
  await loadTasks();
  await addTask();
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
 * Saves tasks either to local storage or server depending on the user's authentication status.
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
      console.log('Tasks saved successfully to server');
    } catch (error) {
      console.error('Error saving tasks to server:', error);
    }
  }
}


/**
 * Loads tasks from either local storage or server depending on the user's authentication status.
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
 * Retrieves the HTML for the task form and appends it to the element with the id 'add-task'.
 * Populates the contacts dropdown and binds subtask events.
 * @function addTask
 */
async function addTask() {
  let addToTask = document.getElementById("add-task");
  document.getElementById("add-task").classList.remove("d-none");
  addToTask.innerHTML += addTaskHTML();
  populateContactsDropdown("contactsDropdownTask");
  bindSubtaskEvents();
}


/**
 * Displays the logged-in user's initials.
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
 * Populates the contacts dropdown with available contacts.
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
 * Checks if the list of contacts is empty.
 * @param {Array} taskContacts - List of contacts to check.
 * @returns {boolean} True if the list of contacts is empty, otherwise false.
 */
function isContactsListEmpty(taskContacts) {
    if (taskContacts.length === 0) {
        console.log("No contacts found or an error occurred while fetching contacts.");
        return true;
    }
    return false;
}


/**
 * Retrieves UI elements needed for populating the contacts dropdown.
 * @returns {Object} UI elements required for populating the contacts dropdown.
 */
function getUIElements() {
    const contactsContainer = document.getElementById("contactsContainerTask");
    const selectToAssignInput = document.querySelector(".select-to-assign");
    const arrowDrop = document.getElementById("arrowDropImage");
    const selectedContactsContainer = document.getElementById("selectedContactsContainer");
    return { contactsContainer, selectToAssignInput, arrowDrop, selectedContactsContainer };
}


/**
 * Checks if UI elements required for populating the contacts dropdown are missing.
 * @param {Object} uiElements - UI elements required for populating the contacts dropdown.
 * @returns {boolean} True if UI elements are missing, otherwise false.
 */
function uiElementsMissing({ contactsContainer, selectToAssignInput, arrowDrop, selectedContactsContainer }) {
    if (!selectToAssignInput || !contactsContainer || !selectedContactsContainer || !arrowDrop) {
        return true;
    }
    return false;
}


/**
 * Sets up event listeners for UI elements.
 * @param {HTMLElement} selectToAssignInput - Input element for selecting contacts.
 */
function setupUIEventListeners(selectToAssignInput) {
    selectToAssignInput.removeEventListener("click", toggleContactsVisibility);
    selectToAssignInput.addEventListener("click", toggleContactsVisibility);
}


/**
 * Prepares the contacts container by rendering contacts.
 * @param {HTMLElement} contactsContainer - Container for displaying contacts.
 * @param {Array} taskContacts - List of contacts to render.
 * @param {HTMLElement} selectedContactsContainer - Container for displaying selected contacts.
 */
function prepareContactsContainer(contactsContainer, taskContacts, selectedContactsContainer) {
    let contactColors = {};
    contactsContainer.innerHTML = '';
    renderContacts(taskContacts, contactsContainer, selectedContactsContainer, contactColors);
}


/**
 * Adds a task based on user input.
 */
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
  selectedContactIcons = [];
  selectedPriority = null;
  await saveTasks();
  location.replace("../html/board.html");
}


/**
 * Retrieves subtasks from the input field.
 * @returns {Array} List of subtasks.
 */
function getSubtasks() {
  const subtaskElements = document.querySelectorAll("#added-subtasks .added-subtask");
  const subtasks = [];
  for (let i = 0; i < subtaskElements.length; i++) {
    subtasks.push(subtaskElements[i].textContent.trim());
  }
  return subtasks;
}


/**
 * Generates a unique ID for a task.
 * @returns {string} Unique task ID.
 */
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


/**
 * Retrieves the image path for the selected priority.
 * @returns {string} Image path for the selected priority.
 */
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


/**
 * Retrieves the name for the selected priority.
 * @returns {string} Name for the selected priority.
 */
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


/**
 * Creates a task object.
 * @param {string} id - Task ID.
 * @param {string} title - Task title.
 * @param {string} description - Task description.
 * @param {string} category - Task category.
 * @param {string} dueDate - Due date for the task.
 * @param {Array} subtasks - List of subtasks for the task.
 * @param {string} priorityName - Priority name for the task.
 * @param {string} priorityImage - Image path for the priority.
 * @returns {Object} Task object.
 */
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


/**
 * Adds a task to the list of all tasks.
 * @param {Object} task - Task object to add.
 */
function addToAllTasks(task) {
  allTasks.push(task);
}


/**
 * Updates the HTML representation of a task's category.
 * @param {string} category - Category of the task.
 * @returns {string} HTML representation of the task's category.
 */
function getCategoryHtml(category) {
  let categoryClass = "";
  if (category === "Technical Task") {
    categoryClass = "category-technical";
  } else if (category === "User Story") {
    categoryClass = "category-user-story";
  }
  return `<div class="board-task-card-title ${categoryClass}">${category}</div>`;
}


/**
 * Updates the HTML representation of a task.
 * @param {Object} task - Task object to update HTML for.
 * @returns {string} HTML representation of the task.
 */
function updateTaskHtml(task) {
  let contactsHtml = '';
  for (let i = 0; i < task.contacts.length; i++) {
    const contact = task.contacts[i];
    contactsHtml += `<div class="task-contact-icon" style="background-color: ${contact.color};">${contact.letter}</div>`;
  }
  const totalSubtasks = task.subtasks.length;
  return `
    <div id="${task.id}" class="board-task-card pointer" ondragstart="startDragging(event)" draggable="true" onclick="openTaskInfos('${task.id}', '${task.title}', '${task.description}', '${task.category}', '${task.dueDate}', ${JSON.stringify(task.subtasks).split('"').join("&quot;")}, '${task.priority}', '${task.priorityImage}')">
      ${getCategoryHtml(task.category)}
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


/**
 * Binds event listeners for subtasks.
 */
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


/**
 * Fetches and filters contacts for the logged-in user.
 * @returns {Array} Filtered list of contacts.
 */
async function fetchAndFilterContacts() {
      const loggedInUserName = localStorage.getItem("loggedInUserName");
      if (!loggedInUserName) {
          console.error("No logged-in user found. Contacts cannot be loaded.");
          return [];}
      const contactsData = await getItem(`contacts_${loggedInUserName}`);
      const parsedContacts = JSON.parse(contactsData) || [];
      const filteredContacts = [];
      for (let i = 0; i < parsedContacts.length; i++) {
          const contact = parsedContacts[i];
          if (contact.name || contact.email || contact.phone) {
              filteredContacts.push(contact);
          }}
      return filteredContacts;
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
}


/**
 * Renders contacts in the contacts container.
 * @param {Array} userContacts - List of user contacts.
 * @param {HTMLElement} contactsContainer - Container for displaying contacts.
 * @param {HTMLElement} selectedContactsContainer - Container for displaying selected contacts.
 * @param {Object} contactColors - Object containing contact colors.
 */
function renderContacts(taskContacts, contactsContainer, selectedContactsContainer, contactColors) {
  contactsContainer.innerHTML = ''; // Clear existing contacts
  for (let i = 0; i < taskContacts.length; i++) {
      const contact = taskContacts[i];
      // createContactDiv is assumed to return an HTML element for each contact.
      const contactElement = createContactDiv(contact.name, contact.color, contactColors);
      contactsContainer.appendChild(contactElement);
  }
}


/**
 * Creates a div element for displaying contact information.
 * @param {string} name - Contact name.
 * @param {string} color - Color associated with the contact.
 * @param {Object} contactColors - Object containing contact colors.
 * @returns {HTMLElement} Div element for contact information.
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
 * Creates the main contact div.
 * @returns {HTMLElement} Main contact div.
 */
function createMainContactDiv() {
  const contactDiv = document.createElement("div");
  contactDiv.classList.add("contact");
  contactDiv.style = `display: flex; marginBottom: 4px; marginTop: 4px; alignItems: center;`;
  return contactDiv;
}


/**
 * Appends contact icon to the contact div.
 * @param {HTMLElement} contactDiv - Contact div element.
 * @param {string} name - Contact name.
 * @param {string} color - Color associated with the contact.
 * @param {Object} contactColors - Object containing contact colors.
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
 * Appends contact name to the contact div.
 * @param {HTMLElement} contactDiv - Contact div element.
 * @param {string} name - Contact name.
 */
function appendContactName(contactDiv, name) {
  const contactName = document.createElement("span");
  contactName.textContent = name;
  contactDiv.appendChild(contactName);
}


/**
 * Appends spacer to the contact div.
 * @param {HTMLElement} contactDiv - Contact div element.
 */
function appendSpacer(contactDiv) {
  const spacer = document.createElement("div");
  spacer.style.flexGrow = "1";
  contactDiv.appendChild(spacer);
}


/**
 * Appends contact checkbox to the contact div.
 * @param {HTMLElement} contactDiv - Contact div element.
 * @param {string} name - Contact name.
 * @param {Object} contactColors - Object containing contact colors.
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
 * @param {HTMLElement} contactDiv - Contact div element.
 * @param {Object} contactColors - Object containing contact colors.
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
 * Handles the change event for the contact checkbox.
 * @param {HTMLElement} contactCheckbox - Contact checkbox element.
 * @param {Object} contactColors - Object containing contact colors.
 */
function handleCheckboxChange(contactCheckbox, contactColors) {
  updateSelectedContacts(contactCheckbox, contactColors);
  renderSelectedContactIcons();
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
 * Renders selected contact icons in the selected contacts container.
 */
function renderSelectedContactIcons() {
  const selectedContactsContainer = document.getElementById("selectedContactsContainer");
  selectedContactsContainer.innerHTML = '';
  for (let i = 0; i < selectedContactIcons.length; i++) {
    const contact = selectedContactIcons[i];
    const iconElement = document.createElement('div');
    iconElement.className = 'contact-icon';
    iconElement.textContent = contact.letter;
    iconElement.style.backgroundColor = contact.color;
    selectedContactsContainer.appendChild(iconElement);
  }
}


/**
 * Updates the list of selected contacts based on checkbox changes.
 * @param {HTMLElement} contactCheckbox - Contact checkbox element.
 * @param {Object} contactColors - Object containing contact colors.
 */
function updateSelectedContacts(contactCheckbox, contactColors) {
  const contactName = contactCheckbox.value;
  const isChecked = contactCheckbox.checked;
  const contactDetail = {
      name: contactName,
      color: contactColors[contactName],
      letter: contactName.charAt(0).toUpperCase(),};
  if (isChecked) {
      selectedContactIcons.push(contactDetail);
  } else {
      let updatedSelectedContactIcons = [];
      for (let i = 0; i < selectedContactIcons.length; i++) {
          const detail = selectedContactIcons[i];
          if (detail.name !== contactName) {
              updatedSelectedContactIcons.push(detail);
          }
      }
      selectedContactIcons = updatedSelectedContactIcons;
  }
}


/**
 * Adds subtasks based on user input.
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
 * Updates the progress bar for subtasks.
 * @param {string} taskId - Task ID.
 * @param {number} completedSubtasks - Number of completed subtasks.
 * @param {number} totalSubtasks - Total number of subtasks.
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
 * Maps contacts for display by extracting the icon and name from each contact object.
 * @param {Array} contacts - List of contacts to loop through.
 * @returns {Array} Mapped contacts with icon and name.
 */
function mapContactsForDisplay(contacts) {
  const mappedContacts = [];
  for (let i = 0; i < contacts.length; i++) {
    const contact = contacts[i];
    mappedContacts.push({
      icon: contact.profileImage,
      name: contact.username
    });
  }
  return mappedContacts;
}



/**
 * Corrects a subtask by validating input, adding it to the DOM if conditions are met, and handling errors.
 */
function correctSubtask() {
  const input = document.getElementById("add-subtasks").value.trim();
  if (input !== "") {
    const currentSubtasks = countCurrentSubtasks();
    if (currentSubtasks < 2) {
      addSubtaskToDOM(input);
      document.getElementById("add-subtasks").value = "";
    } else {
      handleMaxSubtasksError();
    }
  }
}


/**
 * Counts the current number of subtasks in the DOM.
 * @returns {number} Current number of subtasks.
 */
function countCurrentSubtasks() {
  return document.getElementsByClassName("added-subtask").length;
}


/**
 * Adds a subtask to the DOM based on user input.
 * @param {string} input - User input for the subtask.
 */
function addSubtaskToDOM(input) {
  const subtaskId = `subtask-${subtaskIdCounter++}`;
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


/**
 * Handles the error when the maximum number of subtasks is reached.
 */
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


/**
 * Resets the priority settings based on the selected priority.
 * @param {Object} prioritySettings - Object containing priority settings.
 * @param {string} priority - Selected priority.
 */
function resetPriorities(prioritySettings, priority) {
  const priorityElements = document.querySelectorAll('.prioprity-urgent, .prioprity-medium, .prioprity-low');
  for (let i = 0; i < priorityElements.length; i++) {
    const priorityElement = priorityElements[i];
    priorityElement.style.backgroundColor = '';
    priorityElement.style.color = 'black';
    toggleImagesVisibility(priorityElement, prioritySettings, priority);
  }
}


/**
 * Updates the display for the selected priority based on priority settings.
 * @param {Object} prioritySettings - Object containing priority settings.
 * @param {string} priority - Selected priority.
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
 * Toggles the visibility of images based on priority settings.
 * @param {HTMLElement} priorityElement - Priority element.
 * @param {Object} prioritySettings - Object containing priority settings.
 * @param {string} priority - Selected priority.
 */
function toggleImagesVisibility(priorityElement, prioritySettings, priority) {
  const images = priorityElement.querySelectorAll('img');
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    img.classList.toggle('d-none', img.classList.contains(prioritySettings[priority].imgToShow));
  }
}


/**
 * Sets the priority name based on the selected priority.
 * @param {string} priority - Selected priority.
 * @returns {string} Priority name.
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
 * Sets the selected priority and updates the display accordingly.
 * @param {string} priority - Selected priority.
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
 * Displays selected contacts icons in the selected contacts container.
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
 * Updates the selected contacts container with selected contacts.
 * @param {HTMLElement} selectedContactsContainer - Container for displaying selected contacts.
 */
function updateSelectedContactsContainer(selectedContactsContainer) {
  selectedContactsContainer.innerHTML = '';
  for (let i = 0; i < selectedContacts.length; i++) {
    const name = selectedContacts[i];
    const selectedContactIcon = document.createElement("div");
    selectedContactIcon.classList.add("contact-icon");
    selectedContactIcon.textContent = name.charAt(0).toUpperCase();
    selectedContactIcon.style.backgroundColor = contactColors[name];
    selectedContactIcon.style.color = "white";
    selectedContactsContainer.appendChild(selectedContactIcon);
  }
}