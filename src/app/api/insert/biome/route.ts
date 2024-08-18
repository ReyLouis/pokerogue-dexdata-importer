

import { getDb } from '@/lib/db';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import FormData from 'form-data';
import { uploadImg } from '@/utils/imgUtils';

import { Biome } from '@/enums/biome';


const INPUT_DIR = path.join(process.cwd(), 'public', 'img', 'biomes', 'merged');
const R2_BASE_URL = process.env.R2_BASE_URL;

// Create a mapping of enum values to enum names
const BiomeEnumMap = new Map<string, string>();
Object.keys(Biome).forEach(key => {
    if (isNaN(Number(key))) {
        const value = String(Biome[key as keyof typeof Biome]);
        BiomeEnumMap.set(value, key);
    }
});

export async function GET(request) {
    try {
        console.log("----- Begin Upload -----");

        const client = await getDb().connect();

        //Traverse the biome enum
        Object.keys(Biome).forEach(async key => {
            if (isNaN(Number(key)) && 'END' == String(key)) {
                let biomeName = String(key);
                const imagePath = path.join(INPUT_DIR, `${biomeName}.png`);
                if (!fs.existsSync(imagePath)) {
                    console.log(`Image ${biomeName}.png does not exist, skipping...`);                    
                } else {
                    let imgNameTemp = biomeName.replaceAll('_','-').toLowerCase();
                    const fullImageName = `biome/${imgNameTemp}.webp`;
                    const imageUrl = await uploadImg(imagePath, fullImageName);

                    const insertQuery = `INSERT INTO prg_biome (biome, image_url) VALUES ($1, $2) 
                    ON CONFLICT (biome) DO UPDATE SET 
                    image_url = $2
                    `;
                    await client.query(insertQuery, [biomeName, imageUrl]);
                    console.log("Succ Img:" + imageUrl);
                }

            }
        });

        return new Response(JSON.stringify({ message: 'Images processed and uploaded successfully' }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Error processing images:', error);
        return new Response(JSON.stringify({ message: 'Internal server error' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}
