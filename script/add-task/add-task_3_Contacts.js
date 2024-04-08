/**
 * Toggles the visibility of the contacts container on the webpage.
 * Also rotates an arrow image indicating the dropdown state.
 */
function revealContacts() {
  const contactsContainer = document.getElementById("contactsContainerTask");
  const arrowImage = document.getElementById("arrowDropImage");
  if (contactsContainer.style.display === "none" || contactsContainer.style.display === "") {
    contactsContainer.style.display = "block";
    arrowImage.classList.add("rotate");
  } else {
    contactsContainer.style.display = "none";
    arrowImage.classList.remove("rotate");
  }
}


/**
 * Populates the contacts dropdown with available contacts.
 */
async function populateContactsDropdown() {
  try {
      taskContacts = await fetchAndFilterContacts();
      if (isContactsListEmpty(taskContacts)) return;
      const uiElements = getUIElements();
      if (uiElementsMissing(uiElements)) return;
      setupUIEventListeners(uiElements.selectToAssignInput);
      prepareContactsContainer(uiElements.contactsContainer, taskContacts, uiElements.selectedContactsContainer);
  } catch (error) {
      console.error("Error in populateContactsDropdown:", error);
  }
}


/**
 * Fetches and filters contacts for the logged-in user.
 * @returns {Array} Filtered list of contacts.
 */
async function fetchAndFilterContacts() {
  const loggedInUserName = localStorage.getItem("loggedInUserName");
  if (!loggedInUserName) {
      console.error("No logged-in user found. Contacts cannot be loaded.");
      return [];}
  const contactsData = await getItem(`contacts_${loggedInUserName}`);
  const parsedContacts = JSON.parse(contactsData) || [];
  const filteredContacts = [];
  for (let i = 0; i < parsedContacts.length; i++) {
      const contact = parsedContacts[i];
      if (contact.name || contact.email || contact.phone) {
          filteredContacts.push(contact);
      }}
  return filteredContacts;
}


/**
 * Checks if the list of contacts is empty.
 * @param {Array} taskContacts - List of contacts to check.
 * @returns {boolean} True if the list of contacts is empty, otherwise false.
 */
function isContactsListEmpty(taskContacts) {
  if (taskContacts.length === 0) {
      console.log("No contacts found or an error occurred while fetching contacts.");
      return true;
  }
  return false;
}


/**
* Retrieves UI elements needed for populating the contacts dropdown.
* @returns {Object} UI elements required for populating the contacts dropdown.
*/
function getUIElements() {
  const contactsContainer = document.getElementById("contactsContainerTask");
  const selectToAssignInput = document.querySelector(".select-to-assign");
  const arrowDrop = document.getElementById("arrowDropImage");
  const selectedContactsContainer = document.getElementById("selectedContactsContainer");
  return { contactsContainer, selectToAssignInput, arrowDrop, selectedContactsContainer };
}


/**
* Checks if UI elements required for populating the contacts dropdown are missing.
* @param {Object} uiElements - UI elements required for populating the contacts dropdown.
* @returns {boolean} True if UI elements are missing, otherwise false.
*/
function uiElementsMissing({ contactsContainer, selectToAssignInput, arrowDrop, selectedContactsContainer }) {
  if (!selectToAssignInput || !contactsContainer || !selectedContactsContainer || !arrowDrop) {
      return true;
  }
  return false;
}


/**
* Sets up event listeners for UI elements.
* @param {HTMLElement} selectToAssignInput - Input element for selecting contacts.
*/
function setupUIEventListeners(selectToAssignInput) {
  selectToAssignInput.removeEventListener("click", toggleContactsVisibility);
  selectToAssignInput.addEventListener("click", toggleContactsVisibility);
}


/**
 * Toggles the visibility of the contacts dropdown.
 */
function toggleContactsVisibility() {
  const contactsContainer = document.getElementById("contactsContainerTask");
  const arrowDrop = document.getElementById("arrowDropImage");
  const selectedContactsContainer = document.getElementById("selectedContactsContainer");
  contactsContainer.style.display = (contactsContainer.style.display === "none") ? "flex" : "none";
  arrowDrop.style.transform = (contactsContainer.style.display === "none") ? "rotate(0deg)" : "rotate(180deg)";
}


