/**
 * Renders the summary view on the page by setting the innerHTML of the summary container.
 */
function showSummaryHTML() {
    return /*html*/ `
    <div class="summary center">
    <div class="summary-left-side center column">
      <div class="summary-join-360 center">
        <h1>Join 360</h1>
        <span>Key Metrics at a Glance</span>
      </div>
      <div class="summary-todo-and-done-div center" onclick="locationReplaceToBoard()">
        <div class="summary-todo center">
          <div class="summary-todo-icons">
            <img class="todo1" src="../assets/icons/done.svg" alt="a picture with a pen">
            <img class="todo2 d-none" src="../assets/icons/done2.svg" alt="a picture with a pen and white a background">
          </div>
          <div class="summary-todo-number-and-name center column" onclick="locationReplaceToBoard()">
            <span id="summary-todo-number" class="summary-todo-number text-center">0</span>
            <span class="summary-todo-span">To-do</span>
          </div>
        </div>
        <div class="summary-done pointer center" onclick="locationReplaceToBoard()">
          <div class="summary-done-icon">
            <img class="done1" src="../assets/icons/todo.svg" alt="a picture with a hook">
            <img class="done2 d-none" src="../assets/icons/todo2.svg" alt="a picture with a hook and a white background">
          </div>
          <div class="summary-done-number-and-name center column">
            <span id="tasks-done-number" class="summary-done-number text-center">0</span>
            <span class="summary-done-span">Done</span>
          </div>
        </div>
      </div>
      <div class="summary-urgent-div pointer center" onclick="locationReplaceToBoard()">
      <div class="summary-urgent center">
      <div class="summary-urgent-icon-without-change">
          <img class="urgent1" src="../assets/icons/urgent.svg" alt="an image that describes urgency - urgent">
      </div>
      <div class="center column">
          <span id="summary-urgent-number" class="summary-urgent-number text-center">0</span>
          <span class="summary-urgent-span">Urgent Tasks</span>
      </div>
  </div>
        <div class="date-deadline center column">
          <span class="summmary-date">April 16, 2024</span>
          <span class="summmary-deadline">Upcoming Deadline</span>
        </div>
      </div>
      <div class="all-tasks center">
        <div class="tasks-in-board pointer text-center center column" onclick="locationReplaceToBoard()">
          <span class="tasks-in-board-number text-center" id="total-tasks-number">0</span>
          <span class="tasks-in-board-name">Tasks in <br> Board</span>
        </div>
        <div class="tasks-in-progress pointer text-center center column" onclick="locationReplaceToBoard()">
          <span id="tasks-progress-number" class="tasks-progress-number text-center">0</span>
          <span class="tasks-progress-name">Tasks in <br> Progress</span>
        </div>
        <div class="awaiting-feedback pointer text-center center column" onclick="locationReplaceToBoard()">
          <span id="summary-awaitingfeedback-number" class="tasks-awaiting-feedback-number text-center">0</span>
          <span class="tasks-awaiting-feedback-name">Awaiting <br> Feedback</span>
        </div>
      </div>
    </div>
    <div class="greeting column">
      <span class="greeting-good-morning">Good morning</span>
      <span id="loginName" class="greeting-name"></span>
    </div>
  </div>
    `;
}