const logger = require('../../log');

exports.getIndex = function(req, res) {
    logger.debug('GET /dashboard');

    return res.render('dashboard/index', dashboardInfo);
};


const dashboardInfo = {
    required: [
        {
            name: 'Andrews, Mark',
            nomsId: 'A1235HG',
            establishment: 'HMP Manchester',
            dischargeDate: '01/11/2017',
            inProgress: false
        },
        {
            name: 'Bryanston, David',
            nomsId: 'A6627JH',
            establishment: 'HMP Birmingham',
            dischargeDate: '10/07/2017',
            inProgress: true
        }
    ]
};
