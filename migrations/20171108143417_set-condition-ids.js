exports.up = knex =>
    knex.raw('DBCC CHECKIDENT (\'[CONDITIONS]\', RESEED, 0)');


exports.down = knex =>
    knex.raw('DBCC CHECKIDENT (\'[CONDITIONS]\', RESEED)');
