let contacts = [];


async function init() {
  await includeHTML();
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

  // Create overlay and prevent scrolling
  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.style.zIndex = '5';
  document.body.appendChild(overlay);
  document.body.classList.add('no-scroll');

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

  const initialLetter = getInitialLetter(name);
  const newContactElement = createNewContactElement(name, email, initialLetter);
  insertNewContactElement(newContactElement);
  updateLetterContacts(initialLetter);
  clearInputAddingContact();

  // Push the new contact to the local array (contacts)
  const newContact = { name, email, phone, color: getRandomColor() };
  contacts.push(newContact);

  // Save the updated contacts array to the server
  try {
    const loggedInUserName = localStorage.getItem("loggedInUserName");
    if (!loggedInUserName) {
      console.error("No logged-in user found. Contacts cannot be saved to the server.");
      return;
    }

    await setItem(`contacts_${loggedInUserName}`, JSON.stringify(contacts));
    
    // Close the add-new-contact div
    closeAddContact();

    // Show the success message
    successfullyCreatedContact();
    reloadPage();
  } catch (error) {
    console.error("Error adding contact:", error);
  }
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

  // Display the contact information
  displayContactInfo(contactInfoDiv);

  // Generate and display the edit form
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
  const loggedInUserName = localStorage.getItem("loggedInUserName");

  if (!loggedInUserName) {
    console.error("No logged-in user found. Contacts cannot be displayed.");
    return;
  }

  try {
    const response = await fetch(`${STORAGE_URL}?user=${loggedInUserName}&token=${STORAGE_TOKEN}&key=contacts_${loggedInUserName}`);
    const responseText = await response.text();

    console.log("Server response status:", response.status);
    console.log("Server response body:", responseText);

    if (response.ok) {
      try {
        const serverResponse = JSON.parse(responseText);

        if (serverResponse && serverResponse.status === "success" && serverResponse.data && serverResponse.data.value) {
          const savedContacts = JSON.parse(serverResponse.data.value);

          if (Array.isArray(savedContacts)) {
            savedContacts.forEach((contact) => {
              const { name, email, phone, color } = contact;

              // Skip contacts with empty names, emails, and phones
              if (name.trim() !== "" || email.trim() !== "" || phone.trim() !== "") {
                const initialLetter = name.charAt(0).toUpperCase();
                const newContactElement = createContactElement(name, email, initialLetter, phone, color);
                insertContactElement(newContactElement, initialLetter);
              }
            });
          } else {
            console.error("Invalid contacts format received from the server. Expected an array.");
          }
        } else {
          console.error("Invalid server response. Missing 'status' or 'data' properties.");
          console.error("Server response:", serverResponse);
        }
      } catch (error) {
        console.error("Error parsing JSON:", error);
        console.error("Invalid contacts format received from the server.");
      }
    } else {
      console.error("Invalid server response:", response.status);
    }
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


async function deleteContact() {
  const contactInfoDiv = document.getElementById("contact-info");
  const contactName = getContactName();
  const contactsLayout = document.getElementById("contactsLayout");
  const contactToDelete = findContactToDelete(contactsLayout, contactName);

  removeContactFromLayout(contactsLayout, contactToDelete);

  // Delete the contact from the server
  await deleteContactFromServer(contactName);

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


async function deleteContactFromServer(contactName) {
  const loggedInUserName = getLoggedInUserName();

  if (!loggedInUserName) {
    logError("No logged-in user found. Contact cannot be deleted from the server.");
    return;
  }

  const key = `contacts_${loggedInUserName}`;

  try {
    const contactsData = await getItem(key);
    const contacts = JSON.parse(contactsData);

    // Find the index of the contact to delete
    const contactIndex = contacts.findIndex(contact => contact.name === contactName);

    if (contactIndex !== -1) {
      // Remove the contact from the array
      contacts.splice(contactIndex, 1);

      // Update the contacts on the server
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
  const contactName = document.querySelector(".contact-info-name").innerText;
  const loggedInUserName = localStorage.getItem("loggedInUserName");
  const key = `contacts_${loggedInUserName}`;

  try {
    const contactsData = await getItem(key);
    const existingContacts = JSON.parse(contactsData) || [];

    const contactToEdit = existingContacts.find(contact => contact.name === contactName);

    if (!contactToEdit) {
      console.error("Contact not found on the server.");
      return;
    }

    const editContactDiv = document.getElementById("add-new-contact");
    const addNewContactDiv = document.getElementById("add-new-contact");

    [editContactDiv, addNewContactDiv].forEach(elem => elem.classList.add("background", "sign-up-animation"));
    addNewContactDiv.classList.remove("d-none");

    editContactDiv.innerHTML = generateEditContactFormHTML(contactToEdit, existingContacts.indexOf(contactToEdit));
  } catch (error) {
    console.error("Error fetching contacts from the server:", error);
  }
}



function generateEditContactFormHTML(contactToEdit, contactIndex) {
  if (!contactToEdit || typeof contactToEdit.name !== 'string') {
    return "";
  }
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
      <div class="form-contacts">
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


async function updateContact(index) {
  const [name, email, phone] = ["contactNameInput", "contactEmailInput", "contactPhoneInput"].map(getValueById);
  if (!validateInputFields(name, email, phone)) return console.error("Please fill in all fields.");

  const loggedInUserName = localStorage.getItem("loggedInUserName");
  const key = `contacts_${loggedInUserName}`;

  try {
    const contactsData = await getItem(key);
    const contacts = JSON.parse(contactsData) || [];

    const contact = contacts[index];

    if (!contact) {
      console.error("Contact not found.");
      return;
    }

    const updatedContact = { ...contact, name, email, phone };

    // Update the contact on the server
    contacts[index] = updatedContact;
    await setItem(key, JSON.stringify(contacts));

    // Close the edit-contact div
    closeAddContact();

    // Reload the page or update the UI as needed
    reloadPage();
  } catch (error) {
    console.error("Error updating contact on the server:", error);
  }
}


function getValueById(id) {
  return document.getElementById(id).value;
}


function validateInputFields(...values) {
  return values.every(value => value.trim() !== '');
}


init();