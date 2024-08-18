import { NextRequest, NextResponse } from "next/server";

import { pokemon as dataDE } from "@/locales/de/pokemon";
import { pokemon as dataEN } from '@/locales/en/pokemon';
import { pokemon as dataES } from '@/locales/es/pokemon';
import { pokemon as dataFR } from '@/locales/fr/pokemon';
import { pokemon as dataIT } from '@/locales/it/pokemon';
import { pokemon as dataKO } from '@/locales/ko/pokemon';
import { pokemon as dataPT_BR } from '@/locales/pt_BR/pokemon';
import { pokemon as dataZH_CN } from '@/locales/zh_CN/pokemon';
import { pokemon as dataZH_TW } from '@/locales/zh_TW/pokemon';

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
            { locale: 'pt_br', data: dataPT_BR },
            { locale: 'zh_cn', data: dataZH_CN },
            { locale: 'zh_tw', data: dataZH_TW }
        ];

        const client = await getDb().connect();
        await client.query('BEGIN');

        let insertCount = 0;

        for (const { locale, data } of locales) {
            // Gets text data for the current language
            const typeTranslations = data;

            console.log({locale});

            const insertQuery = `INSERT INTO prg_species_i18n (species_id, species_name, species_show_name, locale)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (species_id, locale) DO UPDATE SET
                    species_name = EXCLUDED.species_name,
                    species_show_name = EXCLUDED.species_show_name`;

            for (const [key, value] of Object.entries(typeTranslations)) {
  
                const res = await client.query('SELECT species_id FROM prg_species WHERE species_name = $1', [key]);
       
                if (res.rows.length > 0) {
                    const dataId = res.rows[0].species_id;

                    console.log({ dataId, key, value, locale });
                    
                    await client.query(insertQuery, [dataId, key, value, locale]);
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

        return NextResponse.json({ message: 'Types inserted successfully' }, { status: 200 })
    } catch (error) {
        console.error('Error inserting types:', error);
        return NextResponse.json({ error: 'Error inserting types' }, { status: 500 });
    }
}
