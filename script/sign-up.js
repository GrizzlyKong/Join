const STORAGE_TOKEN = 'NBZULW333XMNBK2G8I6XU4NQSQSP4I72EP4JOU73';
const STORAGE_URL = 'https://remote-storage.developerakademie.org/item';
let users = [];

async function init() {

}

async function register() {
    let registerBtn = document.getElementById('registerBtn');
    registerBtn.disabled = true;
    users.push({
        email: email.value,
        password: password.value
    })


    
    resetForm();
}
function resetForm() {
    email.value = '';
    password.value = '';
    registerBtn.disabled = false;
}

async function setItem(key, value) {
    const payload = { key:key, value:value, token: STORAGE_TOKEN }
    return fetch(STORAGE_URL, { method: 'POST', body: JSON.stringify(payload) })
    .then(res => res.json());
}

async function getItem(key) {
    const url = `${STORAGE_URL}?key=${key}&token=${STORAGE_TOKEN}`;
    return fetch(url).then(res => res.json()).then(res => res.data.value);
}