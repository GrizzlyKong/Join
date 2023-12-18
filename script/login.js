const STORAGE_TOKEN = 'NBZULW333XMNBK2G8I6XU4NQSQSP4I72EP4JOU73';
const STORAGE_URL = 'https://remote-storage.developerakademie.org/item';

async function init() {
  displayHidden();
  logoAnimation();
}

<<<<<<< HEAD
async function setItem(key, value) {
    const payload = { key:key, value:value, token: STORAGE_TOKEN }
    return fetch(STORAGE_URL, { method: 'POST', body: JSON.stringify(payload) })
    .then(res => res.json());
}

async function getItem(key) {
    const url = `${STORAGE_URL}?key=${key}&token=${STORAGE_TOKEN}`;
    return fetch(url).then(res => res.json()).then(res => res.data.value);
}

=======
/**
 * 
 * 
 */
>>>>>>> 107770c7743b2fc56bb2982c4f4250830819433f
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
}
