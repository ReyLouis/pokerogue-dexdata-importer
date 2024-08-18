import { NextRequest, NextResponse } from "next/server";
import { Abilities } from '@/enums/abilities';
import { getDb } from '@/lib/db';


const insertData = Object.keys(Abilities)
    // Filter out enum string keys
    .filter((key) => isNaN(Number(key))) 
    .map((key) => ({
        ability_id: Abilities[key as keyof typeof Abilities],
        ability_name: toCamelCase(key), 
    }));

function toCamelCase(str: string) {
    const parts = str.split('_');
    const camelCaseParts = parts.map((part, index) => {
        if (index === 0) {
            return part.toLowerCase();
        } else {
            return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
        }
    });
    return camelCaseParts.join('');
}

export async function GET(request: NextRequest) {
    try {
        console.debug("---------- Insert Abilities Begin ----------");        
        const client = await getDb().connect();        
        await client.query('BEGIN');

        const insertQuery = 'INSERT INTO prg_ability (ability_id, ability_name) VALUES ($1, $2)';
        let insertCount = 0; 

        for (const data of insertData) {
            // Query whether the species ID already exists
            const existsQuery = 'SELECT 1 FROM prg_ability WHERE ability_id = $1';
            const existsResult = await client.query(existsQuery, [data.ability_id]);
            // If the species ID does not exist, insert the data
            if (existsResult.rows.length === 0) { 
                await client.query(insertQuery, [data.ability_id, data.ability_name]);
                insertCount++;
            }
            // Commit once every 100 inserts
            if (insertCount >= 100) {
                await client.query('COMMIT');
                // Start new transaction
                await client.query('BEGIN');
                console.log("Commit. Lastest data_id:" + data.ability_id);
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
