/**
 * Calculates the progress percentage of subtasks.
 * @param {Object[]} subtasks - The array of subtask objects.
 * @returns {number} The progress percentage of subtasks.
 */
function calculateSubtaskProgress(subtasks) {
    if (!subtasks || subtasks.length === 0) return 0;
    let completedSubtasks = 0;
    for (let i = 0; i < subtasks.length; i++) {
      if (subtasks[i].completed) {
        completedSubtasks++;
      }
    }
    return (completedSubtasks / subtasks.length) * 100;
  }
  
  
  /**
   * Populates the contacts dropdown.
   * @returns {Promise<void>} A Promise that resolves when the dropdown is populated.
   */
  async function populateContactsDropdown() {
    try {
        taskContacts = await fetchAndFilterContacts();
        if (isContactsListEmpty(taskContacts)) return;
        const uiElements = getUIElements();
        if (uiElementsMissing(uiElements)) return;
        setupUIEventListeners(uiElements.selectToAssignInput);
        prepareContactsContainer(uiElements.contactsContainer, taskContacts, uiElements.selectedContactsContainer);
    } catch (error) {
        console.error("Error in populateContactsDropdown:", error);
    }
  }

  
/**
 * Logs task ID and finds its index in the task list.
 * @param {string} taskId - The ID of the task.
 * @returns {number} The index of the task in the task list.
 */
function logTaskIdAndFindIndex(taskId) {
    let taskIndex = -1;
    for (let i = 0; i < allTasks.length; i++) {
      if (allTasks[i].id === taskId) {
        taskIndex = i;
        break;
      }
    }
    return taskIndex;
  }
  
  
  /**
   * Removes a task if it exists and updates the DOM.
   * @param {number} taskIndex - The index of the task to remove.
   * @param {string} taskId - The ID of the task to remove.
   */
  async function removeTaskIfExists(taskIndex, taskId) {
    if (taskIndex > -1) {
      allTasks.splice(taskIndex, 1);
      await saveTasksAndUpdateDOM(taskId);
    } else {
      console.error(`Task ${taskId} not found in allTasks.`);
    }
  }
  
  
  /**
   * Saves tasks and updates the DOM after removing a task.
   * @param {string} taskId - The ID of the task removed.
   */
  async function saveTasksAndUpdateDOM(taskId) {
    await saveTasks();
    removeTaskElement(taskId);
    hideTaskInfo();
    updateNoTaskDivs();
    removeGreyOverlay();
  }


  /**
 * Removes a task element from the DOM.
 * @param {string} taskId - The ID of the task element to remove.
 */
function removeTaskElement(taskId) {
    let taskElement = document.getElementById(taskId);
    if (taskElement) {
      taskElement.remove();
    } else {
      console.error(`DOM element for task ${taskId} not found.`);
    }
  }
  
  
  /**
   * Hides task information display.
   */
  function hideTaskInfo() {
    let wholeTaskInfos = document.querySelector(".whole-task-infos");
    if (wholeTaskInfos) {
      wholeTaskInfos.classList.add("d-none");
    }
  }
  
  
  /**
   * Deletes task information for a specific task.
   * @param {string} taskId - The ID of the task to delete.
   */
  async function deleteTaskInfos(taskId) {
    const taskIndex = logTaskIdAndFindIndex(taskId);
    await removeTaskIfExists(taskIndex, taskId);
  }
  
  
  /**
   * Sets up a container for displaying task information.
   * @param {string} containerId - The ID of the container element.
   * @returns {HTMLElement | null} The container element or null if not found.
   */
  function setupContainer(containerId) {
    if (!currentEditingTaskId) {
      return null;
    }
    const container = document.getElementById(containerId);
    if (!container) {
      return null;
    }
    container.innerHTML = '';
    return container;
  }
  
  
  /**
   * Retrieves task information for the currently editing task.
   * @returns {Object | null} The task object or null if not found.
   */
  function retrieveTask() {
    const task = allTasks.find(task => task.id === currentEditingTaskId);
    if (!task) {
      console.error("Task not found with ID:", currentEditingTaskId);
      return null;
    }
    return task;
  }


  /**
 * Creates a contact element for display.
 * @param {Object} contact - The contact object.
 * @param {boolean} isSelected - Whether the contact is selected.
 * @returns {HTMLElement} The contact element.
 */
