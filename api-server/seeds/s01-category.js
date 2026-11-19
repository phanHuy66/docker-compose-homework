

exports.seed = async function(knex) {
    const result = await knex('category').count('* as count').first();

    if (Number(result.count) === 0) {
        await knex('category').insert([
            {name: 'Dell'},
            {name: 'HP'},
            {name: 'Apple'},
            {name: 'Microsoft'},
            {name: 'Razer'},
            {name: 'Acer'},
            {name: 'Asus'},
        ]);
    }
};

