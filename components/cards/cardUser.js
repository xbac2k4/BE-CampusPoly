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
            white-space: nowrap; 
            overflow: hidden; 
            text-overflow: ellipsis;
        }
    </style>
    <tr>
        <td>bacnxph44315@fpt.edu.vn</td>
        <td>123</td>
        <td style="gap: 20px; font-size: 20px" class="d-flex justify-content-end">
        <i class="bi bi-pen"></i> 
        <i class="bi bi-trash3"></i></td>
    </tr>
`;

class CardUser extends HTMLElement {
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
                timeElement.textContent = newValue; // Cập nhật thời gian
                break;
            case 'img':
                imgElement.src = newValue; // Cập nhật hình ảnh từ API
                break;
        }
    }
}

// Định nghĩa phần tử custom-card
window.customElements.define('card-user', CardUser);

export default CardUser;
