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
 * When the Enter key is detected, it triggers the `correctSubtask` function.
 * @param {KeyboardEvent} event - The keyboard event triggered when a key is pressed.
 */
function checkEnter(event) {
  if (event.key === "Enter") {
      correctSubtask();
  }
}


/**
 * When the Enter key is detected, it triggers the `correctSubtaskEdit` function.
 * @param {KeyboardEvent} event - The keyboard event triggered when a key is pressed.
 */
function checkEnterEdit(event) {
  if (event.key === "Enter") {
      correctSubtaskEdit();
  }
}


/**
 * Counts the number of tasks in each category.
 * @returns {Object} An object containing the count of tasks in each category.
 */
function countTasks() {
  let todoCount = 0, inProgressCount = 0, testingCount = 0, doneCount = 0;
  for (let i = 0; i < allTasks.length; i++) {
    switch (allTasks[i].category) {
      case 'todo':
        todoCount++;
        break;
      case 'in-progress':
        inProgressCount++;
        break;
      case 'testing':
        testingCount++;
        break;
      case 'done':
        doneCount++;
        break;
    }}
  return { todo: todoCount, inProgress: inProgressCount, testing: testingCount, done: doneCount };
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
  for (let i = 0; i < allTasks.length; i++) {
    renderTask(allTasks[i]);
  }
}


/**
 * Clears the task containers specified by IDs.
 * @param {string[]} containers - An array of container IDs to be cleared.
 */
function clearTaskContainers(containers) {
  for (let i = 0; i < containers.length; i++) {
    const containerId = containers[i];
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = '';
    }
  }
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
    const loggedInUserName = localStorage.getItem("loggedInUserName");
    if (!loggedInUserName) {
      console.error("No logged-in user found. Contacts cannot be loaded.");
      return [];
    }
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
 * Generates HTML content for displaying contacts.
 * @param {Object[]} contacts - The array of contact objects.
 * @returns {string} The HTML content for displaying contacts.
 */
function getContactsHtml(contacts) {
  if (!contacts || contacts.length === 0) {
    return 'None';
  }
  let html = '';
  for (let i = 0; i < contacts.length; i++) {
    const contact = contacts[i];
    const contactInitial = contact.name.charAt(0).toUpperCase();
    const backgroundColor = contact.color || '#ddd';
    html += `<div class="task-contact-icon" style="background-color: ${backgroundColor};">${contactInitial}</div>`;
  }
  return html;
}


/**
 * Calculates the progress percentage of subtasks.
 * @param {Object[]} subtasks - The array of subtask objects.
 * @returns {number} The progress percentage of subtasks.
 */
function calculateSubtaskProgress(subtasks) {
  if (!subtasks || subtasks.length === 0) return 0;
  let completedSubtasks = 0;
  for (let i = 0; i < subtasks.length; i++) {
    if (subtasks[i].completed) {
      completedSubtasks++;
    }
  }
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
  for (let i = 0; i < selectedContactIcons.length; i++) {
    const contact = selectedContactIcons[i];
    const selectedContactIcon = document.createElement("div");
    selectedContactIcon.classList.add("contact-icon");
    selectedContactIcon.textContent = contact.letter;
    selectedContactIcon.style.backgroundColor = contact.color;
    selectedContactsContainer.appendChild(selectedContactIcon);
  }
}


/**
 * Updates the selected contact icons based on the checkboxes state.
 * Clears the existing icons and updates them according to the selected checkboxes.
 */
function updateSelectedContactIcons() {
  const selectedContactsContainer = document.getElementById("selectedContactsContainer");
  selectedContactsContainer.innerHTML = '';
updateSelectedContacIconsLoop(selectedContactsContainer);
}
const checkboxes = document.querySelectorAll('.contact-checkbox');
for (let i = 0; i < checkboxes.length; i++) {
  checkboxes[i].addEventListener('change', (event) => {
      updateSelectedContactIcons();
  });
}


