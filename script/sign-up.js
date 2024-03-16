async function init() {
  loadUsers();
  privacyPolicyHoverCheckbox();
}


async function loadUsers() {
  try {
    users = JSON.parse(await getItem("users"));
  } catch (e) {
    console.error("Loading error:", e);
  }
}


async function register() {
  const privacyCheckbox = document.getElementById("privacyCheckbox");
  const privacyPolicy = document.querySelector(".sign-up-privacy-policy");
  const privacyPolicySpan = document.querySelector(".sign-up-privacy-policy-span");

  privacyCheckbox.addEventListener("change", function() {
    if (this.checked) {
      privacyPolicy.classList.remove("error");
      privacyPolicySpan.classList.remove("error2");
    }
  });

  if (!privacyCheckbox.checked) {
    privacyPolicy.classList.add("error");
    privacyPolicySpan.classList.add("error2");
    return;
  } else {
    privacyPolicy.classList.remove("error");
    privacyPolicySpan.classList.remove("error2");
    pushUsers();
    await setItem("users", JSON.stringify(users));
    resetForm();
    SignedUpSuccessfully();
  }
}


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


function pushUsers() {
  users.push({
    name: username.value,
    email: email.value,
    password: password.value,
    passwordConfirm: passwordConfirm.value,
  });
}


function resetForm() {
  username.value = "";
  email.value = "";
  password.value = "";
  passwordConfirm.value = "";
}


document.getElementById("privacyCheckbox").addEventListener("change", function() {
  if (this.checked) {
    document.querySelector(".sign-up-privacy-policy").classList.remove("error");
  }
});


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


function updatePasswordVisibility(field) {
  const passwordInput = document.getElementById(field === 'password' ? 'password' : 'passwordConfirm');
  const lockIcon = document.getElementById(`lockIcon${field === 'password' ? 'Password' : 'Confirm'}`);
  const eyeIcon = document.getElementById(`eyeIcon${field === 'password' ? 'Password' : 'Confirm'}`);
  const eyeIconHidden = document.getElementById(`eyeIconHidden${field === 'password' ? 'Password' : 'Confirm'}`);

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

// Add event listeners to the eye icons to toggle password visibility
document.getElementById('eyeIconPassword').addEventListener('click', () => togglePasswordVisibility('password'));

// Call the function on page load
document.addEventListener('DOMContentLoaded', () => {
  updatePasswordVisibilityForPassword();

  // Add an event listener to the password input to update the icons dynamically
  document.getElementById('password').addEventListener('input', updatePasswordVisibilityForPassword);
});

function togglePasswordVisibility(field) {
  const passwordInput = document.getElementById(field === 'password' ? 'password' : 'passwordConfirm');
  const eyeIcon = document.getElementById(`eyeIcon${field === 'password' ? 'Password' : 'Confirm'}`);

  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    eyeIcon.src = '../assets/icons/eyeNO.png'; // Change to eyeNO.png when password is visible
  } else {
    passwordInput.type = 'password';
    eyeIcon.src = '../assets/icons/eyeYES.png'; // Change to eyeYES.png when password is hidden
  }
}

function updatePasswordVisibilityForPassword() {
  updatePasswordVisibility('password');
}

function updatePasswordVisibilityForConfirmPassword() {
  updatePasswordVisibility('passwordConfirm');
}

// Call the functions on page load
document.addEventListener('DOMContentLoaded', () => {
  updatePasswordVisibilityForPassword();
  updatePasswordVisibilityForConfirmPassword();

  // Add event listeners to the password inputs to update the icons dynamically
  document.getElementById('password').addEventListener('input', updatePasswordVisibilityForPassword);
  document.getElementById('passwordConfirm').addEventListener('input', updatePasswordVisibilityForConfirmPassword);
});

// Add event listeners to the eye icons to toggle password visibility
document.getElementById('eyeIconPassword').addEventListener('click', () => togglePasswordVisibility('password'));
try {
  document.getElementById('eyeIconConfirmPassword').addEventListener('click', () => togglePasswordVisibility('passwordConfirm'));
} catch (error) {}
