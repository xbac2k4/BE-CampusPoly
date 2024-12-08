const IP = 'localhost';
const API_URL = `http://${IP}:3000/api/v1/`; // Biến toàn cục
const APP_NAME = 'My Express App';

// Xuất các biến để sử dụng trong các file khác
window.APP_CONFIG = {
    API_URL,
    APP_NAME,
};