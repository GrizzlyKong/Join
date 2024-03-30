let contacts = [];


/**
 * Initializes the application.
 * 
 * @returns {Promise<void>} A Promise that resolves when initialization is complete.
 */
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


/**
 * Loads contacts from local storage.
 * 
 * @returns {Promise<void>} A Promise that resolves when contacts are loaded.
 */
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


/**
 * Displays contacts from local storage.
 */
function displayContactsFromLocalStorage() {
  const loggedInUserName = localStorage.getItem("loggedInUserName");
  if (!loggedInUserName) {
    displayGuestContacts();
  } else {
    loadContacts();
    displayUserContacts();
    } 
}


/**
 * Displays guest contacts.
 */
function displayGuestContacts() {
  const guestContactsKey = "guestContacts";
  const guestContacts = JSON.parse(localStorage.getItem(guestContactsKey)) || [];
  guestContacts.forEach(displayGuestContact);
}


/**
 * Displays a guest contact.
 * 
 * @param {object} contact - The guest contact to display.
 */
function displayGuestContact(contact) {
  const { name, email, phone, color } = contact;
  const initialLetter = name.charAt(0).toUpperCase();
  const newContactElement = createContactElement(name, email, initialLetter, phone, color);
  insertContactElement(newContactElement, initialLetter);
}


/**
 * Includes HTML content into the document.
 * 
 * @returns {Promise<void>} A Promise that resolves when HTML is included.
 */
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


/**
 * Adds a new contact.
 */
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


/**
 * Adds a grey overlay to the page.
 */
function greyOverlay () {
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.style.zIndex = '5';
    document.body.appendChild(overlay);
    document.body.classList.add('no-scroll');
}


/**
 * Updates the class of an HTML element.
 * 
 * @param {string} elementId - The ID of the HTML element.
 * @param {string} className - The class name to add or remove.
 * @param {string} action - The action to perform ('add' or 'remove').
 */
function updateElementClass(elementId, className, action) {
  const element = document.getElementById(elementId);
  if (action === "add") {
    element.classList.add(className);
  } else {
    element.classList.remove(className);
  }
}


/**
 * Generates HTML for adding a new contact.
 * 
 * @returns {string} The HTML for adding a new contact.
 */
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


/**
 * Clears input fields for adding a new contact.
 */
function clearInputAddingContact() {
  document.getElementById("contactNameInput").value = "";
  document.getElementById("contactEmailInput").value = "";
  document.getElementById("contactPhoneInput").value = "";
}


/**
 * Inserts a new HTML node after a reference node.
 * 
 * @param {Node} newNode - The new HTML node to insert.
 * @param {Node} referenceNode - The reference node after which the new node will be inserted.
 */
function insertAfter(newNode, referenceNode) {
  let nextSibling = referenceNode.nextSibling;
  if (nextSibling) {
      referenceNode.parentNode.insertBefore(newNode, nextSibling);
  } else {
      referenceNode.parentNode.appendChild(newNode);
  }
}


/**
 * Generates a random color code.
 * 
 * @returns {string} A random color code.
 */
function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}


/**
 * Adds a new contact.
 * 
 * @returns {Promise<void>} A Promise that resolves when the contact is added.
 */
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


/**
 * Handles the storage of a new contact.
 * 
 * @param {object} newContact - The new contact to be stored.
 * @returns {Promise<void>} A Promise that resolves when the contact is stored.
 */
async function handleContactStorage(newContact) {
  const loggedInUserName = localStorage.getItem("loggedInUserName");
  if (!loggedInUserName) {
    await handleGuestContactStorage(newContact);
  } else {
    await handleUserContactStorage(newContact, loggedInUserName);
  }
}


/**
 * Handles the storage of a new guest contact.
 * 
 * @param {object} newContact - The new guest contact to be stored.
 * @returns {Promise<void>} A Promise that resolves when the guest contact is stored.
 */
async function handleGuestContactStorage(newContact) {
  const guestContactsKey = "guestContacts";
  let guestContacts = JSON.parse(localStorage.getItem(guestContactsKey)) || [];
  guestContacts.push(newContact);
  localStorage.setItem(guestContactsKey, JSON.stringify(guestContacts));
}


/**
 * Handles the storage of a new user contact.
 * 
 * @param {object} newContact - The new user contact to be stored.
 * @param {string} loggedInUserName - The username of the logged-in user.
 * @returns {Promise<void>} A Promise that resolves when the user contact is stored.
 */