/**
* Prepares the contacts container by rendering contacts.
* @param {HTMLElement} contactsContainer - Container for displaying contacts.
* @param {Array} taskContacts - List of contacts to render.
* @param {HTMLElement} selectedContactsContainer - Container for displaying selected contacts.
*/
function prepareContactsContainer(contactsContainer, taskContacts, selectedContactsContainer) {
  let contactColors = {};
  contactsContainer.innerHTML = '';
  renderContacts(taskContacts, contactsContainer, selectedContactsContainer, contactColors);
}


/**
 * Renders contacts in the contacts container.
 * @param {Array} userContacts - List of user contacts.
 * @param {HTMLElement} contactsContainer - Container for displaying contacts.
 * @param {HTMLElement} selectedContactsContainer - Container for displaying selected contacts.
 * @param {Object} contactColors - Object containing contact colors.
 */
function renderContacts(taskContacts, contactsContainer, selectedContactsContainer, contactColors) {
  contactsContainer.innerHTML = '';
  for (let i = 0; i < taskContacts.length; i++) {
      const contact = taskContacts[i];
      const contactElement = createContactDiv(contact.name, contact.color, contactColors);
      contactsContainer.appendChild(contactElement);
  }
}


/**
 * Creates a div element for displaying contact information.
 * @param {string} name - Contact name.
 * @param {string} color - Color associated with the contact.
 * @param {Object} contactColors - Object containing contact colors.
 * @returns {HTMLElement} Div element for contact information.
 */
function createContactDiv(name, color, contactColors) {
  const contactDiv = createMainContactDiv();
  appendContactIcon(contactDiv, name, color, contactColors);
  appendContactName(contactDiv, name);
  appendSpacer(contactDiv);
  appendContactCheckbox(contactDiv, name, contactColors);
  setupEventListeners(contactDiv, contactColors);
  return contactDiv;
}


/**
 * Creates the main contact div.
 * @returns {HTMLElement} Main contact div.
 */
function createMainContactDiv() {
  const contactDiv = document.createElement("div");
  contactDiv.classList.add("contact");
  contactDiv.style = `display: flex; marginBottom: 4px; marginTop: 4px; alignItems: center;`;
  return contactDiv;
}


/**
 * Appends contact icon to the contact div.
 * @param {HTMLElement} contactDiv - Contact div element.
 * @param {string} name - Contact name.
 * @param {string} color - Color associated with the contact.
 * @param {Object} contactColors - Object containing contact colors.
 */
function appendContactIcon(contactDiv, name, color, contactColors) {
  const contactIcon = document.createElement("div");
  contactIcon.classList.add("contact-icon");
  contactIcon.textContent = name.charAt(0).toUpperCase();
  contactColors[name] = color || getRandomColor();
  contactIcon.style.backgroundColor = contactColors[name];
  contactIcon.style.color = "white";
  contactDiv.appendChild(contactIcon);
}


/**
 * Appends contact name to the contact div.
 * @param {HTMLElement} contactDiv - Contact div element.
 * @param {string} name - Contact name.
 */
function appendContactName(contactDiv, name) {
  const contactName = document.createElement("span");
  contactName.textContent = name;
  contactDiv.appendChild(contactName);
}


/**
 * Appends spacer to the contact div.
 * @param {HTMLElement} contactDiv - Contact div element.
 */
function appendSpacer(contactDiv) {
  const spacer = document.createElement("div");
  spacer.style.flexGrow = "1";
  contactDiv.appendChild(spacer);
}


/**
 * Appends contact checkbox to the contact div.
 * @param {HTMLElement} contactDiv - Contact div element.
 * @param {string} name - Contact name.
 * @param {Object} contactColors - Object containing contact colors.
 */
function appendContactCheckbox(contactDiv, name, contactColors) {
  const contactCheckbox = document.createElement("input");
  contactCheckbox.type = "checkbox";
  contactCheckbox.value = name;
  contactCheckbox.dataset.color = contactColors[name];
  contactCheckbox.classList.add("contact-checkbox");
  contactDiv.appendChild(contactCheckbox);
}


/**
 * Sets up event listeners for the contact div.
 * @param {HTMLElement} contactDiv - Contact div element.
 * @param {Object} contactColors - Object containing contact colors.
 */
