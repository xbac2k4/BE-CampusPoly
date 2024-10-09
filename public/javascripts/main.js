const buttonLogout = document.getElementById('buttonLogout');

buttonLogout.addEventListener('click', async () => {
    // Đẩy trạng thái mới vào lịch sử trình duyệt, không lưu lại trang trước đó   
    history.pushState(null, null, window.location.href = '/login');
    window.addEventListener('load', () => {
        // Lắng nghe sự kiện "popstate" xảy ra khi người dùng nhấn nút "Back"
        window.onpopstate = function () {
            // Đẩy lại trạng thái để giữ người dùng trên trang hiện tại
            history.go(1);
        };
    });
});