import { NextRequest, NextResponse } from "next/server";
import { Type as TypeEnum } from '@/enums/type';
import { getDb } from '@/lib/db';


const typeData = Object.keys(TypeEnum)
    .filter((key) => isNaN(Number(key))) 
    .map((key) => ({
        type_id: TypeEnum[key as keyof typeof TypeEnum],
        type_name: key, 
    }));

export async function GET(request: NextRequest) {
    try {
        console.debug("---------- Insert Types Begin ----------");
        
        const client = await getDb().connect();
        await client.query('BEGIN');

        const insertQuery = 'INSERT INTO prg_type (type_id, type_name) VALUES ($1, $2)';
        
        for (const type of typeData) {
          await client.query(insertQuery, [type.type_id, type.type_name]);
        }
    
        await client.query('COMMIT');

        return NextResponse.json({ message: 'Types inserted successfully' }, { status: 200 })
    } catch (error) {
        console.error('Error inserting types:', error);
        return NextResponse.json({ error: 'Error inserting types' }, { status: 500 });
    }
}
