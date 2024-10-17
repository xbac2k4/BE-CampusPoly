const template = document.createElement('template');
template.innerHTML = `
    <style>
        .modal-content {
            height: 100vh; /* Cố định chiều cao modal-content */
            display: flex;
            flex-direction: column; /* Để dễ dàng quản lý các phần tử con */
            overflow: hidden; /* Ngăn chặn cuộn cho toàn bộ modal-content */
        }
        .modal-body {
            overflow-y: auto; /* Chỉ cho phép cuộn trong phần thân modal */
            flex: 1; /* Cho phép phần thân mở rộng để sử dụng hết không gian còn lại */
            padding: 15px; /* Thêm khoảng đệm để tránh viền */
        }
        .modal-header, .modal-footer {
            flex-shrink: 0; /* Đảm bảo header và footer không thay đổi kích thước */
        }
    </style>
    <div class="modal fade" id="editUserModal" tabindex="-1" role="dialog" aria-labelledby="editUserModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="editUserModalLabel">Edit User</h5>
                    <button type="button" class="close" id="closeModal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="user-email">Email</label>
                        <input type="email" class="form-control" id="user-email" placeholder="Email" disabled>
                    </div>
                    <div class="form-group">
                        <label for="user-fullname">Full Name</label>
                        <input type="text" class="form-control" id="user-fullname" placeholder="Full Name">
                    </div>
                    <div class="form-group">
                        <label for="user-sex">Sex</label>
                        <select class="form-control" id="user-sex">
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="user-status">User Status</label>
                        <select class="form-control" id="user-status" disabled>
                            <option value="Đang hoạt động">Đang hoạt động</option>
                            <option value="Không hoạt động">Không hoạt động</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="user-bio">Bio</label>
                        <textarea class="form-control" id="user-bio" rows="3" placeholder="Bio"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="button btn-secondary" id="closeModalFooter">Close</button>
                    <button type="button" class="button btn-primary" id="saveChanges">Save Changes</button>
                </div>
            </div>
        </div>
    </div>
`;

class UserEditModal extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        // Handle Save Changes button click
        this.shadowRoot.querySelector('#saveChanges').addEventListener('click', () => {
            this.saveChanges();
        });

        // Handle Close button click
        this.shadowRoot.getElementById('closeModalFooter').addEventListener('click', () => {
            this.hideModal();
        });
        // Handle the X button click
        this.shadowRoot.getElementById('closeModal').addEventListener('click', () => {
            this.hideModal();
        });
    }

    // Method to show the modal
    showModal(user) {
        const emailInput = this.shadowRoot.getElementById('user-email');
        const fullnameInput = this.shadowRoot.getElementById('user-fullname');
        const sexSelect = this.shadowRoot.getElementById('user-sex');
        const statusSelect = this.shadowRoot.getElementById('user-status');
        const bioInput = this.shadowRoot.getElementById('user-bio');
        console.log(user);
        
        // Populate the input fields with user data
        if (emailInput && fullnameInput && sexSelect && statusSelect && bioInput) {
            emailInput.value = user.email;
            fullnameInput.value = user.full_name;
            sexSelect.value = user.sex;
            statusSelect.value = user.user_status_id.user_status_name;
            bioInput.value = user.bio;

            // Show modal
            $('#editUserModal').modal('show');
            console.log('Đã reset và hiển thị modal');
        } else {
            console.error('One or more input elements are missing in the modal.');
        }
    }

    // Method to hide the modal
    hideModal() {
        $('#editUserModal').modal('hide'); 
    }

    // Reset input fields
    resetFields() {
        this.shadowRoot.getElementById('user-email').value = '';
        this.shadowRoot.getElementById('user-fullname').value = '';
        this.shadowRoot.getElementById('user-sex').value = 'male';
        this.shadowRoot.getElementById('user-status').value = 'Đang hoạt động';
        this.shadowRoot.getElementById('user-bio').value = '';
    }

    // Save changes method
    async saveChanges() {
        const email = this.shadowRoot.getElementById('user-email').value;
        const fullName = this.shadowRoot.getElementById('user-fullname').value;
        const sex = this.shadowRoot.getElementById('user-sex').value;
        const status = this.shadowRoot.getElementById('user-status').value;
        const bio = this.shadowRoot.getElementById('user-bio').value;

        // Add your API call logic here to update the user details
        console.log({ email, fullName, sex, status, bio }); // For demonstration

        // Close the modal after saving changes
        this.hideModal();
    }
}

// Define the custom element
window.customElements.define('user-edit-modal', UserEditModal);
