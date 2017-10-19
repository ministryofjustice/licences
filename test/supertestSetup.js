const request = require('supertest');
const sinon = require('sinon');
const express = require('express');
const path = require('path');
const nock = require('nock');
const bodyParser = require('body-parser');

const {
    expect,
    sandbox
} = require('./testSetup');

const testUser = {
    firstName: 'first',
    lastName: 'last',
    staffId: 'id',
    token: 'token'
};

module.exports = {
    sinon,
    sandbox,
    request,
    expect,
    nock,
    appSetup: function(route, user = testUser) {

        const app = express();

        app.use((req, res, next) => {
            req.user = user;
            next();
        });
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({extended: false}));
        app.use(route);
        app.set('views', path.join(__dirname, '../server/views'));
        app.set('view engine', 'pug');

        return app;
    }
};
