import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const INPUT_DIR = path.join(process.cwd(), 'public', 'img','pokemon', 'original');
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'img','pokemon', 'crop');

export async function GET(request) {
    console.log("----- Begin Crop -----");
    try {
        const files = fs.readdirSync(INPUT_DIR);
        const jsonFiles = files.filter(file => file.endsWith('.json'));

        for (const jsonFile of jsonFiles) {
            const baseName = path.basename(jsonFile, '.json');
            const outputFilePath = path.join(OUTPUT_DIR, `${baseName}.png`);

            if (fs.existsSync(outputFilePath)) {
                console.log(`File ${outputFilePath} already exists, skipping...`);
                continue;
            }

            const jsonFilePath = path.join(INPUT_DIR, jsonFile);
            const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

            const pngFilePath = path.join(INPUT_DIR, `${baseName}.png`);
            if (!fs.existsSync(pngFilePath)) {
                console.log(`PNG file ${pngFilePath} does not exist, skipping...`);
                continue;
            }

            const { frame } = jsonData.textures[0].frames.find(f => f.filename === '0001.png');

            await sharp(pngFilePath)
                .extract({ left: frame.x, top: frame.y, width: frame.w, height: frame.h })
                .toFile(outputFilePath);

            console.log(`Cropped image saved to ${outputFilePath}`);
        }

        return new Response(JSON.stringify({ message: 'Images cropped and saved successfully' }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Error cropping images:', error);
        return new Response(JSON.stringify({ message: 'Internal server error' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}
