import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

import { ability as dataDE } from '@/locales/de/ability';
import { ability as dataEN } from '@/locales/en/ability';
import { ability as dataES } from '@/locales/es/ability';
import { ability as dataFR } from '@/locales/fr/ability';
import { ability as dataIT } from '@/locales/it/ability';
import { ability as dataKO } from '@/locales/ko/ability';
import { ability as dataPT_BR } from '@/locales/pt_BR/ability';
import { ability as dataZH_CN } from '@/locales/zh_CN/ability';
import { ability as dataZH_TW } from '@/locales/zh_TW/ability';

interface AbilityTranslationEntry {
  name: string;
  description: string;
}

interface AbilityTranslationEntries {
  [key: string]: AbilityTranslationEntry;
}

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'json', 'ability');

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
      const outputFilePath = path.join(OUTPUT_DIR, locale, 'ability.json');
      const abilityTranslations = data as AbilityTranslationEntries;

      const transformedData = {
        Ability: {},
      };

      for (const [key, value] of Object.entries(abilityTranslations)) {
        transformedData.Ability[key] = value.name;
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
