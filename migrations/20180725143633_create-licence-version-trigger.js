const versionFunction = `
    create function version_update_function()
    returns trigger as
    $func$
        BEGIN
            update licences set version = version + 1
            where nomis_id = NEW.nomis_id and version in (
                select max(version)
                from licence_versions
                where nomis_id = NEW.nomis_id
            );
        return new;
        END
    $func$ LANGUAGE plpgsql;
`;

const versionTrigger = `
    create trigger version_update_trigger
    after update on licences
    for each row
    execute procedure version_update_function()
`;

exports.up = knex =>
    Promise.all([
        knex.raw(versionFunction),
        knex.raw(versionTrigger)
    ]);

exports.down = knex =>
    Promise.all([
        knex.raw('drop trigger version_update_trigger on licences;'),
        knex.raw('drop function version_update_function')
    ]);
