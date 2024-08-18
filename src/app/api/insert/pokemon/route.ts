import { NextRequest, NextResponse } from "next/server";
import { getDb } from '@/lib/db';
import { flattenPokemonSpecies } from '@/lib/flattenPokemonSpecies';
import { allSpecies, initSpecies } from '@/data/pokemon-species'; 

export async function GET(request: NextRequest) {

    initSpecies();
    const flattenedPokemonData = flattenPokemonSpecies(allSpecies);
    const client = await getDb().connect();
    try {
        await client.query('BEGIN');

        const insertQuery = `
      INSERT INTO prg_pokemon_info (
        species_id, form_index, species_name, form_name, form_key, image_url, generation, type1, type2, height, weight,
        ability1, ability2, ability_hidden, base_total, base_hp, base_atk, base_def, base_spatk, base_spdef, base_spd,
        catch_rate, base_friendship, base_exp, growth_rate, male_percent, gender_diffs, species_intro,
        sub_legendary, legendary, mythical, can_change_form, 
        type1_name, type2_name, ability1_name, ability2_name, ability_hidden_name, starter_ability_id, starter_ability_name, starter_cost, slug

      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
        $12, $13, $14, $15, $16, $17, $18, $19, $20, $21,
        $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32,
        $33, $34, $35, $36, $37, $38, $39, $40, $41
      )
        ON CONFLICT (species_id, form_key) DO UPDATE SET
            type1 = EXCLUDED.type1,
            type2 = EXCLUDED.type2,
            type1_name = EXCLUDED.type1_name,
            type2_name = EXCLUDED.type2_name,
            ability1 = EXCLUDED.ability1,
            ability2 = EXCLUDED.ability2,
            ability_hidden = EXCLUDED.ability_hidden,
            ability1_name = EXCLUDED.ability1_name,
            ability2_name = EXCLUDED.ability2_name,
            ability_hidden_name = EXCLUDED.ability_hidden_name,
            starter_ability_id = EXCLUDED.starter_ability_id,
            starter_ability_name = EXCLUDED.starter_ability_name,
            starter_cost = EXCLUDED.starter_cost,
            slug = EXCLUDED.slug
    `;
        let insertCount = 0; 

        for (const pokemon of flattenedPokemonData) {

                await client.query(insertQuery, [
                    pokemon.species_id, pokemon.form_index, pokemon.species_name, pokemon.form_name, pokemon.form_key, pokemon.image_url, pokemon.generation, pokemon.type1, pokemon.type2, pokemon.height, pokemon.weight,
                    pokemon.ability1, pokemon.ability2, pokemon.ability_hidden, pokemon.base_total, pokemon.base_hp, pokemon.base_atk, pokemon.base_def, pokemon.base_spatk, pokemon.base_spdef, pokemon.base_spd,
                    pokemon.catch_rate, pokemon.base_friendship, pokemon.base_exp, pokemon.growth_rate, pokemon.male_percent, pokemon.gender_diffs, pokemon.species_intro,
                    pokemon.sub_legendary, pokemon.legendary, pokemon.mythical, pokemon.can_change_form,
                    pokemon.type1_name, pokemon.type2_name, pokemon.ability1_name, pokemon.ability2_name, pokemon.ability_hidden_name, pokemon.starter_ability_id, pokemon.starter_ability_name, pokemon.starter_cost, pokemon.slug                    
                ]);
                insertCount++;


            // Commit once every 100 inserts
            if (insertCount >= 100) {
                await client.query('COMMIT');
                await client.query('BEGIN'); 
                console.log("Commit. Lastest data_id:" + pokemon.species_id);
                insertCount = 0;
            }
        }

        // Commit the remaining insert operations
        if (insertCount > 0) {
            await client.query('COMMIT');
        }


        return NextResponse.json({ message: 'Types inserted successfully' }, { status: 200 })
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error inserting types' }, { status: 500 });
    } finally {
        client.release();
    }
}
