const config = require('./server/config');

module.exports = {
    client: 'mssql',
    connection: {
        server: config.db.server,
        user: config.db.username,
        password: config.db.password,
        database: config.db.database,
        options: {
            encrypt: true
        }
    },
    acquireConnectionTimeout: 5000
};
