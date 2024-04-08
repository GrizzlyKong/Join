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
    editInput.addEventListener('keydown', function(event) {
      handleEnterWhileEditingSubtask(event, subtaskId);
    });
  }
  
  
  /**
   * Calls saveEditedSubtask() if Enter key is pressed.
   * @param {string} subtaskId - The ID of the subtask.
   */
  function handleEnterWhileEditingSubtask(event, subtaskId) {
    if (event.key === 'Enter') {
      event.preventDefault();
      saveEditedSubtask(subtaskId);
    }
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