const bcrypt = require('bcrypt');
class UtilsFunctions {
    static passwordEncryption = async (password) => {
        const saltRounds = 10; // Độ khó của việc mã hóa (tăng số này để tăng độ bảo mật)
        const hashedPassword = await bcrypt.hash( password, saltRounds);
        return hashedPassword;
    }
}

module.exports = UtilsFunctions;
