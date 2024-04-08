/**
 * Fetches and filters contacts data.
 * @returns {Promise<Object[]>} A Promise that resolves with the filtered contacts array.
 */
async function fetchAndFilterContacts() {
    const loggedInUserName = localStorage.getItem("loggedInUserName");
    if (!loggedInUserName) {
      console.error("No logged-in user found. Contacts cannot be loaded.");
      return [];
    }
    const contactsData = await getItem(`contacts_${loggedInUserName}`);
    const parsedContacts = JSON.parse(contactsData) || [];
    const filteredContacts = [];
    for (let i = 0; i < parsedContacts.length; i++) {
      const contact = parsedContacts[i];
      if (contact.name || contact.email || contact.phone) {
        filteredContacts.push(contact);
      }}
    return filteredContacts;
  }


/**
 * Generates HTML content for displaying contacts.
 * @param {Object[]} contacts - The array of contact objects.
 * @returns {string} The HTML content for displaying contacts.
 */
function getContactsHtml(contacts) {
  if (!contacts || contacts.length === 0) {
    return 'None';
  }
  let html = '';
  for (let i = 0; i < contacts.length; i++) {
    const contact = contacts[i];
    const contactInitial = contact.name.charAt(0).toUpperCase();
    const backgroundColor = contact.color || '#ddd';
    html += `<div class="task-contact-icon" style="background-color: ${backgroundColor};">${contactInitial}</div>`;
  }
  return html;
}


/**
 * Generates a unique ID for a task.
 * @returns {string} The generated unique ID.
 */
function generateUniqueId() {
    let uniqueIdFound = false, taskId;
    while (!uniqueIdFound) {
      taskId = `task-${taskIdCounter}`;
      if (!allTasks.some(task => task.id === taskId)) {
        uniqueIdFound = true;
      } else {
        taskIdCounter++;
      }
    }
    return taskId;
  }


  /**
 * Populates selected contacts placeholder with contact information.
 * @param {Array<Object>} contacts - The array of contacts to populate.
 */
function populateContactsPlaceholder(contacts) {
    let selectedContactsPlaceholder = document.getElementById("selectedContactsPlaceholder");
    let htmlContent = '';
    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];
      let iconDiv = `<div class="self-made-icon" style="background-color: ${contact.color};">${contact.letter}</div>`;
      htmlContent += `<div class="assigned-to-edit-contact">${iconDiv} ${contact.name}</div>`;
    }
    selectedContactsPlaceholder.innerHTML = htmlContent;
  }
  
  
  /**
   * Finds a task by its ID.
   * @param {string} taskId - The ID of the task to find.
   * @returns {Object | undefined} The task object if found, otherwise undefined.
   */
  function findTaskById(taskId) {
    return allTasks.find(task => task.id === taskId);
  }
  
  
  /**
   * Populates selected contacts placeholder for a specific task.
   * @param {string} taskId - The ID of the task.
   */
  function populateSelectedContactsPlaceholder(taskId) {
    let task = findTaskById(taskId);
    if (task) {
      let selectedContactsPlaceholder = document.getElementById('selectedContactsPlaceholder');
      selectedContactsPlaceholder.innerHTML = '';
      for (let i = 0; i < task.contacts.length; i++) {
        let contact = task.contacts[i];
        let contactDiv = createContactElement(contact);
        selectedContactsPlaceholder.appendChild(contactDiv);
      }
    }
  }


  /**
 * Validates the form for adding a new task and invokes the function to create the task.
 */
