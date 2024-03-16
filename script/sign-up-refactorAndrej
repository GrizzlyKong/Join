/**
 * Initializes the registration process by loading users, setting up checkbox behavior, password length validation, and password visibility.
 */
async function init() {
  loadUsers();
  privacyPolicyHoverCheckbox();
  checkboxCheck();
  passwordLenghtCheck();
  eventTogglePasswordVisibility();
  updatePasswordVisibilityForPassword();
  updatePasswordVisibilityForConfirmPassword();
  updateVisibilities();
}


/**
 * Loads user data from storage asynchronously.
 */
async function loadUsers() {
  try {
    users = JSON.parse(await getItem("users"));
  } catch (e) {
    console.error("Loading error:", e);
  }
}


/**
 * Registers a new user by handling privacy policy agreement, registration form validation, and successful registration actions.
 * @param {HTMLElement} privacyCheckbox - The privacy policy checkbox element.
 * @param {HTMLElement} privacyPolicy - The privacy policy element.
 * @param {HTMLElement} privacyPolicySpan - The span element within the privacy policy element.
 */
async function register() {
  const privacyCheckbox = document.getElementById("privacyCheckbox");
  const privacyPolicy = document.querySelector(".sign-up-privacy-policy");
  const privacyPolicySpan = document.querySelector(".sign-up-privacy-policy-span");
  addPrivacyCheckboxListener(privacyCheckbox, privacyPolicy, privacyPolicySpan);
  if (!privacyCheckbox.checked) {
    showError(privacyPolicy, privacyPolicySpan);
    return;
  } else {
    removeError(privacyPolicy, privacyPolicySpan);
    handleSuccessfulRegistration();
  }
}


/**
 * Adds an event listener to the privacy checkbox for updating the privacy policy element's error state.
 * @param {HTMLElement} checkbox - The privacy policy checkbox element.
 * @param {HTMLElement} policyElement - The privacy policy element.
 * @param {HTMLElement} spanElement - The span element within the privacy policy element.
 */
function addPrivacyCheckboxListener(checkbox, policyElement, spanElement) {
  checkbox.addEventListener("change", function() {
    if (this.checked) {
      policyElement.classList.remove("error");
      spanElement.classList.remove("error2");
    }
  });
}


/**
 * Displays an error state for the privacy policy element.
 * @param {HTMLElement} policyElement - The privacy policy element.
 * @param {HTMLElement} spanElement - The span element within the privacy policy element.
 */
function showError(policyElement, spanElement) {
  policyElement.classList.add("error");
  spanElement.classList.add("error2");
}


/**
 * Removes the error state from the privacy policy element.
 * @param {HTMLElement} policyElement - The privacy policy element.
 * @param {HTMLElement} spanElement - The span element within the privacy policy element.
 */
function removeError(policyElement, spanElement) {
  policyElement.classList.remove("error");
  spanElement.classList.remove("error2");
}


/**
 * Handles successful user registration by updating user data, storing it, resetting the form, and displaying success message.
 */
async function handleSuccessfulRegistration() {
  pushUsers();
  await setItem("users", JSON.stringify(users));
  resetForm();
  SignedUpSuccessfully();
}


/**
 * Displays a success message for successful user registration.
 */
function SignedUpSuccessfully() {
  document.getElementById("sign-up-id").classList.remove("d-none");
  document.getElementById("sign-up-id").classList.add("sign-up-animation");
  document.getElementById("body").classList.add("body");
  document.getElementById("sign-up-content-id").classList.add("blur");
  setTimeout(() => {
    document.getElementById("sign-up-id").classList.add("d-none");
    document.getElementById("body").classList.remove("body");
    document.getElementById("sign-up-content-id").classList.remove("blur");
    location.replace("../html/login.html");
  }, 3000);
}


/**
 * Pushes user data into the users array.
 */
function pushUsers() {
  users.push({
    name: username.value,
    email: email.value,
    password: password.value,
    passwordConfirm: passwordConfirm.value,
  });
}


/**
 * Resets the registration form.
 */
function resetForm() {
  username.value = "";
  email.value = "";
  password.value = "";
  passwordConfirm.value = "";
}


/**
 * Adds an event listener to the privacy checkbox for updating the privacy policy element's error state.
 */
function checkboxCheck() {
document.getElementById("privacyCheckbox").addEventListener("change", function() {
  if (this.checked) {
    document.querySelector(".sign-up-privacy-policy").classList.remove("error");
  }
});
}


/**
 * Validates password length and displays an error message if it's less than 6 characters.
 */
