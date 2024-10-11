const DOMAIN = `http://localhost:3000/api/v1/`;

// fetch api
const tbody = document.querySelector('tbody');
const loadMore = document.getElementById('load-more');
const loading = document.getElementById('spinner');
let currentPage = 1;
let totalPages;

const loadUsers = async () => {
    await fetch(`${DOMAIN}users/get-user-by-page?page=${currentPage}&limit=10`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            let html = data.data.users.map(items => {
                return /*html*/` 
                    <tr>
                        <td>1</td>
                        <td>${items.email}</td>
                        <td>
                            <div class="badge bg-secondary p-2 text-light">
                                <span>${items.role === 1 ? 'Sinh viên' : 'Giảng viên'}</span>
                            </div>
                        </td>
                        <td>${items.full_name}</td>
                        <td>97219</td>
                        <td>
                            <div class="badge ${items.user_status_id.user_status_name === 'Đang hoạt động' ? 'badge-success' : items.user_status_id.user_status_name === 'Không hoạt động' ? 'bg-danger' : 'bg-warning'}  p-2">
                                <span>${items.user_status_id.user_status_name}</span>
                            </div>
                        </td>
                        <td>
                            <a href="#" class="block" title="Block User" data-toggle="tooltip">
                                <i class="material-icons">&#xE14B;</i></a>
                            <a href="#" class="edit" title="Edit" data-toggle="tooltip"><i
                                    class="material-icons">&#xE254;</i></a>
                            <a href="#" class="delete" title="Delete" data-toggle="tooltip"><i
                                    class="material-icons">&#xE872;</i></a>
                        </td>
                    </tr>
            `;
            }).join('');
            // let htmlPage = data.data.totalPages;
            // let htmlPage = [...Array(data.data.totalPages).keys()].map(page => {
            //     return /*html*/` 
            //     <button type="button" class="btn btn-outline-secondary ${page + 1 === currentPage ? 'active' : ''}" onclick="BtnPage(${page + 1})">${page + 1}</button>
            // `;
            // })
            tbody.innerHTML = html;
            totalPages = data.data.totalPages;
            // preloader.style.display = 'none';
            // pageNumber.value = numberPage;
            // if (currentPage < data.data.totalPages) {
            //     loading.style.display = 'none';
            //     loadMore.style.display = 'block'
            // } else {
            //     loadMore.style.display = 'none'
            //     loading.style.display = 'none';
            // }
            // currentPage++;
        })
        .catch(error => {
            console.error('There was a itemsblem with the fetch operation:', error);
        });
}
// loadPosts();

 // Khi trang tải lần đầu, gọi API để hiển thị 5 bài viết đầu tiên
window.addEventListener('DOMContentLoaded', (event) => {
    loadUsers();  // Lần đầu tiên gọi API để lấy trang 1
});