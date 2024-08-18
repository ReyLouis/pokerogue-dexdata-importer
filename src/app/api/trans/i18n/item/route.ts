import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { ModifierTypeTranslationEntries } from "@/interfaces/locales";

import { modifierType as dataDE } from '@/locales/de/modifier-type';
import { modifierType as dataEN } from '@/locales/en/modifier-type';
import { modifierType as dataES } from '@/locales/es/modifier-type';
import { modifierType as dataFR } from '@/locales/fr/modifier-type';
import { modifierType as dataIT } from '@/locales/it/modifier-type';
import { modifierType as dataKO } from '@/locales/ko/modifier-type';
import { modifierType as dataPT_BR } from '@/locales/pt_BR/modifier-type';
import { modifierType as dataZH_CN } from '@/locales/zh_CN/modifier-type';
import { modifierType as dataZH_TW } from '@/locales/zh_TW/modifier-type';

interface AbilityTranslationEntry {
  name: string;
  description: string;
}

interface AbilityTranslationEntries {
  [key: string]: AbilityTranslationEntry;
}

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'json','item');

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
      const outputFilePath = path.join(OUTPUT_DIR, locale, 'item.json');
      const abilityTranslations = data as ModifierTypeTranslationEntries;

      const transformedData = {
        Item: {
          EvolutionItem:{}
        } ,
      };

      for (const [key, value] of Object.entries(abilityTranslations.EvolutionItem)) {
        transformedData.Item.EvolutionItem[key] = value;
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