function passwordLenghtCheck() {
const passwordInput = document.getElementById("password");
passwordInput.addEventListener("input", function() {
  const passwordValue = this.value;
  const passwordLengthError = document.getElementById("passwordLengthError");
  if (passwordValue.length < 6) {
    passwordLengthError.innerText = "Password must be at least 6 characters";
  } else {
    passwordLengthError.innerText = "";
  }
});
}


/**
 * Handles hover behavior for the privacy policy checkbox.
 */
function privacyPolicyHoverCheckbox() {
  const privacyPolicySpan = document.getElementById("sign-up-privacy-policy-id");
  const privacyCheckbox = document.getElementById("privacyCheckbox");
  privacyPolicySpan.addEventListener("mouseenter", function() {
    privacyCheckbox.classList.add("hovered");
  });
  privacyPolicySpan.addEventListener("mouseleave", function() {
    privacyCheckbox.classList.remove("hovered");
  });
}


/**
 * Updates the visibility of password input fields based on their values.
 * @param {string} field - The name of the password input field.
 */
 function updatePasswordVisibility(field) {
  const passwordInput = document.getElementById(field === 'password' ? 'password' : 'passwordConfirm');
  const lockIcon = document.getElementById(`lockIcon${field === 'password' ? 'Password' : 'Confirm'}`);
  const eyeIcon = document.getElementById(`eyeIcon${field === 'password' ? 'Password' : 'Confirm'}`);
  const eyeIconHidden = document.getElementById(`eyeIconHidden${field === 'password' ? 'Password' : 'Confirm'}`);
  const passwordValue = passwordInput.value.trim();
  if (passwordInput.type === 'password') {
    passwordIsHidden(lockIcon, eyeIcon, eyeIconHidden,passwordValue);
  } else {
     passwordIsVisible(lockIcon, eyeIcon, eyeIconHidden,passwordValue);
  }
}


/**
 * Updates the visibility of password input fields based on their values.
 */
function passwordIsHidden(lockIcon, eyeIcon, eyeIconHidden,passwordValue) {
lockIcon.style.display = passwordValue === '' ? 'inline-block' : 'none';
eyeIcon.style.display = passwordValue === '' ? 'none' : 'inline-block';
eyeIconHidden.style.display = 'none';
}


/**
 * Updates the visibility of password input fields based on their values.
 */
function passwordIsVisible(lockIcon, eyeIcon, eyeIconHidden,passwordValue) {
lockIcon.style.display = passwordValue === '' ? 'inline-block' : 'none';
eyeIcon.style.display = 'none';
eyeIconHidden.style.display = passwordValue === '' ? 'none' : 'inline-block';
}


/**
 * Adds event listeners for toggling password visibility and updating password visibility for the password field.
 */
function eventTogglePasswordVisibility() {
document.getElementById('eyeIconPassword').addEventListener('click', () => togglePasswordVisibility('password'));
document.getElementById('password').addEventListener('input', updatePasswordVisibilityForPassword);
}


/**
 * Toggles the visibility of the password input field.
 * @param {string} field - The name of the password input field.
 */
function togglePasswordVisibility(field) {
  const passwordInput = document.getElementById(field === 'password' ? 'password' : 'passwordConfirm');
  const eyeIcon = document.getElementById(`eyeIcon${field === 'password' ? 'Password' : 'Confirm'}`);
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    eyeIcon.src = '../assets/icons/eyeNO.png';
  } else {
    passwordInput.type = 'password';
    eyeIcon.src = '../assets/icons/eyeYES.png';
  }
}


/**
 * Updates the visibility of the password input field for the password field.
 */
function updatePasswordVisibilityForPassword() {
  updatePasswordVisibility('password');
}


/**
 * Updates the visibility of the password input field for the confirm password field.
 */
function updatePasswordVisibilityForConfirmPassword() {
  updatePasswordVisibility('passwordConfirm');
}


/**
 * Adds event listeners for updating password visibility for both password and confirm password fields.
 */
function updateVisibilities() {
  document.getElementById('password').addEventListener('input', updatePasswordVisibilityForPassword);
  document.getElementById('passwordConfirm').addEventListener('input', updatePasswordVisibilityForConfirmPassword);
}
document.getElementById('eyeIconPassword').addEventListener('click', () => togglePasswordVisibility('password'));
try {
  document.getElementById('eyeIconConfirmPassword').addEventListener('click', () => togglePasswordVisibility('passwordConfirm'));
} catch (error) {}