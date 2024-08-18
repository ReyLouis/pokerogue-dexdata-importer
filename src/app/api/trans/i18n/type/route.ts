import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { PokemonInfoTranslationEntries } from "@/interfaces/locales";

import { pokemonInfo as dataDE } from '@/locales/de/pokemon-info';
import { pokemonInfo as dataEN } from '@/locales/en/pokemon-info';
import { pokemonInfo as dataES } from '@/locales/es/pokemon-info';
import { pokemonInfo as dataFR } from '@/locales/fr/pokemon-info';
import { pokemonInfo as dataIT } from '@/locales/it/pokemon-info';
import { pokemonInfo as dataKO } from '@/locales/ko/pokemon-info';
import { pokemonInfo as dataPT_BR } from '@/locales/pt_BR/pokemon-info';
import { pokemonInfo as dataZH_CN } from '@/locales/zh_CN/pokemon-info';
import { pokemonInfo as dataZH_TW } from '@/locales/zh_TW/pokemon-info';

interface AbilityTranslationEntry {
  name: string;
  description: string;
}

interface AbilityTranslationEntries {
  [key: string]: AbilityTranslationEntry;
}

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'json' ,'type');

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
      const outputFilePath = path.join(OUTPUT_DIR, locale, 'type.json');
      const abilityTranslations = data as PokemonInfoTranslationEntries;

      const transformedData = {
        Type: {},
      };

      for (const [key, value] of Object.entries(abilityTranslations.Type)) {
        transformedData.Type[key] = value;
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
