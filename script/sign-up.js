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