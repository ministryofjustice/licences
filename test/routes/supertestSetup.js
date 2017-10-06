const request = require('supertest');
const sinon = require('sinon');
const express = require('express');
const path = require('path');
const chai = require('chai');
const sinonChai = require('sinon-chai');
chai.use(require('dirty-chai'));
chai.use(sinonChai);
const expect = chai.expect;

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
