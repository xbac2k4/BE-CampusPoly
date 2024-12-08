const DOMAIN = window.APP_CONFIG.API_URL;
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
                const avatarUrl = data.data?.avatar;
                avatarImg.src = avatarUrl && avatarUrl.startsWith("http") ? avatarUrl : DOMAIN + avatarUrl;
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
    const files = event.target.files; // Lấy tất cả các file người dùng chọn

    if (files && files.length > 0) {
        // Chọn phần chứa nội dung đăng bài
        const postContentDiv = document.querySelector(".post-content");
        
        if (postContentDiv) {
            // Xóa nội dung cũ trong div (nếu cần)
            postContentDiv.innerHTML = ""; 

            // Lặp qua tất cả các file và tạo thẻ <img> để hiển thị ảnh
            for (let i = 0; i < files.length; i++) {
                const file = files[i];

                // Kiểm tra loại file là ảnh
                if (file && file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        // Tạo thẻ <img> để hiển thị ảnh
                        const imgElement = document.createElement("img");
                        imgElement.src = e.target.result; // Đặt ảnh dưới dạng base64
                        imgElement.style.maxWidth = "100px"; // Giới hạn kích thước ảnh
                        imgElement.style.maxHeight = "100px"; // Giới hạn chiều cao ảnh
                        imgElement.style.marginTop = "10px"; // Thêm khoảng cách trên ảnh

                        // Thêm ảnh vào div
                        postContentDiv.appendChild(imgElement);
                    };
                    reader.readAsDataURL(file); // Đọc ảnh dưới dạng URL (Base64)
                } else {
                    console.error("Chỉ có thể chọn các tệp ảnh!");
                }
            }
        }
    } else {
        console.error("Chưa chọn file ảnh!");
    }
}

// Khi DOM đã được tải
document.addEventListener("DOMContentLoaded", () => {
    loadUserInfo(userId); // Gọi hàm tải thông tin người dùng

    const postTextarea = document.querySelector("textarea");
    const postTitleInput = document.querySelector("#postTitle"); // Input cho tiêu đề bài viết
    const postHashtagInput = document.querySelector("#postHashtag"); // Input cho tiêu đề bài viết
    const postButton = document.querySelector(".custom-button");

    // Kiểm tra sự tồn tại của các phần tử trước khi thêm sự kiện
    if (postButton) {
        postButton.addEventListener("click", async () => {
            const postContent = postTextarea ? postTextarea.value.trim() : "";
            const postTitle = postTitleInput ? postTitleInput.value.trim() : "";
            const postHashtag = postHashtagInput ? postHashtagInput.value.trim() : "";

            if (!postContent || !postTitle) {
                alert("Vui lòng điền đầy đủ thông tin trước khi đăng!");
                return;
            }

            // Tạo FormData để gửi ảnh và dữ liệu
            const formData = new FormData();
            formData.append("user_id", userId);
            formData.append("title", postTitle);
            formData.append("content", postContent);
            if (postHashtag) {
                formData.append("hashtag", postHashtag); // Chỉ gửi nếu có hashtag
            }


            const fileInput = document.getElementById('fileInput');
            if (fileInput && fileInput.files.length > 0) {
                // Thêm tất cả các ảnh vào FormData
                for (let i = 0; i < fileInput.files.length; i++) {
                    formData.append("image", fileInput.files[i]); // Chỉ dùng 'image' để truyền nhiều ảnh
                }
            }            
            try {
                const postResponse = await fetch(`${DOMAIN}posts/add-post`, {
                    method: "POST",
                    body: formData,
                });

                const postResult = await postResponse.json();
                if (postResult.status === 200) {
                    // Mở dialog thành công
                    const successDialog = document.getElementById('successDialog');
                    const viewPostButton = document.getElementById('viewPostButton');
                    const closeDialogButton = document.getElementById('closeDialogButton');

                    if (successDialog) {
                        successDialog.style.display = 'flex'; // Hiển thị dialog
                    }

                    // Thêm sự kiện cho nút "Xem bài viết"
                    if (viewPostButton) {
                        viewPostButton.addEventListener("click", () => {
                            // Mở bài viết vừa đăng
                            window.location.href = `/post-detail/${postResult.data._id}`;
                        });
                    }

                    // Thêm sự kiện cho nút "Đóng" để đóng dialog
                    if (closeDialogButton) {
                        closeDialogButton.addEventListener("click", () => {
                            successDialog.style.display = 'none'; // Đóng dialog
                        });
                    }

                    // Làm trắng các trường nhập liệu
                    if (postTextarea) postTextarea.value = ""; // Xóa nội dung sau khi đăng
                    if (postHashtagInput) postHashtagInput.value = ""; // Xóa tiêu đề sau khi đăng
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
