function generateAddTaskForm() {
  return`
    <form onsubmit="addTodo(); return false;" class="addTaskForm">
    <div class="headline-div">
      <h1>Add Task</h1>
      <img onclick="closeAddTodo()" class="goBack pointer" src="../assets/icons/close.svg">
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
              <select id="contactsDropdownTask">
                <option value="" selected disabled>Select contacts to assign</option>
                <!-- Options will be dynamically added here using JavaScript -->
              </select>
            </div>
          </div>
          <div class="contacts-container" id="contactsContainerTask"></div>
  
  
            <div class="contacts-container" id="contactsContainerTask"></div>
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
                  <img class="urgent1" src="../assets/icons/urgent3.svg" alt="">
                  <img class="urgent2 d-none" src="../assets/icons/urgent2.svg" alt="">
                </div>
              </div>
              <div id="priority-medium-todo" tabindex="2" class="prioprity-medium pointer center" onclick="setSelectedPriority('medium')">
                <div>Medium</div>
                <div>
                  <img class="medium1" src="../assets/icons/medium.svg" alt="">
                  <img class="medium2 d-none" src="../assets/icons/medium2.svg" alt="">
                </div>
              </div>
              <div id="priority-low-todo" tabindex="3" class="prioprity-low pointer center" onclick="setSelectedPriority('low')">
                <div>Low</div>
                <div>
                  <img class="low1" src="../assets/icons/low.svg" alt="">
                  <img class="low2 d-none" src="../assets/icons/low2.svg" alt="">
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
          <img id="subtask-add" class="input-icon2 pointer" src="../assets/icons/add.svg">
        <div class="oninput">
          <img onclick="cancelSubtask()" id="subtask-cancel" class="input-icon3 d-none pointer center" src="../assets/icons/cancelX.svg">
          <img onclick="correctSubtask()" id="subtask-correct" class="input-icon4 d-none pointer center" src="../assets/icons/correct.svg">
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
            <img class="cancel1" src="../assets/icons/cancel.svg" alt="">
            <img class="cancel2 d-none" src="../assets/icons/cancel2.svg" alt="">
          </button>
          <button type="submit" class="create-task pointer center">
            <span>Create Task</span>
            <img src="../assets/icons/check.svg" alt="">
          </button>
        </div>
      </div>
    </div>
  </form>
    `;
}
function generateTask(taskId,category,title,description,dueDate,selectedPriority,priorityImage) {
    return ;
}
function openTaskWithAllInfos(currentCategory,currentTitle,currentDescription,currentDueDate,priorityHtml,subtasksHtml,taskId,encodedSubtasksHtml,priorityName,priorityImage) {
    return `
    <div class="whole-task-infos absolute">
    <div class="task-info-top">
      <div class="task-info-category">${currentCategory}</div>
      <div><img onclick="closeTaskInfos()" src="../assets/icons/Close2.svg"></div>
    </div>
    <div class="task-info-title">${currentTitle}</div>
    <div class="task-info-description">${currentDescription}</div>
    <div class="task-info-due-date">
      <div class="headline3">Due date:</div>
      <div class="variable">${currentDueDate}</div>
    </div>
    <div class="task-info-prio">
      <div class="headline3">Priority:</div>
      ${priorityHtml}
    </div>
    <div class="task-info-assigned-to">
      <div class="headline3">Assigned To:</div>
      <div class="variable">
        <div class="task-info-contacts">Hier kommen die Kontakte</div>
      </div>
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
      <div onclick="editTaskInfos('${taskId}', '${encodedSubtasksHtml}','${priorityName}', '${priorityImage}')" class="task-info-edit pointer center"> 
        <img class="img3" src="../assets/icons/edit2.svg" alt="">
        <img class="img4 d-none" src="../assets/icons/edit2.png" alt="">
        <span><b>Edit</b></span>
      </div>
    </div>
  </div>
    `;
}
function editTaskInfosForm(subtasksHtml,title,description,category,dueDate,priorityName,priorityImage) {
    return `
    <form onsubmit="saveEditedTaskInfo('${taskId}'); return false;">
      <div class="edit-the-category">
      <div>Category:</div>
        <select value="${category}" type="text" id="edit-category-${taskId}" required class="edit-the-category-select pointer" placeholder="Select task category">
          <option value="" class="d-none">Select task category</option>
          <option>Technical Task</option>
          <option>User Story</option>
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
  
      <div class="all-priorities">
      <span>Prio</span>
      <div class="priorities">
      <div id="priority-urgent-todo" tabindex="1" class="prioprity-urgent pointer center" onclick="setSelectedPriority('urgent')">
          <div>Urgent</div>
          <div>
            <img class="urgent1" src="../assets/icons/urgent3.svg" alt="">
            <img class="urgent2 d-none" src="../assets/icons/urgent2.svg" alt="">
          </div>
        </div>
        <div id="priority-medium-todo" tabindex="2" class="prioprity-medium pointer center" onclick="setSelectedPriority('medium')">
          <div>Medium</div>
          <div>
            <img class="medium1" src="../assets/icons/medium.svg" alt="">
            <img class="medium2 d-none" src="../assets/icons/medium2.svg" alt="">
          </div>
        </div>
        <div id="priority-low-todo" tabindex="3" class="prioprity-low pointer center" onclick="setSelectedPriority('low')">
          <div>Low</div>
          <div>
            <img class="low1" src="../assets/icons/low.svg" alt="">
            <img class="low2 d-none" src="../assets/icons/low2.svg" alt="">
          </div>
        </div>
      </div>
    </div>
      
          <div id="edited-subtasks">
              ${subtasksHtml}
          </div>
          
      <div class="save-edited-task-button">
      <button type="submit" class="save-edited-Task pointer center">
        <span>OK</span>
        <img src="../assets/icons/check.svg" alt="">
      </button>
      </div>
    </form>
    `;
}