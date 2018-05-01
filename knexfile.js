const config = require('./server/config');

module.exports = {
    client: 'pg',
    connection: {
        host: config.db.server,
        user: config.db.username,
        password: config.db.password,
        database: config.db.database
    },
    acquireConnectionTimeout: 5000
};
