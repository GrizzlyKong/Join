let users = [];

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
  let name1 = document.getElementById("name1");
  let email1 = document.getElementById("email1");
  let password1 = document.getElementById("password1");
  let passwordConfirm = document.getElementById("passwordConfirm");
  registerBtn.disabled = true;
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
    name: name1.value,
    email: email1.value,
    password: password1.value,
    passwordConfirm: passwordConfirm.value,
  });
}

function resetForm() {
  name1.value = "";
  email1.value = "";
  password1.value = "";
  passwordConfirm.value = "";
  registerBtn.disabled = false;
}
