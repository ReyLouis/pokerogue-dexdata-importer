import { NextRequest, NextResponse } from "next/server";
import { allMoves, initMoves } from "@/data/move"
import { Moves } from '@/enums/moves';
import { Type } from '@/enums/type';
import { getDb } from '@/lib/db';

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
        console.debug("---------- Insert Moves Begin ----------");
        const client = await getDb().connect();
        await client.query('BEGIN');

        const insertQuery = `INSERT INTO prg_move (move_id, move_name, type_id, type_name, category, power, accuracy, pp, chance, generation) VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                ON CONFLICT (move_id) DO UPDATE SET
                    move_name = EXCLUDED.move_name,
                    type_id = EXCLUDED.type_id,
                    type_name = EXCLUDED.type_name,
                    category = EXCLUDED.category,
                    power = EXCLUDED.power,
                    accuracy = EXCLUDED.accuracy,
                    pp = EXCLUDED.pp,
                    chance = EXCLUDED.chance,
                    generation = EXCLUDED.generation
        `;

        const moveEnumMap = new Map<string, string>();
        const typeEnumMap = new Map<string, string>();

        Object.keys(Type).forEach(key => {
            if (isNaN(Number(key))) {
                const value = String(Type[key as keyof typeof Type]);      
                typeEnumMap.set(value, key.toUpperCase()); 
            }
        });

        Object.keys(Moves).forEach(key => {
            if (isNaN(Number(key))) {
                const value = String(Moves[key as keyof typeof Moves]);    
                moveEnumMap.set(value, toCamelCase(key)); 
            }
        });

        // Initializes the move data
        initMoves();

        let insertCount = 0;

        for (let move of allMoves) {
            if (move.id == Moves.NONE) {
                continue;
            }

            await client.query(insertQuery, [move.id, moveEnumMap.get(String(move.id)), move.type, typeEnumMap.get(String(move.type)), 
                move.category, move.power, move.accuracy, move.pp, move.chance, move.generation]);
            insertCount++;

            // Commit once every 100 inserts
            if (insertCount >= 100) {
                await client.query('COMMIT');
                await client.query('BEGIN'); 
                console.log("Commit. Lastest data_id:" + move.id);
                insertCount = 0;
                return NextResponse.json({ error: 'Break' }, { status: 500 });
            }

        }

        if (insertCount > 0) {
            await client.query('COMMIT');
        }

        return NextResponse.json({ message: 'Data inserted successfully' }, { status: 200 })
    } catch (error) {
        console.error('Error inserting types:', error);
        return NextResponse.json({ error: 'Error inserting types' }, { status: 500 });
    }
}