async function handleUserContactStorage(newContact, loggedInUserName) {
  await setItem(`contacts_${loggedInUserName}`, JSON.stringify(contacts));
}


/**
 * Closes the add contact dialog and reloads the page.
 */
function handleCloseAndReload() {
  closeAddContact();
  successfullyCreatedContact();
  reloadPage();
}


/**
 * Retrieves input values from the add contact form.
 * 
 * @returns {object} An object containing the input values (name, email, phone).
 */
function getInputValues() {
  return {
    name: document.getElementById("contactNameInput").value,
    email: document.getElementById("contactEmailInput").value,
    phone: document.getElementById("contactPhoneInput").value,
  };
}


/**
 * Gets the initial letter of a name.
 * 
 * @param {string} name - The name from which to extract the initial letter.
 * @returns {string} The initial letter.
 */
function getInitialLetter(name) {
  return name.charAt(0).toUpperCase();
}


/**
 * Creates a new HTML element for a contact.
 * 
 * @param {string} name - The name of the contact.
 * @param {string} email - The email of the contact.
 * @param {string} initialLetter - The initial letter of the contact's name.
 * @returns {HTMLElement} The new contact element.
 */
function createNewContactElement(name, email, initialLetter) {
  const newContactElement = document.createElement("div");
  newContactElement.className = "added-contact pointer";
  newContactElement.onclick = showContact;
  const randomColor = getRandomColor();
  newContactElement.innerHTML = generateNewContactElementHTML(initialLetter, name, email, randomColor);
  return newContactElement;
}


/**
 * Inserts a new contact element into the contacts menu.
 * 
 * @param {HTMLElement} newContactElement - The new contact element to insert.
 */
function insertNewContactElement(newContactElement) {
  const contactsMenu = document.getElementById("contactsMenu");
  const referenceNode = contactsMenu.childNodes[1];
  insertAfter(newContactElement, referenceNode);
}


/**
 * Displays a success message indicating that a contact was successfully created.
 */
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


/**
 * Reloads the page.
 */
function reloadPage() {
  location.reload();
}


/**
 * Validates input fields.
 * 
 * @param {string} name - The name input value.
 * @param {string} email - The email input value.
 * @param {string} phone - The phone input value.
 * @returns {boolean} True if input fields are valid, otherwise false.
 */
function validateInputFields(name, email, phone) {
  return name && email && phone;
}


/**
 * Generates HTML for a new contact element.
 * 
 * @param {string} initialLetter - The initial letter of the contact's name.
 * @param {string} name - The name of the contact.
 * @param {string} email - The email of the contact.
 * @param {string} randomColor - The random color for the contact icon.
 * @returns {string} The generated HTML.
 */
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


/**
 * Updates the letter contacts in the contacts menu.
 * 
 * @param {string} firstLetter - The first letter of the contact's name.
 */
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


/**
 * Gets an array of letter contacts from the contacts menu.
 * 
 * @param {HTMLElement} contactsMenu - The contacts menu element.
 * @returns {HTMLElement[]} An array of letter contact elements.
 */
function getLetterContactsArray(contactsMenu) {
  return Array.from(contactsMenu.getElementsByClassName("letter-contacts"));
}


/**
 * Finds existing letter contacts in the contacts menu.
 * 
 * @param {HTMLElement[]} letterContacts - An array of letter contact elements.
 * @param {string} firstLetter - The first letter of the contact's name.
 * @returns {HTMLElement|null} The existing letter contact element, or null if not found.
 */
function findExistingLetterContacts(letterContacts, firstLetter) {
  return letterContacts.find((element) => element.getAttribute("data-letter") === firstLetter);
}


/**
 * Creates a new letter contact element.
 * 
 * @param {string} firstLetter - The first letter of the contact's name.
 * @returns {HTMLElement} The new letter contact element.
 */
function createNewLetterContacts(firstLetter) {
  const newLetterContacts = document.createElement("div");
  newLetterContacts.className = "letter-contacts";
  newLetterContacts.setAttribute("data-letter", firstLetter);
  newLetterContacts.innerHTML = `<p>${firstLetter}</p>`;
  return newLetterContacts;
}


/**
 * Gets the insert index for a new letter contact element.
 * 
 * @param {HTMLElement[]} letterContacts - An array of letter contact elements.
 * @param {string} firstLetter - The first letter of the contact's name.
 * @returns {number} The insert index.
 */
function getInsertIndex(letterContacts, firstLetter) {
  return letterContacts.findIndex((element) => element.getAttribute("data-letter") > firstLetter);
}


