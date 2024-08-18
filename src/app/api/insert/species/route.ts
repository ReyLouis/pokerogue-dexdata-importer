import { NextRequest, NextResponse } from "next/server";
import { Species } from '@/enums/species';
import { getDb } from '@/lib/db';

const insertData = Object.keys(Species)
    .filter((key) => isNaN(Number(key)))
    .map((key) => ({
        species_id: Species[key as keyof typeof Species],
        species_name: key.toLowerCase(),
    }));

export async function GET(request: NextRequest) {
    try {
        console.debug("---------- Insert Species Begin ----------");

        const client = await getDb().connect();  
        await client.query('BEGIN');

        const insertQuery = 'INSERT INTO prg_species (species_id, species_name) VALUES ($1, $2)';
        let insertCount = 0; 

        for (const data of insertData) {

            const existsQuery = 'SELECT 1 FROM prg_species WHERE species_id = $1';
            const existsResult = await client.query(existsQuery, [data.species_id]);

            if (existsResult.rows.length === 0) { 
                await client.query(insertQuery, [data.species_id, data.species_name]);
                insertCount++;
            }

            // Commit once every 100 inserts
            if (insertCount >= 100) {
                await client.query('COMMIT');
                await client.query('BEGIN'); 
                console.log("Commit. Lastest data_id:" + data.species_id);
                insertCount = 0;
            }

        }

        // Commit the remaining insert operations
        if (insertCount > 0) {
            await client.query('COMMIT');
        }

        return NextResponse.json({ message: 'Types inserted successfully' }, { status: 200 })
    } catch (error) {
        console.error('Error inserting types:', error);
        return NextResponse.json({ error: 'Error inserting types' }, { status: 500 });
    }
}
