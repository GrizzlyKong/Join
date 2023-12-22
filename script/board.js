async function init() {
    await includeHTML();
    
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
function addTask() {
  let addToTask = document.getElementById('add-task');
  document.getElementById("board-div").classList.add("background");
  document.getElementById("add-task").classList.remove("d-none");
  document.getElementById("add-task").classList.add("sign-up-animation");
  addToTask.innerHTML = `
  <div>
  <div class="headline-div">
    <h1>Add Task</h1>
    <img onclick="closeAddTodo()" class="goBack pointer" src="/assets/icons/close.svg">
  </div>

  <div class="add-tasks-div center">
    <div class="add-tasks-left-side-div">
      <div class="title column">
        <div><span>Title</span><span class="important">*</span></div>
        <input required placeholder="Enter a title">
      </div>
      <div class="description">
        <div><span>Description</span></div>
        <textarea placeholder="Enter a Description"></textarea>
      </div>
      <div class="assigned-to">
        <div><span>Assigned to</span></div>
        <select class="pointer" placeholder="Select contacts to assign">
          <option value="" class="d-none">Select contacts to assign</option>
          <option>1</option>
          <option>2</option>
          <option>3</option>
        </select>
      </div>
    </div>
    <div class="add-tasks-right-side-div">
      <div class="duo-date">
        <div><span>Due date</span><span class="important">*</span></div>
        <input required placeholder="dd/mm/yyyy"><img class="input-icon1" src="/assets/icons/date.svg" alt="">
      </div>
      <div class="all-priorities">
        <span>Prio</span>
        <div class="priorities">
          <div tabindex="1" class="prioprity-urgent pointer center">
            <div>Urgent</div>
            <div>
              <img class="urgent1" src="/assets/icons/urgent3.svg" alt="">
              <img class="urgent2 d-none" src="/assets/icons/urgent2.svg" alt="">
            </div>
          </div>
          <div tabindex="2" class="prioprity-medium pointer center">
            <div>Medium</div>
            <div>
              <img class="medium1" src="/assets/icons/medium.svg" alt="">
              <img class="medium2 d-none" src="/assets/icons/medium2.svg" alt="">
            </div>
          </div>
          <div tabindex="3" class="prioprity-low pointer center">
            <div>Low</div>
            <div>
              <img class="low1" src="/assets/icons/low.svg" alt="">
              <img class="low2 d-none" src="/assets/icons/low2.svg" alt="">
            </div>
          </div>
        </div>
      </div>
      <div class="category">
        <div><span>Category</span><span class="important">*</span></div>
        <select required class="pointer" placeholder="Select task category">
          <option value="" class="d-none">Select task category</option>
          <option>Technical Task</option>
          <option>User Story</option>
        </select>
      </div>
      <div class="subtasks">
        <div><span>Subtasks</span><span class="important">*</span></div>
        <input required placeholder="Add new subtask"><img class="input-icon2" src="/assets/icons/add.svg" alt="">
      </div>
    </div>
  </div>
  <div class="bottom">
    <div class="left-bottom">
      <span class="important">*</span><span>This field is required</span>
    </div>
    <div class="right-bottom">
      <div class="clear-and-create-task center">
        <div class="clear pointer center">
          <span>Clear</span>
          <img class="cancel1" src="/assets/icons/cancel.svg" alt="">
          <img class="cancel2 d-none" src="/assets/icons/cancel2.svg" alt="">
        </div>
        <div class="create-task pointer center">
          <span>Create Task</span>
          <img src="/assets/icons/check.svg" alt="">
        </div>
      </div>
    </div>
  </div>
</div>
  `;
}
    
function closeAddTodo() {
  document.getElementById("add-task").classList.add("d-none");
}