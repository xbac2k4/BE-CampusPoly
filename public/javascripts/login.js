// Ẩn hiện password
const togglePassword = document.querySelector('#togglePassword');
const passwordInput = document.querySelector('#password');
const toggleIcon = document.querySelector('#toggleIcon');

togglePassword.addEventListener('click', function (e) {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);

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
const email = document.getElementById('email');
const password = document.getElementById('password');
const DOMAIN = window.APP_CONFIG.API_URL;

const buttonText = document.getElementById("buttonText");
const spinner = document.getElementById("spinner");
const errorMessage = document.getElementById("errorMessage");
const buttonLogin = document.getElementById('buttonLogin');
const socket = io();

// Kết nối đến Socket.IO
const loginProcessing = async () => {
    try {
        const user = {
            email: email.value,
            password: password.value
        };
        
        const response = await fetch(`${DOMAIN}users/login`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(user)
        });
        const result = await response.json();

        errorMessage.style.display = "none";
    
        if (result.status === 200) {
            // Redirect to dashboard or main page
            // console.log(result.data);
            // console.log("123");
            // Gọi hàm xử lý sự kiện khi trang được tải
            handleLoginSuccess(result.data);
            window.location.href = '/';
        } else {
            // Hiển thị thông báo lỗi
            errorMessage.innerText = `*${result.message}`;
            errorMessage.style.display = "inline-block";
            spinner.style.display = "none";
            buttonText.style.display = "inline-block";
            buttonLogin.disabled = false;
        }
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

function handleLoginSuccess(data) {
    // Gửi yêu cầu để nhận thông tin của khách hàng từ máy chủ, lưu lại danh sách customer đang online
    socket.emit('admin_login', data);
}