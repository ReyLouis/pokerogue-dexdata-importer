import { NextRequest, NextResponse } from "next/server";
import { pokemonInfo as pokemonInfoDE } from '@/locales/de/pokemon-info';
import { pokemonInfo as pokemonInfoEN } from '@/locales/en/pokemon-info';
import { pokemonInfo as pokemonInfoES } from '@/locales/es/pokemon-info';
import { pokemonInfo as pokemonInfoFR } from '@/locales/fr/pokemon-info';
import { pokemonInfo as pokemonInfoIT } from '@/locales/it/pokemon-info';
import { pokemonInfo as pokemonInfoKO } from '@/locales/ko/pokemon-info';
import { pokemonInfo as pokemonInfoPT_BR } from '@/locales/pt_BR/pokemon-info';
import { pokemonInfo as pokemonInfoZH_CN } from '@/locales/zh_CN/pokemon-info';
import { pokemonInfo as pokemonInfoZH_TW } from '@/locales/zh_TW/pokemon-info';

import { getDb } from '@/lib/db';


export async function GET(request: NextRequest) {
    try {
        console.debug("---------- Insert Types i18n Begin ----------");

        const locales = [
            { locale: 'de', data: pokemonInfoDE },
            { locale: 'en', data: pokemonInfoEN },
            { locale: 'es', data: pokemonInfoES },
            { locale: 'fr', data: pokemonInfoFR },
            { locale: 'it', data: pokemonInfoIT },
            { locale: 'ko', data: pokemonInfoKO },
            { locale: 'pt_br', data: pokemonInfoPT_BR },
            { locale: 'zh_cn', data: pokemonInfoZH_CN },
            { locale: 'zh_tw', data: pokemonInfoZH_TW }
        ];

        const client = await getDb().connect();
        await client.query('BEGIN');

        let insertCount = 0; 

        for (const { locale, data } of locales) {
            // Gets text data for the current language
            const typeTranslations = data.Type;

            const insertQuery = `INSERT INTO prg_type_i18n (type_id, type_name, type_show_name, locale)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (type_id, locale) DO UPDATE SET
                    type_name = EXCLUDED.type_name,
                    type_show_name = EXCLUDED.type_show_name`;

            for (const [key, value] of Object.entries(typeTranslations)) {
                
                const res = await client.query('SELECT type_id FROM prg_type WHERE type_name = $1', [key]);
                
                if (res.rows.length > 0) {
                    const typeId = res.rows[0].type_id;

                    await client.query(insertQuery, [typeId, key, value, locale]);
                    insertCount++;                    

                    // Commit once every 100 inserts
                    if (insertCount >= 100) {
                        await client.query('COMMIT');
                        await client.query('BEGIN'); 
                        console.log("Commit. Lastest data_id:" + typeId + ' locale:' + locale);
                        insertCount = 0;
                    }
                } else {
                    console.warn(`No matching type found for key: ${key}`);
                }
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
