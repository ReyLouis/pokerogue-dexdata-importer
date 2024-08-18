import { NextRequest, NextResponse } from "next/server";
import { tmSpecies } from "@/data/tms";
import { Species } from '@/enums/species';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        console.debug("---------- Insert Moves Begin ----------");
        const client = await getDb().connect();
        await client.query('BEGIN');

        const insertQuery = `INSERT INTO prg_tm_move (move_id, species_id, species_slug) VALUES 
        ($1, $2, $3)
                ON CONFLICT (move_id, species_slug) DO UPDATE SET
                    species_id = EXCLUDED.species_id
        `;

        const speciesSlugEnumMap = new Map<string, string>();

        const slugListQuery = `select species_id, slug from prg_pokemon_info where form_index = 0 `;
        let { rows: slugRows } = await client.query(slugListQuery);
        for (let item of slugRows) {
            speciesSlugEnumMap.set(String(item.species_id), String(item.slug));
        }

        let insertCount = 0; 

        for (let [move, speciesList] of Object.entries(tmSpecies)) {

            for (const item of speciesList) {
                if (Array.isArray(item)) {

                    let species_id = item[0];
                    for (let i = 1; i < item.length; i++) {
                        let form_key = item[i];
                        if (species_id == Species.DEOXYS && "" == form_key) {
                            form_key = "normal";
                        }
                        if (species_id == Species.TOXTRICITY && "low-key" == form_key) {
                            form_key = "lowkey";
                        }

                        let slugQuery = `select slug from prg_pokemon_info where species_id = $1 and form_key = $2 `;
                        let { rows: slugAnswer } = await client.query(slugQuery, [species_id, form_key]);
                        if (slugAnswer.length > 0) {
                            client.query(insertQuery, [move, species_id, slugAnswer[0].slug]);
                            insertCount++;
                        } else {
                            console.log("PokemonInfo Not Found. species_id: " + species_id + " form_key: " + form_key);
                        }

                    }

                } else {
                    let species_id = item;
                    let speciesSlug = speciesSlugEnumMap.get(String(species_id));
                    client.query(insertQuery, [move, species_id, speciesSlug]);
                    insertCount++;
                }

                // Commit once every 100 inserts
                if (insertCount >= 100) {
                    await client.query('COMMIT');
                    await client.query('BEGIN'); 
                    console.log("Commit. Lastest data_id:" + move);
                    insertCount = 0;
                }

            }

        }

        await client.query('COMMIT');

        return NextResponse.json({ message: 'Data inserted successfully' }, { status: 200 })
    } catch (error) {
        console.error('Error inserting types:', error);
        return NextResponse.json({ error: 'Error inserting types' }, { status: 500 });
    }
}