/**
 * Inserts a new letter contact element into the contacts menu.
 * 
 * @param {HTMLElement} contactsMenu - The contacts menu element.
 * @param {HTMLElement} newLetterContacts - The new letter contact element to insert.
 * @param {HTMLElement[]} letterContacts - An array of letter contact elements.
 * @param {number} insertIndex - The index at which to insert the new letter contact element.
 */
function insertNewLetterContacts(contactsMenu, newLetterContacts, letterContacts, insertIndex) {
  if (insertIndex !== -1) {
    contactsMenu.insertBefore(newLetterContacts, letterContacts[insertIndex]);
  } else {
    contactsMenu.appendChild(newLetterContacts);
  }
}


/**
 * Closes the add contact dialog.
 */
function closeAddContact() {
  document.getElementById("add-new-contact").classList.add("d-none");
  document.getElementById("add-new-contact").classList.add("sign-up-animation-close");
  closeOverlay();
}


/**
 * Closes the overlay.
 */
function closeOverlay() {
  const overlay = document.querySelector('.overlay');
  if (overlay) {
    document.body.removeChild(overlay);
  }
  document.body.classList.remove('no-scroll');
}


/**
 * Displays contact information.
 */
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


/**
 * Displays the contact info panel.
 */
function displayContactInfo(contactInfoDiv) {
  contactInfoDiv.style.display = 'block';
}


/**
 * Gets contact information from a contact element.
 * 
 * @param {HTMLElement} contactElement - The contact element.
 * @returns {object} An object containing contact information.
 */
function getContactInfo(contactElement) {
  return {
    name: contactElement.querySelector(".moveRight p").innerText,
    email: contactElement.querySelector(".moveRight a").innerText,
    initialLetter: contactElement.querySelector(".added-contact-icon").innerText,
    color: contactElement.querySelector(".added-contact-icon").style.backgroundColor,
    phoneNumber: contactElement.getAttribute("data-phone-number"),
  };
}



/**
 * Updates contact information in the contact info panel.
 */
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


/**
 * Displays user contacts in the contacts menu.
 * 
 * Retrieves user contacts from the server and displays them in the contacts menu.
 * 
 * @returns {Promise<void>} A Promise that resolves when contacts are displayed.
 */
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


/**
 * Retrieves the username of the logged-in user from local storage.
 * 
 * @returns {string} The username of the logged-in user.
 */
function getLoggedInUserName() {
  return localStorage.getItem("loggedInUserName");
}


/**
 * Retrieves the contacts menu element.
 * 
 * @returns {HTMLElement} The contacts menu element.
 */
function getContactsMenu() {
  return document.getElementById("contactsMenu");
}


/**
 * Fetches the response text containing user contacts.
 * 
 * @param {string} loggedInUserName - The username of the logged-in user.
 * @returns {Promise} A Promise that resolves with the response text.
 */
async function fetchContactsResponseText(loggedInUserName) {
  const response = await fetch(`${STORAGE_URL}?user=${loggedInUserName}&token=${STORAGE_TOKEN}&key=contacts_${loggedInUserName}`);
  if (response.ok) {
    return await response.text();
  }
}


/**
 * Parses the server response text to extract saved contacts.
 * 
 * @param {string} responseText - The response text from the server.
 * @returns {object} An array of saved contacts.
 */
function getSavedContacts(responseText) {
  const serverResponse = JSON.parse(responseText);
  if (serverResponse && serverResponse.status === "success" && serverResponse.data && serverResponse.data.value) {
    const savedContacts = JSON.parse(serverResponse.data.value);
    if (Array.isArray(savedContacts)) {
      return savedContacts;
    }
  }
}


/**
 * Displays a contact in the contacts menu.
 * 
 * @param {object} contact - The contact to display.
 */
function displayContact(contact) {
  const { name, email, phone, color } = contact;
  if (isValidContact(name, email, phone)) {
    const initialLetter = getInitialLetter(name);
    const newContactElement = createContactElement(name, email, initialLetter, phone, color);
    insertContactElement(newContactElement, initialLetter);
  }
}


/**
 * Checks if a contact is valid.
 * 
 * @param {string} name - The name of the contact.
 * @param {string} email - The email of the contact.
 * @param {string} phone - The phone number of the contact.
 * @returns {boolean} True if the contact is valid, otherwise false.
 */
function isValidContact(name, email, phone) {
  return (name.trim() !== "" || email.trim() !== "" || phone.trim() !== "");
}


