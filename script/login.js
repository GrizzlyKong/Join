/**
 * Initializes the application by loading users, displaying hidden elements, performing a logo animation, and setting up login form functionality.
 */
async function init() {
  await loadUsers();
  displayHidden();
  logoAnimation();
  loginForm(users);
  updatePasswordVisibility();
}


/**
 * Performs a logo animation by translating and scaling the logo element.
 */
function logoAnimation() {
  const logo = document.getElementById("logo-animated");
  setTimeout(() => {
    logo.style.transform = "translate(-42.25vw, -28.25vh) scale(0.35)";
  }, 500);
}


/**
 * Displays hidden elements on the page with opacity transition.
 */
function displayHidden() {
  let hidden1 = document.querySelector(".log-in-content");
  let hidden2 = document.querySelector(".log-in-sign-up");
  let hidden3 = document.querySelector(".log-in-links");
  setTimeout(function () {
    hidden1.style.opacity = 1;
    hidden2.style.opacity = 1;
    hidden3.style.opacity = 1;
  }, 1500);
  document.getElementById('logo-anime').classList.add('zIndex');
  document.getElementById('log-in-content-id').classList.add('zIndex2');
}


/**
 * Loads user data from server storage asynchronously.
 */
async function loadUsers() {
  try {
    users = JSON.parse(await getItem('users'));
  } catch (e) {
    console.error('Loading error:', e);
  }
}


/**
 * Checks if the provided email and password match a user in the system.
 * @param {string} email - The email address provided by the user.
 * @param {string} password - The password provided by the user.
 * @returns {(object|null)} The user object if a match is found, otherwise null.
 */
function validateCredentials(email, password) {
  const user = findUser(email, password);
  if (user) {
    return user;
  } else {
    return null;
  }
}


/**
 * Executes necessary actions for a successful login, including setting session flags and redirecting the user.
 * @param {object} user
 * @param {HTMLElement} checkbox
 */
function processSuccessfulLogin(user, checkbox) {
  const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  handleRememberMe(checkbox, user.email, user.password);
  setLoggedInUser(user.name);
  localStorage.setItem('isMobileDevice', isMobileDevice);
  location.replace("../html/summary.html");
}


/**
 * processes a successful login or shows an error message based on the validation result.
 */
async function login() {
  await loadUsers();
  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');
  const invalidUserData = document.getElementById('ifInvalid');
  const checkbox = document.getElementById('remember-me-checkbox');
  clearValidationStyles(emailInput, passwordInput, invalidUserData);
  const email = emailInput.value;
  const password = passwordInput.value;
  const user = validateCredentials(email, password);
  if (user) {
    processSuccessfulLogin(user, checkbox);
  } else {
    showInvalidUserData(invalidUserData, emailInput, passwordInput);
  }
}


/**
 * Clears validation styles for email and password inputs.
 */
function clearValidationStyles(emailInput, passwordInput, invalidUserData) {
  invalidUserData.innerHTML = '';
  emailInput.style.borderColor = '';
  passwordInput.style.borderColor = '';
}


/**
 * Handles remember me functionality by storing or removing email and password in local storage.
 */
function handleRememberMe(checkbox, email, password) {
  if (checkbox.checked) {
    localStorage.setItem('rememberedEmail', email);
    localStorage.setItem('rememberedPassword', password);
  } else {
    localStorage.removeItem('rememberedEmail');
    localStorage.removeItem('rememberedPassword');
  }
}


/**
 * Sets the logged-in user name in local storage.
 * @param {string} userName - The name of the logged-in user.
 */
function setLoggedInUser(userName) {
  localStorage.setItem('loggedInUserName', userName);
}


/**
 * Finds a user in the users array based on email and password.
 * @param {string} email - The email of the user.
 * @param {string} password - The password of the user.
 */
function findUser(email, password) {
  return users.find(u => u.email === email && u.password === password);
}


/**
 * Displays a message for invalid user data and applies red border to email and password inputs.
 */
function showInvalidUserData(invalidUserData, emailInput, passwordInput) {
  invalidUserData.innerHTML += /* HTML */ `
    <div class="invalid-data">Invalid email or password</div>
  `;
  emailInput.style.borderColor = "red";
  passwordInput.style.borderColor = "red";
}


/**
 * Sets up the login form by setting default values and event listeners.
 * @param {array} users - The array of user objects.
 */
function loginForm(users) {
  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');
  const rememberCheckbox = document.getElementById('remember-me-checkbox');
  rememberCheckbox.checked = true;
  setEmailChangeListener(emailInput, passwordInput, users);
}


/**
 * Adds an event listener to the email input for updating the password input based on the selected email.
 * @param {HTMLInputElement} emailInput - The email input element.
 * @param {HTMLInputElement} passwordInput - The password input element.
 * @param {array} users - The array of user objects.
 */
function setEmailChangeListener(emailInput, passwordInput, users) {
  emailInput.addEventListener('change', () => {
    updatePasswordBasedOnEmail(emailInput, passwordInput, users);
  });
}


/**
 * Updates the password input based on the selected email.
 * @param {HTMLInputElement} emailInput - The email input element.
 * @param {HTMLInputElement} passwordInput - The password input element.
 * @param {array} users - The array of user objects.
 */
function updatePasswordBasedOnEmail(emailInput, passwordInput, users) {
  const selectedEmail = emailInput.value;
  const user = findUserByEmail(users, selectedEmail);
  if (user) {
    passwordInput.value = user.password;
  } else {
    passwordInput.value = '';
  }
}


/**
 * Finds a user in the users array based on email.
 * @param {array} users - The array of user objects.
 * @param {string} email - The email of the user to find.
 */
function findUserByEmail(users, email) {
  return users.find(u => u.email === email);
}


/**
 * Logs out the guest user by removing stored data and redirecting to the summary page.
 */
function guestLogin() {
  localStorage.removeItem('loggedInUserName');
  localStorage.removeItem('rememberedEmail');
  localStorage.removeItem('rememberedPassword');
  location.replace("../html/summary.html");
}


/**
 * Updates the visibility of the password input field and related icons.
 */
function updatePasswordVisibility() {
  const { passwordInput, lockIcon, eyeIcon, eyeIconHidden } = getPasswordElements();
  if (!passwordInput || !lockIcon || !eyeIcon || !eyeIconHidden) {
    return;
  }
  const passwordValue = passwordInput.value.trim();
  updateVisibility(passwordValue, lockIcon, eyeIcon, eyeIconHidden);
}


/**
 * Updates the visibility of lock icon, eye icon, and hidden eye icon based on the password value.
 * @param {string} passwordValue - The value of the password input field.
 * @param {HTMLElement} lockIcon - The lock icon element.
 * @param {HTMLElement} eyeIcon - The visible eye icon element.
 * @param {HTMLElement} eyeIconHidden - The hidden eye icon element.
 */
function updateVisibility(passwordValue, lockIcon, eyeIcon, eyeIconHidden) {
  lockIcon.style.display = passwordValue === '' ? 'inline-block' : 'none';
  eyeIcon.style.display = passwordValue === '' ? 'none' : 'inline-block';
  eyeIconHidden.style.display = passwordValue === '' ? 'none' : 'inline-block';
}


/**
 * Toggles the visibility of the password input between text and password types.
 */
function togglePasswordVisibility() {
  const passwordInput = document.getElementById('loginPassword');
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
  } else {
    passwordInput.type = 'password';
  }
  updatePasswordVisibility();
}