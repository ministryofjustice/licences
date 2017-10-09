const request = require('supertest');
const sinon = require('sinon');
const express = require('express');
const path = require('path');

const {
    expect,
    sandbox
} = require('../services/testSetup');

module.exports = {
    sinon,
    sandbox,
    request,
    expect,
    appSetup: function(route) {
        const app = express();

        app.use(route);
        app.set('views', path.join(__dirname, '../../server/views'));
        app.set('view engine', 'pug');

        return app;
    }
};