/**
 * Gets sorted contacts for the logged-in user.
 * 
 * @param {string} loggedInUserName - The username of the logged-in user.
 * @returns {object[]} An array of sorted contacts.
 */
function getSortedContacts(loggedInUserName) {
  const userContactsKey = `contacts_${loggedInUserName}`;
  const savedContacts = JSON.parse(localStorage.getItem(userContactsKey)) || [];
  return savedContacts.sort((a, b) => a.name.localeCompare(b.name));
}


/**
 * Creates an HTML element for a contact.
 * 
 * @param {string} name - The name of the contact.
 * @param {string} email - The email of the contact.
 * @param {string} initialLetter - The initial letter of the contact's name.
 * @param {string} phone - The phone number of the contact.
 * @param {string} color - The color of the contact icon.
 * @returns {HTMLElement} The new contact element.
 */
function createContactElement(name, email, initialLetter, phone, color) {
  const newContactElement = document.createElement("div");
  newContactElement.className = "added-contact pointer";
  newContactElement.onclick = showContact;
  newContactElement.setAttribute("data-phone-number", phone);
  newContactElement.innerHTML = generateContactElementHTML(name, email, initialLetter, color);
  return newContactElement;
}


/**
 * Generates HTML for a contact element.
 * 
 * @param {string} name - The name of the contact.
 * @param {string} email - The email of the contact.
 * @param {string} initialLetter - The initial letter of the contact's name.
 * @param {string} color - The color of the contact icon.
 * @returns {string} The generated HTML.
 */
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


/**
 * Inserts a contact element into the contacts menu.
 * 
 * @param {HTMLElement} newContactElement - The new contact element to insert.
 * @param {string} initialLetter - The initial letter of the contact's name.
 */
function insertContactElement(newContactElement, initialLetter) {
  const contactsMenu = document.getElementById("contactsMenu");
  const letterContacts = Array.from(contactsMenu.getElementsByClassName("letter-contacts"));
  let letterGroup = getOrCreateLetterGroup(letterContacts, initialLetter);
  letterGroup.appendChild(newContactElement);
}


/**
 * Gets or creates a letter group for contacts.
 * 
 * @param {HTMLElement[]} letterContacts - An array of letter contact elements.
 * @param {string} initialLetter - The initial letter of the contact's name.
 * @returns {HTMLElement} The letter group element.
 */
function getOrCreateLetterGroup(letterContacts, initialLetter) {
  let letterGroup = letterContacts.find((element) => element.getAttribute("data-letter") === initialLetter);
  if (!letterGroup) {
    letterGroup = createLetterGroup(initialLetter);
    insertLetterGroup(letterGroup, letterContacts, initialLetter);
  }
  return letterGroup;
}


/**
 * Creates a new letter group for contacts.
 * 
 * @param {string} initialLetter - The initial letter of the contact's name.
 * @returns {HTMLElement} The new letter group element.
 */
function createLetterGroup(initialLetter) {
  const letterGroup = document.createElement("div");
  letterGroup.className = "letter-contacts";
  letterGroup.setAttribute("data-letter", initialLetter);
  letterGroup.innerHTML = `<p>${initialLetter}</p>`;
  return letterGroup;
}


/**
 * Inserts a letter group into the contacts menu.
 * 
 * @param {HTMLElement} letterGroup - The letter group element to insert.
 * @param {HTMLElement[]} letterContacts - An array of letter contact elements.
 * @param {string} initialLetter - The initial letter of the contact's name.
 */
function insertLetterGroup(letterGroup, letterContacts, initialLetter) {
  const contactsMenu = document.getElementById("contactsMenu");
  const insertIndex = letterContacts.findIndex((element) => element.getAttribute("data-letter") > initialLetter);
  if (insertIndex !== -1) {
    contactsMenu.insertBefore(letterGroup, letterContacts[insertIndex]);
  } else {
    contactsMenu.appendChild(letterGroup);
  }
}


/**
 * Deletes a contact.
 * 
 * @returns {Promise<void>} A Promise that resolves when the contact is deleted.
 */
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


/**
 * Retrieves the name of the contact from the contact information panel.
 * 
 * @returns {string} The name of the contact.
 */
function getContactName() {
  return document.getElementById("contact-info").innerText;
}


/**
 * Finds the contact element to delete from the contacts layout.
 * 
 * @param {HTMLElement} contactsLayout - The container element for contacts.
 * @param {string} contactName - The name of the contact to delete.
 * @returns {HTMLElement|null} The contact element to delete, or null if not found.
 */
