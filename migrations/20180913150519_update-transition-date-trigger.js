const stageChangeFunction = `
    create function transition_date_update_function()
    returns trigger as
    $func$
        BEGIN
            update licences set transition_date = current_timestamp;
            return null;
        END
    $func$ LANGUAGE plpgsql;
`;

const stageChangeTrigger = `
    create trigger transition_date_update_trigger
    after update of stage on licences
    for each row
    execute procedure transition_date_update_function()
`;

exports.up = knex =>
    Promise.all([
        knex.raw(stageChangeFunction),
        knex.raw(stageChangeTrigger)
    ]);

exports.down = knex =>
    Promise.all([
        knex.raw('drop trigger transition_date_update_trigger on licences;'),
        knex.raw('drop function transition_date_update_function')
    ]);
