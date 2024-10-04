// ẩn hiện password
const togglePassword = document.querySelector('#togglePassword');
const passwordInput = document.querySelector('#passwordInput');
const toggleIcon = document.querySelector('#toggleIcon');

togglePassword.addEventListener('click', function (e) {
    // Toggle the type attribute
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);

    // Toggle the eye icon
    if (type === 'text') {
        toggleIcon.classList.remove('bi-eye-slash');
        toggleIcon.classList.add('bi-eye');
    } else {
        toggleIcon.classList.remove('bi-eye');
        toggleIcon.classList.add('bi-eye-slash');
    }
});
// Đăng nhập
const loginForm = document.getElementById('loginForm');
const email = document.getElementById('emailInput');
const password = document.getElementById('passwordInput');
const DOMAIN = `http://localhost:3000/api/v1/`;
//
const buttonText = document.getElementById("buttonText");
const spinner = document.getElementById("spinner");
const errorMessage = document.getElementById("errorMessage");
const buttonLogin = document.getElementById('buttonLogin');
//
const loginProcessing = async () => {
    try {
        const user = {
            email: email.value,
            password: password.value
        }
        // console.log(`User ${JSON.stringify(user)}`);
        const response = await fetch(`${DOMAIN}users/login`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(user)
        })
        const result = await response.json();
        // console.log(result);

        errorMessage.style.display = "none";

        setTimeout(function() {
            buttonText.style.display = "inline"; 
            if (result.status === 200) {
                // console.log(result.data);
                
                spinner.style.display = "none";
                if (result.data.role !== 0) {
                    errorMessage.innerText = `*You are not an administrator`;
                    errorMessage.style.display = "inline-block";
                    buttonLogin.disabled = false; 
                    return;
                }
                window.location.href = '/post';
                form.reset();
            } else {
                errorMessage.innerText = `*${result.message}`;
                spinner.style.display = "none";
                errorMessage.style.display = "inline-block";
                buttonLogin.disabled = false; 
            }
        }, 1000); 
    } catch (error) {
        console.error('Error:', error);
    }
};

loginForm.addEventListener('submit', async event => {
    event.preventDefault();
    buttonText.style.display = "none";
    spinner.style.display = "inline-block";
    buttonLogin.disabled = true;
    loginProcessing();
});
