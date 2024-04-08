/**
 * Initializes a task element.
 * @param {Object} task - The task object for which the element is being initialized.
 * @returns {HTMLElement} The initialized task element.
 */
function initializeTaskElement(task) {
    const taskElement = document.createElement('div');
    setTaskElementAttributes(taskElement, task.id);
    taskElement.innerHTML = createTaskElementInnerHTML(task);
    return taskElement;
  }
  
  
  /**
   * Sets attributes for a task element.
   * @param {HTMLElement} taskElement - The task element to set attributes for.
   * @param {string} taskId - The ID of the task.
   */
  function setTaskElementAttributes(taskElement, taskId) {
    taskElement.setAttribute('id', taskId);
    taskElement.className = 'board-task-card pointer';
    taskElement.setAttribute('draggable', 'true');
    taskElement.setAttribute('ondragstart', 'startDragging(event)');
  }


  /**
 * Checks if the contacts list is empty.
 * @param {Object[]} taskContacts - The array of contact objects.
 * @returns {boolean} `true` if the contacts list is empty, otherwise `false`.
 */
function isContactsListEmpty(taskContacts) {
    if (taskContacts.length === 0) {
        console.log("No contacts found or an error occurred while fetching contacts.");
        return true;
    }
    return false;
}


/**
 * Finds and displays tasks matching the search query.
 */
function findTask() {
    const inputValue = document.getElementById("findTask").value.trim().toLowerCase();
    const allTasks = document.querySelectorAll(".board-task-card");
    let isAnyTaskVisible = false;
    for (let i = 0; i < allTasks.length; i++) {
      const container = allTasks[i];
      const taskDescription = container.querySelector(".board-task-card-description").innerText.trim().toLowerCase();
      if (taskDescription.includes(inputValue)) {
        container.style.display = "flex";
        isAnyTaskVisible = true;
      } else {
        container.style.display = "none";
      }
    }
  }
  
  
  /**
   * Adds an event listener to the find task input field.
   */
  function addFindTaskEventListener() {
    if (window.location.href.indexOf("board") !=-1)
    document.getElementById('findTask').addEventListener('input', findTask);
  }


  /**
 * Retrieves the HTML for the task form and appends it to the element with the id 'add-task'.
 * Applies visual effects, such as background modification and animation, to enhance user experience.
 * Populates the contacts dropdown, binds subtask events, and updates relevant elements on the page.
 * @function addTask
 */
function addTask() {
    let addToTask = document.getElementById("add-task");
    document.getElementById("board-div").classList.add("background");
    document.getElementById("add-task").classList.remove("d-none");
    document.getElementById("add-task").classList.add("sign-up-animation");
    addToTask.innerHTML = addTaskHTML();
    greyOverlay();
    populateContactsDropdown("contactsDropdownTask");
    updateNoTaskDivs();
  }
  
  
  /**
   * Applies a grey overlay to the document body.
   */
  function greyOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.style.zIndex = '7';
    document.body.appendChild(overlay);
    document.body.classList.add('no-scroll');
  }
  
  
  /**
   * Closes the task creation form.
   */
  function closeAddTodo() {
    document.getElementById("add-task").classList.add("d-none");
    selectedContacts = [];
      removeGreyOverlay();
  }
  
  
  /**
   * Removes the grey overlay from the document body.
   */
  function removeGreyOverlay() {
    const overlay = document.querySelector('.overlay');
    if (overlay) {
        document.body.removeChild(overlay);
        document.body.classList.remove('no-scroll');
    }
  }


  /**
 * Creates a task object from task details.
 * @param {string} taskId - The ID of the task.
 * @param {Object} details - Details of the task.
 * @param {string[]} subtasks - Subtasks of the task.
 * @param {Object} priority - Priority information of the task.
 * @returns {Object} The created task object.
 */
