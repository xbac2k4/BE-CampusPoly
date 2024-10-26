const template = document.createElement('template');
template.innerHTML = `
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <style>
        .post-container {
            background-color: #E4EBF6;
            transition: background-color 0.3s;
            cursor: pointer;
            border-radius: 2vh;
            display: flex;
            justify-content: space-around; 
        }

        .post-container:hover {
            background-color: #f2f5fa;
        }

        .content-container {
            width: auto;
            max-width: 45vw; /* Thu hẹp chiều rộng để phù hợp với biểu tượng */
            white-space: nowrap; 
            overflow: hidden; 
            text-overflow: ellipsis;
        }

        .post-icons {
            font-size: 0.9rem;
            color: #5b5e62;
            display: flex;
            padding-right: 0.6rem
        }

        .icon {
            margin-left: 1rem;
            display: flex;
            align-items: center; /* Đảm bảo biểu tượng và số đếm nằm cùng một dòng */
        }

        .icon i {
            margin-right: 0.2rem; /* Thêm khoảng cách giữa icon và số */
        }

        .wrapper {
            width: auto;            
        }
    </style>
    <div class="container post-container p-3 align-items-center mb-2">
        <div class="d-flex w-auto">
            <img id="post-img" class="rounded-circle mr-3" style="width: 50px; height: 50px;">
            <div class="wrapper d-flex flex-column">
                <span style="font-weight: bold; font-size: 1rem" id="title" class="content-container">Tiêu đề của một bài viết</span>
                <span style="font-size: 0.7rem; color: #5b5e62" class="content-container">
                    <span style="font-weight: bold;" id="user-name">User</span> đã đăng <span id="time-up">25</span>
                </span>
                <span style="font-size: 0.7rem; color: #5b5e62" id="content" class="content-container">Nội dung chính của bài đăng</span>
            </div>
        </div>
        <div class="post-icons ml-auto d-flex flex-column">
            <span class="icon">
                <i class="bi bi-heart-fill"></i> <span id="like-count">0</span>
            </span>
            <span class="icon">
                <i class="bi bi-chat-fill"></i> <span id="comment-count">0</span>
            </span>
        </div>
    </div>
`;

class CardPost extends HTMLElement {
    static get observedAttributes() {
        return ['title', 'time', 'user', 'content', 'img', 'likes', 'comments']; // Thêm thuộc tính 'likes' và 'comments'
    }

    constructor() {
        super();
        // Tạo Shadow DOM
        this.attachShadow({ mode: 'open' });
        // Thêm template vào Shadow DOM
        this.shadowRoot.appendChild(template.content.cloneNode(true));
         // Thêm sự kiện click để điều hướng tới chi tiết bài viết
         this.shadowRoot.querySelector('.post-container').addEventListener('click', () => {
            const postId = this.getAttribute('post-id');
            console.log(postId);
            
            if (postId) {
                window.location.href = `post-detail/${postId}`;
            }
        });
    }

    // Phương thức này sẽ được gọi khi thuộc tính thay đổi
    attributeChangedCallback(name, oldValue, newValue) {
        const titleElement = this.shadowRoot.getElementById('title');
        const contentElement = this.shadowRoot.getElementById('content');
        const userElement = this.shadowRoot.getElementById('user-name');
        const timeElement = this.shadowRoot.getElementById('time-up');
        const imgElement = this.shadowRoot.getElementById('post-img');
        const likeElement = this.shadowRoot.getElementById('like-count');
        const commentElement = this.shadowRoot.getElementById('comment-count');

        // Cập nhật nội dung dựa trên thuộc tính
        switch (name) {
            case 'title':
                titleElement.textContent = newValue;
                break;
            case 'content':
                contentElement.textContent = newValue;
                break;
            case 'user':
                userElement.textContent = newValue;
                break;
            case 'time':
                timeElement.textContent = this.timeAgo(newValue);
                break;
            case 'img':
                imgElement.src = newValue;
                break;
            case 'likes':
                likeElement.textContent = newValue; // Cập nhật số lượt thích
                break;
            case 'comments':
                commentElement.textContent = newValue; // Cập nhật số lượt bình luận
                break;
        }
    }

    // Hàm tính thời gian trôi qua
    timeAgo(date) {
        const now = new Date();
        const postDate = new Date(date);
        const diff = Math.floor((now - postDate) / 1000); // Chênh lệch thời gian tính bằng giây

        if (diff < 60) return `${diff} seconds ago`;
        const minutes = Math.floor(diff / 60);
        if (minutes < 60) return `${minutes} minutes ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hours ago`;
        const days = Math.floor(hours / 24);
        return `${days} days ago`;
    }
}

// Định nghĩa phần tử custom-card
window.customElements.define('card-post', CardPost);

export default CardPost;

