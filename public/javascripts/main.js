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

document.addEventListener('DOMContentLoaded', () => {
    // Lấy tất cả các phần tử nav-item
    const navItems = document.querySelectorAll('aside .nav-item');

    // Lấy đường dẫn hiện tại
    const currentPath = window.location.pathname;   
    console.log(currentPath);
    

    // Duyệt qua từng nav-item
    navItems.forEach(item => {
        const path = item.getAttribute('data-path'); // Lấy đường dẫn từ data-path
        console.log(path);
        

        // Nếu đường dẫn hiện tại trùng với đường dẫn của nav-item, thêm class 'active'
        if (currentPath === path) {
            item.classList.add('active');
        }
    });
});