/**
 * Updates the selected contact icons displayed in the specified container.
 * Iterates over an array of selected contact icons and creates a div element for each icon.
 */
function updateSelectedContacIconsLoop(selectedContactsContainer) {
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
 * Renders contacts on the contacts container.
 * @param {Object[]} userContacts - The array of user contact objects.
 * @param {HTMLElement} contactsContainer - The container element for contacts.
 * @param {HTMLElement} selectedContactsContainer - The container element for selected contacts.
 * @param {Object} contactColors - An object containing contact colors.
 */
function renderContacts(userContacts, contactsContainer, selectedContactsContainer, contactColors) {
  for (let i = 0; i < userContacts.length; i++) {
    const contact = userContacts[i];
    const { name, color } = contact;
    if (!name) {
      continue;
    }
    const contactDiv = createContactDiv(name, color, contactColors);
    contactsContainer.appendChild(contactDiv);
  }
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
    addSelectedContact(contactDetail);
  } else {
    removeSelectedContact(contactName);
  }
}


/**
 * Adds a selected contact to the list of selected contacts.
 * @param {Object} contactDetail - The contact details.
 */
function addSelectedContact(contactDetail) {
  const contactName = contactDetail.name;
  let isContactExist = false;
  for (let i = 0; i < selectedContactIcons.length; i++) {
    if (selectedContactIcons[i].name === contactName) {
      isContactExist = true;
      break;
    }
  }
  if (!isContactExist) {
    selectedContactIcons.push(contactDetail);
  }
}


/**
 * Removes a selected contact from the list of selected contacts.
 * @param {string} contactName - The name of the contact to be removed.
 */
function removeSelectedContact(contactName) {
  let updatedSelectedContactIcons = [];
  for (let i = 0; i < selectedContactIcons.length; i++) {
    if (selectedContactIcons[i].name !== contactName) {
      updatedSelectedContactIcons.push(selectedContactIcons[i]);
    }
  }
  selectedContactIcons = updatedSelectedContactIcons;
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
  for (let i = 0; i < allTasks.length; i++) {
    const container = allTasks[i];
    const taskDescription = container.querySelector(".board-task-card-description").innerText.trim().toLowerCase();
    if (taskDescription.includes(inputValue)) {
      container.style.display = "flex";
      isAnyTaskVisible = true;
    } else {
      container.style.display = "none";
    }
  }
}


/**
 * Adds an event listener to the find task input field.
 */