function findContactToDelete(contactsLayout, contactName) {
  return contactsLayout.querySelector(`[data-name="${contactName}"]`);
}


/**
 * Removes a contact element from the contacts layout.
 * 
 * @param {HTMLElement} contactsLayout - The container element for contacts.
 * @param {HTMLElement} contactToDelete - The contact element to delete.
 */
function removeContactFromLayout(contactsLayout, contactToDelete) {
  if (contactToDelete) {
    contactsLayout.removeChild(contactToDelete);
  }
}


/**
 * Deletes a guest contact from local storage.
 * 
 * @param {string} contactName - The name of the contact to delete.
 */
function deleteGuestContactFromLocalStorage(contactName) {
  const guestContactsKey = "guestContacts";
  const guestContacts = JSON.parse(localStorage.getItem(guestContactsKey)) || [];
  const guestContactIndex = guestContacts.findIndex(contact => contact.name === contactName);
  if (guestContactIndex !== -1) {
    guestContacts.splice(guestContactIndex, 1);
    localStorage.setItem(guestContactsKey, JSON.stringify(guestContacts));
  }
}


/**
 * Hides the contact information panel.
 * 
 * @param {HTMLElement} contactInfoDiv - The contact information panel element.
 */
function hideContactInfo(contactInfoDiv) {
  contactInfoDiv.style.display = "none";
}


/**
 * Finds the contact element to delete from the contacts layout.
 * 
 * @param {HTMLElement} contactsLayout - The container element for contacts.
 * @param {string} contactName - The name of the contact to delete.
 * @returns {HTMLElement|null} The contact element to delete, or null if not found.
 */
function findContactToDelete(contactsLayout, contactName) {
  return Array.from(contactsLayout.getElementsByClassName("added-contact"))
    .find(contact => contact.querySelector(".moveRight p").innerText === contactName);
}


/**
 * Removes a contact element from the contacts layout.
 * 
 * @param {HTMLElement} contactsLayout - The container element for contacts.
 * @param {HTMLElement} contactToDelete - The contact element to delete.
 */
function removeContactFromLayout(contactsLayout, contactToDelete) {
  if (contactToDelete) {
    contactsLayout.removeChild(contactToDelete);
  }
}


/**
 * Deletes a contact from the server.
 * 
 * @param {string} contactName - The name of the contact to delete.
 * @returns {Promise<void>} A Promise that resolves when the contact is deleted.
 */
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


/**
 * Retrieves the username of the logged-in user from local storage.
 * 
 * @returns {string} The username of the logged-in user.
 */
function getLoggedInUserName() {
  return localStorage.getItem("loggedInUserName");
}


/**
 * Logs an error message to the console.
 * 
 * @param {string} errorMessage - The error message to log.
 */
function logError(errorMessage) {
  console.error(errorMessage);
}


/**
 * Retrieves the key for user contacts.
 * 
 * @param {string} loggedInUserName - The username of the logged-in user.
 * @returns {string} The key for user contacts.
 */
function getUserContactsKey(loggedInUserName) {
  return `contacts_${loggedInUserName}`;
}


/**
 * Retrieves existing contacts from local storage.
 * 
 * @param {string} userContactsKey - The key for user contacts.
 * @returns {object[]} An array of existing contacts.
 */
function getExistingContacts(userContactsKey) {
  return JSON.parse(localStorage.getItem(userContactsKey)) || [];
}


/**
 * Finds the index of a contact in an array of contacts.
 * 
 * @param {object[]} existingContacts - An array of existing contacts.
 * @param {string} contactName - The name of the contact to find.
 * @returns {number} The index of the contact, or -1 if not found.
 */
function findContactIndex(existingContacts, contactName) {
  return existingContacts.findIndex(contact => contact.name === contactName);
}


/**
 * Removes a contact from an array of contacts.
 * 
 * @param {object[]} existingContacts - An array of existing contacts.
 * @param {number} contactIndex - The index of the contact to remove.
 */
function removeContact(existingContacts, contactIndex) {
  if (contactIndex !== -1) {
    existingContacts.splice(contactIndex, 1);
  }
}


/**
 * Hides the contact information panel.
 * 
 * @param {HTMLElement} contactInfoDiv - The contact information panel element.
 */
function hideContactInfo(contactInfoDiv) {
  contactInfoDiv.style.display = "none";
}


/**
 * Reloads the current page.
 */
function reloadPage() {
  location.reload();
}


/**
 * Edits a contact.
 * 
 * Determines if the contact is for a logged-in user or a guest, then initiates the editing process accordingly.
 */
