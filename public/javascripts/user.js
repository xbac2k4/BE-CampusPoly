const DOMAIN = `http://localhost:3000/api/v1/`;

// Fetch API
const tbody = document.querySelector('tbody');
const loadMore = document.getElementById('load-more');
const loading = document.getElementById('spinner');
const container_role = document.getElementById('container-role');
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
        console.log(data);

        // Cập nhật dữ liệu
        totalPages = data.data.totalPages; // Giả sử totalPages là thuộc tính của response
        const users = data.data.userData; // Lấy danh sách người dùng
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
        // console.log(user);
        return /*html*/ `
            <tr data-user='${JSON.stringify(user)}'>
                <td>${stt}</td>
                <td>${user.email}</td>
                <td>${rolesHtml}</td>
                <td>${user.full_name}</td>
                <td>${user.sex === 'male' ? 'Nam' : 'Nữ'}</td>
                <td>
                    <button onclick="showFriendList(this.closest('tr').dataset.user)" class="badge border-0 bg-secondary p-2 text-light mr-1"><span>${user.friends.length}</span></button>
                </td>
                <td>${formatDateTime(user.createdAt)}</td>
                <td>
                    <div class="badge border-0 text-light ${user.user_status_id.status_name === 'Đang hoạt động' ? 'badge-success' : user.user_status_id.status_name === 'Không hoạt động' ? 'bg-danger' : 'bg-warning'} p-2">
                        <span>${user.user_status_id.status_name}</span>
                    </div>
                </td>
                <td>${user.bio}</td>
                <td>${formatDateTime(user.last_login)}</td>
                <td>
                    <a href="#" class="block ${user.user_status_id.status_name === 'Bị chặn' ? 'text-danger' : ''}" title="Block User" data-toggle="tooltip" onclick="confirmDeleteBtn(this.closest('tr').dataset.user)">
                        <i class="material-icons">&#xE14B;</i></a>
                    <a href="#" id="edit-user" class="edit" title="Quyền" data-toggle="tooltip" onclick="showModalRoleUser(this.closest('tr').dataset.user)">
                        <i class="material-icons">&#xE7FB;</i></a>
                </td>
            </tr>
        `;
    }).join('');
    tbody.innerHTML = html;
}
// <a href="#" class="delete" title="Delete" data-toggle="tooltip" onclick="confirmDeleteBtn('${user._id}')">
// <i class="material-icons">&#xE872;</i></a>
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
let blockUser;
function confirmDeleteBtn(userData) {
    const user = JSON.parse(userData); // Phân tích cú pháp JSON
    console.log(user);

    userID = user._id;
    if (user.user_status_id.status_name === 'Bị chặn') {
        document.getElementById('confirmDeleteModalLabel').innerText = 'BỎ CHẶN TÀI KHOẢN';
        document.getElementById('confirmDeleteModalBody').innerText = 'Bạn có chắc muốn bỏ chặn tài khoản này không? Hành động này không thể được hoàn tác.';
        document.getElementById('confirmDeleteBtn').innerText = 'Bỏ chặn';
        blockUser = {
            user_status_id: {
                _id: '67089cc2862f7badead53eb9',
            }
        }
    } else {
        document.getElementById('confirmDeleteModalLabel').innerText = 'CHẶN TÀI KHOẢN';
        document.getElementById('confirmDeleteModalBody').innerText = 'Bạn có chắc muốn chặn tài khoản này không? Hành động này không thể được hoàn tác.';
        document.getElementById('confirmDeleteBtn').innerText = 'Chặn';
        blockUser = {
            user_status_id: {
                _id: '67089ccb862f7badead53eba',
            }
        }
    }
    $('#confirmDeleteModal').modal('show'); // Hiển thị modal
}

// Xử lý sự kiện xóa
document.getElementById('confirmDeleteBtn').addEventListener('click', async function () {
    updateUser(blockUser)
});
// Gán sự kiện cho nút "Close"
// Lấy tất cả các phần tử có class 'close'
const closeButtons = document.querySelectorAll('.close');
// Lặp qua từng nút và thêm sự kiện click
closeButtons.forEach(button => {
    button.addEventListener('click', function () {
        // Đóng modal
        $('#confirmDeleteModal').modal('hide'); // Ẩn modal xác nhận
        $('#roleUserModal').modal('hide'); // Ẩn modal chỉnh sửa
        $('#friendListModal').modal('hide'); //
    });
});

// Gán sự kiện cho nút "Hủy"
document.querySelector('.btn-secondary').addEventListener('click', function () {
    // Đóng modal
    $('#confirmDeleteModal').modal('hide'); // Ẩn modal
    $('#friendListModal').modal('hide'); //
});

// Hàm xóa người dùng
// async function deleteUser(userId) {
//     try {
//         const response = await fetch(`${DOMAIN}users/delete-user/${userId}`, {
//             method: 'DELETE',
//             headers: {
//                 'Content-Type': 'application/json'
//             }
//         });
//         if (!response.ok) {
//             throw new Error('Network response was not ok');
//         }
//         // Gọi lại API để tải lại dữ liệu sau khi xóa
//         fetchDataForPage(currentPage);
//     } catch (error) {
//         console.error('There was a problem with the delete operation:', error);
//     }
// }

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
    $('#roleUserModal').modal('hide');
});