function createContactElement(contact, isSelected) {
    const contactElement = document.createElement('div');
    contactElement.classList.add('contact-display');
    Object.assign(contactElement.style, {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      cursor: 'pointer', marginBottom: '8px', padding: '10px', borderRadius: '5px'
    });
    const iconDiv = createIconDiv(contact);
    const nameSpan = createNameSpan(contact.name);
    const checkbox = createCheckbox(contact, isSelected);
    contactElement.append(iconDiv, nameSpan, checkbox);
  
  
    /**
   * Updates the style of a contact element based on the checked state of a checkbox.
   */
  function updateContainerStyle() {
      if (checkbox.checked) {
        contactElement.style.backgroundColor = "rgb(42, 54, 71)";
        contactElement.style.color = "white";
      } else {
        contactElement.style.backgroundColor = "transparent";
        contactElement.style.color = "inherit";
      }}
    updateContainerStyle();
    contactElement.addEventListener('click', function(event) {
      if (event.target !== checkbox) {
        checkbox.checked = !checkbox.checked;
        updateContainerStyle();
        checkbox.dispatchEvent(new Event('change'));
      }});
    return contactElement;
  }
  
  
  /**
   * Creates a div element for displaying contact icon.
   * @param {Object} contact - The contact object.
   * @returns {HTMLElement} The created div element.
   */
  function createIconDiv(contact) {
    const div = document.createElement('div');
    div.classList.add('contact-icon');
    div.textContent = contact.name.charAt(0).toUpperCase();
    Object.assign(div.style, {
      backgroundColor: contact.color || '#ddd', color: 'white',
      width: '32px', height: '32px', display: 'flex', justifyContent: 'center',
      alignItems: 'center', borderRadius: '50%'
    });
    return div;
  }
  
  
  /**
   * Creates a span element for displaying contact name.
   * @param {string} name - The name of the contact.
   * @returns {HTMLElement} The created span element.
   */
  function createNameSpan(name) {
    const span = document.createElement('span');
    span.textContent = name;
    span.classList.add('contact-name');
    span.style.flexGrow = '1';
    return span;
  }
  
  
  /**
   * Creates a checkbox element for selecting a contact.
   * @param {Object} contact - The contact object.
   * @param {boolean} isSelected - Whether the contact is selected.
   * @returns {HTMLInputElement} The created checkbox element.
   */
  function createCheckbox(contact, isSelected) {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = isSelected;
    checkbox.classList.add('contact-checkbox');
    return checkbox;
  }
  
  
  /**
   * Sets up a change event listener for the checkbox to update task contacts.
   * @param {HTMLInputElement} checkbox - The checkbox element.
   * @param {Object} contact - The contact object.
   * @param {Object} task - The task object.
   */
  function setupCheckboxListener(checkbox, contact, task) {
    checkbox.addEventListener('change', function() {
      const index = task.contacts.findIndex(c => c.name === contact.name);
      if (checkbox.checked && index === -1) {
        task.contacts.push({
          name: contact.name,
          color: contact.color,
          letter: contact.name.charAt(0).toUpperCase()
        });
      } else if (!checkbox.checked && index !== -1) {
        task.contacts.splice(index, 1);
      }
    });
  }
  
  
  /**
   * Renders selected contacts in a specified container.
   * @param {string} containerId - The ID of the container element.
   */
  function renderSelectedContacts(containerId) {
    const container = setupContainer(containerId);
    if (!container) return;
    const task = retrieveTask();
    if (!task) return;
    for (let i = 0; i < taskContacts.length; i++) {
      const contact = taskContacts[i];
      const isSelected = task.contacts.some(c => c.name === contact.name);
      const contactElement = createContactElement(contact, isSelected);
      const checkbox = contactElement.querySelector('.contact-checkbox');
      setupCheckboxListener(checkbox, contact, task);
      container.appendChild(contactElement);
    }
  }
  
  
  
  /**
   * Updates the style of a contact element based on the checked state.
   * @param {HTMLElement} contactElement - The contact element.
   * @param {boolean} isChecked - Whether the contact is checked.
   */
  function updateContactElementStyle(contactElement, isChecked) {
    contactElement.style.backgroundColor = isChecked ? "rgb(42, 54, 71)" : "transparent";
    contactElement.style.color = isChecked ? "white" : "inherit";
  }


  /**
 * Closes the task information container.
 */
