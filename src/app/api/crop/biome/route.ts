import { NextRequest, NextResponse } from "next/server";
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const INPUT_DIR = path.join(process.cwd(), 'public', 'img', 'biomes', 'original');
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'img', 'biomes', 'merged');

const TARGET_WIDTH = 320;
const TARGET_HEIGHT = 132;

async function mergeImages(biomeName) {
    const images = [];
    const baseNames = ['bg', 'b', 'a'];
    const extraNames = ['b_1', 'b_2', 'b_3'];

    // Deal Background image
    const bgPath = path.join(INPUT_DIR, `${biomeName}_bg.png`);
    if (fs.existsSync(bgPath)) {
        const bgBuffer = await sharp(bgPath)
            .resize(TARGET_WIDTH, TARGET_HEIGHT, { fit: 'cover', position: 'top' })
            .toBuffer();
        images.push({ input: bgBuffer, top: 0, left: 0 });
    }

    // Deal other image
    for (const name of [...baseNames.slice(1), ...extraNames]) {
        const filePath = path.join(INPUT_DIR, `${biomeName}_${name}.png`);
        if (fs.existsSync(filePath)) {
            const image = sharp(filePath);
            const metadata = await image.metadata();

            // If the image is larger than the target size, scale it
            if (metadata.width > TARGET_WIDTH || metadata.height > TARGET_HEIGHT) {
                image.resize(TARGET_WIDTH, TARGET_HEIGHT, { 
                    fit: 'inside', 
                    withoutEnlargement: true 
                });
            }

            const resizedBuffer = await image.toBuffer();
            const resizedMetadata = await sharp(resizedBuffer).metadata();

            const top = Math.floor(Math.max(0, (TARGET_HEIGHT - resizedMetadata.height) / 2));
            const left = Math.floor(Math.max(0, (TARGET_WIDTH - resizedMetadata.width) / 2));

            images.push({ input: resizedBuffer, top, left });
        }
    }

    // Create a transparent background
    const background = await sharp({
        create: {
            width: TARGET_WIDTH,
            height: TARGET_HEIGHT,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 }
        }
    }).png().toBuffer();

    const outputPath = path.join(OUTPUT_DIR, `${biomeName.toUpperCase()}.png`);
    await sharp(background)
        .composite(images)
        .toFile(outputPath);

    return outputPath;
}

export async function GET(request: NextRequest) {
    try {
        if (!fs.existsSync(OUTPUT_DIR)) {
            fs.mkdirSync(OUTPUT_DIR, { recursive: true });
        }

        const biomeNames = fs.readdirSync(INPUT_DIR)
            .filter(file => file.endsWith('_a.png'))
            .map(file => file.replace('_a.png', ''));

        const mergedImages = [];

        for (const biomeName of biomeNames) {
            const outputPath = await mergeImages(biomeName);
            mergedImages.push(outputPath);
            console.log(`Merged image saved to ${outputPath}`);
        }

        return NextResponse.json({ 
            message: 'Biome images merged successfully', 
            mergedImages 
        }, { status: 200 });
    } catch (error) {
        console.error('Error merging biome images:', error);
        return NextResponse.json({ error: 'Error merging biome images', details: error.message }, { status: 500 });
    }
}