function setupEventListeners(contactDiv, contactColors) {
  contactDiv.addEventListener("mouseover", () => contactDiv.classList.add("hovered"));
  contactDiv.addEventListener("mouseout", () => contactDiv.classList.remove("hovered"));
  contactDiv.addEventListener("click", function(event) {
      event.stopPropagation();
      const contactCheckbox = contactDiv.querySelector(".contact-checkbox");
      contactCheckbox.checked = !contactCheckbox.checked;
      contactCheckbox.dispatchEvent(new Event("change"));
  });
  const contactCheckbox = contactDiv.querySelector(".contact-checkbox");
  contactCheckbox.addEventListener("change", () => handleCheckboxChange(contactCheckbox, contactColors));
}


/**
 * Handles the change event for the contact checkbox.
 * @param {HTMLElement} contactCheckbox - Contact checkbox element.
 * @param {Object} contactColors - Object containing contact colors.
 */
function handleCheckboxChange(contactCheckbox, contactColors) {
  updateSelectedContacts(contactCheckbox, contactColors);
  renderSelectedContactIcons();
  const contactElement = contactCheckbox.closest('.contact');
  if (contactCheckbox.checked) {
    contactElement.style.backgroundColor = 'rgb(42,54,71)';
    contactElement.style.color = 'white';
  } else {
    contactElement.style.backgroundColor = '';
    contactElement.style.color = '';
  }
}


/**
 * Renders selected contact icons in the selected contacts container.
 */
function renderSelectedContactIcons() {
  const selectedContactsContainer = document.getElementById("selectedContactsContainer");
  selectedContactsContainer.innerHTML = '';
  for (let i = 0; i < selectedContactIcons.length; i++) {
    const contact = selectedContactIcons[i];
    const iconElement = document.createElement('div');
    iconElement.className = 'contact-icon';
    iconElement.textContent = contact.letter;
    iconElement.style.backgroundColor = contact.color;
    selectedContactsContainer.appendChild(iconElement);
  }
}


/**
 * Updates the list of selected contacts based on checkbox changes.
 * @param {HTMLElement} contactCheckbox - Contact checkbox element.
 * @param {Object} contactColors - Object containing contact colors.
 */
function updateSelectedContacts(contactCheckbox, contactColors) {
  const contactName = contactCheckbox.value;
  const isChecked = contactCheckbox.checked;
  const contactDetail = {
      name: contactName,
      color: contactColors[contactName],
      letter: contactName.charAt(0).toUpperCase(),};
  if (isChecked) {
      selectedContactIcons.push(contactDetail);
  } else {
      let updatedSelectedContactIcons = [];
      for (let i = 0; i < selectedContactIcons.length; i++) {
          const detail = selectedContactIcons[i];
          if (detail.name !== contactName) {
              updatedSelectedContactIcons.push(detail);
          }
      }
      selectedContactIcons = updatedSelectedContactIcons;
  }
}


/**
 * Maps contacts for display by extracting the icon and name from each contact object.
 * @param {Array} contacts - List of contacts to loop through.
 * @returns {Array} Mapped contacts with icon and name.
 */
function mapContactsForDisplay(contacts) {
  const mappedContacts = [];
  for (let i = 0; i < contacts.length; i++) {
    const contact = contacts[i];
    mappedContacts.push({
      icon: contact.profileImage,
      name: contact.username
    });
  }
  return mappedContacts;
}


/**
 * Displays selected contacts icons in the selected contacts container.
 */
function displaySelectedContactsIcons() {
  const selectToAssignInput = document.querySelector('.select-to-assign');
  const container = selectToAssignInput.parentElement;
  let iconsContainer = document.getElementById('selectedContactsIcons');
  if (!iconsContainer) {
    iconsContainer = document.createElement('div');
    iconsContainer.id = 'selectedContactsIcons';
    container.appendChild(iconsContainer);
  }
  iconsContainer.innerHTML = '';
}


/**
 * Updates the selected contacts container with selected contacts.
 * @param {HTMLElement} selectedContactsContainer - Container for displaying selected contacts.
 */
function updateSelectedContactsContainer(selectedContactsContainer) {
  selectedContactsContainer.innerHTML = '';
  for (let i = 0; i < selectedContacts.length; i++) {
    const name = selectedContacts[i];
    const selectedContactIcon = document.createElement("div");
    selectedContactIcon.classList.add("contact-icon");
    selectedContactIcon.textContent = name.charAt(0).toUpperCase();
    selectedContactIcon.style.backgroundColor = contactColors[name];
    selectedContactIcon.style.color = "white";
    selectedContactsContainer.appendChild(selectedContactIcon);
  }
}