function addFindTaskEventListener() {
  if (window.location.href.indexOf("board") !=-1)
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
  for (let i = 0; i < userContacts.length; i++) {
    const contact = userContacts[i];
    const contactElement = createContactIcon(contact);
    contactsContainer.appendChild(contactElement);
  }
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
 * Retrieves the HTML for the task form and appends it to the element with the id 'add-task'.
 * Applies visual effects, such as background modification and animation, to enhance user experience.
 * Populates the contacts dropdown, binds subtask events, and updates relevant elements on the page.
 * @function addTask
 */
function addTask() {
  let addToTask = document.getElementById("add-task");
  document.getElementById("board-div").classList.add("background");
  document.getElementById("add-task").classList.remove("d-none");
  document.getElementById("add-task").classList.add("sign-up-animation");
  addToTask.innerHTML = addTaskHTML();
  greyOverlay();
  populateContactsDropdown("contactsDropdownTask");
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
  const subtaskElements = Array.from(document.querySelectorAll("#added-subtasks .added-subtask"));
  const subtasks = [];
  for (let i = 0; i < subtaskElements.length; i++) {
    const subtask = subtaskElements[i];
    subtasks.push(subtask.textContent.trim());
  }
  return subtasks;
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
 * Creates HTML content for displaying a task on the webpage.
 * 
 * @param {Object} task - The task object containing task details.
 * @param {string} task.id - The unique identifier of the task.
 * @param {string} task.category - The category of the task.
 * @param {string} task.title - The title of the task.
 * @param {string} task.description - The description of the task.
 * @param {string} task.dueDate - The due date of the task.
 * @param {Array} task.subtasks - An array of subtasks associated with the task.
 * @param {string} task.priorityImage - The image representing the priority of the task.
 */
function createTaskHTML(task) {
  const { id, category, title, description, dueDate, subtasks, priorityImage } = task;
  const totalSubtasks = subtasks.length;
  const contactsHtml = generateContactsHtml(task.contacts);
  const categoryClass = getCategoryClass(category);
  const taskContainer = document.getElementById('task-container');
  if (taskContainer) {
    const taskHTML = generateTaskHTMLcontent(id, categoryClass, category, title, description, dueDate, contactsHtml, priorityImage, totalSubtasks);
    taskContainer.innerHTML += taskHTML;
  } else {
    console.error('Task container not found');
  }
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
  let htmlContent = '';
  for (let i = 0; i < contacts.length; i++) {
    const contact = contacts[i];
    htmlContent += `<div class="task-contact-icon" style="background-color: ${contact.color};">${contact.letter}</div>`;
  }
  return htmlContent;
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
  let htmlContent = '';
  for (let i = 0; i < contacts.length; i++) {
    const contact = contacts[i];
    let iconDiv = `<div class="self-made-icon" style="background-color: ${contact.color};">${contact.letter}</div>`;
    htmlContent += `<div class="assigned-to-edit-contact">${iconDiv} ${contact.name}</div>`;
  }
  selectedContactsPlaceholder.innerHTML = htmlContent;
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
    for (let i = 0; i < task.contacts.length; i++) {
      let contact = task.contacts[i];
      let contactDiv = createContactElement(contact);
      selectedContactsPlaceholder.appendChild(contactDiv);
    }
  }
}


/**
 * Logs task ID and finds its index in the task list.
 * @param {string} taskId - The ID of the task.
 * @returns {number} The index of the task in the task list.
 */
function logTaskIdAndFindIndex(taskId) {
  let taskIndex = -1;
  for (let i = 0; i < allTasks.length; i++) {
    if (allTasks[i].id === taskId) {
      taskIndex = i;
      break;
    }
  }
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
  for (let i = 0; i < taskContacts.length; i++) {
    const contact = taskContacts[i];
    const isSelected = task.contacts.some(c => c.name === contact.name);
    const contactElement = createContactElement(contact, isSelected);
    const checkbox = contactElement.querySelector('.contact-checkbox');
    setupCheckboxListener(checkbox, contact, task);
    container.appendChild(contactElement);
  }
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
 * Binds mouseover and mouseout events to display/hide icons for a subtask element.
 * @param {HTMLElement} subtaskElement - The subtask element.
 */
function bindSubtaskEvents(subtaskElement) {
  subtaskElement.onmouseover = function() {
    let icons = this.querySelector(".edit-subtask-images").children;
    for (let i = 0; i < icons.length; i++) {
      icons[i].style.display = 'block';
    }
  };
  subtaskElement.onmouseout = function() {
    let icons = this.querySelector(".edit-subtask-images").children;
    for (let i = 0; i < icons.length; i++) {
      icons[i].style.display = 'none';
    }
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
 * @param {string} subtaskId - The ID of the subtask.
 */
function editSubtask(subtaskId) {
  const subtaskElement = document.getElementById(subtaskId);
  const currentText = subtaskElement.querySelector('div').textContent.substring(2);
  subtaskElement.innerHTML = /*html*/`
    <input type="text" value="${currentText}" id="edit-input-${subtaskId}" class="subtask-edit-input">
    <img src="../assets/icons/correct.svg" alt="Save" class="hook-image" onclick="saveEditedSubtask('${subtaskId}')">
  `;
  const editInput = document.getElementById(`edit-input-${subtaskId}`);
  editInput.focus();
  editInput.selectionStart = editInput.selectionEnd = currentText.length;
}


/**
 * Saves the edited subtask by replacing its existing HTML with updated content.
 * @param {string} subtaskId - The ID of the subtask to be saved after editing.
 */
function saveEditedSubtask(subtaskId) {
  const editInput = document.getElementById(`edit-input-${subtaskId}`);
  const newText = editInput.value;
  const subtaskHTML = addSubtaskHTML(newText, subtaskId);
  const subtaskElement = document.getElementById(subtaskId);
  subtaskElement.outerHTML = subtaskHTML;
}


/**
 * Sets up event listeners for the input field in a subtask.
 * @param {HTMLElement} inputField - The input field element.
 * @param {HTMLElement} subtaskElement - The subtask element that contains the input field.
 * @param {string} subtaskId - The ID of the subtask.
 */
function setupInputFieldEventListeners(inputField, subtaskElement, subtaskId) {
  inputField.addEventListener('blur', function() {
    const updatedSubtaskContent = inputField.value;
    subtaskElement.innerHTML = `<div>&bull; ${updatedSubtaskContent}</div>`;
    const buttonsHTML = `
      <div class="subtask-both-img">
        <img onclick="editSubtask('${subtaskId}')" class="subtask-img1" src="../assets/icons/edit.svg" alt="a picture of a pen">
        <img onclick="deleteSubtask('${subtaskId}')" class="subtask-img2" src="../assets/icons/delete.svg" alt="a picture of a trash can">
      </div>
    `;
    subtaskElement.innerHTML += buttonsHTML;
  });
  inputField.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      inputField.blur();
    }
  });
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
  const priorityElements = document.querySelectorAll('.prioprity-urgent, .prioprity-medium, .prioprity-low');
  for (let i = 0; i < priorityElements.length; i++) {
    let priorityElement = priorityElements[i];
    priorityElement.style.backgroundColor = '';
    priorityElement.style.color = 'black';
    toggleImagesVisibility(priorityElement, prioritySettings, priority);
  }
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
  const images = priorityElement.querySelectorAll('img');
  for (let i = 0; i < images.length; i++) {
    let img = images[i];
    img.classList.toggle('d-none', img.classList.contains(prioritySettings[priority].imgToShow));
  }
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
  for (let index = 0; index < taskCards.length; index++) {
    let card = taskCards[index];
    card.setAttribute("draggable", true);
    card.setAttribute("id", "task-card-" + index); 
    card.addEventListener("dragstart", (e) => startDragging(e, card));
  }
}


/**
 * Focuses on the subtask input field.
 */
function focusOnSubtaskInput() {
  document.getElementById("add-subtasks").focus();
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
    addedSubtasks.innerHTML += addSubtaskHTML(input, subtaskId);
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
 * Corrects or adds a subtask based on the input from a specific input element.
 * @param {string|null} [options.taskId=null] - The ID of the specific task to which the subtask is being added or corrected.
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
    inputElement.value = "";
    document.getElementById("subtask-add").classList.remove("d-none");
    document.getElementById("subtask-cancel").classList.add("d-none");
    document.getElementById("subtask-correct").classList.add("d-none");
  } else {
    handleMaxSubtasksError(isTaskSpecific, inputElement, taskId);
  }
  updateProgressBar();
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
  const noTaskDivs = document.getElementsByClassName('board-column-empty');
  
  for (let index = 0; index < departmentIds.length; index++) {
    const id = departmentIds[index];
    const taskContainer = document.getElementById(id);
    const noTaskDiv = noTaskDivs[index];
    if (taskContainer && noTaskDiv) {
      const tasks = taskContainer.getElementsByClassName('board-task-card');
      noTaskDiv.style.display = tasks.length > 0 ? 'none' : 'grid';
    }
  }
}


init();