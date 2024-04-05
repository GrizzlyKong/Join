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
    return /*html*/ `
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
 * Adds a new task to the board.
 */
  function addTaskHTML() {
    return /*html*/ `
    <form onsubmit="addTodo(); return false;" class="addTaskForm">
    <div class="headline-div">
      <h1>Add Task</h1>
      <img onclick="closeAddTodo()" class="goBack pointer" src="../assets/icons/close.svg" alt="an picture of a X">
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
            <div for="contactsDropdownTask"><span>Assigned to</span></div>
            <div class="custom-dropdown" id="contactsDropdownContainer">
          <div id="contactsDropdownTask">
            <input class="select-to-assign" placeholder="Select contacts to assign" readonly="readonly">
            <img id="arrowDropImage" class="find-contact-img" src="../assets/icons/arrowDrop.png" alt="a picture of an arrow pointing downwards" onclick="revealContacts()">
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
          <input minlength="1" oninput="addSubtasks()" id="add-subtasks" type="text" placeholder="Add new subtask" onkeydown="checkEnter(event)">
          <img id="subtask-add" class="input-icon2 pointer" src="../assets/icons/add.svg" alt="an image of a plus" onclick="focusOnSubtaskInput()">
        <div class="oninput">
          <img onclick="cancelSubtask()" id="subtask-cancel" class="input-icon3 d-none pointer center" src="../assets/icons/cancelX.svg" alt="a picture of a X">
          <img onclick="correctSubtask()" id="subtask-correct" class="input-icon4 d-none pointer center" src="../assets/icons/correct.svg" alt="a picture of a hook">
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


