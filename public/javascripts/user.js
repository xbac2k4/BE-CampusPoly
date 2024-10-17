const DOMAIN = `http://localhost:3000/api/v1/`;

// Fetch API
const tbody = document.querySelector('tbody');
const loadMore = document.getElementById('load-more');
const loading = document.getElementById('spinner');
let currentPage = 1;
let totalPages;
const itemsPerPage = 10; // Số lượng mục mỗi trang
let userIdToDelete; // Biến để lưu ID của người dùng cần xóa
let userID;

const fetchDataForPage = async (page) => {
    try {
        const response = await fetch(`${DOMAIN}users/get-user-by-page?page=${page}&limit=${itemsPerPage}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();

        // Cập nhật dữ liệu
        totalPages = data.data.totalPages; // Giả sử totalPages là thuộc tính của response
        const users = data.data.users; // Lấy danh sách người dùng
        renderTable(users); // Gọi hàm renderTable để hiển thị dữ liệu
        renderPagination(); // Gọi hàm renderPagination để cập nhật phân trang

        // Cập nhật hiển thị số mục
        const userAll = await fetch(`${DOMAIN}users/get-all-user`); 
        const dataAll = await userAll.json();
        const totalItems = dataAll.data.length         
        const startItem = (currentPage - 1) * itemsPerPage + 1; // Mục bắt đầu
        const endItem = Math.min(startItem + users.length - 1, totalItems); // Mục kết thúc

        const hintText = document.querySelector('.hint-text');
        hintText.innerHTML = `Hiển thị <b>${startItem}</b> đến <b>${endItem}</b> trên tổng số <b>${totalItems}</b> người dùng`;

    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
};

// Hàm để hiển thị dữ liệu trong bảng
const renderTable = (users) => {
    const html = users.map((user, index) => {
        const stt = (currentPage - 1) * itemsPerPage + index + 1; // Tính số thứ tự
        const rolesHtml = user.role.map(role => {
            return `<div class="badge border-0 bg-secondary p-2 text-light mr-1"><span>${role.role_name}</span></div>`;
        }).join(''); // Nối các vai trò lại thành một chuỗi

        return /*html*/ `
            <tr data-user='${JSON.stringify(user)}'>
                <td>${stt}</td>
                <td>${user.email}</td>
                <td>${rolesHtml}</td>
                <td>${user.full_name}</td>
                <td>${user.sex === 'male' ? 'Nam' : 'Nữ'}</td>
                <td>${formatDateTime(user.createdAt)}</td>
                <td>
                    <div class="badge border-0 text-light ${user.user_status_id.user_status_name === 'Đang hoạt động' ? 'badge-success' : user.user_status_id.user_status_name === 'Không hoạt động' ? 'bg-danger' : 'bg-warning'} p-2">
                        <span>${user.user_status_id.user_status_name}</span>
                    </div>
                </td>
                <td>${user.bio}</td>
                <td>${formatDateTime(user.last_login)}</td>
                <td>
                    <a href="#" class="block ${user.user_status_id.user_status_name === 'Bị chặn' ? 'text-danger' : ''}" title="Block User" data-toggle="tooltip">
                        <i class="material-icons">&#xE14B;</i></a>
                    <a href="#" id="edit-user" class="edit" title="Edit" data-toggle="tooltip" onclick="showModalEditUser(this.closest('tr').dataset.user)"><i class="material-icons">&#xE254;</i></a>
                    <a href="#" class="delete" title="Delete" data-toggle="tooltip" onclick="confirmDeleteBtn('${user._id}')"><i class="material-icons">&#xE872;</i></a>
                </td>
            </tr>
        `;
    }).join('');
    tbody.innerHTML = html;
}

// Khi trang tải lần đầu, gọi API để hiển thị 10 người dùng đầu tiên
window.addEventListener('DOMContentLoaded', (event) => {
    fetchDataForPage(currentPage);
});

// Số lượng trang tối đa hiển thị
const maxPagesToShow = 5;

const renderPagination = async () => {
    const pagesContainer = document.getElementById("pages");
    pagesContainer.innerHTML = ""; // Xóa nội dung cũ

    // Tạo một <ul> cho phân trang
    const paginationList = document.createElement("ul");
    paginationList.classList.add("pagination");

    // Tính toán số trang bắt đầu và kết thúc
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = startPage + maxPagesToShow - 1;

    // Điều chỉnh nếu endPage lớn hơn totalPages
    if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    // Nếu startPage nhỏ hơn 1, điều chỉnh lại
    if (startPage < 1) {
        startPage = 1;
    }

    // Hiển thị các trang
    for (let i = startPage; i <= endPage; i++) {
        const pageItem = document.createElement("li");
        pageItem.classList.add("page-item");

        const pageLink = document.createElement("a");
        pageLink.classList.add("page-link");
        pageLink.href = "#";
        pageLink.textContent = i;

        // Đánh dấu trang hiện tại
        if (i === currentPage) {
            pageItem.classList.add("active");
        }

        pageLink.onclick = function () {
            currentPage = i;
            fetchDataForPage(currentPage); // Gọi API để tải dữ liệu cho trang mới
        };

        pageItem.appendChild(pageLink);
        paginationList.appendChild(pageItem);
    }

    pagesContainer.appendChild(paginationList); // Thêm <ul> vào pagesContainer

    // Cập nhật trạng thái nút "Prev" và "Next"
    document.getElementById("prev").classList.toggle("disabled", currentPage === 1);
    document.getElementById("next").classList.toggle("disabled", currentPage === totalPages);
}

// Nút "Prev"
document.getElementById("prev").onclick = function () {
    if (currentPage > 1) {
        currentPage--;
        fetchDataForPage(currentPage);
    }
};

// Nút "Next"
document.getElementById("next").onclick = function () {
    if (currentPage < totalPages) {
        currentPage++;
        fetchDataForPage(currentPage);
    }
};

// Hiển thị modal xác nhận xóa
function confirmDeleteBtn(userId) {
    userIdToDelete = userId; // Lưu ID người dùng cần xóa
    $('#confirmDeleteModal').modal('show'); // Hiển thị modal
}

// Xử lý sự kiện xóa
document.getElementById('confirmDeleteBtn').addEventListener('click', async function () {
    await deleteUser(userIdToDelete); // Gọi hàm xóa người dùng
    // Đóng modal sau khi xóa
    $('#confirmDeleteModal').modal('hide'); // Ẩn modal
});
// Gán sự kiện cho nút "Close"
// Lấy tất cả các phần tử có class 'close'
const closeButtons = document.querySelectorAll('.close');
// Lặp qua từng nút và thêm sự kiện click
closeButtons.forEach(button => {
    button.addEventListener('click', function () {
        // Đóng modal
        $('#confirmDeleteModal').modal('hide'); // Ẩn modal xác nhận
        $('#editUserModal').modal('hide'); // Ẩn modal chỉnh sửa
    });
});

// Gán sự kiện cho nút "Hủy"
document.querySelector('.btn-secondary').addEventListener('click', function () {
    // Đóng modal
    $('#confirmDeleteModal').modal('hide'); // Ẩn modal
});

// Hàm xóa người dùng
async function deleteUser(userId) {
    try {
        const response = await fetch(`${DOMAIN}users/delete-user/${userId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        // Gọi lại API để tải lại dữ liệu sau khi xóa
        fetchDataForPage(currentPage);
    } catch (error) {
        console.error('There was a problem with the delete operation:', error);
    }
}

function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Tháng 0-11
    const year = date.getFullYear();

    return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
}

document.getElementById('closeModalFooter').addEventListener('click', () => {
    $('#editUserModal').modal('hide');
});
document.getElementById('saveChanges').addEventListener('click', () => {
    saveChanges();
});

let initialUserData = {}; // Biến để lưu trữ thông tin người dùng ban đầu

function showModalEditUser(userData) {
    const user = JSON.parse(userData); // Phân tích cú pháp JSON
    userID = user._id;
    // console.log(user);
    
    initialUserData = { ...user }; // Lưu trữ dữ liệu ban đầu
    const emailInput = document.getElementById('user-email');
    const fullnameInput = document.getElementById('user-fullname');
    const sexSelect = document.getElementById('user-sex');
    const statusSelect = document.getElementById('user-status');
    const bioInput = document.getElementById('user-bio');

    // Điền thông tin vào các trường nhập liệu
    if (emailInput && fullnameInput && sexSelect && statusSelect && bioInput) {
        emailInput.value = user.email;
        fullnameInput.value = user.full_name;
        sexSelect.value = user.sex;
        statusSelect.value = user.user_status_id.user_status_name;
        bioInput.value = user.bio;

        $('#editUserModal').modal('show'); // Hiển thị modal
        updateSaveButtonState(); // Cập nhật trạng thái nút Save Changes
    } else {
        console.error('Một hoặc nhiều phần tử nhập liệu bị thiếu trong modal.');
    }

    // Thêm sự kiện để kiểm tra sự thay đổi
    emailInput.addEventListener('input', updateSaveButtonState);
    fullnameInput.addEventListener('input', updateSaveButtonState);
    sexSelect.addEventListener('change', updateSaveButtonState);
    statusSelect.addEventListener('change', updateSaveButtonState);
    bioInput.addEventListener('input', updateSaveButtonState);
}

// Hàm để kiểm tra sự thay đổi và kích hoạt nút Save Changes
function updateSaveButtonState() {
    const emailInput = document.getElementById('user-email').value;
    const fullnameInput = document.getElementById('user-fullname').value;
    const sexSelect = document.getElementById('user-sex').value;
    const statusSelect = document.getElementById('user-status').value;
    const bioInput = document.getElementById('user-bio').value;

    const isChanged = 
        emailInput !== initialUserData.email ||
        fullnameInput !== initialUserData.full_name ||
        sexSelect !== initialUserData.sex ||
        statusSelect !== initialUserData.user_status_id.user_status_name ||
        bioInput !== initialUserData.bio;

    document.getElementById('saveChanges').disabled = !isChanged; // Kích hoạt hoặc vô hiệu hóa nút
}

// Lưu thay đổi người dùng
const saveChanges = async () => {
    const fullName = document.getElementById('user-fullname').value;
    const sex = document.getElementById('user-sex').value;
    const bio = document.getElementById('user-bio').value;

    // Tạo đối tượng người dùng để gửi đến API
    const user = {
        full_name: fullName,
        sex,
        bio,
    };

    // Gọi hàm cập nhật người dùng
    const result = await updateUser(user);

    // Kiểm tra kết quả và thông báo cho người dùng
    if (result) {
        alert('Người dùng đã được cập nhật thành công!'); // Thông báo thành công
        fetchDataForPage(currentPage);
        $('#editUserModal').modal('hide'); // Ẩn modal sau khi thành công
    }
}


const updateUser = async(user) => {    
    console.log(userID, user);
    
    try {
        const response = await fetch(`${DOMAIN}users/update-user/${userID}`, {
            method: 'PUT', // Hoặc POST tùy vào API của bạn
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(user), // Gửi dữ liệu người dùng dưới dạng JSON
        });

        if (!response.ok) {
            throw new Error('Failed to update user');
        }

        const result = await response.json();
        console.log('User updated successfully:', result);
        return result; // Hoặc xử lý theo cách khác
    } catch (error) {
        console.error('Error updating user:', error);
    }
}




