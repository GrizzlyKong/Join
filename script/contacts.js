const STORAGE_TOKEN = 'UK3WMTJPY9HCOS9AB0PGAT5U9XL1Y2BKP4MIYIVD';
const STORAGE_URL = 'https://remote-storage.developerakademie.org/item';

let contacts = [];


async function setItem(key, value) {
  const payload = { key, value, token: STORAGE_TOKEN };
  return fetch(STORAGE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  }).then(res => res.json());
}


async function getItem(key) {
  const url = `${STORAGE_URL}?key=${key}&token=${STORAGE_TOKEN}`;
  return fetch(url).then(res => res.json()).then(res => {
    if (res.data) {
      return res.data.value;
    } throw `Could not find data with key "${key}".`;
  });
}


async function init() {
  await includeHTML();
  displayUserContacts();
}


async function includeHTML() {
  let includeElements = document.querySelectorAll("[w3-include-html]");
  for (let i = 0; i < includeElements.length; i++) {
    const element = includeElements[i];
    file = element.getAttribute("w3-include-html");
    let resp = await fetch(file);
    if (resp.ok) {
      element.innerHTML = await resp.text();
    } else {
      element.innerHTML = "Page not found";
    }
  }
}


function addNewContact() {
  const newContact = document.getElementById("add-new-contact");
  updateElementClass("contacts-div", "background", "add");
  updateElementClass("add-new-contact", "sign-up-animation", "add");
  updateElementClass("add-new-contact", "d-none", "remove");

  newContact.innerHTML = generateNewContactHTML();

  const newContactElement = createNewContactElement();
  newContactElement.onclick = showContact;
}


function updateElementClass(elementId, className, action) {
  const element = document.getElementById(elementId);
  if (action === "add") {
    element.classList.add(className);
  } else {
    element.classList.remove(className);
  }
}