async function editContact() {
  const contactName = getContactName();
  const loggedInUserName = getLoggedInUserName();
  if (loggedInUserName) {
    await editUserContact(contactName);
  } else {
    editGuestContact(contactName);
  }
}


/**
 * Retrieves the name of the contact from the contact information panel.
 * 
 * @returns {string} The name of the contact.
 */
function getContactName() {
  return document.querySelector(".contact-info-name").innerText;
}


/**
 * Retrieves the username of the logged-in user from local storage.
 * 
 * @returns {string|null} The username of the logged-in user, or null if not found.
 */
function getLoggedInUserName() {
  return localStorage.getItem("loggedInUserName");
}


/**
 * Edits a contact for the logged-in user.
 * 
 * Retrieves the contact to edit, then opens the edit contact form.
 * 
 * @param {string} contactName - The name of the contact to edit.
 */
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


/**
 * Retrieves existing contacts from the server.
 * 
 * @param {string} key - The key for user contacts.
 * @returns {object[]} An array of existing contacts.
 */
async function getExistingContacts(key) {
  const contactsData = await getItem(key);
  return JSON.parse(contactsData) || [];
}


/**
 * Finds a contact by name in an array of contacts.
 * 
 * @param {object[]} contacts - An array of contacts to search.
 * @param {string} contactName - The name of the contact to find.
 * @returns {object|null} The contact object if found, otherwise null.
 */
function findContactByName(contacts, contactName) {
  return contacts.find(contact => contact.name === contactName);
}


/**
 * Edits a guest contact.
 * 
 * Retrieves the guest contact to edit, then opens the edit contact form.
 * 
 * @param {string} contactName - The name of the guest contact to edit.
 */
function editGuestContact(contactName) {
  const guestContacts = JSON.parse(localStorage.getItem("guestContacts")) || [];
  const guestContactToEdit = guestContacts.find(contact => contact.name === contactName);
  if (!guestContactToEdit) {
    console.error("Contact not found in local storage.");
    return;
  }
  openEditContactForm(guestContactToEdit, guestContacts.indexOf(guestContactToEdit));
}


/**
 * Opens the edit contact form with the details of the contact to edit.
 * 
 * @param {object} contactToEdit - The contact object to edit.
 * @param {number} contactIndex - The index of the contact in the contacts list.
 */
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


/**
 * Generates the HTML for the edit contact form.
 * 
 * @param {object} contactToEdit - The contact object to edit.
 * @param {number} contactIndex - The index of the contact in the contacts list.
 * @param {string} initialLetter - The initial letter of the contact's name.
 * @param {string} email - The email of the contact.
 * @param {string} phone - The phone number of the contact.
 * @param {string} color - The color of the contact icon.
 * @returns {string} The HTML content of the edit contact form.
 */
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


/**
 * Updates a contact.
 * 
 * @param {number} index - The index of the contact to update.
 */
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


/**
 * Retrieves the values of the contact fields from the form inputs.
 * 
 * @returns {string[]} An array containing the values of the contact fields.
 */
function getContactValues() {
  return ["contactNameInput", "contactEmailInput", "contactPhoneInput"].map(getValueById);
}


/**
 * Retrieves the username of the logged-in user from local storage.
 * 
 * @returns {string|null} The username of the logged-in user, or null if not found.
 */
function getLoggedInUserName() {
  return localStorage.getItem("loggedInUserName");
}


/**
 * Updates the contact for the logged-in user.
 * 
 * @param {number} index - The index of the contact to update.
 * @param {string} name - The updated name of the contact.
 * @param {string} email - The updated email of the contact.
 * @param {string} phone - The updated phone number of the contact.
 */
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


/**
 * Updates the guest contact.
 * 
 * @param {number} index - The index of the contact to update.
 * @param {string} name - The updated name of the contact.
 * @param {string} email - The updated email of the contact.
 * @param {string} phone - The updated phone number of the contact.
 */
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


/**
 * Retrieves the value of an input field by its ID.
 * 
 * @param {string} id - The ID of the input field.
 * @returns {string} The value of the input field.
 */
function getValueById(id) {
  return document.getElementById(id).value;
}


/**
 * Validates input fields to ensure they are not empty.
 * 
 * @param {...string} values - The values to validate.
 * @returns {boolean} True if all fields are not empty, otherwise false.
 */
function validateInputFields(...values) {
  return values.every(value => value.trim() !== '');
}


/**
 * Initializes the application.
 */
init();