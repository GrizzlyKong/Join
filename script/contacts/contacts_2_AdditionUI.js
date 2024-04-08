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