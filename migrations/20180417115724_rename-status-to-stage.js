
exports.up = function(knex, Promise) {
    knex.raw('exec sp_rename \'LICENCES.STATUS\', \'STAGE\', \'COLUMN\'');
};

exports.down = function(knex, Promise) {
    knex.raw('exec sp_rename \'LICENCES.STAGE\', \'STATUS\', \'COLUMN\'');
};
