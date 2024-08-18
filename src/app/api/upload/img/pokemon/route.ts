

import { getDb } from '@/lib/db';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import FormData from 'form-data';
import { uploadImg } from '@/utils/imgUtils';


const INPUT_DIR = path.join(process.cwd(), 'public', 'img', 'crop');
const R2_BASE_URL = process.env.R2_BASE_URL;

export async function GET(request) {
  try {
    console.log("----- Begin Upload -----");

    const client = await getDb().connect();
    const existsQuery = 'SELECT species_id,form_key,image_url FROM prg_pokemon_info';
    const existsResult = await client.query(existsQuery);


    for (const record of existsResult.rows) {
      let imageUrlDb = record.image_url;
      if (null != imageUrlDb && '' != imageUrlDb){
        continue;
      }

      let imageName = record.form_key ? `${record.species_id}-${record.form_key}` : `${record.species_id}`;  
      const imagePath = path.join(INPUT_DIR, `${imageName}.png`);

      if (!fs.existsSync(imagePath)) {
        console.log(`Image ${imageName}.png does not exist, skipping...`);
        continue;
      }

      const fullImageName = `pokemon/${imageName}.webp`;
      const imageUrl = await uploadImg(imagePath, fullImageName);

      // Update the image url field in the database
      let updateQuery = 'UPDATE prg_pokemon_info SET image_url = $1 where species_id = $2 and form_key = $3'
      await client.query(updateQuery,[imageUrl,record.species_id,record.form_key]);
      console.log("Succ Img:"+imageUrl);
      
    }

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
