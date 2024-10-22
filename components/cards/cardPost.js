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
        }

        .post-container:hover {
            background-color: #f2f5fa;
        }
        .content-container {
            width: 50vw;
            white-space: nowrap; 
            overflow: hidden; 
            text-overflow: ellipsis;
        }
    </style>
    <div class="container post-container p-3 d-flex align-items-start mb-2">
        <img id="post-img" class="rounded-circle mr-3" style="width: 50px; height: 50px;">
        <div class="wrapper d-flex flex-column">
            <span style="font-weight: bold; font-size: 1rem" id="title" class="content-container">Tiêu đề của một bài viết</span>
            <span style="font-size: 0.7rem; color: #5b5e62" class="content-container">
                <span style="font-weight: bold;" id="user-name">User</span> đã đăng <span id="time-up">25</span>
            </span>
            <span style="font-size: 0.7rem; color: #5b5e62" id="content" class="content-container">Nội dung chính của bài đăng</span>
        </div>
    </div>
`;

class CardPost extends HTMLElement {
    static get observedAttributes() {
        return ['title', 'time', 'user', 'content', 'img']; // Thêm thuộc tính 'img' để theo dõi
    }

    constructor() {
        super();
        // Tạo Shadow DOM
        this.attachShadow({ mode: 'open' });
        // Thêm template vào Shadow DOM
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    // Phương thức này sẽ được gọi khi thuộc tính thay đổi
    attributeChangedCallback(name, oldValue, newValue) {
        const titleElement = this.shadowRoot.getElementById('title');
        const contentElement = this.shadowRoot.getElementById('content');
        const userElement = this.shadowRoot.getElementById('user-name');
        const timeElement = this.shadowRoot.getElementById('time-up');
        const imgElement = this.shadowRoot.getElementById('post-img'); // Lấy phần tử img

        // Cập nhật nội dung dựa trên thuộc tính
        switch (name) {
            case 'title':
                titleElement.textContent = newValue; // Cập nhật tiêu đề
                break;
            case 'content':
                contentElement.textContent = newValue; // Cập nhật nội dung
                break;
            case 'user':
                userElement.textContent = newValue; // Cập nhật tên người dùng
                break;
            case 'time':
                timeElement.textContent = this.timeAgo(newValue); // Sử dụng hàm timeAgo để cập nhật thời gian
                break;
            case 'img':
                imgElement.src = newValue; // Cập nhật hình ảnh từ API
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
