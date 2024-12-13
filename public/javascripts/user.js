const DOMAIN = window.APP_CONFIG.API_URL;

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
let listUserOnline = [];
let users = [];
let filterUsers = [];
let selectedRole = ''; // Vai trò được chọn
let selectedStatus = ''; // Trạng thái được chọn

const fetchDataForPage = async (page, roleFilter = selectedRole, statusFilter = selectedStatus) => {
    try {
        const response = await fetch(`${DOMAIN}users/get-user-by-page?page=${page}&limit=${itemsPerPage}&roleId=${roleFilter}&status=${statusFilter}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();

        // Cập nhật dữ liệu phân trang
        totalPages = data.data.totalPages;
        let users = data.data.users;
        // console.log(roleFilter);
        // console.log(statusFilter);


        // Áp dụng bộ lọc nếu có
        // if (roleFilter) {
        //     users = users.filter(user =>
        //         user.role.some(role => role.role_name.toLowerCase() === roleFilter.toLowerCase())
        //     );
        // }

        // if (statusFilter) {
        //     users = users.filter(user => user.user_status_id?.status_name === statusFilter);
        // }

        renderTable(users); // Hiển thị danh sách người dùng
        renderPagination(); // Cập nhật giao diện phân trang

        // Cập nhật hiển thị số mục
        const userAll = await fetch(`${DOMAIN}users/get-all-user`);
        const dataAll = await userAll.json();
        const totalItems = dataAll.data.length;

        const startItem = (currentPage - 1) * itemsPerPage + 1; // Mục bắt đầu
        const endItem = Math.min(startItem + users.length - 1, totalItems); // Mục kết thúc

        const hintText = document.querySelector('.hint-text');
        hintText.innerHTML = `Hiển thị <b>${startItem}</b> đến <b>${endItem}</b> trên tổng số <b>${totalItems}</b> người dùng`;

    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
};


const handleUserOnline = async () => {
    return new Promise((resolve, reject) => {
        if (window.socket) {
            // Đảm bảo chỉ lắng nghe một lần
            if (!window.socket._hasListener) {
                window.socket.on('update_user_list', (users) => {
                    listUserOnline = users;
                    // console.log('Updated user list:', listUserOnline);
                    resolve();  // Khi cập nhật xong, gọi resolve để tiếp tục
                    fetchDataForPage(currentPage);
                });
                window.socket._hasListener = true; // Đánh dấu đã lắng nghe
            }
        } else {
            console.error("Socket is not initialized.");
            reject("Socket is not initialized.");
        }
    });
};

// Hàm để hiển thị dữ liệu trong bảng
const renderTable = (users) => {
    const html = users.map((user, index) => {
        const stt = (currentPage - 1) * itemsPerPage + index + 1; // Tính số thứ tự
        const rolesHtml = user.role.map(role => {
            return `<div class="badge border-0 bg-secondary p-2 text-light mr-1"><span>${role.role_name}</span></div>`;
        }).join(''); // Nối các vai trò lại thành một chuỗi
        // console.log(user);
        // console.log(listUserOnline);
        const isUserOnline = listUserOnline.some(userOnline => userOnline._id === user._id);
        let statusClass = '';
        let statusText = '';

        if (user.user_status_id.status_name === 'Bị chặn') {
            statusClass = 'bg-warning'; // Chặn => màu đỏ
            statusText = 'Bị chặn';
        } else if (isUserOnline) {
            statusClass = 'badge-success'; // Nếu có trong listUserOnline => hoạt động
            statusText = 'Đang hoạt động';
        } else {
            statusClass = 'bg-danger'; // Nếu không có trong listUserOnline => không hoạt động
            statusText = 'Không hoạt động';
        }
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
                    <div class="badge border-0 text-light ${statusClass} p-2">
                        <span>${statusText}</span>
                    </div>
                </td>
                <td>${user.bio}</td>
                <td>${user.block_reason}</td>
                <td>${user.block_count}</td>
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
window.addEventListener('DOMContentLoaded', async (event) => {
    window.socket.emit('get_users_online');
    await handleUserOnline();
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
        fetchDataForPage(currentPage,);
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
let block_count = 0;
function confirmDeleteBtn(userData) {
    const user = JSON.parse(userData); // Phân tích cú pháp JSON
    console.log(user);

    userID = user._id;
    if (user.user_status_id.status_name === 'Bị chặn') {
        console.log('User is blocked, preparing to unblock');
        document.getElementById('confirmDeleteModalLabel').innerText = 'BỎ CHẶN TÀI KHOẢN';
        document.getElementById('confirmDeleteModalBody').innerText = 'Bạn có chắc muốn bỏ chặn tài khoản này không? Hành động này không thể được hoàn tác.';
        document.getElementById('confirmDeleteBtn').innerText = 'Bỏ chặn';
        blockUser = {
            user_status_id: {
                _id: '67089cc2862f7badead53eb9',
            },
            block_reason: '',
        }
    } else {
        document.getElementById('confirmDeleteModalLabel').innerText = 'CHẶN TÀI KHOẢN';
        document.getElementById('confirmDeleteModalBody').innerText = 'Bạn có chắc muốn chặn tài khoản này không? Hành động này không thể được hoàn tác.';
        document.getElementById('confirmDeleteBtn').innerText = 'Chặn';
        block_count = user.block_count + 1;
        console.log('New Block Count:', block_count);
        blockUser = {
            user_status_id: {
                _id: '67089ccb862f7badead53eba',
            },
            block_reason: 'Bởi Admin', // Lý do bị chặn là do admin
            block_count: block_count, // Cập nhật block_count sau khi tăng
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
async function removeRole(button, roleId) {
    try {
        // Gửi yêu cầu lấy tất cả người dùng
        const response = await fetch(`${DOMAIN}users/get-all-user`);
        const data = await response.json();

        if (!data || !data.data) {
            throw new Error("Dữ liệu không hợp lệ!");
        }

        // Lọc ra các vai trò "Admin"
        const adminRoles = data.data
            .flatMap(user => user.role)
            .filter(role => role.role_name === "Admin");

        // Kiểm tra nếu chỉ còn 1 vai trò "Admin" và vai trò này đang được yêu cầu xóa
        if (adminRoles.length === 1 && adminRoles[0]._id === roleId) {
            alert("Không thể xóa vai trò Admin cuối cùng!");
            return; // Dừng không xóa
        }

        // Xóa vai trò khỏi giao diện
        button.parentElement.remove();

        // Cập nhật danh sách vai trò trong bộ nhớ
        initialUserData = initialUserData.filter(role => role._id !== roleId);

        // Gửi yêu cầu cập nhật lại danh sách vai trò của người dùng
        await updateUser({ role: initialUserData });
    } catch (error) {
        console.error("Lỗi khi xóa vai trò:", error);
    }
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
    console.log(friendList);


    // Tạo modal
    const modal = document.createElement('div');

    modal.classList.add('modal', 'fade');
    modal.setAttribute('id', 'friendListModal');
    modal.setAttribute('tabindex', '-1');
    modal.setAttribute('role', 'dialog');
    modal.style.height = '100vh'; // Cố định chiều cao của modal
    modal.style.overflow = 'hidden'
    friendList.map(friend =>
        console.log(friend.avatar)
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
                                <img src="${friend.avatar}" alt="${friend.full_name}" class="rounded-circle" width="40" height="40" style="margin-right: 10px;">
                                ${friend.full_name}
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

const searchInput = document.getElementById('searchInput');

const fetchAllUsers = () => {
    fetch(`${DOMAIN}users/get-all-user`)
        .then(response => response.json())
        .then(data => {
            users = data.data;
        })
        .catch(error => console.error('Error:', error));
}
searchInput.addEventListener('input', async (e) => {
    const searchValue = e.target.value.toLowerCase();
    fetchAllUsers();
    const filteredUsers = users.filter(user => {
        return user.full_name.toLowerCase().includes(searchValue) ||
            user.email.toLowerCase().includes(searchValue);
    });

    renderTable(filteredUsers);
});

document.addEventListener("DOMContentLoaded", () => {
    // Bắt sự kiện chọn vai trò
    document.querySelectorAll('.role-filter').forEach(item => {
        item.addEventListener('click', (event) => {
            event.preventDefault(); // Ngăn chặn tải lại trang
            selectedRole = event.target.getAttribute('data-role'); // Lấy giá trị vai trò
            console.log('Vai trò đã chọn:', selectedRole);
            selectedStatus = '';

            // Gọi hàm fetch với vai trò được chọn
            fetchDataForPage(currentPage);
        });
    });

    // Bắt sự kiện chọn trạng thái
    document.querySelectorAll('.status-filter').forEach(item => {
        item.addEventListener('click', (event) => {
            event.preventDefault(); // Ngăn chặn tải lại trang
            selectedStatus = event.target.getAttribute('data-status'); // Lấy giá trị trạng thái
            console.log('Trạng thái đã chọn:', selectedStatus);
            selectedRole = '';

            // Gọi hàm fetch với trạng thái được chọn
            fetchDataForPage(currentPage);
        });
    });
});
