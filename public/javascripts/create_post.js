const DOMAIN = `http://localhost:3000/api/v1/`;
const userId = localStorage.getItem('userId');

// Kiểm tra userId có tồn tại hay không
if (!userId) {
    console.error("User ID not found in localStorage.");
    window.location.href = "/login"; // Chuyển hướng đến trang đăng nhập nếu không có userId
} else {
    console.log("User ID:", userId);
}

// Hàm để tải thông tin người dùng
const loadUserInfo = async (userId) => {
    try {
        const response = await fetch(`${DOMAIN}users/get-user-by-id/${userId}`);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();

        if (data && data.data) {
            // Cập nhật avatar và tên người dùng trong HTML
            const avatarImg = document.querySelector("img[alt='Avatar-1']");
            const usernameSpan = document.querySelector("span[style*='font-weight: 500;']");
            
            if (avatarImg) {
                avatarImg.src = data.data.avatar ? DOMAIN + data.data.avatar : "/images/profile-user.png"; // Đảm bảo đường dẫn đầy đủ
            }
            if (usernameSpan) {
                usernameSpan.textContent = data.data.full_name || "Unknown User"; // Tên mặc định nếu không có
            }
        } else {
            console.error("Không tìm thấy dữ liệu người dùng.");
        }
        
    } catch (error) {
        console.error('Error loading user info:', error);
    }
};

// Hàm xử lý khi người dùng chọn ảnh
function handleFileSelect(event) {
    const file = event.target.files[0]; // Lấy file người dùng chọn

    if (file) {
        // Kiểm tra loại file là ảnh
        const reader = new FileReader();
        reader.onload = function(e) {
            // Lấy đường dẫn ảnh dưới dạng base64 hoặc URL
            const imageUrl = e.target.result;

            // Tạo thẻ <img> để hiển thị ảnh
            const imgElement = document.createElement("img");
            imgElement.src = imageUrl;
            imgElement.style.maxWidth = "100px"; // Giới hạn kích thước ảnh
            imgElement.style.maxHeight = "100px"; // Giới hạn chiều cao ảnh
            imgElement.style.marginTop = "10px"; // Thêm khoảng cách trên ảnh

            // Thêm thẻ <img> vào phần "Bạn đang nghĩ gì..."
            const postContentDiv = document.querySelector(".post-content"); // Chọn phần chứa nội dung đăng bài
            if (postContentDiv) {
                postContentDiv.innerHTML = ""; // Xóa nội dung cũ trong div (nếu cần)
                postContentDiv.appendChild(imgElement); // Thêm ảnh vào div
            }

            // Nếu cần giữ nguyên nội dung đã nhập vào textarea
            const postTextarea = document.querySelector("textarea");
            if (postTextarea) {
                const currentText = postTextarea.value;
                postTextarea.value = currentText + "\n"; // Bạn có thể tiếp tục thêm văn bản nếu cần
            }
        };
        reader.readAsDataURL(file); // Đọc ảnh dưới dạng URL (Base64)
    } else {
        console.error("Chưa chọn file ảnh!");
    }
}

// Khi DOM đã được tải
document.addEventListener("DOMContentLoaded", () => {
    loadUserInfo(userId); // Gọi hàm tải thông tin người dùng

    const postTextarea = document.querySelector("textarea");
    const postTitleInput = document.querySelector("#postTitle"); // Input cho tiêu đề bài viết
    const postButton = document.querySelector(".custom-button");

    // Kiểm tra sự tồn tại của các phần tử trước khi thêm sự kiện
    if (postButton) {
        postButton.addEventListener("click", async () => {
            const postContent = postTextarea ? postTextarea.value.trim() : "";
            const postTitle = postTitleInput ? postTitleInput.value.trim() : "";
            // const postType = "0"; // Set cứng giá trị cho post_type là "0"

            if (!postContent || !postTitle) {
                alert("Vui lòng điền đầy đủ thông tin trước khi đăng!");
                return;
            }

            // Tạo FormData để gửi ảnh và dữ liệu
            const formData = new FormData();
            formData.append("user_id", userId);
            formData.append("title", postTitle);
            formData.append("content", postContent);
            formData.append("post_type", "0"); // Gửi giá trị cứng "0" cho post_type

            const fileInput = document.getElementById('fileInput');
            if (fileInput && fileInput.files[0]) {
                formData.append("image", fileInput.files[0]); // Thêm ảnh vào FormData
            }

            try {
                const postResponse = await fetch(`${DOMAIN}posts/add-post`, {
                    method: "POST",
                    body: formData,
                });

                const postResult = await postResponse.json();
                if (postResult.status === 200) {
                    alert("Đăng bài thành công!");
                    // Làm trắng các trường nhập liệu
                    if (postTextarea) postTextarea.value = ""; // Xóa nội dung sau khi đăng
                    if (postTitleInput) postTitleInput.value = ""; // Xóa tiêu đề sau khi đăng
                    const postContentDiv = document.querySelector(".post-content");
                    if (postContentDiv) postContentDiv.innerHTML = ""; // Xóa ảnh đã chọn nếu có

                } else {
                    console.error("Lỗi khi đăng bài:", postResult.message);
                }
            } catch (error) {
                console.error('Error posting content:', error);
            }
        });
    }

    // Đảm bảo sự kiện onchange được kết nối với hàm handleFileSelect
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
    }
});
