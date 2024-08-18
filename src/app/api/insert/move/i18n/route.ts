import { NextRequest, NextResponse } from "next/server";

import { move as dataDE } from "@/locales/de/move";
import { move as dataEN } from '@/locales/en/move';
import { move as dataES } from '@/locales/es/move';
import { move as dataFR } from '@/locales/fr/move';
import { move as dataIT } from '@/locales/it/move';
import { move as dataKO } from '@/locales/ko/move';
import { move as dataPT_BR } from '@/locales/pt_BR/move';
import { move as dataZH_CN } from '@/locales/zh_CN/move';
import { move as dataZH_TW } from '@/locales/zh_TW/move';

import { getDb } from '@/lib/db';


export async function GET(request: NextRequest) {
    try {
        console.debug("---------- Insert Species i18n Begin ----------");

        const locales = [
            { locale: 'de', data: dataDE },
            { locale: 'en', data: dataEN },
            { locale: 'es', data: dataES },
            { locale: 'fr', data: dataFR },
            { locale: 'it', data: dataIT },
            { locale: 'ko', data: dataKO },
            { locale: 'pt-br', data: dataPT_BR },
            { locale: 'zh-cn', data: dataZH_CN },
            { locale: 'zh-tw', data: dataZH_TW }
        ];

        const client = await getDb().connect();
        await client.query('BEGIN');

        let insertCount = 0; 

        for (const { locale, data } of locales) {
            // Gets text data for the current language
            const typeTranslations = data;

            const insertQuery = `INSERT INTO prg_move_i18n (move_id, move_name, move_show_name, move_effect, locale)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (move_id, locale) DO UPDATE SET
                    move_name = EXCLUDED.move_name,
                    move_show_name = EXCLUDED.move_show_name,
                    move_effect = EXCLUDED.move_effect
                    `;

            for (const [key, value] of Object.entries(typeTranslations)) {

                const res = await client.query('SELECT move_id FROM prg_move WHERE move_name = $1', [key]);                
                if (res.rows.length > 0) {
                    const dataId = res.rows[0].move_id;
                    let effect = value.effect;
                    effect = effect.replaceAll('\n','').replaceAll('ＨＰ','HP').replaceAll('ＰＰ','PP');

                    await client.query(insertQuery, [dataId, key, value.name, effect, locale]);
                    
                    insertCount++;

                    // Commit once every 100 inserts
                    if (insertCount >= 100) {
                        await client.query('COMMIT');
                        await client.query('BEGIN'); 
                        console.log("Commit. Lastest data_id:" + dataId + ' locale:' + locale);
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

        return NextResponse.json({ message: 'Data inserted successfully' }, { status: 200 })
    } catch (error) {
        console.error('Error inserting types:', error);
        return NextResponse.json({ error: 'Error inserting types' }, { status: 500 });
    }
}
