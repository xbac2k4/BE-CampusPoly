const DOMAIN = window.APP_CONFIG.API_URL;

// fetch api
const tbody = document.getElementById('wrapper-posts');
const loadMore = document.getElementById('load-more');
const loading = document.getElementById('spinner');
let currentPage = 1;
let totalPages;

const loadPosts = async () => {
    await fetch(`${DOMAIN}posts/get-post-by-page?page=${currentPage}&limit=5`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            data.data.posts.map(items => {
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
// loadPosts();

// Khi trang tải lần đầu, gọi API để hiển thị 5 bài viết đầu tiên
window.addEventListener('DOMContentLoaded', (event) => {
    loadPosts();  // Lần đầu tiên gọi API để lấy trang 1
});

// Gọi API khi người dùng nhấn vào nút 'Tải thêm'
loadMore.addEventListener('click', function () {
    loadMore.style.display = 'none';
    loading.style.display = 'block';
    loadPosts();  // Gọi API để tải thêm bài viết
});