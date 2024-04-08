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
 * Generates HTML for a new contact element.
 * 
 * @param {string} initialLetter - The initial letter of the contact's name.
 * @param {string} name - The name of the contact.
 * @param {string} email - The email of the contact.
 * @param {string} randomColor - The random color for the contact icon.
 * @returns {string} The generated HTML.
 */
function generateNewContactElementHTML(initialLetter, name, email, randomColor) {
    return /*html*/ `
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
 * Generates HTML for a contact element.
 * 
 * @param {string} name - The name of the contact.
 * @param {string} email - The email of the contact.
 * @param {string} initialLetter - The initial letter of the contact's name.
 * @param {string} color - The color of the contact icon.
 * @returns {string} The generated HTML.
 */
function generateContactElementHTML(name, email, initialLetter, color) {
    return /*html*/ `
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