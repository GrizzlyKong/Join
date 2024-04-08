/**
 * Toggles the visibility of the contacts dropdown.
 */
function toggleContactsVisibility() {
    const contactsContainer = document.getElementById("contactsContainerTask");
    const arrowDrop = document.getElementById("arrowDropImage");
    const selectedContactsContainer = document.getElementById("selectedContactsContainer");
    contactsContainer.style.display = (contactsContainer.style.display === "none") ? "flex" : "none";
    arrowDrop.style.transform = (contactsContainer.style.display === "none") ? "rotate(0deg)" : "rotate(180deg)";
    if (contactsContainer.style.display === "none") {
      updateSelectedContactIcons();
    }
  }
  
  
  /**
   * Displays selected contacts icons.
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
   * Updates the selected contacts container.
   * @param {HTMLElement} selectedContactsContainer - The container element for selected contacts.
   */
  function updateSelectedContactsContainer(selectedContactsContainer) {
    selectedContactsContainer.innerHTML = '';
    for (let i = 0; i < selectedContactIcons.length; i++) {
      const contact = selectedContactIcons[i];
      const selectedContactIcon = document.createElement("div");
      selectedContactIcon.classList.add("contact-icon");
      selectedContactIcon.textContent = contact.letter;
      selectedContactIcon.style.backgroundColor = contact.color;
      selectedContactsContainer.appendChild(selectedContactIcon);
    }
  }
  
  
  /**
   * Updates the selected contact icons based on the checkboxes state.
   * Clears the existing icons and updates them according to the selected checkboxes.
   */
  function updateSelectedContactIcons() {
    const selectedContactsContainer = document.getElementById("selectedContactsContainer");
    selectedContactsContainer.innerHTML = '';
  updateSelectedContacIconsLoop(selectedContactsContainer);
  }
  const checkboxes = document.querySelectorAll('.contact-checkbox');
  for (let i = 0; i < checkboxes.length; i++) {
    checkboxes[i].addEventListener('change', (event) => {
        updateSelectedContactIcons();
    });
  }
  
  
  /**
   * Updates the selected contact icons displayed in the specified container.
   * Iterates over an array of selected contact icons and creates a div element for each icon.
   */
  function updateSelectedContacIconsLoop(selectedContactsContainer) {
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
   * Renders contacts on the contacts container.
   * @param {Object[]} userContacts - The array of user contact objects.
   * @param {HTMLElement} contactsContainer - The container element for contacts.
   * @param {HTMLElement} selectedContactsContainer - The container element for selected contacts.
   * @param {Object} contactColors - An object containing contact colors.
   */
  function renderContacts(userContacts, contactsContainer, selectedContactsContainer, contactColors) {
    for (let i = 0; i < userContacts.length; i++) {
      const contact = userContacts[i];
      const { name, color } = contact;
      if (!name) {
        continue;
      }
      const contactDiv = createContactDiv(name, color, contactColors);
      contactsContainer.appendChild(contactDiv);
    }
  }
  
  
  /**
   * Creates a contact div with various elements inside.
   * @param {string} name - The name of the contact.
   * @param {string} color - The color associated with the contact.
   * @param {Object} contactColors - An object containing contact colors.
   * @returns {HTMLElement} The created contact div.
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
   * Creates the main contact div element.
   * @returns {HTMLElement} The created main contact div element.
   */
  function createMainContactDiv() {
    const contactDiv = document.createElement("div");
    contactDiv.classList.add("contact");
    contactDiv.style = `display: flex; marginBottom: 4px; marginTop: 4px; alignItems: center;`;
    return contactDiv;
  }
  
  
  /**
   * Appends a contact icon to the contact div.
   * @param {HTMLElement} contactDiv - The contact div element.
   * @param {string} name - The name of the contact.
   * @param {string} color - The color associated with the contact.
   * @param {Object} contactColors - An object containing contact colors.
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
   * Appends a contact name element to the contact div.
   * @param {HTMLElement} contactDiv - The contact div element.
   * @param {string} name - The name of the contact.
   */
  function appendContactName(contactDiv, name) {
    const contactName = document.createElement("span");
    contactName.textContent = name;
    contactDiv.appendChild(contactName);
  }
  
  
  /**
   * Appends a spacer element to the contact div.
   * @param {HTMLElement} contactDiv - The contact div element.
   */
  function appendSpacer(contactDiv) {
    const spacer = document.createElement("div");
    spacer.style.flexGrow = "1";
    contactDiv.appendChild(spacer);
  }
  
  
  /**
   * Appends a contact checkbox element to the contact div.
   * @param {HTMLElement} contactDiv - The contact div element.
   * @param {string} name - The name of the contact.
   * @param {Object} contactColors - An object containing contact colors.
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
   * @param {HTMLElement} contactDiv - The contact div element.
   * @param {Object} contactColors - An object containing contact colors.
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
   * Handles the change event of the contact checkbox.
   * @param {HTMLInputElement} contactCheckbox - The contact checkbox element.
   * @param {Object} contactColors - An object containing contact colors.
   */
  function handleCheckboxChange(contactCheckbox, contactColors) {
    updateSelectedContacts(contactCheckbox, contactColors);
    renderSelectedContacts();
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
   * Updates the list of selected contacts.
   * @param {HTMLInputElement} contactCheckbox - The contact checkbox element.
   * @param {Object} contactColors - An object containing contact colors.
   */
  function updateSelectedContacts(contactCheckbox, contactColors) {
    const contactName = contactCheckbox.value;
    const isChecked = contactCheckbox.checked;
    const contactDetail = {
      name: contactName,
      color: contactColors[contactName],
      letter: contactName.charAt(0).toUpperCase(),
    };
  
    if (isChecked) {
      addSelectedContact(contactDetail);
    } else {
      removeSelectedContact(contactName);
    }
  }
  
  
  /**
   * Adds a selected contact to the list of selected contacts.
   * @param {Object} contactDetail - The contact details.
   */
  function addSelectedContact(contactDetail) {
    const contactName = contactDetail.name;
    let isContactExist = false;
    for (let i = 0; i < selectedContactIcons.length; i++) {
      if (selectedContactIcons[i].name === contactName) {
        isContactExist = true;
        break;
      }
    }
    if (!isContactExist) {
      selectedContactIcons.push(contactDetail);
    }
  }
  
  
  /**
   * Removes a selected contact from the list of selected contacts.
   * @param {string} contactName - The name of the contact to be removed.
   */
  function removeSelectedContact(contactName) {
    let updatedSelectedContactIcons = [];
    for (let i = 0; i < selectedContactIcons.length; i++) {
      if (selectedContactIcons[i].name !== contactName) {
        updatedSelectedContactIcons.push(selectedContactIcons[i]);
      }
    }
    selectedContactIcons = updatedSelectedContactIcons;
  }
  
  
  /**
   * Displays the logged-in user's initial.
   */
  function displayLoggedInUser() {
    const loggedInUserName = localStorage.getItem('loggedInUserName');
    if (loggedInUserName) {
      const userNameIcon = document.getElementById('board-user-icon');
      const firstLetter = loggedInUserName.charAt(0).toUpperCase();
      userNameIcon.textContent = firstLetter;
    }
  }
  
  
  /**
   * Toggles the visibility of the contacts container.
   */
  function revealContacts() {
    const contactsContainer = document.getElementById("contactsContainerTask");
    const arrowDrop = document.getElementById("arrowDropImage");
    isContactsVisible = !isContactsVisible;
    contactsContainer.style.display = isContactsVisible ? "flex" : "none";
    arrowDrop.style.transform = isContactsVisible ? "rotate(180deg)" : "rotate(0deg)";
  }


  /**
 * Displays assigned contacts on the task creation form.
 */
function displayAssignedContacts() {
    const loggedInUserName = localStorage.getItem("loggedInUserName");
    const contactsData = getItem(`contacts_${loggedInUserName}`);
    const userContacts = JSON.parse(contactsData) || [];
    const contactsContainer = document.getElementById("contactsContainerTask");
    for (let i = 0; i < userContacts.length; i++) {
      const contact = userContacts[i];
      const contactElement = createContactIcon(contact);
      contactsContainer.appendChild(contactElement);
    }
  }
  
  
  /**
   * Creates a contact icon element based on contact details.
   * @param {Object} contact - The contact object containing name and color.
   * @param {string} contact.name - The name of the contact.
   * @param {string} contact.color - The color associated with the contact.
   * @returns {HTMLElement|null} The created contact icon element, or null if name is empty.
   */
  function createContactIcon(contact) {
    const { name, color } = contact;
    if (!name) {
      return null;
    }
    const contactElement = document.createElement("div");
    contactElement.className = "contact-icon";
    contactElement.style.backgroundColor = color;
    const nameElement = document.createElement("div");
    nameElement.className = "contact-icon-name";
    nameElement.textContent = name.charAt(0).toUpperCase();
    contactElement.appendChild(nameElement);
    return contactElement;
  }


  /**
 * Generates HTML content for displaying contacts.
 * @param {Object[]} contacts - The array of contact objects.
 * @returns {string} The HTML content for displaying contacts.
 */
function generateContactsHtml(contacts) {
    let htmlContent = '';
    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];
      htmlContent += `<div class="task-contact-icon" style="background-color: ${contact.color};">${contact.letter}</div>`;
    }
    return htmlContent;
  }


  init();