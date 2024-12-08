const DOMAIN = window.APP_CONFIG.API_URL;
const userOnline = document.getElementById('user-online');
const totalUser = document.getElementById('total-user');
const totalPost = document.getElementById('total-post');
const listTopHashtags = document.getElementById('list-top-hashtags');
const topPostContainer = document.getElementById('item-top-post');

let listUserOnline = [];

window.addEventListener('DOMContentLoaded', async () => {
    if (window.socket) {
        window.socket.emit('get_users_online');
    } else {
        console.error("Socket is not initialized.");
    }

    try {
        // Chạy đồng thời các tác vụ
        await Promise.all([
            handleUserOnline(),
            fetchUsers(),
            fetchPosts(),
            fetchTopHashtags(),
            fetchTopPost()
        ]);
    } catch (error) {
        console.error("Error in loading data:", error);
    }
});

const handleUserOnline = () => {
    return new Promise((resolve, reject) => {
        if (window.socket) {
            if (!window.socket._hasListener) {
                window.socket.on('update_user_list', (users) => {
                    listUserOnline = users;
                    userOnline.textContent = listUserOnline.length;
                    resolve();
                });
                window.socket._hasListener = true;
            }
        } else {
            console.error("Socket is not initialized.");
            reject("Socket is not initialized.");
        }
    });
};

const fetchUsers = async () => {
    try {
        const response = await fetch(`${DOMAIN}users/get-all-user`);
        const data = await response.json();

        if (response.ok && data.data) {
            const users = data.data;

            const userCountsByMonth = Array(12).fill(0);
            users.forEach((item) => {
                const month = new Date(item.createdAt).getMonth();
                userCountsByMonth[month]++;
            });

            const integerUserCounts = userCountsByMonth.map(count => parseInt(count, 10));

            // console.log("User counts by month:", integerUserCounts);

            totalUser.textContent = users.length;

            renderUserChart(integerUserCounts);
        } else {
            throw new Error(data.message || "Failed to fetch users");
        }
    } catch (error) {
        console.error("Error fetching users:", error);
    }
};

// Hàm vẽ biểu đồ
const renderUserChart = (userCountsByMonth) => {
    const ctx2 = document.getElementById('number-of-users');

    new Chart(ctx2, {
        type: 'line',
        data: {
            labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
            datasets: [{
                label: 'Số lượng người dùng đăng ký mỗi tháng',
                data: userCountsByMonth,
                borderWidth: 2,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0 // Đảm bảo hiển thị số nguyên trên trục y
                    }
                }
            }
        }
    });
};

// const fetchPosts = async () => {
//     try {
//         const response = await fetch(`${DOMAIN}posts/get-all-post`);
//         const data = await response.json();

//         if (response.ok && data.data) {
//             const posts = data.data;

//             const postCountsByMonth = Array(12).fill(0);

//             posts.forEach((item) => {
//                 const month = new Date(item.postData.createdAt).getMonth();
//                 postCountsByMonth[month]++;
//             });

//             const integerPostCounts = postCountsByMonth.map(count => parseInt(count, 10));

//             // console.log("Post counts by month (integer):", integerPostCounts);

//             totalPost.textContent = posts.length;

//             renderChart(integerPostCounts);
//         } else {
//             throw new Error(data.message || "Failed to fetch posts");
//         }
//     } catch (error) {
//         console.error("Error fetching posts:", error);
//     }
// };

// Hàm vẽ biểu đồ
let chartInstance; // Lưu trữ biểu đồ hiện tại