function closeTaskInfos() {
    document.getElementById("all-task-infos").classList.add("d-none");
    removeGreyOverlay();
  }
  
  
  /**
   * Resets the priority settings based on the selected priority.
   * @param {object} prioritySettings - The settings for different priorities.
   * @param {string} priority - The selected priority.
   */
  function resetPriorities(prioritySettings, priority) {
    const priorityElements = document.querySelectorAll('.prioprity-urgent, .prioprity-medium, .prioprity-low');
    for (let i = 0; i < priorityElements.length; i++) {
      let priorityElement = priorityElements[i];
      priorityElement.style.backgroundColor = '';
      priorityElement.style.color = 'black';
      toggleImagesVisibility(priorityElement, prioritySettings, priority);
    }
  }
  
  
  /**
   * Updates the display of the selected priority.
   * @param {object} prioritySettings - The settings for different priorities.
   * @param {string} priority - The selected priority.
   */
  function updateSelectedPriorityDisplay(prioritySettings, priority) {
    let selectedElement = document.getElementById(`priority-${priority}-todo`);
    if (selectedElement) {
      selectedElement.style.backgroundColor = prioritySettings[priority].color;
      selectedElement.style.color = prioritySettings[priority].textColor;
      selectedElement.querySelector(`.${prioritySettings[priority].imgToHide}`).classList.add('d-none');
      selectedElement.querySelector(`.${prioritySettings[priority].imgToShow}`).classList.remove('d-none');
    }
  }
  
  
  /**
   * Toggles the visibility of priority images based on the selected priority.
   * @param {HTMLElement} priorityElement - The HTML element representing the priority.
   * @param {object} prioritySettings - The settings for different priorities.
   * @param {string} priority - The selected priority.
   */
  function toggleImagesVisibility(priorityElement, prioritySettings, priority) {
    const images = priorityElement.querySelectorAll('img');
    for (let i = 0; i < images.length; i++) {
      let img = images[i];
      img.classList.toggle('d-none', img.classList.contains(prioritySettings[priority].imgToShow));
    }
  }
  
  
  /**
   * Sets the name of the priority based on the selected priority.
   * @param {string} priority - The selected priority.
   * @returns {string} The name of the priority.
   */
  function setPriorityName(priority) {
    switch (priority) {
      case 'urgent':
        return 'Urgent';
      case 'medium':
        return 'Medium';
      case 'low':
        return 'Low';
    }
  }
  
  
  /**
   * Sets the selected priority and updates its display.
   * @param {string} priority - The selected priority.
   */
  function setSelectedPriority(priority) {
    const prioritySettings = {
      'urgent': { color: '#ff3d00', textColor: 'white', imgToShow: 'urgent2', imgToHide: 'urgent1' },
      'medium': { color: '#ffa800', textColor: 'white', imgToShow: 'medium2', imgToHide: 'medium1' },
      'low': { color: '#7ae229', textColor: 'white', imgToShow: 'low2', imgToHide: 'low1' }
    };
    resetPriorities(prioritySettings, priority);
    updateSelectedPriorityDisplay(prioritySettings, priority);
    selectedPriority = priority;
    selectedPriorityName = setPriorityName(priority);
  }