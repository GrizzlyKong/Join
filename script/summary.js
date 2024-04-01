

async function init() {
  await includeHTML();
  showSummary();
  // Eine kurze Verzögerung könnte notwendig sein, um sicherzustellen, dass das HTML geladen wird
  setTimeout(async () => {
      await loadAndDisplayTaskCounts();
  }, 100); // Verzögerung von 100 ms
  setLoggedInUserName();
}

async function includeHTML() {
  let includeElements = document.querySelectorAll("[w3-include-html]");
  for (let i = 0; i < includeElements.length; i++) {
    const element = includeElements[i];
    file = element.getAttribute("w3-include-html"); // "includes/header.html"
    let resp = await fetch(file);
    if (resp.ok) {
      element.innerHTML = await resp.text();
    } else {
      element.innerHTML = "Page not found";
    }
  }
}

async function loadTasks() {
  try {
      let tasks = await getItem('allTasks');
      console.log("Geladene Tasks:", tasks); // Hinzugefügte Konsolenausgabe
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





function setLoggedInUserName() {
  const loggedInUserName = localStorage.getItem('loggedInUserName');

  if (loggedInUserName) {
    const userName = document.getElementById('loginName');
    userName.textContent = loggedInUserName;
  }
}
async function loadAndDisplayTaskCounts() {
  let allTasks = await loadTasks();
  console.log("Geladene Aufgaben: ", allTasks); // Zum Debuggen
  let counts = countTasksInColumns(allTasks);
  updateSummaryDisplay(counts);
}

function countTasksInColumns(tasks) {
  const counts = {
      todo: 0,
      inProgress: 0,
      done: 0,
      awaitingFeedback: 0,
      total: 0,
      urgent: tasks.filter(task => task.priority === 'Urgent').length
  };

  tasks.forEach(task => {
    console.log(task.id, task.container);
      if(task.container === 'todo') counts.todo++;
      if(task.container === 'inprogress') counts.inProgress++;
      if(task.container === 'done') counts.done++;
      if (task.container === 'awaitingfeedback') counts.awaitingFeedback++;
      if(task.category === 'urgent') counts.urgent++;
      counts.total++;
  });

  return counts;
}



function updateSummaryDisplay(counts) {
  console.log('Aktualisiere Zusammenfassung:', counts);
  const todoElement = document.getElementById('summary-todo-number');
  if (todoElement) {
      todoElement.textContent = counts.todo;
  }
  const doneElement = document.getElementById('tasks-done-number'); // Stellen Sie sicher, dass diese ID korrekt ist
  if (doneElement) {
      doneElement.textContent = counts.done;
  }
  const awaitingfeedbackElement = document.getElementById('summary-awaitingfeedback-number'); // Stellen Sie sicher, dass diese ID korrekt ist
  if (awaitingfeedbackElement) {
    awaitingfeedbackElement.textContent = counts.awaitingFeedback;
  }
  const inProgressElement = document.getElementById('tasks-progress-number'); // Stellen Sie sicher, dass diese ID korrekt ist
  if (inProgressElement) {
    inProgressElement.textContent = counts.inProgress;
  }
  const totalTasksElement = document.getElementById('total-tasks-number');
  if (totalTasksElement) {
      totalTasksElement.textContent = counts.total;
  }
  const urgentElement = document.getElementById('summary-urgent-number'); 
  if (urgentElement) {
      urgentElement.textContent = counts.urgent;
  }
}

function countUrgentTasks() {
  return allTasks.filter(task => task.category === 'urgent').length;
}


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
    <div class="summary-urgent-icon-without-change">
        <img class="urgent1" src="../assets/icons/urgent.svg" alt="an image that describes urgency - urgent">
    </div>
    <div class="text-center center column">
        <span id="summary-urgent-number" class="summary-urgent-number text-center">0</span>
        <span class="summary-urgent-span">Urgent Tasks</span>
    </div>
</div>
      <div class="date-deadline center column">
        <span class="summmary-date">April 16, 2024</span>
        <span class="summmary-deadline">Upcoming Deadline</span>
      </div>
    </div>

    <div class="all-tasks center">
      <div class="tasks-in-board pointer text-center center column">
        <span class="tasks-in-board-number text-center" id="total-tasks-number">0</span>
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

function updateUrgentTasksDisplay() {
  const urgentTasksCount = countUrgentTasks();
  const urgentTasksElement = document.querySelector('.summary-urgent-number');
  if (urgentTasksElement) {
    urgentTasksElement.textContent = urgentTasksCount;
  }
}


init();
