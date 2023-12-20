const STORAGE_TOKEN = 'UK3WMTJPY9HCOS9AB0PGAT5U9XL1Y2BKP4MIYIVD';
const STORAGE_URL = 'https://remote-storage.developerakademie.org/item';

let users = [];

async function init() {
  displayHidden();
  logoAnimation();
}

async function setItem(key, value) {
  const payload = { key, value, token: STORAGE_TOKEN };
  return fetch(STORAGE_URL, { method: 'POST', body: JSON.stringify(payload) })
      .then(res => res.json());
}

async function getItem(key) {
  const url = `${STORAGE_URL}?key=${key}&token=${STORAGE_TOKEN}`;
  return fetch(url).then(res => res.json()).then(res => {
      // Verbesserter code
      if (res.data) { 
          return res.data.value;
      } throw `Could not find data with key "${key}".`;
  });
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

async function register() {
  let email1 = document.getElementById("email");
  let password = document.getElementById("password");
  registerBtn2.disabled = true;
  pushUsers();
  await setItem("users", JSON.stringify(users));
  resetForm();
/*   location.replace("../html/summary.html"); */
}

function pushUsers() {
  users.push({
    email: email.value,
    password: password.value,
  });
}

function resetForm() {
  email.value = "";
  password.value = "";
  registerBtn2.disabled = false;
}

