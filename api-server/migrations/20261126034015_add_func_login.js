
exports.up = async function(knex) {
    await knex.raw(`
        CREATE FUNCTION public.login(
            username TEXT, password TEXT
        ) RETURNS public.result AS $$
        DECLARE
            auth_info private.authentication;
        BEGIN
            SELECT a.* INTO auth_info
            FROM private.authentication AS a
            WHERE a.username = $1;

            IF FOUND THEN
                IF auth_info.password_hash = crypt($2, auth_info.password_hash) THEN
                    RETURN (
                        true,
                        0,
                        'Login successfully',
                        jsonb_build_object('role', auth_info.rolename)
                    )::public.result;
                ELSE
                    RETURN (
                        false,
                        1,
                        'Invalid username or password',
                        '{}'::jsonb
                    )::public.result;
                END IF;
            ELSE
                RETURN (
                    false,
                    1,
                    'Username does not exists',
                    '{}'::jsonb
                )::public.result;
            END IF;
        END;
        $$ LANGUAGE plpgsql STRICT SECURITY DEFINER;
    `);
};

exports.down = async function(knex) {
    await knex.raw(`
        DROP FUNCTION IF EXISTS public.login(TEXT, TEXT);
    `);
};
