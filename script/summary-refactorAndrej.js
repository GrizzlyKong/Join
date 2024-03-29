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
 * Counts tasks based on their container categories.
 * @param {Array} tasks
 * @returns {Object}
 */
function countTasksInColumns(tasks) {
  const counts = {
    todo: 0,
    inProgress: 0,
    done: 0,
    awaitingFeedback: 0
  };
  tasks.forEach(task => {
    const container = normalizeContainer(task.container);
    counts[container]++;
  });
  return counts;
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
 * Updates elements on the page with the provided task counts.
 * @param {Object} counts
 */
function updateSummaryDisplay(counts) {
  updateElementText('summary-todo-number', counts.todo);
  updateElementText('tasks-done-number', counts.done);
  updateElementText('summary-awaitingfeedback-number', counts.awaitingFeedback);
  updateElementText('tasks-progress-number', counts.inProgress);
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
  return allTasks.filter(task => task.category === 'urgent').length;
}


/**
 * Renders the summary view on the page by setting the innerHTML of the summary container.
 */
function showSummary() {
  let wholeSummary = document.getElementById('whole-summary');
  wholeSummary.innerHTML = `
  <div class="summary center">
  <div class="summary-left-side center column">
    <div class="summary-join-360 center">
      <h1>Join 360</h1>
      <span>Key Metrics at a Glance</span>
    </div>

    <div class="summary-todo-and-done-div center">
      <div class="summary-todo center">
        <div class="summary-todo-icons">
          <img class="todo1" src="../assets/icons/done.svg" alt="a picture with a pen">
          <img class="todo2 d-none" src="../assets/icons/done2.svg" alt="a picture with a pen and white a background">
        </div>
        <div class="summary-todo-number-and-name center column">
          <span id="summary-todo-number" class="summary-todo-number text-center">0</span>
          <span class="summary-todo-span">To-do</span>
        </div>
      </div>
      <div class="summary-done pointer center">
        <div class="summary-done-icon">
          <img class="done1" src="../assets/icons/todo.svg" alt="a picture with a hook">
          <img class="done2 d-none" src="../assets/icons/todo2.svg" alt="a picture with a hook and a white background">
        </div>
        <div class="summary-done-number-and-name center column">
          <span id="tasks-done-number" class="summary-done-number text-center">0</span>
          <span class="summary-done-span">Done</span>
        </div>
      </div>
    </div>

    <div class="summary-urgent-div pointer center">
      <div class="summary-urgent center">
        <div class="summary-urgent-icon-whitout-change">
          <img class="urgent1" src="../assets/icons/urgent.svg" alt="an image that describes the urgency - urgent">
        </div>
        <div class="center column">
          <span class="summary-urgent-number text-center">0</span>
          <span class="summary-urgent-span">To-do</span>
        </div>
      </div>
      <div class="date-deadline center column">
        <span class="summmary-date">October 16, 2022</span>
        <span class="summmary-deadline">Upcoming Deadline</span>
      </div>
    </div>

    <div class="all-tasks center">
      <div class="tasks-in-board pointer text-center center column">
        <span class="tasks-in-board-number text-center">0</span>
        <span class="tasks-in-board-name">Tasks in <br> Board</span>
      </div>
      <div class="tasks-in-progress pointer text-center center column">
        <span id="tasks-progress-number" class="tasks-progress-number text-center">0</span>
        <span class="tasks-progress-name">Tasks in <br> Progress</span>
      </div>
      <div class="awaiting-feedback pointer text-center center column">
        <span id="summary-awaitingfeedback-number" class="tasks-awaiting-feedback-number text-center">0</span>
        <span class="tasks-awaiting-feedback-name">Awaiting <br> Feedback</span>
      </div>
    </div>
  </div>

  <div class="greeting center column">
    <span class="greeting-good-morning">Good morning</span>
    <span id="loginName" class="greeting-name"></span>
  </div>
</div>
  `;
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
 * Creates a welcome message element personalized with the user's name.
 * @param {string} userName
 */
function createWelcomeMessage(userName) {
  const welcomeMessage = document.createElement('div');
  welcomeMessageStyle();
  const messageText = document.createTextNode('Willkommen ');
  const userNameSpan = document.createElement('span');
  userNameSpan.textContent = userName;
  userNameSpan.style.color = 'rgb(41,171,226)';
  welcomeMessage.appendChild(messageText);
  welcomeMessage.appendChild(userNameSpan);
  return welcomeMessage;
}


/**
 * Applies styling to the welcome message element. (Note: This function needs to be adjusted to correctly reference and style an element.)
 */
function welcomeMessageStyle () {
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
 * Decides whether to display the welcome message and then content based on device type and if the user is logged in.
 * Shows content directly if the conditions are not met.
 */
function displayWelcomeMessageAndContent() {
  const isMobileDevice = localStorage.getItem('isMobileDevice') === 'true';
  const userName = localStorage.getItem('loggedInUserName');
  if (isMobileDevice && userName) {
    const welcomeMessage = createWelcomeMessage(userName);
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
  document.querySelectorAll('[w3-include-html]').forEach(element => {
    element.style.transition = 'opacity 1s';
    element.style.opacity = '1';
  });
}


/**
 * Immediately shows the main content and any dynamically included HTML content without a fade-in effect.
 */
function showContentDirectly() {
  const mainContent = document.getElementById('whole-summary');
  mainContent.style.opacity = '1';
  document.querySelectorAll('[w3-include-html]').forEach(element => {
    element.style.opacity = '1';
  });
}


init();
