const DOMAIN = window.APP_CONFIG.API_URL;

// DOM Elements
const tbody = document.querySelector('tbody');
const pagesContainer = document.getElementById("pages");
const hintText = document.querySelector('.hint-text');
const itemsPerPage = 10; // Số lượng mục mỗi trang
let currentPage = 1;
let totalPages;

// Fetch API and render data
const fetchDataForPage = async (page) => {
    try {
        const response = await fetch(`${DOMAIN}reportedposts/get-report-by-page?page=${page}&limit=${itemsPerPage}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log("Data from API:", data); // Log dữ liệu từ API

        // Kiểm tra nếu dữ liệu trả về có đúng cấu trúc
        if (!data || !data.data || !Array.isArray(data.data.data.reports)) {
            throw new Error('Dữ liệu không đúng định dạng hoặc không có báo cáo');
        }

        // Cập nhật dữ liệu
        totalPages = data.data.data.totalPages; // totalPages từ data.data
        const reports = data.data.data.reports; // Lấy danh sách báo cáo

        // Kiểm tra nếu reports là một mảng hợp lệ
        if (!Array.isArray(reports) || reports.length === 0) {
            throw new Error('Không có báo cáo nào');
        }

        renderTable(reports); // Gọi hàm renderTable để hiển thị dữ liệu
        renderPagination(); // Gọi hàm renderPagination để cập nhật phân trang

        // Cập nhật thông tin mục hiển thị
        const userAll = await fetch(`${DOMAIN}reportedposts/all-reports`);
        const dataAll = await userAll.json();
        const totalItems = dataAll.data.data.reports.length         
        const startItem = (currentPage - 1) * itemsPerPage + 1; // Mục bắt đầu
        const endItem = Math.min(startItem + reports.length - 1, totalItems); // Mục kết thúc
        const hintText = document.querySelector('.hint-text');
        hintText.innerHTML = `Hiển thị <b>${startItem}</b> đến <b>${endItem}</b> trên tổng số <b>${totalItems}</b> báo cáo`;


    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

// Render table rows
const renderTable = (reports) => {

    const html = reports.map((reportedpost, index) => {
        const stt = (currentPage - 1) * itemsPerPage + index + 1; // Số thứ tự
        return `
            <tr data-reportedpost='${JSON.stringify(reportedpost)}'>
                <td>${stt}</td>
                <td>
                    <span 
                        style="cursor: pointer; color: blue;" 
                        onclick="showUserDetailsModal('${reportedpost.post_id?.user_id?._id}')">
                        ${reportedpost.post_id?.user_id?.full_name}
                    </span>
                </td>
                <td>
                     <a href="#" class="view" title="View" data-toggle="tooltip" onclick="goToPostDetailPage('${reportedpost.post_id?._id}')">
                        <span style="cursor: pointer; transform: none; box-shadow: none;">
                           Xem bài viết
                        </span>
                     </a>
                </td>
                <td>
                    <button 
                        onclick='showReportersList(${JSON.stringify(reportedpost.reporters)})'
                        class="badge border-0 bg-secondary p-2 text-light">
                        <span>${reportedpost.reporters.length}</span>
                    </button>
                </td>
                <td>${formatDateTime(reportedpost.createdAt)}</td>
                <td>${reportedpost.violation_point}</td>
                <td>${reportedpost.total_reports}</td>
                <td>
                    <div  class="badge border-0 text-light bg-info ${reportedpost.report_status_id.status_name === 'Chưa xác định vi phạm' ? 'badge-success' : 'bg-danger'} p-2">
                        ${reportedpost.report_status_id.status_name}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    tbody.innerHTML = html;
};

function goToPostDetailPage(postId) {
    window.location.href = `/post-detail/${postId}`;
}

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
// Hàm hiển thị modal thông tin người dùng
const showUserDetailsModal = async (userId) => {
    try {
        // Gọi API để lấy thông tin người dùng theo userId
        const response = await fetch(`${DOMAIN}users/get-user-by-id/${userId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        const user = data.data;

        // Tạo modal
        const modal = document.createElement('div');
        modal.classList.add('modal', 'fade');
        modal.setAttribute('id', 'userDetailsModal');
        modal.setAttribute('tabindex', '-1');
        modal.setAttribute('role', 'dialog');
        modal.style.height = '100vh';
        modal.style.overflow = 'hidden';

        // Nội dung modal hiển thị thông tin người dùng
        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered" role="document" style="width: 50%;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title d-flex align-items-center">
                            <img src="${user.avatar}" class="rounded-circle" width="40" height="40" style="margin-right: 10px;">
                            ${user.full_name}
                        </h5>
                    </div>
                    <div class="modal-body">
                        <ul class="list-group">
    
                            <li class="list-group-item"><strong>Email:</strong> ${user.email}</li>
                            <li class="list-group-item"><strong>Trạng thái:</strong> ${user.user_status_id.status_name}</li>
                            <li class="list-group-item"><strong>Vai trò:</strong> ${user.role.map(role => role.role_name).join(', ')}</li>
                            <li class="list-group-item"><strong>Số lần bị chặn:</strong> ${user.block_count}</li>
                            <li class="list-group-item"><strong>Lý do bị chặn:</strong> ${user.block_reason || 'Hiện tại chưa bị chặn'}</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;

        // Thêm modal vào body và hiển thị
        document.body.appendChild(modal);
        $(modal).modal('show');
        $(modal).on('hidden.bs.modal', () => modal.remove());

    } catch (error) {
        console.error('Error fetching user details:', error);
    }
};


// Show reporters list modal
const showReportersList = (reporters) => {
    const modal = document.createElement('div');
    modal.classList.add('modal', 'fade');
    modal.setAttribute('id', 'reportersListModal');
    modal.setAttribute('tabindex', '-1');
    modal.setAttribute('role', 'dialog');
    modal.style.height = '100vh';
    modal.style.overflow = 'hidden';

    const reportersHtml = reporters.length > 0
        ? reporters.map(reporter => `
            <li class="list-group-item d-flex align-items-center">
                <img src="${reporter.user.avatar}" alt="${reporter.user.full_name}" class="rounded-circle" width="40" height="40" style="margin-right: 10px;">
                <div>
                    <strong>${reporter.user.full_name}</strong>
                    <p class="mb-0 text-muted">${reporter.report_type}</p>
                    <small class="text-muted">${formatDateTime(reporter.reported_at)}</small>
                </div>
            </li>
        `).join('')
        : '<li class="list-group-item">Không có thông tin người báo cáo.</li>';

    modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered" role="document" style="width: 50%;">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Danh sách người báo cáo: ${reporters.length} người</h5>
                </div>
                <div class="modal-body" style="max-height: calc(5 * 56px); overflow-y: auto;">
                    <ul class="list-group">${reportersHtml}</ul>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    $(modal).modal('show');
    $(modal).on('hidden.bs.modal', () => modal.remove());
};


// Format datetime
const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
};

// Initial fetch on page load
window.addEventListener("DOMContentLoaded", () => {
    fetchDataForPage(currentPage);
});
