async function init() {
  await loadUsers();
  displayHidden();
  logoAnimation();
  loginForm(users);
}


function logoAnimation() {
  const logo = document.getElementById("logo-animated");
  setTimeout(() => {
    logo.style.transform = "translate(-42.25vw, -28.25vh) scale(0.35)";
  }, 500);
}


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


async function loadUsers() {
  try {
    users = JSON.parse(await getItem('users'));
  } catch (e) {
    console.error('Loading error:', e);
  }
}


function validateCredentials(email, password) {
  const user = findUser(email, password);
  if (user) {
    return user;
  } else {
    return null;
  }
}


function processSuccessfulLogin(user, checkbox) {
  const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  handleRememberMe(checkbox, user.email, user.password);
  setLoggedInUser(user.name);
  localStorage.setItem('isMobileDevice', isMobileDevice);
  redirectToSummaryPage();
}


function showLoginError(invalidUserData, emailInput, passwordInput) {
  showInvalidUserData(invalidUserData, emailInput, passwordInput);
}


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
    showLoginError(invalidUserData, emailInput, passwordInput);
  }
}


function clearValidationStyles(emailInput, passwordInput, invalidUserData) {
  invalidUserData.innerHTML = '';
  emailInput.style.borderColor = '';
  passwordInput.style.borderColor = '';
}


function findUser(email, password) {
  return users.find(u => u.email === email && u.password === password);
}


function handleRememberMe(checkbox, email, password) {
  if (checkbox.checked) {
    localStorage.setItem('rememberedEmail', email);
    localStorage.setItem('rememberedPassword', password);
  } else {
    localStorage.removeItem('rememberedEmail');
    localStorage.removeItem('rememberedPassword');
  }
}


function setLoggedInUser(userName) {
  localStorage.setItem('loggedInUserName', userName);
}


function redirectToSummaryPage() {
  location.replace("../html/summary.html");
}


function showInvalidUserData(invalidUserData, emailInput, passwordInput) {
  invalidUserData.innerHTML += /* HTML */ `
    <div class="invalid-data">Invalid email or password</div>
  `;
  emailInput.style.borderColor = "red";
  passwordInput.style.borderColor = "red";
}


function loginForm(users) {
  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');
  const rememberCheckbox = document.getElementById('remember-me-checkbox');

  setRememberCheckboxDefault(rememberCheckbox);
  setEmailChangeListener(emailInput, passwordInput, users);
}


function setRememberCheckboxDefault(checkbox) {
  checkbox.checked = true;
}


function setEmailChangeListener(emailInput, passwordInput, users) {
  emailInput.addEventListener('change', () => {
    updatePasswordBasedOnEmail(emailInput, passwordInput, users);
  });
}


function updatePasswordBasedOnEmail(emailInput, passwordInput, users) {
  const selectedEmail = emailInput.value;
  const user = findUserByEmail(users, selectedEmail);

  if (user) {
    passwordInput.value = user.password;
  } else {
    passwordInput.value = '';
  }
}


function findUserByEmail(users, email) {
  return users.find(u => u.email === email);
}


function guestLogin() {
  localStorage.removeItem('loggedInUserName');
  localStorage.removeItem('rememberedEmail');
  localStorage.removeItem('rememberedPassword');

  location.replace("../html/summary.html");
}


// Function to update password visibility
function updatePasswordVisibility() {
  const passwordInput = document.getElementById('loginPassword');
  const lockIcon = document.getElementById('lockIcon');
  const eyeIcon = document.getElementById('eyeIcon');
  const eyeIconHidden = document.getElementById('eyeIconHidden');

  // Check if elements exist
  if (!passwordInput || !lockIcon || !eyeIcon || !eyeIconHidden) {
    return; // Exit the function if any element is missing
  }

  const passwordValue = passwordInput.value.trim();

  if (passwordInput.type === 'password') {
    // Password is hidden
    lockIcon.style.display = passwordValue === '' ? 'inline-block' : 'none';
    eyeIcon.style.display = passwordValue === '' ? 'none' : 'inline-block';
    eyeIconHidden.style.display = 'none';
  } else {
    // Password is visible
    lockIcon.style.display = passwordValue === '' ? 'inline-block' : 'none';
    eyeIcon.style.display = 'none';
    eyeIconHidden.style.display = passwordValue === '' ? 'none' : 'inline-block';
  }
}


// Call the function on page load
document.addEventListener('DOMContentLoaded', () => {
  updatePasswordVisibility();
});

// Function to toggle password visibility
function togglePasswordVisibility() {
  const passwordInput = document.getElementById('loginPassword');

  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
  } else {
    passwordInput.type = 'password';
  }

  updatePasswordVisibility();
}

