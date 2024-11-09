const bcrypt = require('bcrypt');
class UtilsFunctions {
    static passwordEncryption = async (password) => {
        const saltRounds = 10; // Độ khó của việc mã hóa (tăng số này để tăng độ bảo mật)
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    }
    static convertStringToISODate = async (dateString) => {
        // Tách chuỗi ngày, tháng, năm
        const [day, month, year] = dateString.split('-').map(Number);

        // Tạo đối tượng Date và định dạng thành ISO
        const date = await new Date(Date.UTC(year, month - 1, day, 0, 0, 0));

        return date.toISOString(); // Kết quả định dạng ISO
    }
}

module.exports = UtilsFunctions;
