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