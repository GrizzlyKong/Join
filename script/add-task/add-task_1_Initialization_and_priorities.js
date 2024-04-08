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
 * When the Enter key is detected, it triggers the `correctSubtask` function.
 * @param {KeyboardEvent} event - The keyboard event triggered when a key is pressed.
 */
function checkEnter(event) {
  if (event.key === "Enter") {
      correctSubtask();
  }
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