function validateFormAddTask() {
    var form = document.querySelector('.addTaskForm');
    if (!form.checkValidity()) {
      return false;
    }
    addTodo();
    return false;
  }
  
  
  /**
   * Prevents form submission when the Enter key is pressed within the title input field.
   * @param {KeyboardEvent} event - The keyboard event object.
   */
  function preventSubmitInputTitle(event) {
    if (event.key === "Enter") {
      event.preventDefault();
    }
  }
  
  
  /**
   * Creates an input field element for editing subtasks.
   * @param {string} subtask - The content of the subtask.
   * @returns {HTMLInputElement} The created input field element.
   */
  function createInputField(subtask) {
    const inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.value = subtask;
    inputField.className = 'edit-input';
    inputField.style.border = '1px solid #ccc';
    return inputField;
  }
  
  
  /**
   * Inserts an input field before a specified subtask element.
   * @param {HTMLInputElement} inputField - The input field element.
   * @param {HTMLElement} subtaskToEdit - The subtask element before which the input field will be inserted.
   * @param {HTMLElement} subtaskContainer - The container element for subtasks.
   */
  function insertInputBeforeSubtask(inputField, subtaskToEdit, subtaskContainer) {
    subtaskContainer.insertBefore(inputField, subtaskToEdit);
  }
  
  
  /**
   * Appends an input field to the end of the subtask container.
   * @param {HTMLInputElement} inputField - The input field element.
   * @param {HTMLElement} subtaskContainer - The container element for subtasks.
   */
  function appendInputField(inputField, subtaskContainer) {
    subtaskContainer.appendChild(inputField);
  }
  
  
  /**
   * Replaces an input field with text content in the subtask container.
   * @param {HTMLInputElement} inputField - The input field element.
   * @param {number} index - The index of the subtask.
   * @param {HTMLElement} subtaskContainer - The container element for subtasks.
   */
  function replaceInputWithText(inputField, index, subtaskContainer) {
    const editedText = createEditedTextElement(inputField.value, index);
    const subtaskToEdit = findSubtaskByIndex(index, subtaskContainer);
    if (subtaskToEdit) {
      subtaskContainer.replaceChild(editedText, subtaskToEdit);
    } else {
      subtaskContainer.appendChild(editedText);
    }
  }
  
  
  /**
   * Creates an edited text element for displaying subtask content.
   * @param {string} text - The content of the subtask.
   * @param {number} index - The index of the subtask.
   * @returns {HTMLElement} The created edited text element.
   */
  function createEditedTextElement(text, index) {
    const editedText = document.createElement('span');
    editedText.textContent = text;
    editedText.className = 'hover-subtask pointer';
    const iconsContainer = createIconsContainer(index);
    editedText.appendChild(iconsContainer);
    return editedText;
  }
  
  
  /**
   * Creates a container for edit and delete icons of a subtask.
   * @param {number} index - The index of the subtask.
   * @returns {HTMLElement} The created icons container element.
   */
  function createIconsContainer(index) {
    const iconsContainer = document.createElement('div');
    iconsContainer.style.display = 'none';
    const editIcon = createEditIcon(index);
    const deleteIcon = createDeleteIcon(index);
    iconsContainer.appendChild(editIcon);
    iconsContainer.appendChild(deleteIcon);
    editedText.addEventListener('mouseover', function() {
      iconsContainer.style.display = 'flex';
    });
    editedText.addEventListener('mouseout', function() {
      iconsContainer.style.display = 'none';
    });
    return iconsContainer;
  }
  
  
  /**
   * Creates an edit icon element for editing subtasks.
   * @param {number} index - The index of the subtask.
   * @returns {HTMLImageElement} The created edit icon element.
   */
  function createEditIcon(index) {
    const editIcon = document.createElement('img');
    editIcon.id = `edit-icon-${index}`;
    editIcon.src = "../assets/icons/edit.svg";
    editIcon.addEventListener('click', function() {
      editSubtask(index, inputField.value);
    });
    return editIcon;
  }
  
  
  /**
   * Creates a delete icon element for deleting subtasks.
   * @param {number} index - The index of the subtask.
   * @returns {HTMLImageElement} The created delete icon element.
   */
  function createDeleteIcon(index) {
    const deleteIcon = document.createElement('img');
    deleteIcon.id = `delete-icon-${index}`;
    deleteIcon.src = "../assets/icons/delete.svg";
    deleteIcon.addEventListener('click', function() {
      deleteSubtask(index);
    });
    return deleteIcon;
  }
  
  
  /**
   * Displays icons for editing and deleting a subtask.
   * @param {number} index - The index of the subtask.
   */
  function showIcons(index) {
    document.getElementById(`edit-icon-${index}`).style.display = "flex";
    document.getElementById(`delete-icon-${index}`).style.display = "flex";
  }
  
  
  /**
   * Hides icons for editing and deleting a subtask.
   * @param {number} index - The index of the subtask.
   */
  function hideIcons(index) {
    document.getElementById(`edit-icon-${index}`).style.display = "none";
    document.getElementById(`delete-icon-${index}`).style.display = "none";
  }


  /**
 * Binds drag events to a specified element.
 * @param {HTMLElement} element - The HTML element to bind drag events.
 */
