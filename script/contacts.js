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
  newContact.innerHTML = /*HTML*/ ` 
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
        <div class="adding-contact-icon"><img src="/assets/icons/person.png"></div>
      </div>
      <div>
        <form onsubmit="return false;">
          <div class="form-contacs">
            <div class="center"><input id="contactNameInput" class="log-in-field column center pointer" required type="text" placeholder="Name"><img
              class="log-in-mail-lock-icon" src="../assets/icons/person-small.png"></div>
            <div class="center"><input id="contactEmailInput" class="log-in-field column center pointer" required type="email" placeholder="Email"><img
              class="log-in-mail-lock-icon" src="../assets/icons/mail.png"></div>
            <div class="center"><input id="contactPhoneInput" class="log-in-field column center pointer" required type="number" placeholder="Phone"><img
              class="log-in-mail-lock-icon" src="../assets/icons/call.png"></div>
          </div>
          <div class="right-bottom">
            <div class="clear-and-create-task">
              <div class="clear pointer center" onclick="clearInputAddingContact()">
                <span>Clear</span>
                <img class="cancel1" src="/assets/icons/cancel.svg" alt="">
                <img class="cancel2 d-none" src="/assets/icons/cancel2.svg" alt="">
              </div>
              <div class="create-task pointer center" onclick="addingContact()">
                <span>Create contact</span>
                <img src="/assets/icons/check.svg" alt="">
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
  `;


  const newContactElement = document.createElement("div");
  newContactElement.className = "added-contact pointer";
  newContactElement.onclick = showContact;
  newContactElement.innerHTML = `
    <div class="primary-contact-icon-container">
      <div class="added-contact-icon"></div>
    </div>
    <div class="moveRight">
      <p></p>
      <a class="contact-link"></a>
    </div>
  `;
}


function clearInputAddingContact() {
  document.getElementById("contactNameInput").value = "";
  document.getElementById("contactEmailInput").value = "";
  document.getElementById("contactPhoneInput").value = "";
}


function insertAfter(newNode, referenceNode) {
  var nextSibling = referenceNode.nextSibling;
  if (nextSibling) {
      referenceNode.parentNode.insertBefore(newNode, nextSibling);
  } else {
      referenceNode.parentNode.appendChild(newNode);
  }
}


function getRandomColor() {
const letters = "0123456789ABCDEF";
let color = "#";
for (let i = 0; i < 6; i++) {
  color += letters[Math.floor(Math.random() * 16)];
}
return color;
}


function addingContact() {
  const name = document.getElementById("contactNameInput").value;
  const email = document.getElementById("contactEmailInput").value;
  const phone = document.getElementById("contactPhoneInput").value;

  if (!name || !email || !phone) {
      alert("Please fill in all fields before creating a contact.");
      return;
  }

  const initialLetter = name.charAt(0).toUpperCase();

  const newContactElement = document.createElement("div");
  newContactElement.className = "added-contact pointer";
  newContactElement.onclick = showContact;

  const randomColor = getRandomColor();

  newContactElement.innerHTML = `
  <div class="primary-contact-icon-container">
      <div class="added-contact-icon" style="background-color: ${randomColor} !important; border: 4px solid white;">${initialLetter}</div>
  </div>
  <div class="moveRight">
      <p>${name}</p>
      <a class="contact-link">${email}</a>
  </div>
`;

  const contactsMenu = document.getElementById("contactsMenu");
  const referenceNode = contactsMenu.childNodes[2]; // Reference node at the third position
  insertAfter(newContactElement, referenceNode);

  updateLetterContacts(initialLetter);
  clearInputAddingContact();
  closeAddContact();
}



function updateLetterContacts(firstLetter) {
  const contactsMenu = document.getElementById("contactsMenu");
  const existingLetterContacts = document.querySelector(`.letter-contacts[data-letter="${firstLetter}"]`);

  if (!existingLetterContacts) {
    const newLetterContacts = document.createElement("div");
    newLetterContacts.className = "letter-contacts";
    newLetterContacts.setAttribute("data-letter", firstLetter);
    newLetterContacts.innerHTML = `<p>${firstLetter}</p>`;

    const primaryContact = contactsMenu.querySelector(".primary-contact");
    if (primaryContact) {
      primaryContact.insertAdjacentElement('afterend', newLetterContacts);
    } else {
      contactsMenu.insertBefore(newLetterContacts, contactsMenu.firstChild);
    }
  }
}


function closeAddContact() {
  document.getElementById("add-new-contact").classList.add("d-none");
  document.getElementById("add-new-contact").classList.add("sign-up-animation-close");
}


function showContact() {
  document.getElementById("contact-info").style.display = "flex";
  document.getElementById("contact-info").classList.add("show-contact-animation");
}