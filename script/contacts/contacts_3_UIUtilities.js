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
    for (let i = 0; i < 2; i++) {
      const elem = i === 0 ? editContactDiv : addNewContactDiv;
      elem.classList.add("sign-up-animation");
    }
    addNewContactDiv.classList.remove("d-none");
    greyOverlay();
    editContactDiv.innerHTML = generateEditContactFormHTML(contactToEdit, contactIndex, initialLetter, email, phone, color);
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