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
 * Adds a subtask to the DOM based on user input.
 * @param {string} input - User input for the subtask.
 */
function addSubtaskToDOM(input) {
    const subtaskId = `subtask-${subtaskIdCounter++}`;
    const addedSubtasks = document.getElementById("added-subtasks");
    addedSubtasks.innerHTML += /*HTML*/`
      <div id="${subtaskId}" class="added-subtask pointer">
          <div>&bull; ${input}</div>
        <div class="subtask-both-img">
          <img onclick="editSubtask('${subtaskId}')" class="subtask-img1" src="../assets/icons/edit.svg" alt="Edit icon">
          <img onclick="deleteSubtask('${subtaskId}')" class="subtask-img2" src="../assets/icons/delete.svg" alt="Delete icon">
        </div>
      </div>
    `;
  }
  
  
  /**
   * Deletes a subtask element from the DOM.
   * @param {string} subtaskId - The ID of the subtask to be deleted.
   */
  function deleteSubtask(subtaskId) {
    const subtaskElement = document.getElementById(subtaskId);
    if (subtaskElement) {
      subtaskElement.remove();
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