/**
 * Generates HTML content for displaying a task card on the webpage.
 * @param {string} id - The unique identifier of the task.
 * @param {string} categoryClass - The CSS class corresponding to the task category.
 * @param {string} category - The category of the task.
 * @param {string} title - The title of the task.
 * @param {string} description - The description of the task.
 * @param {string} dueDate - The due date of the task.
 * @param {string} contactsHtml - The HTML content representing contacts associated with the task.
 * @returns {string} The generated HTML content for the task card.
 */
  function generateTaskHTMLcontent(id, categoryClass, category, title, description, dueDate, contactsHTML) {
    return /*html*/ `
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
 * Assembles HTML for displaying task information.
 * @param {Object} task - The task object.
 * @param {Object} taskInfos - Information about task display.
 * @param {string} priorityHtml - HTML for task priority.
 * @param {string} subtasksHtml - HTML for task subtasks.
 */
function assembleTaskInfoHtml(task, taskInfos, priorityHtml, subtasksHtml) {
    const { allTaskInfos, categoryClass } = taskInfos;
    allTaskInfos.innerHTML = /*html*/ `
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
 * Generates HTML for displaying subtasks.
 * @param {Array<string>} subtasks - The array of subtasks.
 * @param {string} taskId - The ID of the task.
 * @returns {string} The HTML for displaying subtasks.
 */
function generateSubtasksHtml1(subtasks, taskId) {
    let html = '';
    for (let index = 0; index < subtasks.length; index++) {
      const subtask = subtasks[index];
      html += /*html*/`
      <div id="hoverSubtask-${index}" class="hover-subtask">
        <span>${subtask}</span>
        <div class="edit-subtask-images">
        </div>
      </div>`;
    }
    return html;
  }
  
  
  
  /**
   * Generates HTML for displaying editable subtasks.
   * @param {Array<string>} subtasks - The array of subtasks.
   * @param {string} taskId - The ID of the task.
   * @returns {string} The HTML for displaying editable subtasks.
   */
  function generateSubtasksHtml2(subtasks, taskId) {
    let html = '';
    for (let index = 0; index < subtasks.length; index++) {
      const subtask = subtasks[index];
      html += /*html*/`
      <div id="hoverSubtask-${index}" class="hover-subtask hover-subtask2 pointer" onmouseover="showIcons(${index})" onmouseout="hideIcons(${index})">
        <span>${subtask}</span>
        <div class="edit-subtask-images">
          <img id="edit-icon-${index}" onclick="startEditingSubtask('hoverSubtask-${index}', '${subtask}', '${taskId}')" src="../assets/icons/edit.svg" style="display:none">
          <img id="delete-icon-${index}" onclick="deleteExistingSubtask(${index}, '${taskId}')" src="../assets/icons/delete.svg" style="display:none">
        </div>
      </div>`;
    }
    return html;
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
    let formHtml = /*html*/ `
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
          <div for="contactsDropdownTask"><span>Assigned to</span></div>
          <div class="custom-dropdown" id="contactsDropdownContainer2">
            <div id="contactsDropdownTask2">
              <input class="select-to-assign" placeholder="Select contacts to assign" readonly="readonly">
              <img id="arrowDropImage2" class="find-contact-img" src="../assets/icons/arrowDrop.png" alt="a picture of an arrow pointing downwards" onclick="revealContacts()">
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
          <input minlength="1" id="add-subtasks-edit" type="text" placeholder="Add new subtask" onkeydown="checkEnterEdit(event)">
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
 * Creates a new subtask element.
 * @param {string} input - The content of the new subtask.
 * @param {string} subtaskId - The ID of the new subtask.
 * @returns {HTMLElement} The created subtask element.
 */
function createNewSubtaskElement(input, subtaskId) {
    let newSubtaskHtml = document.createElement("div");
    newSubtaskHtml.id = subtaskId;
    newSubtaskHtml.className = "hover-subtask hover-subtask2 pointer";
    newSubtaskHtml.innerHTML = /*html*/ `
                                <span>• ${input}</span>
                                <div class="edit-subtask-images">
                                    <img src="../assets/icons/edit.svg" style="display:none;" onclick="startEditingSubtask('${subtaskId}')">
                                    <img src="../assets/icons/delete.svg" style="display:none;" onclick="deleteExistingSubtask('${subtaskId}')">
                                </div>`;
    return newSubtaskHtml;
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
      taskInfoContainer.innerHTML = /*html*/`
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
 * Generates HTML content for contacts and subtasks.
 * @param {object} task - The task object.
 * @returns {object} Object containing HTML content for contacts and subtasks.
 */
function generateContactAndSubtaskHtml(task) {
    let subtasksHtml = '';
    for (let index = 0; index < task.subtasks.length; index++) {
      const subtask = task.subtasks[index];
      subtasksHtml += `<div class="hover-subtask column pointer">${subtask}</div>`;
    }
    let contactsHtml = '';
    for (let i = 0; i < task.contacts.length; i++) {
      const contact = task.contacts[i];
      contactsHtml += /*html*/ `
                       <div class="assigned-contact-display">
                          <div class="contact-icon" style="background-color: ${contact.color};">${contact.letter}</div>
                          <span class="contact-name">${contact.name}</span>
                       </div>`;
    }
    return { contactsHtml, subtasksHtml };
  }


  /**
 * Adds a subtask to the DOM.
 * @param {string} subtaskId - The ID of the subtask.
 * @param {string} input - The content of the subtask.
 */
function addSubtaskToDOM(subtaskId, input) {
    let addedSubtasks = document.getElementById("added-subtasks");
    addedSubtasks.innerHTML += /*html*/ `
      <div id="${subtaskId}" class="added-subtask pointer">
        <div>${input}</div>
        <div class="subtask-both-img d-none">
          <img onclick="editSubtask('${subtaskId}')" class="subtask-img1" src="../assets/icons/edit.svg" alt="a picture of a pen">
          <img onclick="deleteSubtask('${subtaskId}')" class="subtask-img2" src="../assets/icons/delete.svg" alt="a picture of a trash can">
        </div>
      </div>
    `;
  }


  /**
 * Generates HTML content for adding a subtask to a task.
 * @param {string} input - The input text for the subtask.
 * @param {Array} currentSubtasks - An array containing the current subtasks of the task.
 * @returns {string} The generated HTML content for the subtask.
 */
  function addSubtaskHTML(input, subtaskId) {
    return /*html*/ `
      <div id="${subtaskId}" class="added-subtask pointer">
          <div>&bull; ${input}</div>
        <div class="subtask-both-img">
          <img onclick="editSubtask('${subtaskId}')" class="subtask-img1" src="../assets/icons/edit.svg" alt="a picture of a pen">
          <img onclick="deleteSubtask('${subtaskId}')" class="subtask-img2" src="../assets/icons/delete.svg" alt="a picture of a trash can">
        </div>
      </div>
    `;
  }  