// Hàm vẽ biểu đồ
const renderChart = (labels, data) => {
    const ctx1 = document.getElementById('number-of-posts');

    // Xóa biểu đồ cũ nếu tồn tại
    if (chartInstance) {
        chartInstance.destroy();
    }

    // Tạo biểu đồ mới
    chartInstance = new Chart(ctx1, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Số lượng bài đăng',
                data: data,
                borderWidth: 1,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
};

const fetchPosts = async () => {
    try {
        const response = await fetch(`${DOMAIN}posts/get-all-post`);
        const data = await response.json();

        if (response.ok && data.data) {
            const posts = data.data;

            // Lấy loại thống kê
            const statisticType = document.getElementById('statistic-type').value;

            // Chuẩn bị dữ liệu thống kê
            let labels = [];
            let postCounts = [];

            if (statisticType === 'month') {
                labels = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
                postCounts = Array(12).fill(0);

                posts.forEach((item) => {
                    const month = new Date(item.postData.createdAt).getMonth();
                    postCounts[month]++;
                });
            } else if (statisticType === 'day') {
                const now = new Date();
                const currentMonth = now.getMonth(); // Tháng hiện tại (0-11)
                const daysInMonth = new Date(now.getFullYear(), currentMonth + 1, 0).getDate(); // Số ngày trong tháng

                // Tạo danh sách ngày đầy đủ dạng dd/MM
                labels = Array.from({ length: daysInMonth }, (_, i) =>
                    `${String(i + 1).padStart(2, '0')}/${String(currentMonth + 1).padStart(2, '0')}`
                );
                postCounts = Array(daysInMonth).fill(0);

                // Tính số lượng bài đăng theo ngày
                posts.forEach((item) => {
                    const createdAt = new Date(item.postData.createdAt);
                    const day = createdAt.getDate(); // Lấy ngày (1-31)
                    if (createdAt.getMonth() === currentMonth) {
                        postCounts[day - 1]++;
                    }
                });
            } else if (statisticType === 'year') {
                const years = posts.map(item => new Date(item.postData.createdAt).getFullYear());
                const uniqueYears = [...new Set(years)];
                labels = uniqueYears.map(year => `Năm ${year}`);
                postCounts = Array(uniqueYears.length).fill(0);

                posts.forEach((item) => {
                    const year = new Date(item.postData.createdAt).getFullYear();
                    const index = uniqueYears.indexOf(year);
                    postCounts[index]++;
                });
            }

            totalPost.textContent = posts.length;
            // Vẽ lại biểu đồ
            renderChart(labels, postCounts);
        } else {
            throw new Error(data.message || "Failed to fetch posts");
        }
    } catch (error) {
        console.error("Error fetching posts:", error);
    }
};

document.getElementById('statistic-type').addEventListener('change', fetchPosts);

const fetchTopHashtags = async () => {
    try {
        const response = await fetch(`${DOMAIN}hashtags/get-top-hashtag`);
        const data = await response.json();

        if (response.ok && data.data) {
            // Xóa nội dung cũ (nếu có)
            listTopHashtags.innerHTML = '';

            // Render danh sách hashtag
            data.data.forEach(item => {
                const hashtagItem = document.createElement('div');
                hashtagItem.classList.add('hashtag-item', 'mb-2', 'p-2', 'border', 'rounded');
                hashtagItem.innerHTML = `
                    <strong>${item.hashtag_name}</strong> 
                    <span class="text-muted">(${item.hashtag_count} lượt sử dụng)</span>
                `;
                listTopHashtags.appendChild(hashtagItem);
            });
        } else {
            console.error(data.message || 'Failed to fetch hashtags');
        }
    } catch (err) {
        console.error('Error fetching hashtags:', err);
    }
};

const fetchTopPost = async () => {
    try {
        const response = await fetch(`${DOMAIN}posts/get-top-post`);
        const data = await response.json();

        // Duyệt qua từng bài viết và render HTML
        data.data.forEach(post => {
            // Lấy thông tin bài viết
            const postData = post?.postData;
            const user = postData?.user_id;
            const postTitle = postData?.title;
            const postContent = postData?.content;
            const likeCount = postData?.like_count;
            const commentCount = postData?.comment_count;
            const avatar = user?.avatar;
            const fullName = user?.full_name;

            // Tạo HTML cho từng bài viết
            const postElement = document.createElement('div');
            postElement.classList.add('post-item', 'mb-1', 'border', 'p-1', 'px-3', 'rounded');

            postElement.innerHTML = `
               <div class="d-flex flex-column justify-content-between">
                    <div class="post-footer d-flex justify-content-between w-100">
                        <div class="d-flex flex-column w-50">
                            <h6 class="m-0 text-container">${postTitle}</h6>
                            <span style="font-size: 12px" class="m-0 text-container">${postContent}</span>
                        </div>
                        <div class="d-flex flex-column text-right">
                            <span class="m-0"><i class="fa fa-heart"></i> ${likeCount}</span>
                            <span class="m-0"><i class="fa fa-comment"></i> ${commentCount}</span>
                        </div>
                    </div>

                    <div class="post-header d-flex align-items-center justify-content-between">
                        <!-- User Info Section -->
                        <div class="d-flex align-items-center">
                            <img src="${avatar}" alt="${fullName}" class="avatar rounded-circle mr-2" width="20" height="20">
                            <span class="m-0">${fullName}</span>
                        </div>
                        <span class="m-0">Điểm: ${post?.interactionScore}</span>
                    </div>
                </div>
            `;
            // Thêm bài viết vào container
            topPostContainer.appendChild(postElement);
        });

    } catch (e) {
        console.log(e);
    }
};




