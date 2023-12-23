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


async function login() {
  await loadUsers();
  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');
  const invalidUserData = document.getElementById('ifInvalid');
  const email = emailInput.value;
  const password = passwordInput.value;
  const checkbox = document.getElementById('remember-me-checkbox');

  const user = users.find(u => u.email === email && u.password === password);
  invalidUserData.innerHTML = '';
  emailInput.style.borderColor = '';
  passwordInput.style.borderColor = '';
  
  if (user) {
    if (checkbox.checked) {
      localStorage.setItem('rememberedEmail', email);
      localStorage.setItem('rememberedPassword', password);
    } else {

      localStorage.removeItem('rememberedEmail');
      localStorage.removeItem('rememberedPassword');
    }

    location.replace("../html/summary.html");
  } else {
    showInvalidUserData(invalidUserData, emailInput, passwordInput);
  }
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

  const rememberedEmail = localStorage.getItem('rememberedEmail');
  const rememberedPassword = localStorage.getItem('rememberedPassword');
  rememberCheckbox.checked = true;

  emailInput.addEventListener('change', () => {
    const selectedEmail = emailInput.value;
    const user = users.find(u => u.email === selectedEmail);
    if (user) {
      passwordInput.value = user.password;
    } else {
      passwordInput.value = '';
    }
  });
}