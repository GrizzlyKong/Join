let contacts = [];


/**
 * Initializes the application.
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
  for (let i = 0; i < guestContacts.length; i++) {
    displayGuestContact(guestContacts[i]);
  }
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
    for (let i = 0; i < savedContacts.length; i++) {
      displayContact(savedContacts[i]);
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
   * Retrieves the contacts menu element.
   * 
   * @returns {HTMLElement} The contacts menu element.
   */
  function getContactsMenu() {
    return document.getElementById("contactsMenu");
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
 * Reloads the current page.
 */
function reloadPage() {
    location.reload();
  }


  /**
 * Retrieves the values of the contact fields from the form inputs.
 * 
 * @returns {string[]} An array containing the values of the contact fields.
 */
function getContactValues() {
    const contactFieldIds = ["contactNameInput", "contactEmailInput", "contactPhoneInput"];
    const contactValues = [];
    for (let i = 0; i < contactFieldIds.length; i++) {
      const value = getValueById(contactFieldIds[i]);
      contactValues.push(value);
    }
    return contactValues;
  }
  
  
  /**
   * Retrieves the username of the logged-in user from local storage.
   * 
   * @returns {string|null} The username of the logged-in user, or null if not found.
   */
  function getLoggedInUserName() {
    return localStorage.getItem("loggedInUserName");
  }