function createTaskObject(taskId, details, subtasks, priority) {
    return {
      id: taskId,
      ...details,
      subtasks,
      priority: priority.priorityName,
      priorityImage: priority.priorityImage,
      contacts: [...selectedContactIcons]
    };
  }
  
  
  /**
   * Creates HTML content for displaying a task on the webpage.
   * 
   * @param {Object} task - The task object containing task details.
   * @param {string} task.id - The unique identifier of the task.
   * @param {string} task.category - The category of the task.
   * @param {string} task.title - The title of the task.
   * @param {string} task.description - The description of the task.
   * @param {string} task.dueDate - The due date of the task.
   * @param {Array} task.subtasks - An array of subtasks associated with the task.
   * @param {string} task.priorityImage - The image representing the priority of the task.
   */
  function createTaskHTML(task) {
    const { id, category, title, description, dueDate, subtasks, priorityImage } = task;
    const totalSubtasks = subtasks.length;
    const contactsHtml = generateContactsHtml(task.contacts);
    const categoryClass = getCategoryClass(category);
    const taskContainer = document.getElementById('task-container');
    if (taskContainer) {
      const taskHTML = generateTaskHTMLcontent(id, categoryClass, category, title, description, dueDate, contactsHtml, priorityImage, totalSubtasks);
      taskContainer.innerHTML += taskHTML;
    } else {
      console.error('Task container not found');
    }
  }
  
  
  
  /**
   * Inserts task HTML into the DOM.
   * @param {string} taskHTML - The HTML content for the task.
   */
  function insertTaskIntoDOM(taskHTML) {
    document.getElementById("todo").insertAdjacentHTML("beforeend", taskHTML);
  }
  
  
  /**
   * Cleans up after adding a task.
   */
  function cleanupAfterTaskAddition() {
    selectedContactIcons = [];
    selectedPriority = null;
    document.getElementById("add-task").classList.add("d-none");
    document.getElementById("board-div").classList.remove("background");
    removeGreyOverlay();
    location.reload();
  }


  /**
 * Adds a new todo task to the task list.
 * @returns {Promise<void>} A promise that resolves after the task is added.
 */
async function addTodo() {
    const details = getTaskDetailsFromForm();
    const subtasks = processSubtasks();
    const taskId = generateUniqueId();
    const priority = determinePriority();
    const task = createTaskObject(taskId, details, subtasks, priority);
    allTasks.push(task);
    const taskHTML = createTaskHTML(task);
    insertTaskIntoDOM(taskHTML);
    await saveTasks();
    cleanupAfterTaskAddition();
  }


  /**
 * Opens task information display for a specific task.
 * @param {string} taskId - The ID of the task.
 */
function openTaskInfos(taskId) {
    let task = findTaskById(taskId);
    currentEditingTaskId = taskId;
    if (task) {
      let priorityName = task.priority;
      let priorityImage = getPriorityImage(priorityName);
      let subtasks = task.subtasks;
      let category = task.category;
      let title = task.title;
      let description = task.description;
      let dueDate = task.dueDate;
      let priorityHtml = generatePriorityHtml(priorityName, priorityImage);
      let subtasksHtml = generateSubtasksHtml1(subtasks);
      let taskInfos = prepareTaskInfoDisplay(category, title, description, dueDate);
      assembleTaskInfoHtml(task, taskInfos, priorityHtml, subtasksHtml);
    }
  }


  /**
 * Edits task information for a specific task.
 * @param {string} taskId - The ID of the task to edit.
 * @param {string} [priorityName] - The name of the priority.
 * @param {string} [priorityImage] - The image URL for the priority.
 */
function editTaskInfos(taskId, priorityName, priorityImage) {
    let task = allTasks.find(task => task.id === taskId);
    if (task) {
      let subtasks = task.subtasks || [];
      let taskInfoContainer = document.querySelector(".whole-task-infos");
      let { title, description, category, dueDate } = getTaskInfoElements(taskInfoContainer);
      let subtasksHtml = generateSubtasksHtml2(subtasks, taskId);
      renderTaskForm(taskId, title, description, category, dueDate, subtasksHtml);
      bindSubtaskEvents(subtasks);
      bindSelectToAssignEvent();
      renderSelectedContacts('selectedContactsContainer2');
    }
    if (!priorityName) {
      setSelectedPriority('medium');
    } else {
      setSelectedPriority(priorityName, priorityImage);
    }
  }


  /**
 * Focuses on the subtask-input field.
 */
function focusOnSubtaskInput() {
    document.getElementById("add-subtasks").focus();
  }
  
  
  /**
   * Focuses on the search-input field.
   */
  function focusOnSearchInput() {
    document.getElementById("findTask").focus();
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
   * Cancels adding a subtask.
   */
  function cancelSubtask() {
    let input = document.getElementById("add-subtasks");
    input.value = "";
    document.getElementById("subtask-add").classList.remove("d-none");
    document.getElementById("subtask-cancel").classList.add("d-none");
    document.getElementById("subtask-correct").classList.add("d-none");
  }


  /**
 * Disables the input field temporarily.
 */
function disableInputTemporarily() {
    let inputElement = document.getElementById("add-subtasks");
    inputElement.value = "Maximal 2 Subtasks";
    inputElement.classList.add("red");
    inputElement.disabled = true;
    setTimeout(() => resetInputField(inputElement), 3000);
  }
  
  
  /**
   * Resets the input field after temporary disablement.
   * @param {HTMLElement} inputElement - The input field element.
   */
  function resetInputField(inputElement) {
    inputElement.value = "";
    inputElement.classList.remove("red");
    inputElement.disabled = false;
  }