/**
 * Initializes the page by including HTML files and setting up user-related elements.
 */
async function init() {
  await includeHTML();
  userNamerIcon();
}


/**
 * Includes HTML content into designated elements with 'w3-include-html' attribute.
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
 * Sets up the user name icon by retrieving the user's name from local storage.
 */
function userNamerIcon() {
  const loggedInUserName = localStorage.getItem('loggedInUserName');

  if (loggedInUserName) {
    const userNameIcon = document.getElementById('dropbtn');
    const firstLetter = loggedInUserName.charAt(0).toUpperCase();
    userNameIcon.textContent = firstLetter;
  }
}


/**
 * Toggles the visibility of the profile dropdown menu.
 */
function ProfileDropdown() {
  document.getElementById("myDropdown").classList.toggle("show");
}


/**
 * Closes the profile dropdown menu when a click event occurs outside of it.
 */
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {
    let dropdowns = document.getElementsByClassName("dropdown-content");
    let i;
    for (i = 0; i < dropdowns.length; i++) {
      let openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}