import { NextRequest, NextResponse } from "next/server";
import { speciesEggMoves } from "@/data/egg-moves";
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        console.debug("---------- Insert Moves Begin ----------");
        const client = await getDb().connect();
        await client.query('BEGIN');

        const insertQuery = `INSERT INTO prg_egg_move (move_id, species_id, species_slug) VALUES 
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

        for (let [species, moveList] of Object.entries(speciesEggMoves)) {
            let speciesSlug = speciesSlugEnumMap.get(String(species));

            for (let move of moveList) {
                client.query(insertQuery, [move, species, speciesSlug]);
                insertCount++;
            }

            // Commit once every 100 inserts
            if (insertCount >= 100) {
                await client.query('COMMIT');
                await client.query('BEGIN'); 
                console.log("Commit. Lastest data_id:" + species);
                insertCount = 0;
            }
        }

        await client.query('COMMIT');

        return NextResponse.json({ message: 'Data inserted successfully' }, { status: 200 })
    } catch (error) {
        console.error('Error inserting types:', error);
        return NextResponse.json({ error: 'Error inserting types' }, { status: 500 });
    }
}
