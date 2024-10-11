class HttpResponse {

    static errorMessages = {
        serverER: 'Internal server error',
        success: 'Success',
        loginSuccess: 'Login success',
        loginFail: 'Incorrect email or password',
        dataNotFound: 'Data not found',
        getDataSucces: 'Get data succes',
        registerEmailExists: 'email already exists',
        registerSuccess: 'Register success',
        registerFail: 'Register fail',
        5: 'Unauthorized',
    }

    static getErrorMessages = (errorCode) => {
        return this.errorMessages[errorCode] || '';
    }

    static success(data, message) {
        return {
            status: 200,
            message,
            data,
        };
    }

    static fail(message) {
        return {
            status: 400,
            message,
            data: null
        };
    }

    static error(error) {
        return {
            status: 500,
            message: this.getErrorMessages('serverER'),
            error,
        };
    }

    static result(data) {
        return {
            status: data.status,
            message: data.message,
            data: data.data,
        };
    }

    static auth(data, token, refreshToken) {
        return {
            status: 200,
            message: this.getErrorMessages('loginSuccess'),
            data,
            token,
            refreshToken
        }
    }

    static authFail(message) {
        return {
            status: 400,
            message,
            data: null
        }
    }

    static resultAuth(data) {
        return {
            status: data.status,
            message: data.message,
            data: data.data,
            token: data.token,
            refreshToken: data.refreshToken
        }
    }
}

module.exports = HttpResponse;
