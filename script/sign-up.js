async function init() {
  loadUsers();
}

async function loadUsers() {
  try {
    users = JSON.parse(await getItem("users"));
  } catch (e) {
    console.error("Loading error:", e);
  }
}

async function register() {
  pushUsers();
  await setItem("users", JSON.stringify(users));
  resetForm();
  SignedUpSuccessfully();
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
