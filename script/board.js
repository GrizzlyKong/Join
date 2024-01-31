/* const STORAGE_TOKEN = 'UK3WMTJPY9HCOS9AB0PGAT5U9XL1Y2BKP4MIYIVD';
const STORAGE_URL = 'https://remote-storage.developerakademie.org/item';
 */
let currentDraggedElement;
let taskIdCounter = 0;
let subtaskIdCounter = 0;
let addCount = 0;
let selectedPriority = null;
let selectedPriorityName = null;

async function init() {
  await includeHTML();
  displayLoggedInUser();
  updateHTML();
  AddPriorities();
  populateContactsDropdown();
  /*   loadTasks(); */
}


async function populateContactsDropdown() {
  try {
    const loggedInUserName = localStorage.getItem("loggedInUserName");
    if (!loggedInUserName) {
      console.error("No logged-in user found. Contacts cannot be loaded.");
      return;
    }

    const contactsData = await getItem(`contacts_${loggedInUserName}`);
    const userContacts = JSON.parse(contactsData) || [];

    const selectedContact = document.getElementById("selectedContact");
    const contactsDropdown = document.getElementById("contactsDropdownTask");
    const contactsContainer = document.getElementById("contactsContainerTask");
    contactsDropdown.innerHTML = '<option value="" selected disabled>Select contacts to assign</option>';

    contactsContainer.innerHTML = '';


    userContacts.forEach((contact, index) => {
      const { name, color } = contact;
      if (!name) {
        return;
      }

      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;

      contactsDropdown.appendChild(option);

      const contactElement = createContactIcon(contact);
      contactsContainer.appendChild(contactElement);
    });
    contactsDropdown.addEventListener("change", () => {
      selectedContact.textContent = contactsDropdown.value;
    });
  } catch (error) {
    console.error("Error loading contacts:", error);
  }
}





function displayLoggedInUser() {
  const loggedInUserName = localStorage.getItem('loggedInUserName');

  if (loggedInUserName) {
    const userNameIcon = document.getElementById('board-user-icon');
    const firstLetter = loggedInUserName.charAt(0).toUpperCase();
    userNameIcon.textContent = firstLetter;
  }
}


/* async function setItem(key, value) {
  const payload = { key, value, token: STORAGE_TOKEN };
  return fetch(STORAGE_URL, { method: 'POST', body: JSON.stringify(payload) })
      .then(res => res.json());
}

async function getItem(key) {
  const url = `${STORAGE_URL}?key=${key}&token=${STORAGE_TOKEN}`;
  return fetch(url).then(res => res.json()).then(res => {
      if (res.data) {
          return res.data.value;
      } else {
          throw `Could not find data with key "${key}".`;
      }
  });
} */

/* async function loadTasks() {
  try {
    let tasks = await getItem('tasks');
    tasks.forEach(task => {
        addTaskToDOM(task);
    });
  } catch (error) {
    console.error('Fehler beim Laden der Tasks:', error);
  }
} */



function findTask() {
  const inputValue = document.getElementById("findTask").value.toLowerCase();
  const allTasks = document.querySelectorAll(".board-task-card");

  allTasks.forEach((container) => {
    const taskName = container
      .querySelector(".board-task-card-title")
      .innerText.toLowerCase();

    if (taskName.includes(inputValue)) {
      container.style.display = "flex";
    } else {
      container.style.display = "none";
    }
  });
}




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

