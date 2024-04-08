/**
 * Initializes the application by loading HTML content, showing the summary,
 * loading and displaying task counts, setting the logged-in user name, and displaying
 * the welcome message or content directly based on conditions.
 */
async function init() {
  await includeHTML();
  showSummary();
  setTimeout(async () => {
      await loadAndDisplayTaskCounts();
  }, 100);
  setLoggedInUserName();
  displayWelcomeMessageAndContent();
}


/**
 * Dynamically includes HTML from specified files into elements with the "w3-include-html" attribute.
 * It uses fetch to load the HTML content and inserts it into the target elements.
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
 * Asynchronously loads tasks from storage.
 * @returns {Promise<Array>}
 */
async function loadTasks() {
  try {
      let tasks = await getItem('allTasks');
      if (tasks) {
          return JSON.parse(tasks);
      } else {
          console.log('Keine Tasks gefunden.');
          return [];
      }
  } catch (error) {
      console.error('Fehler beim Laden der Tasks:', error);
      return [];
  }
}


/**
 * Sets the logged-in user's name in the designated element on the page.
 */
function setLoggedInUserName() {
  const loggedInUserName = localStorage.getItem('loggedInUserName');
  if (loggedInUserName) {
    const userName = document.getElementById('loginName');
    userName.textContent = loggedInUserName;
  }
}


/**
 * Loads tasks and calculates task counts by categories, then updates the summary display with these counts.
 */
async function loadAndDisplayTaskCounts() {
  let allTasks = await loadTasks();
  let counts = countTasksInColumns(allTasks);
  updateSummaryDisplay(counts);
}


/**
 * Counts the number of tasks in different columns and calculates the total number of tasks.
 * @param {Array} tasks An array of tasks to be counted.
 * @returns {Object} An object containing counts of tasks in different columns and the total count.
 */
function countTasksInColumns(tasks) {
  const counts = {
    todo: 0,
    inProgress: 0,
    done: 0,
    awaitingFeedback: 0,
    total: 0,
    urgent: 0
  };
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    updateCounts(task, counts);
    if (task.priority === 'Urgent') {
      counts.urgent++;
    }
  }
  return counts;
}


/**
 * Updates the counts of tasks in different columns based on the given task.
 * @param {Object} task The task to update counts for.
 * @param {Object} counts The object containing counts of tasks in different columns.
 */
function updateCounts(task, counts) {
  counts.total++;
  if (task.container) {
    switch (task.container.toLowerCase()) {
      case 'todo':
        counts.todo++;
        break;
      case 'inprogress':
        counts.inProgress++;
        break;
      case 'done':
        counts.done++;
        break;
      case 'awaitingfeedback':
        counts.awaitingFeedback++;
        break;
    }
  }
}



/**
 * Normalizes container names to standard keys used in task counts.
 * @param {string} container
 * @returns {string}
 */
function normalizeContainer(container) {
  const containerMap = {
    todo: 'todo',
    inprogress: 'inProgress',
    done: 'done',
    awaitingfeedback: 'awaitingFeedback'
  };
  return containerMap[container.toLowerCase()] || container.toLowerCase();
}


/**
 * Updates the display of summary information based on the provided counts.
 * @param {Object} counts An object containing counts of various tasks.
 */
function updateSummaryDisplay(counts) {
  updateElementTextContent('summary-todo-number', counts.todo);
  updateElementTextContent('tasks-done-number', counts.done);
  updateElementTextContent('summary-awaitingfeedback-number', counts.awaitingFeedback);
  updateElementTextContent('tasks-progress-number', counts.inProgress);
  updateElementTextContent('total-tasks-number', counts.total);
  updateElementTextContent('summary-urgent-number', counts.urgent);
}


/**
 * Updates the text content of an HTML element with the provided value.
 * @param {string} elementId The ID of the HTML element to be updated.
 * @param {string|number} value The value to set as the text content of the element.
 */
function updateElementTextContent(elementId, value) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = value;
  }
}


/**
 * Counts the number of tasks categorized as 'urgent' in the allTasks array.
 * @returns {number} The number of tasks categorized as 'urgent'.
 */
function countUrgentTasks() {
  let count = 0;
  for (let i = 0; i < allTasks.length; i++) {
    if (allTasks[i].category === 'urgent') {
      count++;
    }
  }
  return count;
}


