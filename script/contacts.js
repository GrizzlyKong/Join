let contacts = [];


async function init() {
  await includeHTML();
  const loggedInUserName = localStorage.getItem("loggedInUserName");
  if (!loggedInUserName) {
    displayContactsFromLocalStorage();
    return;
  }
  await loadContacts();
  await displayUserContacts();
}


async function loadContacts() {
  try {
    const loggedInUserName = localStorage.getItem("loggedInUserName");
    if (!loggedInUserName) {
      console.error("No logged-in user found. Contacts cannot be loaded.");
      return;
    }
    contacts = JSON.parse(await getItem(`contacts_${loggedInUserName}`)) || [];
  } catch (e) {
    console.error("Loading error:", e);
  }
}


function displayContactsFromLocalStorage() {
  const loggedInUserName = localStorage.getItem("loggedInUserName");
  if (!loggedInUserName) {
    displayGuestContacts();
  } else {
    loadContacts();
    displayUserContacts();
    } 
}


function displayGuestContacts() {
  const guestContactsKey = "guestContacts";
  const guestContacts = JSON.parse(localStorage.getItem(guestContactsKey)) || [];
  guestContacts.forEach(displayGuestContact);
}


function displayGuestContact(contact) {
  const { name, email, phone, color } = contact;
  const initialLetter = name.charAt(0).toUpperCase();
  const newContactElement = createContactElement(name, email, initialLetter, phone, color);
  insertContactElement(newContactElement, initialLetter);
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
  greyOverlay ();
  newContact.innerHTML = generateNewContactHTML();
  const newContactElement = createNewContactElement();
  newContactElement.onclick = showContact;
}


function greyOverlay () {
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.style.zIndex = '5';
    document.body.appendChild(overlay);
    document.body.classList.add('no-scroll');
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
        <div class="items-right">
        <div><img src="../assets/icons/logo.svg"></div>
        <h1>Add contact</h1>
        <span>Tasks are better with a team!</span>
        <div class="line"></div>
      </div>
      </div>
      <div class = "right-side-add-contact">
        <div class="close-div"><img onclick="closeAddContact()" class="close pointer" src="../assets/icons/close.svg"></div>
        <div class = "account center">
          <div class="adding-contact-icon"><img src="../assets/icons/person.png"></div>
        </div>
        <div>
          <form onsubmit="addingContact(); return false;">
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
                <button class="create-task pointer center">
                  <span>Create contact</span>
                  <img src="../assets/icons/check.svg" alt="">
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}


function clearInputAddingContact() {
  document.getElementById("contactNameInput").value = "";
  document.getElementById("contactEmailInput").value = "";
  document.getElementById("contactPhoneInput").value = "";
}


function insertAfter(newNode, referenceNode) {
  let nextSibling = referenceNode.nextSibling;
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
  const initialLetter = getInitialLetter(name);
  const newContactElement = createNewContactElement(name, email, initialLetter);
  insertNewContactElement(newContactElement);
  updateLetterContacts(initialLetter);
  clearInputAddingContact();
  const newContact = { name, email, phone, color: getRandomColor() };
  contacts.push(newContact);
  try {
    await handleContactStorage(newContact);
    handleCloseAndReload();
  } catch (error) {
    console.error("Error adding contact:", error);
  }
}


async function handleContactStorage(newContact) {
  const loggedInUserName = localStorage.getItem("loggedInUserName");
  if (!loggedInUserName) {
    await handleGuestContactStorage(newContact);
  } else {
    await handleUserContactStorage(newContact, loggedInUserName);
  }
}


async function handleGuestContactStorage(newContact) {
  const guestContactsKey = "guestContacts";
  let guestContacts = JSON.parse(localStorage.getItem(guestContactsKey)) || [];
  guestContacts.push(newContact);
  localStorage.setItem(guestContactsKey, JSON.stringify(guestContacts));
}


async function handleUserContactStorage(newContact, loggedInUserName) {
  await setItem(`contacts_${loggedInUserName}`, JSON.stringify(contacts));
}


