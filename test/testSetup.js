require('dotenv').config();

const sinon = require('sinon');
const sinonStubPromise = require('sinon-stub-promise');
sinonStubPromise(sinon);
const sandbox = sinon.sandbox.create();
const chai = require('chai');
const expect = chai.expect;
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
chai.use(require('chai-as-promised'));
chai.use(require('dirty-chai'));

module.exports = {
    sandbox,
    expect
};