/**
 * Updates the text content of an element by its ID.
 * @param {string} id
 * @param {string|number} text
 */
function updateElementText(id, text) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = text;
  }
}


/**
 * Filters the tasks array to count only urgent tasks.
 */
function countUrgentTasks() {
  let count = 0;
  for (let i = 0; i < allTasks.length; i++) {
    if (allTasks[i].category === 'urgent') {
      count++;
    }
  }
  return count;
}


/**
 * Updates the display of urgent tasks count on the summary view.
 */
function updateUrgentTasksDisplay() {
  const urgentTasksCount = countUrgentTasks();
  const urgentTasksElement = document.querySelector('.summary-urgent-number');
  if (urgentTasksElement) {
    urgentTasksElement.textContent = urgentTasksCount;
  }
}


/**
 * Retrieves the HTML for the summary and appends it to the element with the id 'whole-summary'.
 * @function showSummary
 */
function showSummary() {
  let wholeSummary = document.getElementById('whole-summary');
  wholeSummary.innerHTML += showSummaryHTML();
}


/**
 * Redirects the browser to the 'board.html' page, replacing the current page in the browser's history.
 * @function locationReplaceToBoard
 */
function locationReplaceToBoard() {
  location.replace("../html/board.html");
}


/**
 * Creates a welcome message element personalized with the user's name.
 * @param {string} userName
 */
function createWelcomeMessage(userName) {
  const welcomeMessage = document.createElement('div');
  const messageText = document.createTextNode('Willkommen ');
  const userNameSpan = document.createElement('span');
  userNameSpan.textContent = userName;
  userNameSpan.style.color = 'rgb(41,171,226)';
  welcomeMessage.appendChild(messageText);
  welcomeMessage.appendChild(userNameSpan);
  welcomeMessageStyle(welcomeMessage);
  return welcomeMessage;
}


/**
 * Applies styling to the welcome message element. (Note: This function needs to be adjusted to correctly reference and style an element.)
 */
function welcomeMessageStyle(welcomeMessage) {
  welcomeMessage.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    fontSize: 24px;
    zIndex: 1000;
    color: rgb(42,54,71);
    text-align: center;
  `;
}


/**
 * Displays the welcome message by appending it to the document body.
 * @param {HTMLElement} welcomeMessage
 */
function showWelcomeMessage(welcomeMessage) {
  document.body.style.backgroundColor = 'white';
  document.body.appendChild(welcomeMessage);
}


/**
 * Removes the welcome message from the document body and resets the background color.
 * @param {HTMLElement} welcomeMessage
 */
function removeWelcomeMessage(welcomeMessage) {
  welcomeMessage.remove();
  document.body.style.backgroundColor = '';
}


/**
 * Displays a welcome message based on device type and user login status.
 * For mobile devices, it shows a personalized welcome message for logged-in users
 * and a generic welcome message for guests.
 * @function displayWelcomeMessageAndContent
 */
function displayWelcomeMessageAndContent() {
  const isMobileDevice = localStorage.getItem('isMobileDevice') === 'true';
  const userName = localStorage.getItem('loggedInUserName');
  let welcomeMessage;
  if (isMobileDevice) {
    if (userName) {
      welcomeMessage = createWelcomeMessage(userName);
    } else {
      welcomeMessage = createWelcomeMessage();
    }
    showWelcomeMessage(welcomeMessage);
    setTimeout(() => {
      removeWelcomeMessage(welcomeMessage);
      fadeInContent();
    }, 2000);
  } else {
    showContentDirectly();
  }
}


/**
 * Applies a fade-in effect to the main content and any dynamically included HTML content.
 */
function fadeInContent() {
  const mainContent = document.getElementById('whole-summary');
  mainContent.style.transition = 'opacity 1s';
  mainContent.style.opacity = '1';
  const elements = document.querySelectorAll('[w3-include-html]');
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    element.style.transition = 'opacity 1s';
    element.style.opacity = '1';
  }
}


/**
 * Immediately shows the main content and any dynamically included HTML content without a fade-in effect.
 */
function showContentDirectly() {
  const mainContent = document.getElementById('whole-summary');
  mainContent.style.opacity = '1';
  const elements = document.querySelectorAll('[w3-include-html]');
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    element.style.opacity = '1';
  }
}


init();