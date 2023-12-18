let users = [];


async function init(){
    loadUsers();
}

async function loadUsers(){
    try {
        users = JSON.parse(await getItem('users'));
    } catch(e){
        console.error('Loading error:', e);
    }
}


async function register() {
    let name1 = document.getElementById('name1');
    let email1 = document.getElementById('email1');
    let password1 = document.getElementById('password1');
    let passwordConfirm = document.getElementById('passwordConfirm');
    registerBtn.disabled = true;
    users.push({
        name: name1.value,
        email: email1.value,
        password: password1.value,
        passwordConfirm: passwordConfirm.value,
    });
    await setItem('users', JSON.stringify(users));
    resetForm();
}

function resetForm() {
    name1.value = '';
    email1.value = '';
    password1.value = '';
    passwordConfirm.value = '';
    registerBtn.disabled = false;
}