import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { SimpleTranslationEntries } from "@/interfaces/locales";

import { arenaFlyout as dataDE } from '@/locales/de/arena-flyout';
import { arenaFlyout as dataEN } from '@/locales/en/arena-flyout';
import { arenaFlyout as dataES } from '@/locales/es/arena-flyout';
import { arenaFlyout as dataFR } from '@/locales/fr/arena-flyout';
import { arenaFlyout as dataIT } from '@/locales/it/arena-flyout';
import { arenaFlyout as dataKO } from '@/locales/ko/arena-flyout';
import { arenaFlyout as dataPT_BR } from '@/locales/pt_BR/arena-flyout';
import { arenaFlyout as dataZH_CN } from '@/locales/zh_CN/arena-flyout';
import { arenaFlyout as dataZH_TW } from '@/locales/zh_TW/arena-flyout';

interface AbilityTranslationEntry {
  name: string;
  description: string;
}

interface AbilityTranslationEntries {
  [key: string]: AbilityTranslationEntry;
}

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'json', 'weather');

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
      const outputFilePath = path.join(OUTPUT_DIR, locale, 'weather.json');
      const dataTranslations = data as SimpleTranslationEntries;

      const transformedData = {
        Weather: {
        },
      };

      for (const [key, value] of Object.entries(dataTranslations)) {
        switch (key) {
          case "sunny":
          case "rain":
          case "sandstorm":
          case "hail":
          case "snow":
          case "fog":
          case "heavyRain":
          case "harshSun":
          case "strongWinds":
            transformedData.Weather[key] = value;
          default:
            break;
        }
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
