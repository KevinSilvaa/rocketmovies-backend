class AppError {
    message;
    statuscode;

    constructor(message, statuscode = 400) {
        this.message = message
        this.statuscode = statuscode;
    }
}

module.exports = AppError;
