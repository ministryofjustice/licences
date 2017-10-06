const request = require('supertest');
const sinon = require('sinon');
const express = require('express');
const path = require('path');

const {
    expect
} = require('../services/testSetup');

module.exports = {
    sinon,
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