function handleCloseAndReload() {
  closeAddContact();
  successfullyCreatedContact();
  reloadPage();
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


function successfullyCreatedContact() {
  let successMessage = document.getElementById("successMessage");
  successMessage.classList.remove("d-none");
  successMessage.classList.add("successfull-contact-animation");

  setTimeout(function () {
    successMessage.classList.add("move-to-right");
  }, 1300);

  setTimeout(function () {
    successMessage.classList.add("d-none");
    successMessage.classList.remove("successfull-contact-animation", "move-to-right");
  }, 1500);
}


function reloadPage() {
  location.reload();
}


function validateInputFields(name, email, phone) {
  return name && email && phone;
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
  closeOverlay();
}


function closeOverlay() {
  const overlay = document.querySelector('.overlay');
  if (overlay) {
    document.body.removeChild(overlay);
  }
  document.body.classList.remove('no-scroll');
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
  generateEditContactFormHTML(name, email, phoneNumber, initialLetter, color);
}


function displayContactInfo(contactInfoDiv) {
  contactInfoDiv.style.display = 'block';
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


async function displayUserContacts() {
  const loggedInUserName = getLoggedInUserName();
  const contactsMenu = getContactsMenu();
  if (!loggedInUserName || !contactsMenu) return;
  const responseText = await fetchContactsResponseText(loggedInUserName);
  if (!responseText) return;
  const savedContacts = getSavedContacts(responseText);
  if (!savedContacts) return;
  savedContacts.forEach((contact) => {
    displayContact(contact);
  });
}


function getLoggedInUserName() {
  return localStorage.getItem("loggedInUserName");
}


function getContactsMenu() {
  return document.getElementById("contactsMenu");
}


async function fetchContactsResponseText(loggedInUserName) {
  const response = await fetch(`${STORAGE_URL}?user=${loggedInUserName}&token=${STORAGE_TOKEN}&key=contacts_${loggedInUserName}`);
  if (response.ok) {
    return await response.text();
  }
}


function getSavedContacts(responseText) {
  const serverResponse = JSON.parse(responseText);
  if (serverResponse && serverResponse.status === "success" && serverResponse.data && serverResponse.data.value) {
    const savedContacts = JSON.parse(serverResponse.data.value);
    if (Array.isArray(savedContacts)) {
      return savedContacts;
    }
  }
}


function displayContact(contact) {
  const { name, email, phone, color } = contact;
  if (isValidContact(name, email, phone)) {
    const initialLetter = getInitialLetter(name);
    const newContactElement = createContactElement(name, email, initialLetter, phone, color);
    insertContactElement(newContactElement, initialLetter);
  }
}


function isValidContact(name, email, phone) {
  return (name.trim() !== "" || email.trim() !== "" || phone.trim() !== "");
}


function getSortedContacts(loggedInUserName) {
  const userContactsKey = `contacts_${loggedInUserName}`;
  const savedContacts = JSON.parse(localStorage.getItem(userContactsKey)) || [];
  return savedContacts.sort((a, b) => a.name.localeCompare(b.name));
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


async function deleteContact() {
  const contactInfoDiv = document.getElementById("contact-info");
  const contactName = getContactName();
  const contactsLayout = document.getElementById("contactsLayout");
  const contactToDelete = findContactToDelete(contactsLayout, contactName);
  removeContactFromLayout(contactsLayout, contactToDelete);
  const loggedInUserName = getLoggedInUserName();
  if (loggedInUserName) {
    await deleteContactFromServer(contactName);
  } else {
    deleteGuestContactFromLocalStorage(contactName);
  }
  hideContactInfo(contactInfoDiv);
  reloadPage();
}


function getContactName() {
  return document.getElementById("contact-info").innerText;
}


function findContactToDelete(contactsLayout, contactName) {
  return contactsLayout.querySelector(`[data-name="${contactName}"]`);
}


function removeContactFromLayout(contactsLayout, contactToDelete) {
  if (contactToDelete) {
    contactsLayout.removeChild(contactToDelete);
  }
}


function deleteGuestContactFromLocalStorage(contactName) {
  const guestContactsKey = "guestContacts";
  const guestContacts = JSON.parse(localStorage.getItem(guestContactsKey)) || [];
  const guestContactIndex = guestContacts.findIndex(contact => contact.name === contactName);
  if (guestContactIndex !== -1) {
    guestContacts.splice(guestContactIndex, 1);
    localStorage.setItem(guestContactsKey, JSON.stringify(guestContacts));
  }
}


function hideContactInfo(contactInfoDiv) {
  contactInfoDiv.style.display = "none";
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


async function deleteContactFromServer(contactName) {
  const loggedInUserName = getLoggedInUserName();
  if (!loggedInUserName) return;
  const key = `contacts_${loggedInUserName}`;
  try {
    let contacts = JSON.parse(await getItem(key));
    const contactIndex = contacts.findIndex(contact => contact.name === contactName);
    if (contactIndex !== -1) {
      contacts.splice(contactIndex, 1);
      await setItem(key, JSON.stringify(contacts));
      console.log(`Contact ${contactName} deleted successfully from the server.`);
    } else {
      console.error(`Error deleting contact ${contactName} from the server. Contact not found.`);
    }
  } catch (error) {
    console.error("Error deleting contact from the server:", error);
  }
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


async function editContact() {
  const contactName = getContactName();
  const loggedInUserName = getLoggedInUserName();
  if (loggedInUserName) {
    await editUserContact(contactName);
  } else {
    editGuestContact(contactName);
  }
}


function getContactName() {
  return document.querySelector(".contact-info-name").innerText;
}


function getLoggedInUserName() {
  return localStorage.getItem("loggedInUserName");
}


async function editUserContact(contactName) {
  const key = `contacts_${getLoggedInUserName()}`;
  try {
    const existingContacts = await getExistingContacts(key);
    const contactToEdit = findContactByName(existingContacts, contactName);
    if (!contactToEdit) {
      console.error("Contact not found on the server.");
      return;
    }
    openEditContactForm(contactToEdit, existingContacts.indexOf(contactToEdit));
  } catch (error) {
    console.error("Error fetching contacts from the server:", error);
  }
}


async function getExistingContacts(key) {
  const contactsData = await getItem(key);
  return JSON.parse(contactsData) || [];
}


function findContactByName(contacts, contactName) {
  return contacts.find(contact => contact.name === contactName);
}


function editGuestContact(contactName) {
  const guestContacts = JSON.parse(localStorage.getItem("guestContacts")) || [];
  const guestContactToEdit = guestContacts.find(contact => contact.name === contactName);
  if (!guestContactToEdit) {
    console.error("Contact not found in local storage.");
    return;
  }
  openEditContactForm(guestContactToEdit, guestContacts.indexOf(guestContactToEdit));
}


function openEditContactForm(contactToEdit, contactIndex) {
  const { name, email, phone, color } = contactToEdit;
  const initialLetter = name.charAt(0).toUpperCase();
  const editContactDiv = document.getElementById("add-new-contact");
  const addNewContactDiv = document.getElementById("add-new-contact");
  [editContactDiv, addNewContactDiv].forEach(elem => elem.classList.add("sign-up-animation"));
  addNewContactDiv.classList.remove("d-none");
  greyOverlay();
  editContactDiv.innerHTML = generateEditContactFormHTML(contactToEdit, contactIndex, initialLetter, email, phone, color);
}


function generateEditContactFormHTML(contactToEdit, contactIndex, initialLetter, email, phone, color) {
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
                <input id="contactNameInput" class="log-in-field column center pointer" required type="text" placeholder="Name" value="${contactToEdit.name}">
                <img class="log-in-mail-lock-icon" src="../assets/icons/person-small.png">
              </div>
              <div class="center">
                <input id="contactEmailInput" class="log-in-field column center pointer" required type="email" placeholder="Email" value="${contactToEdit.email}">
                <img class="log-in-mail-lock-icon" src="../assets/icons/mail.png">
              </div>
              <div class="center">
                <input id="contactPhoneInput" class="log-in-field column center pointer" required type="number" placeholder="Phone" value="${contactToEdit.phone}">
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


async function updateContact(index) {
  const [name, email, phone] = getContactValues();
  if (!validateInputFields(name, email, phone)) {
    console.error("Please fill in all fields.");
    return;
  }
  const loggedInUserName = getLoggedInUserName();
  if (loggedInUserName) {
    await updateLoggedInUserContact(index, name, email, phone);
  } else {
    updateGuestContact(index, name, email, phone);
  }
  closeAddContact();
  reloadPage();
}


function getContactValues() {
  return ["contactNameInput", "contactEmailInput", "contactPhoneInput"].map(getValueById);
}


function getLoggedInUserName() {
  return localStorage.getItem("loggedInUserName");
}


async function updateLoggedInUserContact(index, name, email, phone) {
  const key = `contacts_${getLoggedInUserName()}`;
  try {
    const contactsData = await getItem(key);
    const contacts = JSON.parse(contactsData) || [];
    const contact = contacts[index];
    if (!contact) {
      console.error("Contact not found.");
      return;
    }
    const updatedContact = { ...contact, name, email, phone };
    contacts[index] = updatedContact;
    await setItem(key, JSON.stringify(contacts));
  } catch (error) {
    console.error("Error updating contact on the server:", error);
  }
}


function updateGuestContact(index, name, email, phone) {
  const guestContactsKey = "guestContacts";
  let guestContacts = JSON.parse(localStorage.getItem(guestContactsKey)) || [];
  const guestContact = guestContacts[index];
  if (!guestContact) {
    console.error("Contact not found in local storage.");
    return;
  }
  const updatedGuestContact = { ...guestContact, name, email, phone };
  guestContacts[index] = updatedGuestContact;
  localStorage.setItem(guestContactsKey, JSON.stringify(guestContacts));
}


function getValueById(id) {
  return document.getElementById(id).value;
}


function validateInputFields(...values) {
  return values.every(value => value.trim() !== '');
}


init();
