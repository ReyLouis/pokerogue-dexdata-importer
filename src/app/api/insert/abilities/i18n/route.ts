import { NextRequest, NextResponse } from "next/server";

import { ability as dataDE } from "@/locales/de/ability";
import { ability as dataEN } from '@/locales/en/ability';
import { ability as dataES } from '@/locales/es/ability';
import { ability as dataFR } from '@/locales/fr/ability';
import { ability as dataIT } from '@/locales/it/ability';
import { ability as dataKO } from '@/locales/ko/ability';
import { ability as dataPT_BR } from '@/locales/pt_BR/ability';
import { ability as dataZH_CN } from '@/locales/zh_CN/ability';
import { ability as dataZH_TW } from '@/locales/zh_TW/ability';

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

            const insertQuery = `INSERT INTO prg_ability_i18n (ability_id, ability_name, ability_show_name, ability_description, locale)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (ability_id, locale) DO UPDATE SET
                    ability_name = EXCLUDED.ability_name,
                    ability_description = EXCLUDED.ability_description,
                    ability_show_name = EXCLUDED.ability_show_name`;

            for (const [key, value] of Object.entries(typeTranslations)) {

                const res = await client.query('SELECT ability_id FROM prg_ability WHERE ability_name = $1', [key]);
                
                if (res.rows.length > 0) {
                    const dataId = res.rows[0].ability_id;

                    let description = value.description;
                    description = description.replaceAll('\n','').replaceAll('ＨＰ','HP').replaceAll('ＰＰ','PP');

                    await client.query(insertQuery, [dataId, key, value.name, description, locale]);
                    
                    insertCount++;

                    // Commit once every 100 inserts
                    if (insertCount >= 100) {
                        await client.query('COMMIT');
                        // Start new transaction
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

        return NextResponse.json({ message: 'Types inserted successfully' }, { status: 200 })
    } catch (error) {
        console.error('Error inserting types:', error);
        return NextResponse.json({ error: 'Error inserting types' }, { status: 500 });
    }
}
