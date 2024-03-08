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


async function init() {
    await includeHTML();
    AddTask()
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

async function saveTasks() {
  try {
    await setItem('allTasks', JSON.stringify(allTasks));
    console.log('Tasks saved successfully to server');
  } catch (error) {
    console.error('Error saving tasks to server:', error);
  }
}

async function loadTasks() {
  const url = `${STORAGE_URL}?key=allTasks&token=${STORAGE_TOKEN}`;
  allTasks = [];
  console.log(allTasks);
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


async function renderTasks() {
  const containers = ["todo", "inprogress", "done", "awaitingfeedback"];

  containers.forEach((containerId) => {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = "";
    }
  });

  allTasks.forEach((task) => {
    const {
      id: taskId,
      title,
      description,
      category,
      dueDate,
      subtasks,
      priority: priorityName,
      container,
    } = task;
    if (task.category === 'urgent') {
      urgentTaskCount++;
    }
    const priorityImage = getPriorityImage(priorityName);
    const categoryClass = getCategoryClass(category);
    const contactsHtml = getContactsHtml(task.contacts);

    const totalSubtasks = 2;
    const completedSubtasks = subtasks.length;
    const progressPercent = (completedSubtasks / totalSubtasks) * 100;

    const taskElement = document.createElement("div");
    taskElement.setAttribute("id", taskId);
    taskElement.className = "board-task-card pointer";
    taskElement.setAttribute("draggable", "true");
    taskElement.setAttribute("ondragstart", "startDragging(event)");

    taskElement.innerHTML = `
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

    const taskContainer = document.getElementById(task.container || "todo");
    if (taskContainer) {
      taskContainer.appendChild(taskElement);

      taskElement.addEventListener("click", () => {
        openTaskInfos(
          taskId,
          title,
          description,
          category,
          dueDate,
          subtasks,
          priorityName,
          priorityImage
        );
        populateContactsPlaceholder(task.contacts);
      });
    } else {
      console.error(
        `Container not found for task ID ${taskId} with container ID '${container}'`
      );
    }
  });
  updateUrgentTaskCountDisplay();
}

function updateUrgentTaskCountDisplay() {
  const urgentElement = document.querySelector('.summary-urgent-number');
  if (urgentElement) {
    urgentElement.textContent = urgentTaskCount;
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

      console.log("Fetched Contacts after filtering:", filteredContacts);
      return filteredContacts;
  } catch (error) {
      console.error("Error loading contacts:", error);
      return []; // Return an empty array in case of an error
  }
}

function getPriorityImage(priorityName) {
  switch (priorityName) {
    case 'Urgent':
      return '../assets/icons/urgent.svg';
    case 'Medium':
      return '../assets/icons/medium.svg';
    case 'Low':
      return '../assets/icons/low.svg';
    default:
      return '';
  }
}

function getCategoryClass(category) {
  switch (category) {
    case 'Technical Task':
      return 'category-technical';
    case 'User Story':
      return 'category-user-story';
    default:
      return 'category-default';
  }
}

function AddTask() {
  const main = document.getElementById('main');
  main.innerHTML = `
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
          <input class="select-to-assign" placeholder="Select contacts to assign">
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
    }
    async function addTodo() {
      let title = document.getElementById("title-todo").value;
      let description = document.getElementById("description-todo").value;
      let category = document.getElementById("category-todo").value;
      let dueDate = document.getElementById("date-todo").value;
    
      let subtasks = Array.from(
        document.querySelectorAll("#added-subtasks .added-subtask")
      ).map((subtask) => subtask.textContent.trim());
      let totalSubtasks = subtasks.length;
    
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
    
      let task = {
        id: taskId,
        title: title,
        description: description,
        category: category,
        dueDate: dueDate,
        subtasks: subtasks,
        priority: priorityName,
        priorityImage: priorityImage,
        contacts: [...selectedContactIcons]
      };
      allTasks.push(task);
    
      console.log("All Tasks:", allTasks);
    
      let contactsHtml = task.contacts.map(contact => {
        return `<div class="task-contact-icon" style="background-color: ${contact.color};">${contact.letter}</div>`;
      }).join('');
    
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
      <div class="icon-container task-icon-added">${contactsHtml}</div>
        <div class="board-task-card-priority">
          <img id="priority-img-${taskId}" src="${priorityImage}">
        </div>
      </div>
      `;
      selectedContactIcons = [];
      selectedPriority = null;
      document.getElementById("todo").insertAdjacentHTML("beforeend", taskHTML);
      updateProgressBar(taskId, totalSubtasks);
    
      let newTaskElement = document.getElementById(taskId);
      bindDragEvents(newTaskElement);
    
      document.getElementById("add-task").classList.add("d-none");
      document.getElementById("board-div").classList.remove("background");
    
      await saveTasks();
      removeGreyOverlay();
      location.reload();
      window.location.href = 'board.html';
}
    
function revealContacts() {
  const contactsContainer = document.getElementById("contactsContainerTask");
  const arrowDrop = document.getElementById("arrowDropImage");

  isContactsVisible = !isContactsVisible;
  contactsContainer.style.display = isContactsVisible ? "flex" : "none";

  arrowDrop.style.transform = isContactsVisible ? "rotate(180deg)" : "rotate(0deg)";
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
            <img onclick="editSubtask('${subtaskId}')" class="subtask-img1" src="../assets/icons/edit.svg" alt"a picture of a pen">
            <img onclick="deleteSubtask('${subtaskId}')" class="subtask-img2" src="../assets/icons/delete.svg" alt"a picture of a trash can">
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
function closeAddTodo() {
  document.getElementById("add-task").classList.add("d-none");
  selectedContacts = [];
    removeGreyOverlay();
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