function bindDragEvents(element) {
    element.addEventListener("dragstart", (e) => startDragging(e, element));
  }
  
  
  /**
   * Starts dragging an element.
   * @param {Event} event - The drag start event.
   * @param {HTMLElement} element - The HTML element being dragged.
   */
  function startDragging(event, element) {
    event.dataTransfer.setData("text", event.target.id);
  }
  
  
  /**
   * Allows dropping of dragged elements.
   * @param {Event} event - The drop event.
   */
  function allowDrop(event) {
    event.preventDefault();
  }
  
  
  /**
   * Handles dropping of dragged elements.
   * @param {Event} event - The drop event.
   * @param {string} targetId - The ID of the drop target.
   */
  function drop(event, targetId) {
    event.preventDefault();
    let data = event.dataTransfer.getData("text");
    let draggedElement = document.getElementById(data);
    let target = document.getElementById(targetId);
    if (target && draggedElement) {
      target.appendChild(draggedElement);
      updateNoTaskDivs();
      let movedTask = allTasks.find(task => task.id === draggedElement.id);
      if (movedTask) {
        movedTask.container = targetId;
        saveTasks();
      }
    }
  }


  /**
 * Corrects or adds a subtask based on the input from a specific input element.
 * @param {string|null} [options.taskId=null] - The ID of the specific task to which the subtask is being added or corrected.
 */
function correctSubtask({ taskId = null } = {}) {
    const inputElement = document.getElementById("add-subtasks");
    const input = inputElement.value.trim();
    if (!input) return;
    const isTaskSpecific = taskId !== null;
    const containerSelector = isTaskSpecific ? `#${taskId} .added-subtask` : ".added-subtask";
    const currentSubtasksCount = getCurrentSubtasksCount(containerSelector);
    if (currentSubtasksCount < 2) {
      handleSubtaskAddition(inputElement, input, currentSubtasksCount, taskId);
      inputElement.value = "";
      document.getElementById("subtask-add").classList.remove("d-none");
      document.getElementById("subtask-cancel").classList.add("d-none");
      document.getElementById("subtask-correct").classList.add("d-none");
    } else {
      handleMaxSubtasksError(isTaskSpecific, inputElement, taskId);
    }
    updateProgressBar();
  }
  
  
  /**
   * Handles the display of error message when maximum subtasks are reached.
   * @param {boolean} isTaskSpecific - Indicates if the error is task-specific.
   * @param {HTMLElement} inputElement - The input field element.
   * @param {string} taskId - The ID of the task.
   */
  function handleMaxSubtasksError(isTaskSpecific, inputElement, taskId) {
    inputElement.value = "";
    inputElement.placeholder = "Maximum of 2 subtasks reached";
    inputElement.classList.add("input-warning");
    setTimeout(() => {
      inputElement.placeholder = "Add new subtask";
      inputElement.classList.remove("input-warning");
    }, 3000);
    if (isTaskSpecific) {
      handleMaxSubtasksError(taskId);
    } else {
      handleMaxSubtasksReached(inputElement);
    }
  }
  
  
  /**
   * Retrieves the current count of subtasks.
   * @param {string} containerSelector - The selector for the subtask container.
   * @returns {number} The current count of subtasks.
   */
  function getCurrentSubtasksCount(containerSelector) {
    return document.querySelectorAll(containerSelector).length;
  }
  
  
  /**
   * Handles the addition of a subtask.
   * @param {HTMLElement} inputElement - The input field element.
   */
  function handleSubtaskAddition(inputElement, input, currentSubtasksCount, taskId) {
    const isTaskSpecific = taskId !== null;
    const subtaskId = generateSubtaskId();
    if (isTaskSpecific) {
      addSubtaskToDOM(subtaskId, input, taskId);
      inputElement.value = "";
      updateTaskProgress(taskId, 0, currentSubtasksCount + 1);
    } else {
      addSubtask(input, currentSubtasksCount);
    }
  }