let initialUserData = []; // Biến để lưu trữ thông tin người dùng ban đầu

function showModalRoleUser(userData) {
    const user = JSON.parse(userData); // Phân tích cú pháp JSON
    userID = user._id;
    container_role.innerHTML = '';
    const userRoles = user.role;
    initialUserData = [...userRoles]; // Lưu thông tin người dùng ban đầu

    // Hiển thị các vai trò hiện có
    initialUserData.map(items => {
        addRoleToContainer(items._id, items.role_name);
    });

    $('#roleUserModal').modal('show'); // Hiển thị modal
}

function addRoleToContainer(roleId, roleName) {
    let html = `
        <div class="wapper-role border rounded px-2 m-1">
            <span id="role-name">${roleName}</span>
            <button type="button" class="close ml-2" aria-label="Close" onclick="removeRole(this, '${roleId}')">
                <span aria-hidden="true" class="text-center">&times;</span>
            </button>
        </div>
    `;
    container_role.insertAdjacentHTML('beforeend', html);
}

// Hàm để xử lý khi nhấn "Thêm" vai trò
function addRole() {
    const selectRole = document.getElementById("select-role");
    const selectedRoleId = selectRole.value;
    const selectedRoleName = selectRole.options[selectRole.selectedIndex].text;

    // Kiểm tra vai trò chưa có trong danh sách
    if (selectedRoleId && !initialUserData.some(role => role._id === selectedRoleId)) {
        addRoleToContainer(selectedRoleId, selectedRoleName);
        initialUserData.push({ _id: selectedRoleId, role_name: selectedRoleName });
        updateUser({ role: initialUserData }); // Cập nhật cơ sở dữ liệu
    }
}

// Xóa vai trò khỏi container và cập nhật CSDL
function removeRole(button, roleId) {
    button.parentElement.remove();
    initialUserData = initialUserData.filter(role => role._id !== roleId);
    updateUser({ role: initialUserData });
}

const updateUser = async (user) => {
    // console.log(JSON.stringify(user));

    try {
        await fetch(`${DOMAIN}users/update-user/${userID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(user), // Gửi dữ liệu người dùng dưới dạng JSON
        }).then(res => res.json()).then(data => {
            console.log('User updated successfully:', data);
        }).finally(() => {
            // Hiển thị lại dữ liệu sau khi cập nhật
            fetchDataForPage(currentPage);
            $('#confirmDeleteModal').modal('hide'); // Ẩn modal
        });

    } catch (error) {
        console.error('Error updating user:', error);
    }
}

async function loadRoles() {
    const selectRole = document.getElementById("select-role");

    try {
        const response = await fetch(`${DOMAIN}roles/get-all-role`); // Thay URL_CUA_API_VAI_TRO bằng URL của API
        if (!response.ok) throw new Error("Không thể lấy dữ liệu vai trò");

        const roles = await response.json();

        // Xóa các option cũ để tránh trùng lặp khi load lại
        selectRole.innerHTML = '<option value="" selected>Chọn vai trò</option>';
        // console.log(roles);
        // Thêm option cho từng vai trò từ API
        roles.data.forEach(role => {
            const option = document.createElement("option");
            option.value = role._id; // Hoặc field khác như `role_name` tùy vào cấu trúc dữ liệu của bạn
            option.textContent = role.role_name; // Giả sử API trả về tên vai trò trong field role_name
            selectRole.appendChild(option);
        });
    } catch (error) {
        console.error("Lỗi:", error);
    }
}

// Gọi hàm loadRoles() khi modal hiển thị
document.getElementById('roleUserModal').addEventListener('show.bs.modal', loadRoles);

const showFriendList = (userData) => {
    const user = JSON.parse(userData); // Phân tích cú pháp JSON
    const friendList = user.friends;

    // Tạo modal
    const modal = document.createElement('div');
    
    modal.classList.add('modal', 'fade');
    modal.setAttribute('id', 'friendListModal');
    modal.setAttribute('tabindex', '-1');
    modal.setAttribute('role', 'dialog');
    modal.style.height = '100vh'; // Cố định chiều cao của modal
    modal.style.overflow = 'hidden'
    friendList.map(friend =>                            
        console.log(friend.user_friend_id.avatar)
    )

    modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered" role="document" style="height: 100%;">
            <div class="modal-content" style="height: 80%;">
                <div class="modal-header">
                    <h5 class="modal-title" id="friendListModalLabel">Danh sách bạn bè</h5>
                </div>
                <div class="modal-body" style="overflow-y: auto; height: calc(100% - 56px);"> <!-- Chiều cao body chiếm phần còn lại -->
                    <ul id="friendList" class="list-group">
                        ${friendList.length > 0 ? friendList.map(friend =>                            
                            `<li class="list-group-item d-flex align-items-center">
                                <img src="${friend.user_friend_id.avatar}" alt="${friend.user_friend_id.full_name}" class="rounded-circle" width="40" height="40" style="margin-right: 10px;">
                                ${friend.user_friend_id.full_name}
                            </li>`
                        ).join('') : '<li class="list-group-item">Không có bạn bè nào.</li>'}
                    </ul>
                </div>
            </div>
        </div>
    `;

    // Thêm modal vào body
    document.body.appendChild(modal);

    // // Hiển thị modal
    $(modal).modal('show');
};

