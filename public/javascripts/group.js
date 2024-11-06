const DOMAIN = `http://localhost:3000/api/v1/`;

// Fetch API
const tbody = document.querySelector('tbody');
const loadMore = document.getElementById('load-more');
const loading = document.getElementById('spinner');
let currentPage = 1;
let totalPages;
const itemsPerPage = 10; // Số lượng mục mỗi trang
let groupIdToDelete; // Biến để lưu ID của người dùng cần xóa
let grouptID;

const fetchDataForPage = async (page) => {
    try {
        const response = await fetch(`${DOMAIN}groups/get-group-by-page?page=${page}&limit=${itemsPerPage}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();

        // Cập nhật dữ liệu
        totalPages = data.data.totalPages; // Giả sử totalPages là thuộc tính của response
        const groups = data.data.groups; // Lấy danh sách người dùng
        renderTable(groups); // Gọi hàm renderTable để hiển thị dữ liệu
        renderPagination(); // Gọi hàm renderPagination để cập nhật phân trang

        // Cập nhật hiển thị số mục
        const groupAll = await fetch(`${DOMAIN}groups/get-all-group`);
        const dataAll = await groupAll.json();
        const totalItems = dataAll.data.length
        const startItem = (currentPage - 1) * itemsPerPage + 1; // Mục bắt đầu
        const endItem = Math.min(startItem + groups.length - 1, totalItems); // Mục kết thúc

        const hintText = document.querySelector('.hint-text');
        hintText.innerHTML = `Hiển thị <b>${startItem}</b> đến <b>${endItem}</b> trên tổng số <b>${totalItems}</b> Groups`;

    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
};

// Hàm để hiển thị dữ liệu trong bảng
const renderTable = (groups) => {
    const html = groups.map((group, index) => {
        const stt = (currentPage - 1) * itemsPerPage + index + 1;
        return `
           <tr data-group='${JSON.stringify(group)}'>
                <td>${stt}</td>
                <td>${group.group_name}</td>
                <td>${group.owner_id.full_name}</td>
                <td>${group.members.length}</td> <!-- Số lượng thành viên -->
                <td>${group.description}</td>
                <td>${formatDateTime(group.createdAt)}</td>
                <td>
                    <a href="#" class="delete" title="Delete" data-toggle="tooltip" 
                        onclick="confirmDelete('${group._id}', '${group.owner_id._id}')">
                        <i class="material-icons">&#xE872;</i>
                    </a>
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

document.addEventListener('DOMContentLoaded', () => {
    fetchDataForPage(currentPage);
});

// Số lượng trang tối đa hiển thị
const maxPagesToShow = 5;

// // Hàm chuyển hướng đến trang chi tiết bài đăng (post_detail)
// function goToPostDetailPage(postId) {
//     window.location.href = `/post-detail/${postId}`;
// }


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

// Hàm xác nhận xóa (hiển thị modal)
function confirmDelete(groupId, ownerId) {
    groupIdToDelete = groupId; // Lưu ID nhóm cần xóa
    ownerIdToDelete = ownerId; // Lưu owner_id của nhóm cần xóa
    $('#confirmDeleteModal').modal('show'); // Hiển thị modal xác nhận xóa
}
// Xử lý sự kiện khi nhấn nút xác nhận xóa
document.getElementById('confirmDeleteBtn').addEventListener('click', async function () {
    await deleteGroup(groupIdToDelete, ownerIdToDelete); // Gọi hàm xóa với groupId và ownerId đã lưu
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

// Hàm xóa nhóm
async function deleteGroup(groupId, ownerId) {
    try {
        // Gửi yêu cầu xóa với groupId và ownerId trong query
        const response = await fetch(`${DOMAIN}groups/delete-group/${groupId}?owner_id=${ownerId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        // Gọi lại API để tải lại dữ liệu sau khi xóa thành công
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

// async function toggleReportStatus(reportID, currentStatusId, badgeElement) {
//     console.log("Report ID:", reportID);
//     console.log("Current Status ID:", currentStatusId);

//     const statusIds = {
//         "Đang xử lý": "671b72a85b9c34320966d25b",
//         "Đã xử lý": "671b72d45b9c34320966d260"
//     };

//     // Xác định ID trạng thái mới dựa trên trạng thái hiện tại
//     const newStatusId = currentStatusId === statusIds["Đang xử lý"] ? statusIds["Đã xử lý"] : statusIds["Đang xử lý"];

//     // Gửi yêu cầu cập nhật trạng thái lên server
//     try {
//         const response = await fetch(`${DOMAIN}reports/update-report-status/${reportID}`, {
//             method: 'PUT',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({ report_status_id: newStatusId })
//         });

//         if (response.ok) {
//             const data = await response.json();

//             if (data.success) {
//                 // Cập nhật giao diện ngay lập tức nếu cần
//                 const newStatusText = newStatusId === statusIds["Đã xử lý"] ? "Đã xử lý" : "Đang xử lý";
//                 const newClass = newStatusId === statusIds["Đã xử lý"] ? 'badge-success' : 'bg-danger';

//                 badgeElement.querySelector('span').textContent = newStatusText;
//                 badgeElement.className = `badge border-0 text-light ${newClass} p-2`;


//             } else {
//                 console.error('Failed to update status:', data.message);
//             }
//         } else {
//             console.error('Failed to fetch from server, status code:', response.status);
//         }
//     } catch (error) {
//         console.error('There was a problem with the update operation:', error);
//     }
//     // Gọi lại API để làm mới dữ liệu
//     fetchDataForPage(currentPage);
// }

let initialUserData = {}; // Biến để lưu trữ thông tin người dùng ban đầu











