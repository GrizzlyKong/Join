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
 * If the Enter key is pressed, it calls the correctSubtask function to add the subtask.
 * @param {KeyboardEvent} event - The keyboard event object.
 */
function correctSubtaskEnter(event) {
  if (event.key === 'Enter') { 
    correctSubtask();
    event.preventDefault();
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