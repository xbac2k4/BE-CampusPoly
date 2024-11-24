const DOMAIN = window.APP_CONFIG.API_URL;

// Lấy các phần tử DOM cần thiết
const tbody = document.getElementById('wrapper-posts');
const loadMore = document.getElementById('load-more');
const loading = document.getElementById('spinner');
const searchInput = document.getElementById('searchInput');

let currentPage = 1;
let totalPages;
let searchTerm = ""; // Lưu trữ từ khóa tìm kiếm
let isSearching = false; // Trạng thái tìm kiếm
let searchTimeout;

// Hàm load bài viết
const loadPostsSearch = async () => {
    // Xây dựng URL API tùy theo trạng thái tìm kiếm
    const apiUrl = isSearching
        ? `${DOMAIN}posts/admin-search?searchTerm=${encodeURIComponent(searchTerm)}`
        : `${DOMAIN}posts/get-post-by-page?page=${currentPage}&limit=5`;

    await fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (!data.success || !data.posts || data.posts.length === 0) {
                console.log("No posts found");
                if (isSearching) {
                    tbody.innerHTML = "<p>Không tìm thấy bài viết phù hợp.</p>";
                }
                return;
            }

            if (currentPage === 1) tbody.innerHTML = ""; // Reset danh sách nếu là trang đầu tiên

            // Hiển thị bài viết
            data.posts.map(items => {
                let html = `<card-post post-id="${items._id}" img="${items.user_id.avatar !== "" ? items.user_id.avatar.replace("10.0.2.2", "localhost") : "https://placehold.co/50x50"}" title="${items.title}" content="${items.content}" user="${items.user_id.full_name}" time="${items.createdAt}" likes="${items.like_count}" comments="${items.comment_count}"></card-post>`;
                tbody.insertAdjacentHTML('beforeend', html);
            });

            // Điều chỉnh trạng thái nút "Tải thêm"
            if (!isSearching && data.data && currentPage < data.data.totalPages) {
                loadMore.style.display = 'block';
            } else {
                loadMore.style.display = 'none';
            }

            loading.style.display = 'none';
            currentPage++;
        })
        .catch(error => {
            console.error('Error fetching posts:', error);
        });
};

const loadPosts = async () => {
    await fetch(`${DOMAIN}posts/get-post-by-page?page=${currentPage}&limit=5`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            data.data.postData.map(items => {
                // console.log(items.user_id.avatar);
                let html = `<card-post post-id="${items._id}" img="${items.user_id.avatar !== "" ? items.user_id.avatar.replace("10.0.2.2", "localhost") : "https://placehold.co/50x50"}" title="${items.title}" content="${items.content}" user="${items.user_id.full_name}" time="${items.createdAt}" likes="${items.like_count}" comments="${items.comment_count}"></card-post>`;
                tbody.insertAdjacentHTML('beforeend', html);
            });
            // preloader.style.display = 'none';
            // pageNumber.value = numberPage;
            if (currentPage < data.data.totalPages) {
                loading.style.display = 'none';
                loadMore.style.display = 'block'
            } else {
                loadMore.style.display = 'none'
                loading.style.display = 'none';
            }
            currentPage++;
        })
        .catch(error => {
            console.error('There was a itemsblem with the fetch operation:', error);
        });
}

// Gọi API khi trang tải lần đầu, lấy bài viết trang 1
window.addEventListener('DOMContentLoaded', () => {
    searchInput.value = '';
    loadPosts();
});

// Khi người dùng nhấn vào nút 'Tải thêm'
loadMore.addEventListener('click', function () {
    if (!isSearching) {
        loadMore.style.display = 'none';
        loading.style.display = 'block';
        loadPosts(); // Tải thêm bài viết
    }
});

// Lắng nghe sự kiện nhập liệu trong ô tìm kiếm
searchInput.addEventListener('input', () => {
    const value = searchInput.value.trim();
    searchTerm = value || ""; // Gán giá trị tìm kiếm
    clearTimeout(searchTimeout);
   

    // Cập nhật trạng thái tìm kiếm
    if (searchTerm !== "") {
        isSearching = true; // Chuyển sang trạng thái tìm kiếm 
        searchTimeout = setTimeout(() => {
            tbody.innerHTML = ""; // Xóa nội dung cũ
            loadPostsSearch();
        }, 1500); // Chờ 2 giây
    } else {
        isSearching = false; // Không tìm kiếm
        tbody.innerHTML = ""; // Xóa nội dung cũ
        currentPage = 1; // Reset trang khi không có tìm kiếm
        loadPosts();
    }
});
