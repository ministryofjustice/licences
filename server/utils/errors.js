module.exports = {
    NoTokenError
};

function NoTokenError() {
    const error = new Error('No token for user');
    error.name = 'NoToken';
    return error;
}