function generateNewContactHTML() {
  return /* HTML */ `
    <div id="add-new-contact-id" class="addNewContactDiv">
      <div class ="left-side-add-contact column">
        <div><img src="../assets/icons/logo.svg"></div>
        <h1>Add contact</h1>
        <span>Tasks are better with a team!</span>
        <div class="line"></div>
      </div>
      <div class = "right-side-add-contact">
        <img onclick="closeAddContact()" class="close absolute pointer" src="../assets/icons/close.svg">
        <div class = "account center">
          <div class="adding-contact-icon"><img src="../assets/icons/person.png"></div>
        </div>
        <div>
          <form onsubmit="return false;">
            <div class="form-contacs">
              <div class="center">
                <input id="contactNameInput" class="log-in-field column center pointer" required type="text" placeholder="Name">
                <img class="log-in-mail-lock-icon" src="../assets/icons/person-small.png">
              </div>
              <div class="center">
                <input id="contactEmailInput" class="log-in-field column center pointer" required type="email" placeholder="Email">
                <img class="log-in-mail-lock-icon" src="../assets/icons/mail.png">
              </div>
              <div class="center">
                <input id="contactPhoneInput" class="log-in-field column center pointer" required type="number" placeholder="Phone">
                <img class="log-in-mail-lock-icon" src="../assets/icons/call.png">
              </div>
            </div>
            <div class="right-bottom">
              <div class="clear-and-create-task">
                <div class="clear pointer center" onclick="clearInputAddingContact()">
                  <span>Clear</span>
                  <img class="cancel1" src="../assets/icons/cancel.svg" alt="">
                  <img class="cancel2 d-none" src="../assets/icons/cancel2.svg" alt="">
                </div>
                <div class="create-task pointer center" onclick="addingContact()">
                  <span>Create contact</span>
                  <img src="../assets/icons/check.svg" alt="">
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}


function createNewContactElement() {
  const newContactElement = document.createElement("div");
  newContactElement.className = "added-contact pointer";
  newContactElement.innerHTML = generateNewContactElementHTML();
  return newContactElement;
}


function generateNewContactElementHTML() {
  return `
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


async function addingContact() {
  const { name, email, phone } = getInputValues();

  if (!validateInputFields(name, email, phone)) {
    alert("Please fill in all fields before creating a contact.");
    return;
  }

  const initialLetter = getInitialLetter(name);
  const newContactElement = createNewContactElement(name, email, initialLetter);

  insertNewContactElement(newContactElement);
  updateLetterContacts(initialLetter);
  clearInputAddingContact();
  closeAddContact();
  await setItem(name, { name, email, phone, color: getRandomColor() });
}


function getInputValues() {
  return {
    name: document.getElementById("contactNameInput").value,
    email: document.getElementById("contactEmailInput").value,
    phone: document.getElementById("contactPhoneInput").value,
  };
}


function getInitialLetter(name) {
  return name.charAt(0).toUpperCase();
}


function createNewContactElement(name, email, initialLetter) {
  const newContactElement = document.createElement("div");
  newContactElement.className = "added-contact pointer";
  newContactElement.onclick = showContact;
  const randomColor = getRandomColor();

  newContactElement.innerHTML = generateNewContactElementHTML(initialLetter, name, email, randomColor);
  return newContactElement;
}


function insertNewContactElement(newContactElement) {
  const contactsMenu = document.getElementById("contactsMenu");
  const referenceNode = contactsMenu.childNodes[1];
  insertAfter(newContactElement, referenceNode);
}

function reloadPage() {
  location.reload();
}


function validateInputFields(name, email, phone) {
  return name && email && phone;
}


function createNewContactElement(name, email, initialLetter) {
  const newContactElement = document.createElement("div");
  newContactElement.className = "added-contact pointer";
  newContactElement.onclick = showContact;
  const randomColor = getRandomColor();

  newContactElement.innerHTML = generateNewContactElementHTML(initialLetter, name, email, randomColor);
  return newContactElement;
}


function generateNewContactElementHTML(initialLetter, name, email, randomColor) {
  return `
    <div class="primary-contact-icon-container">
      <div class="added-contact-icon" style="background-color: ${randomColor} !important; border: 4px solid white;">${initialLetter}</div>
    </div>
    <div class="moveRight">
      <p>${name}</p>
      <a class="contact-link">${email}</a>
    </div>
  `;
}


function updateLetterContacts(firstLetter) {
  const contactsMenu = document.getElementById("contactsMenu");
  const letterContacts = getLetterContactsArray(contactsMenu);

  const existingLetterContacts = findExistingLetterContacts(letterContacts, firstLetter);

  if (!existingLetterContacts) {
    const newLetterContacts = createNewLetterContacts(firstLetter);

    const insertIndex = getInsertIndex(letterContacts, firstLetter);
    insertNewLetterContacts(contactsMenu, newLetterContacts, letterContacts, insertIndex);
  }
}


function getLetterContactsArray(contactsMenu) {
  return Array.from(contactsMenu.getElementsByClassName("letter-contacts"));
}


function findExistingLetterContacts(letterContacts, firstLetter) {
  return letterContacts.find((element) => element.getAttribute("data-letter") === firstLetter);
}


function createNewLetterContacts(firstLetter) {
  const newLetterContacts = document.createElement("div");
  newLetterContacts.className = "letter-contacts";
  newLetterContacts.setAttribute("data-letter", firstLetter);
  newLetterContacts.innerHTML = `<p>${firstLetter}</p>`;
  return newLetterContacts;
}


function getInsertIndex(letterContacts, firstLetter) {
  return letterContacts.findIndex((element) => element.getAttribute("data-letter") > firstLetter);
}


function insertNewLetterContacts(contactsMenu, newLetterContacts, letterContacts, insertIndex) {
  if (insertIndex !== -1) {
    contactsMenu.insertBefore(newLetterContacts, letterContacts[insertIndex]);
  } else {
    contactsMenu.appendChild(newLetterContacts);
  }
}


function closeAddContact() {
  document.getElementById("add-new-contact").classList.add("d-none");
  document.getElementById("add-new-contact").classList.add("sign-up-animation-close");
}


function showContact() {
  const contactInfoDiv = document.getElementById("contact-info");
  const contactInfoName = document.querySelector(".contact-info-name");
  const contactInfoIcon = document.querySelector(".contact-info-icon");
  const contactInfoLink = document.querySelector(".contact-link");
  const contactInfoDetails = document.querySelector(".contact-information-details span");

  const { name, email, initialLetter, color, phoneNumber } = getContactInfo(this);

  updateContactInfo(contactInfoName, contactInfoIcon, contactInfoLink, contactInfoDetails, name, email, initialLetter, color, phoneNumber);

  displayContactInfo(contactInfoDiv);
}


function getContactInfo(contactElement) {
  return {
    name: contactElement.querySelector(".moveRight p").innerText,
    email: contactElement.querySelector(".moveRight a").innerText,
    initialLetter: contactElement.querySelector(".added-contact-icon").innerText,
    color: contactElement.querySelector(".added-contact-icon").style.backgroundColor,
    phoneNumber: contactElement.getAttribute("data-phone-number"),
  };
}


function updateContactInfo(contactInfoName, contactInfoIcon, contactInfoLink, contactInfoDetails, name, email, initialLetter, color, phoneNumber) {
  contactInfoName.innerText = name;
  contactInfoIcon.innerText = initialLetter;
  contactInfoIcon.style.backgroundColor = color;
  contactInfoLink.innerText = email;
  contactInfoDetails.innerHTML = `
    <p>Email</p>
    <a class="contact-link">${email}</a>
    <p>Phone</p>
    <span>${phoneNumber}</span>
  `;
}


function displayContactInfo(contactInfoDiv) {
  contactInfoDiv.style.display = "flex";
  contactInfoDiv.classList.add("show-contact-animation");
}


async function displayUserContacts() {
  const loggedInUserName = localStorage.getItem("loggedInUserName");

  if (!loggedInUserName) {
    console.error("No logged-in user found. Contacts cannot be displayed.");
    return;
  }

  try {
    const response = await fetch(`${STORAGE_URL}?user=${loggedInUserName}&token=${STORAGE_TOKEN}`);
    const savedContacts = await response.json();

    savedContacts.forEach((contact) => {
      const { name, email, phone, color } = contact;
      const initialLetter = name.charAt(0).toUpperCase();

      const newContactElement = createContactElement(name, email, initialLetter, phone, color);
      insertContactElement(newContactElement, initialLetter);
    });
  } catch (error) {
    console.error("Error fetching contacts from the server:", error);
  }
}


function getSortedContacts(loggedInUserName) {
  const userContactsKey = `contacts_${loggedInUserName}`;
  const savedContacts = JSON.parse(localStorage.getItem(userContactsKey)) || [];

  return savedContacts.sort((a, b) => a.name.localeCompare(b.name)); // Sort contacts alphabetically by name
}


function createContactElement(name, email, initialLetter, phone, color) {
  const newContactElement = document.createElement("div");
  newContactElement.className = "added-contact pointer";
  newContactElement.onclick = showContact;
  newContactElement.setAttribute("data-phone-number", phone);
  newContactElement.innerHTML = generateContactElementHTML(name, email, initialLetter, color);
  return newContactElement;
}


function generateContactElementHTML(name, email, initialLetter, color) {
  return `
    <div class="primary-contact-icon-container">
      <div class="added-contact-icon" style="background-color: ${color} !important; border: 4px solid white;">${initialLetter}</div>
    </div>
    <div class="moveRight">
      <p>${name}</p>
      <a class="contact-link">${email}</a>
    </div>
  `;
}


function insertContactElement(newContactElement, initialLetter) {
  const contactsMenu = document.getElementById("contactsMenu");
  const letterContacts = Array.from(contactsMenu.getElementsByClassName("letter-contacts"));
  let letterGroup = getOrCreateLetterGroup(letterContacts, initialLetter);

  letterGroup.appendChild(newContactElement);
}


function getOrCreateLetterGroup(letterContacts, initialLetter) {
  let letterGroup = letterContacts.find((element) => element.getAttribute("data-letter") === initialLetter);

  if (!letterGroup) {
    letterGroup = createLetterGroup(initialLetter);
    insertLetterGroup(letterGroup, letterContacts, initialLetter);
  }

  return letterGroup;
}


function createLetterGroup(initialLetter) {
  const letterGroup = document.createElement("div");
  letterGroup.className = "letter-contacts";
  letterGroup.setAttribute("data-letter", initialLetter);
  letterGroup.innerHTML = `<p>${initialLetter}</p>`;
  return letterGroup;
}


function insertLetterGroup(letterGroup, letterContacts, initialLetter) {
  const contactsMenu = document.getElementById("contactsMenu");
  const insertIndex = letterContacts.findIndex((element) => element.getAttribute("data-letter") > initialLetter);

  if (insertIndex !== -1) {
    contactsMenu.insertBefore(letterGroup, letterContacts[insertIndex]);
  } else {
    contactsMenu.appendChild(letterGroup);
  }
}


function deleteContact() {
  const contactInfoDiv = document.getElementById("contact-info");
  const contactName = getContactName();
  const contactsLayout = document.getElementById("contactsLayout");
  const contactToDelete = findContactToDelete(contactsLayout, contactName);

  removeContactFromLayout(contactsLayout, contactToDelete);
  deleteContactFromLocalStorage(contactName);

  hideContactInfo(contactInfoDiv);
  reloadPage();
}


function getContactName() {
  return document.querySelector(".contact-info-name").innerText;
}


function findContactToDelete(contactsLayout, contactName) {
  return Array.from(contactsLayout.getElementsByClassName("added-contact"))
    .find(contact => contact.querySelector(".moveRight p").innerText === contactName);
}


function removeContactFromLayout(contactsLayout, contactToDelete) {
  if (contactToDelete) {
    contactsLayout.removeChild(contactToDelete);
  }
}


function deleteContactFromLocalStorage(contactName) {
  const loggedInUserName = getLoggedInUserName();

  if (!loggedInUserName) {
    logError("No logged-in user found. Contact cannot be deleted from local storage.");
    return;
  }

  const userContactsKey = getUserContactsKey(loggedInUserName);
  let existingContacts = getExistingContacts(userContactsKey);

  const contactIndex = findContactIndex(existingContacts, contactName);
  removeContact(existingContacts, contactIndex);
}


function getLoggedInUserName() {
  return localStorage.getItem("loggedInUserName");
}


function logError(errorMessage) {
  console.error(errorMessage);
}


function getUserContactsKey(loggedInUserName) {
  return `contacts_${loggedInUserName}`;
}


function getExistingContacts(userContactsKey) {
  return JSON.parse(localStorage.getItem(userContactsKey)) || [];
}


function findContactIndex(existingContacts, contactName) {
  return existingContacts.findIndex(contact => contact.name === contactName);
}


function removeContact(existingContacts, contactIndex) {
  if (contactIndex !== -1) {
    existingContacts.splice(contactIndex, 1);
  }
}


function hideContactInfo(contactInfoDiv) {
  contactInfoDiv.style.display = "none";
}


function reloadPage() {
  location.reload();
}


function editContact() {
  const contactName = document.querySelector(".contact-info-name").innerText;
  const userContactsKey = `contacts_${localStorage.getItem("loggedInUserName")}`;
  const existingContacts = JSON.parse(localStorage.getItem(userContactsKey)) || [];
  const contactToEdit = existingContacts.find(contact => contact.name === contactName);

  if (!contactToEdit) {
    console.error("Contact not found in local storage.");
    return;
  }

  const editContactDiv = document.getElementById("add-new-contact");
  const addNewContactDiv = document.getElementById("add-new-contact");

  [editContactDiv, addNewContactDiv].forEach(elem => elem.classList.add("background", "sign-up-animation"));
  addNewContactDiv.classList.remove("d-none");

  editContactDiv.innerHTML = generateEditContactFormHTML(contactToEdit, existingContacts.indexOf(contactToEdit));
}


function generateEditContactFormHTML(contactToEdit, contactIndex) {
  const { name, email, phone, color } = contactToEdit;
  const initialLetter = name.charAt(0).toUpperCase();

  return /* HTML */ `
    <div id="edit-contact-id" class="addNewContactDiv">
      <div class="left-side-add-contact column">
        <div><img src="../assets/icons/logo.svg"></div>
        <h1>Edit contact</h1>
        <span></span>
        <div class="line"></div>
      </div>
      <div class="right-side-add-contact">
        <img onclick="closeAddContact()" class="close absolute pointer" src="../assets/icons/close.svg">
        <div class="account center">
          <div class="adding-contact-icon" style="background-color: ${color}">${initialLetter}</div>
        </div>
        <div>
          <form onsubmit="return false;">
            <div class="form-contacs">
              <div class="center">
                <input id="contactNameInput" class="log-in-field column center pointer" required type="text" placeholder="Name" value="${name}">
                <img class="log-in-mail-lock-icon" src="../assets/icons/person-small.png">
              </div>
              <div class="center">
                <input id="contactEmailInput" class="log-in-field column center pointer" required type="email" placeholder="Email" value="${email}">
                <img class="log-in-mail-lock-icon" src="../assets/icons/mail.png">
              </div>
              <div class="center">
                <input id="contactPhoneInput" class="log-in-field column center pointer" required type="number" placeholder="Phone" value="${phone}">
                <img class="log-in-mail-lock-icon" src="../assets/icons/call.png">
              </div>
            </div>
            <div class="right-bottom">
              <div class="clear-and-update-contact">
                <div class="clear pointer center" onclick="deleteContact()">
                  <span>Delete</span>
                  <img class="cancel1" src="../assets/icons/cancel.svg" alt="">
                  <img class="cancel2 d-none" src="../assets/icons/cancel2.svg" alt="">
                </div>
                <div class="update-contact pointer center" onclick="updateContact(${contactIndex})">
                  <span>Save</span>
                  <img src="../assets/icons/check.svg" alt="">
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}


function updateContact(index) {
  const [name, email, phone] = ["contactNameInput", "contactEmailInput", "contactPhoneInput"].map(getValueById);
  if (!validateInputFields(name, email, phone)) return console.error("Please fill in all fields.");

  const key = `contacts_${localStorage.getItem("loggedInUserName")}`;
  const contacts = JSON.parse(localStorage.getItem(key)) || [];
  const contact = contacts[index];

  if (!contact) return console.error("Contact not found in local storage.");

  const updatedContact = { ...contact, name, email, phone };
  contacts[index] = updatedContact;
  localStorage.setItem(key, JSON.stringify(contacts));

  closeAddContact();
  location.reload();
}


function getValueById(id) {
  return document.getElementById(id).value;
}


function validateInputFields(...values) {
  return values.every(value => value.trim() !== '');
}