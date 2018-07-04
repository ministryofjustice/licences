require('dotenv').config();

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const dirtyChai = require('dirty-chai');
const sinonChai = require('sinon-chai');
const sinon = require('sinon');

// Test Assertion libraries
chai.use(chaiAsPromised);
chai.use(dirtyChai);
chai.use(sinonChai);


global.expect = chai.expect;
global.sinon = sinon;