function addTask() {
  console.log('Moin');
  let addToTask = document.getElementById("add-task");
  document.getElementById("board-div").classList.add("background");
  document.getElementById("add-task").classList.remove("d-none");
  document.getElementById("add-task").classList.add("sign-up-animation");
  addToTask.innerHTML = generateAddTaskForm();

  populateContactsDropdown("contactsDropdownTask");
  bindSubtaskEvents();
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

function closeAddTodo() {
  document.getElementById("add-task").classList.add("d-none");
}

function getValueFromInput(title, description, category, dueDate){
  let title = document.getElementById("title-todo").value;
  let description = document.getElementById("description-todo").value;
  let category = document.getElementById("category-todo").value;
  let dueDate = document.getElementById("date-todo").value;
}

function addTodo() {
  getValueFromInput(title, description, category, dueDate);

  let subtasks = Array.from(
    document.querySelectorAll("#added-subtasks .added-subtask")
  ).map((subtask) => subtask.textContent.trim());
  let totalSubtasks = subtasks.length; 
  const taskId = `task-${taskIdCounter++}`; 

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
  let taskHTML = generateTask(taskId,category,title,description,dueDate,selectedPriority,priorityImage);

 selectedPriority = null;
  document.getElementById("todo").insertAdjacentHTML("beforeend", taskHTML);
  updateProgressBar(taskId, totalSubtasks);

  let newTaskElement = document.getElementById(taskId);
  bindDragEvents(newTaskElement);

  // Formular und Modalfenster schließen
  document.getElementById("add-task").classList.add("d-none");
  document.getElementById("board-div").classList.remove("background");
}

function updateProgressBar(taskId, totalSubtasks) {
  const maxSubtasks = 2; // Maximale Anzahl der Subtasks
  const progressPercent = (totalSubtasks / maxSubtasks) * 100; // Prozent der abgeschlossenen Subtasks

  let progressBar = document.getElementById(`bar-fill-${taskId}`);
  if (progressBar) {
    progressBar.style.width = `${progressPercent}%`;
  }

  let subtaskText = document.getElementById(`subtasks-amount-${taskId}`);
  if (subtaskText) {
    subtaskText.textContent = `${totalSubtasks}/${maxSubtasks} Subtasks`;
  }
}

/* async function saveTask(task) {
  try {
      let tasks = await getItem('tasks') || [];
      tasks.push(task);
      await setItem('tasks', tasks);
  } catch (error) {
      console.error('Fehler beim Speichern des Tasks:', error);
  }
} */

function generateCurrentValueFromInput(currentTitle,currentDescription,currentCategory,currentDueDate){
  let currentTitle = taskElement.querySelector(
    ".board-task-card-description"
  ).textContent;
  let currentDescription = taskElement.querySelector(".board-task-card-task").textContent;
  let currentCategory = taskElement.querySelector(
    ".board-task-card-title"
  ).textContent;
  let currentDueDate = taskElement.querySelector(
    ".board-task-card-date"
  ).textContent;
}



function openTaskInfos(taskId,title,description,category,dueDate,subtasks,priorityName,priorityImage
) {
  let priorityHtml = `
  <div class="task-info-priority-name">${priorityName}</div>
  <img src="${priorityImage}" class="task-info-priority-image">
`;
  let taskElement = document.getElementById(taskId);

  document.getElementById("all-task-infos").classList.remove("d-none");
  
  generateCurrentValueFromInput(currentTitle,currentDescription,currentCategory,currentDueDate);

  let subtasksHtml = subtasks.map((subtask, index) =>
        `<div class="hover-subtask column pointer" onmouseover="showIcons(${index})" onmouseout="hideIcons(${index})">
    ${subtask}
    <img id="edit-icon-${index}" onclick="editExistingSubtask(${index}, ${subtask})" src="../assets/icons/edit.svg" style="display:none;">
    <img id="delete-icon-${index}" onclick="deleteExistingSubtask(${index})" src="../assets/icons/delete.svg" style="display:none;">
  </div>`
  ).join("");
  let encodedSubtasksHtml = encodeURIComponent(subtasksHtml);
  document.getElementById("all-task-infos").classList.remove("d-none");
  let allTaskInfos = document.getElementById("all-task-infos");

  allTaskInfos.innerHTML = openTaskWithAllInfos(currentCategory,currentTitle,currentDescription,currentDueDate,priorityHtml,subtasksHtml,taskId,encodedSubtasksHtml,priorityName,priorityImage);

  if (!Array.isArray(subtasks)) {
    console.error("subtasks ist kein Array:", subtasks);
    return; // Beendet die Ausführung der Funktion, wenn 'subtasks' kein Array ist
  }
}

function editExistingSubtask(index, subtask) {
  let subtaskElement = document.getElementById(`subtask-${index}`);

  let editableSubtaskHtml = `
    <div>
      <input id="input-subtask-${index}" class="subtask-input" type="text" value="${subtask}">
      <img id="save-icon-${index}" onclick="saveEditedSubtask()" src="../assets/icons/correct.svg" style="display:inline;"/>
      <img id="cancel-icon-${index}" onclick="cancelEditSubtask()" src="../assets/icons/delete.svg" style="display:inline;"/>
    </div>`;

  subtaskElement.innerHTML = editableSubtaskHtml;
}

function showIcons(index) {
  document.getElementById(`edit-icon-${index}`).style.display = "inline";
  document.getElementById(`delete-icon-${index}`).style.display = "inline";
}

function hideIcons(index) {
  document.getElementById(`edit-icon-${index}`).style.display = "none";
  document.getElementById(`delete-icon-${index}`).style.display = "none";
}

function deleteTaskInfos(taskId) {
  console.log("Löschversuch für Task mit ID:", taskId);
  let taskElement = document.getElementById(taskId);
  if (taskElement) {
    taskElement.remove(); // Entfernt das Element aus dem DOM
  }
  let wholeTaskInfos = document.querySelector(".whole-task-infos");
  wholeTaskInfos.classList.add("d-none");
}

function editTaskInfos(taskId, encodedSubtasksHtml, priorityName, priorityImage){
  let taskInfoContainer = document.querySelector(".whole-task-infos");
  let subtasksHtml = decodeURIComponent(encodedSubtasksHtml);

  let title = taskInfoContainer.querySelector(".task-info-title").textContent;
  let description = taskInfoContainer.querySelector(
    ".task-info-description"
  ).textContent;
  let category = taskInfoContainer.querySelector(
    ".task-info-category"
  ).textContent;
  let dueDate = taskInfoContainer.querySelector(
    ".task-info-due-date .variable"
  ).textContent;

  taskInfoContainer.innerHTML = editTaskInfosForm(subtasksHtml,title,description,category,dueDate,priorityName,priorityImage);
}

function deleteExistingSubtask(index) {
  // Löscht eine bestehende Subtask
  let subtaskElement = document.getElementById(`editable-subtask-${index}`);
  if (subtaskElement) {
    subtaskElement.remove();
  }
}

function saveEditedTaskInfo(taskId) {
  // Extrahiert die bearbeiteten Werte
  let editedTitle = document.getElementById(`edit-title-${taskId}`).value;
  let editedDescription = document.getElementById(`edit-description-${taskId}`).value;
  let editedCategory = document.getElementById(`edit-category-${taskId}`).value;
  let editedDueDate = document.getElementById(`edit-due-date-${taskId}`).value;

  let priorityElement = document.getElementById("edit-priority-" + taskId);
if (priorityElement) {
    let selectedPriority = priorityElement.value;
} else {
    console.error("Element nicht gefunden: edit-priority-" + taskId);
}
let priorityName, priorityImage;
switch (selectedPriority) {
  case 'urgent':
    priorityName = 'Urgent';
    priorityImage = "../assets/icons/urgent3.svg";
    break;
    case 'medium':
      priorityName = 'Medium';
      priorityImage = "../assets/icons/medium.svg";
      break;
    case 'low':
      priorityName = 'Low';
      priorityImage = "../assets/icons/low.svg";
      break;
  }

  let taskElement = document.getElementById(taskId);
  if (taskElement) {
    taskElement.querySelector(".board-task-card-description").textContent =
      editedTitle;
    taskElement.querySelector(".board-task-card-task").textContent =
      editedDescription;
    taskElement.querySelector(".board-task-card-title").textContent =
      editedCategory;
    taskElement.querySelector(".board-task-card-date").textContent =
      editedDueDate;
  }
  if (taskElement) {
      let priorityElement = taskElement.querySelector(".board-task-card-priority");
      priorityElement.dataset.priorityName = priorityName;
      priorityElement.querySelector("img").src = priorityImage;
  }

  if (taskElement) {
    let priorityImgElement = taskElement.querySelector(".board-task-card-priority img");
    if (priorityImgElement) {
      priorityImgElement.src = priorityImage;
    }
  }

  let taskInfoContainer = document.querySelector(".whole-task-infos");
  if (taskInfoContainer) {
    taskInfoContainer.innerHTML = `
      <div class="task-info-top">
        <div class="task-info-category">${editedCategory}</div>
        <div><img onclick="closeTaskInfos()" src="../assets/icons/Close2.svg"></div>
      </div>
      <div class="task-info-title">${editedTitle}</div>
      <div class="task-info-description">${editedDescription}</div>
      <div class="task-info-due-date">
        <div class="headline3">Due date:</div>
        <div class="variable">${editedDueDate}</div>
      </div>
      <div class="task-info-prio">
      <div>Priority:</div>
      <div class="task-info-priority-name">${priorityName}</div>
      <img src="${priorityImage}" class="task-info-priority-image">

        </div>
      </div>
      <div class="task-info-assigned-to">
        <div class="headline3">Assigned To:</div>
        <div class="variable">
          <div class="task-info-contacts">Kontakte aktualisieren</div>
        </div>
      </div>
      <div class="task-info-subtasks">
        <div class="headline3">Subtasks</div>

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
  openTaskInfos(
    taskId,
    editedTitle, // oder title, falls Sie den ursprünglichen Titel behalten
    editedDescription, // oder description
    editedCategory, // oder category
    editedDueDate, // oder dueDate
    priorityName, // Aktualisierter Wert
    priorityImage // Aktualisierter Wert
  );
}

function correctSubtask(taskId) {
  // taskId hinzugefügt
  let input = document.getElementById("add-subtasks").value.trim();
  if (input !== "") {
    const currentSubtasks = document.querySelectorAll(
      `#${taskId} .added-subtask`
    ).length;
    if (currentSubtasks < 2) {
      const subtaskId = `subtask-${subtaskIdCounter++}`;
      let addedSubtasks = document.getElementById("added-subtasks");
      addedSubtasks.innerHTML += `
        <div id="${subtaskId}" class="added-subtask pointer">
          <div> ${input}</div>
          <div class="subtask-both-img d-none">
            <img onclick="editSubtask('${subtaskId}')" class="subtask-img1" src="../assets/icons/edit.svg">
            <img onclick="deleteSubtask('${subtaskId}')" class="subtask-img2" src="../assets/icons/delete.svg">
          </div>
        </div>
      `;
      document.getElementById("add-subtasks").value = "";
      updateTaskProgress(taskId, 0, currentSubtasks + 1);
    } else {
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

function closeTaskInfos() {
  document.getElementById("all-task-infos").classList.add("d-none");
}

function setSelectedPriority(priority) {
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


/* function setPriority(priority, taskId) {
  let prioritySrc = {
    urgent: "../assets/icons/urgent3.svg",
    medium: "../assets/icons/medium.svg",
    low: "../assets/icons/low.svg",
  };

  let src = prioritySrc[priority] || "";
  document.getElementById(`priorities-todo-${taskId}`).src = src;
} */

function bindDragEvents(element) {
  element.addEventListener("dragstart", (e) => startDragging(e, element));
}

function startDragging(event, element) {
  event.dataTransfer.setData("text", event.target.id);
}

function allowDrop(event) {
  event.preventDefault();
}

function drop(event, targetId) {
  event.preventDefault();
  let data = event.dataTransfer.getData("text");
  let draggedElement = document.getElementById(data);
  let target = document.getElementById(targetId);
  if (target && draggedElement) {
    target.appendChild(draggedElement);
  }
}

function addTaskToDOM(task) {

  let newCard = document.getElementById(task.id);
  newCard.setAttribute("draggable", true);
  newCard.addEventListener("dragstart", (e) => startDragging(e, newCard));
}

function updateHTML() {
  let taskCards = document.querySelectorAll(".board-task-card");
  taskCards.forEach((card, index) => {
    card.setAttribute("draggable", true);
    card.setAttribute("id", "task-card-" + index); 
    card.addEventListener("dragstart", (e) => startDragging(e, card));
  });
}

function highlight(id) {
  document.getElementById(id).classList.add("drag-area-highlight");
}

function removeHighlight(id) {
  document.getElementById(id).classList.remove("drag-area-highlight");
}

/* function getDate() {
  let today = new Date();
  let yyyy = today.getFullYear();
  let mm = today.getMonth() + 1; // Der Monat beginnt mit der 0
  let dd = today.getDate();

  if (dd < 10) dd = "0" + dd;
  if (mm < 10) mm = "0" + mm;

  let formattedToday = dd + "/" + mm + "/" + yyyy;

  document.getElementById("date-todo").value = formattedToday;
} */
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
            <img onclick="editSubtask('${subtaskId}')" class="subtask-img1" src="../assets/icons/edit.svg">
            <img onclick="deleteSubtask('${subtaskId}')" class="subtask-img2" src="../assets/icons/delete.svg">
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

function editSubtask(subtaskId) {
  let subtaskElement = document.getElementById(subtaskId);
  let subtaskContent = subtaskElement.querySelector("div").textContent;
  const taskId = `task-${taskIdCounter++}`;

  subtaskElement.innerHTML = `
    <input type="text" id="edit-${subtaskId}" class="edit-input" value="${subtaskContent.trim()}">
    <div>
      <img onclick="deleteSubtask('${taskId}', '${subtaskId}')" src="../assets/icons/delete.svg">
      <img onclick="saveEdit('${subtaskId}')" src="../assets/icons/correct.svg">
    </div>
  `;
  document.getElementById(subtaskId).classList.add("border-bottom-blue");
  document.getElementById(subtaskId).classList.add("added-subtask-unset");
  document.getElementById(subtaskId).classList.add("border-radius-unset");
}

function saveEdit(subtaskId) {
  let inputElement = document.getElementById(`edit-${subtaskId}`);
  let updatedText = inputElement.value;

  let subtaskElement = document.getElementById(subtaskId);
  subtaskElement.innerHTML = `
    <div>&bull; ${updatedText}</div>
    <div class="subtask-both-img d-none">
      <img onclick="editSubtask('${subtaskId}')" class="subtask-img1" src="../assets/icons/edit.svg">
      <img onclick="deleteSubtask('${subtaskId}')" class="subtask-img2" src="../assets/icons/delete.svg">
    </div>
  `;
  document.getElementById(subtaskId).classList.remove("border-bottom-blue");
  document.getElementById(subtaskId).classList.remove("added-subtask-unset");
  document.getElementById(subtaskId).classList.remove("border-radius-unset");
}

function deleteSubtask(taskId, subtaskId) {
  let currentSubtask = document.getElementById(subtaskId);
  if (currentSubtask) {
    currentSubtask.remove();
  }
}

init();