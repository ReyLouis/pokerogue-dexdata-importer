import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

import { move as dataDE } from '@/locales/de/move';
import { move as dataEN } from '@/locales/en/move';
import { move as dataES } from '@/locales/es/move';
import { move as dataFR } from '@/locales/fr/move';
import { move as dataIT } from '@/locales/it/move';
import { move as dataKO } from '@/locales/ko/move';
import { move as dataPT_BR } from '@/locales/pt_BR/move';
import { move as dataZH_CN } from '@/locales/zh_CN/move';
import { move as dataZH_TW } from '@/locales/zh_TW/move';

interface MoveTranslationEntries {
  name: string;
  effect: string;
}

interface AbilityTranslationEntries {
  [key: string]: MoveTranslationEntries;
}

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'json', 'move');

export async function GET(request: NextRequest) {
  console.log("----- Begin Translation -----");
  try {
    const locales = [
      { locale: 'de', data: dataDE },
      { locale: 'en', data: dataEN },
      { locale: 'es', data: dataES },
      { locale: 'fr', data: dataFR },
      { locale: 'it', data: dataIT },
      { locale: 'ko', data: dataKO },
      { locale: 'pt-br', data: dataPT_BR },
      { locale: 'zh-cn', data: dataZH_CN },
      { locale: 'zh-tw', data: dataZH_TW },
    ];

    for (const { locale, data } of locales) {
      const outputFilePath = path.join(OUTPUT_DIR, locale, 'move.json');
      const dataTranslations = data as AbilityTranslationEntries;

      const transformedData = {
        Move: {},
      };

      for (const [key, value] of Object.entries(dataTranslations)) {
        transformedData.Move[key] = value.name;
      }

      fs.mkdirSync(path.dirname(outputFilePath), { recursive: true });
      fs.writeFileSync(outputFilePath, JSON.stringify(transformedData, null, 2));

      console.log(`Translation saved to ${outputFilePath}`);
    }

    return NextResponse.json({ message: 'Translations processed and saved successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error processing translations:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
