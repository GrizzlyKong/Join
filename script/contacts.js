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

function addNewContact() {
  let newContact = document.getElementById("add-new-contact");
  document.getElementById("contacts-div").classList.add("background");
  document.getElementById("add-new-contact").classList.add("sign-up-animation");
  document.getElementById("add-new-contact").classList.remove("d-none");
  newContact.innerHTML = `
  <div id="add-new-contact-id" class="addNewContactDiv">
    <div class ="left-side-add-contact column">
      <div><img src="/assets/icons/logo.svg"></div>
      <h1>Add contact</h1>
      <span>Tasks are better with a team!</span>
      <div class="line"></div>
    </div>
    <div class = "right-side-add-contact">
    <img onclick="closeAddContact()" class="close absolute pointer" src="/assets/icons/close.svg">
      <div class = "account center">
        <div>NP</div>
      </div>
      <div>
        <form onsubmit="" ; return false;" >
        <div class="form-contacs">
          <div class="center"><input id="email" class="log-in-field column center pointer" required type="email" placeholder="Email"><img
            class="log-in-mail-lock-icon" src="../assets/icons/mail.png"></div>
          <div class="center"><input id="password" class="log-in-field column center pointer" required type="password" placeholder="Password"><img
            class="log-in-mail-lock-icon" src="../assets/icons/lock.png"></div>
          <div class="center"><input id="password" class="log-in-field column center pointer" required type="password" placeholder="Password"><img
            class="log-in-mail-lock-icon" src="../assets/icons/lock.png"></div>
          </div>
          <div class="right-bottom">
          <div class="clear-and-create-task">
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
        </form>
      </div>
    </div>
  </div>
  `;
}
function closeAddContact() {
  document.getElementById("add-new-contact").classList.add("d-none");
  document.getElementById("add-new-contact").classList.add("sign-up-animation-close");

}