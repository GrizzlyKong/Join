/**
 * Retrieves subtasks from the input field.
 * @returns {Array} List of subtasks.
 */
function getSubtasks() {
  const subtaskElements = document.querySelectorAll("#added-subtasks .added-subtask");
  const subtasks = [];
  for (let i = 0; i < subtaskElements.length; i++) {
    subtasks.push(subtaskElements[i].textContent.trim());
  }
  return subtasks;
}


/**
 * Updates the HTML representation of a task's category.
 * @param {string} category - Category of the task.
 * @returns {string} HTML representation of the task's category.
 */
function getCategoryHtml(category) {
  let categoryClass = "";
  if (category === "Technical Task") {
    categoryClass = "category-technical";
  } else if (category === "User Story") {
    categoryClass = "category-user-story";
  }
  return `<div class="board-task-card-title ${categoryClass}">${category}</div>`;
}


/**
 * Updates the HTML content for a task with contacts and subtasks.
 * @param {Object} task - The task object containing task details.
 */
function updateTaskHtml(task) {
  let contactsHtml = '';
  for (let i = 0; i < task.contacts.length; i++) {
    const contact = task.contacts[i];
    contactsHtml += `<div class="task-contact-icon" style="background-color: ${contact.color};">${contact.letter}</div>`;
  }
  const totalSubtasks = task.subtasks.length;
  updateTaskHTMLtemplate(task, contactsHtml, totalSubtasks);
}


/**
 * Binds event listeners for subtasks.
 */
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


/**
 * Focuses on the subtask input field.
 */
function focusOnSubtaskInput() {
  document.getElementById("add-subtasks").focus();
}


/**
 * Adds subtasks to a task.
 */
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

/**
 * Updates the progress bar for subtasks.
 * @param {string} taskId - Task ID.
 * @param {number} completedSubtasks - Number of completed subtasks.
 * @param {number} totalSubtasks - Total number of subtasks.
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
 * Corrects a subtask by adding it to the DOM, clearing the input, and toggling icon visibility based on subtask count.
 */
function correctSubtask() {
  const input = document.getElementById("add-subtasks").value.trim();
  if (input !== "") {
    const currentSubtasks = countCurrentSubtasks();
    if (currentSubtasks < 2) {
      addSubtaskToDOM(input);
      document.getElementById("add-subtasks").value = "";
      document.getElementById("subtask-add").classList.remove("d-none");
      document.getElementById("subtask-cancel").classList.add("d-none");
      document.getElementById("subtask-correct").classList.add("d-none");
    } else {
      handleMaxSubtasksError();
    }
  }
}


/**
 * Counts the current number of subtasks in the DOM.
 * @returns {number} Current number of subtasks.
 */
function countCurrentSubtasks() {
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
 * Initiates the editing of a subtask.
 * @param {string} subtaskId - The ID of the subtask being edited.
 */
function editSubtask(subtaskId) {
  const subtaskElement = document.getElementById(subtaskId);
  const currentText = subtaskElement.innerText.trim();
  subtaskElement.innerHTML = /*html*/`
    <input type="text" value="${currentText}" id="edit-input-${subtaskId}" class="subtask-edit-input">
    <img src="../assets/icons/correct.svg" alt="Save" class="hook-image" onclick="saveEditedSubtask('${subtaskId}')">
  `;
  const editInput = document.getElementById(`edit-input-${subtaskId}`);
  editInput.focus();
  editInput.setSelectionRange(currentText.length, currentText.length);
}


/**
 * Saves the edited subtask and updates the DOM.
 * @param {string} subtaskId - The ID of the subtask being edited.
 */
function saveEditedSubtask(subtaskId) {
  const editInput = document.getElementById(`edit-input-${subtaskId}`);
  const newText = editInput.value.trim();
  if (newText) {
    const subtaskElement = document.getElementById(subtaskId);
    subtaskElement.innerHTML = /*html*/`
      <div>${newText}</div>
      <div class="subtask-both-img">
        <img onclick="editSubtask('${subtaskId}')" class="subtask-img1" src="../assets/icons/edit.svg" alt="a picture of a pen">
        <img onclick="deleteSubtask('${subtaskId}')" class="subtask-img2" src="../assets/icons/delete.svg" alt="a picture of a trash can">
      </div>
    `;
  }
}


/**
 * Handles the error when the maximum number of subtasks is reached.
 */
function handleMaxSubtasksError() {
  const inputElement = document.getElementById("add-subtasks");
  inputElement.value = "Maximal 2 Subtasks";
  inputElement.classList.add("red");
  inputElement.disabled = true;
  setTimeout(() => {
    inputElement.value = "";
    inputElement.classList.remove("red");
    inputElement.disabled = false;
  }, 3000);
}