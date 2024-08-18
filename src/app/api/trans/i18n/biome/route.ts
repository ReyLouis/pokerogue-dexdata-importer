import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { SimpleTranslationEntries } from "@/interfaces/locales";

// 导入所有语言的 ability 数据
import { biome as dataDE } from '@/locales/de/biome';
import { biome as dataEN } from '@/locales/en/biome';
import { biome as dataES } from '@/locales/es/biome';
import { biome as dataFR } from '@/locales/fr/biome';
import { biome as dataIT } from '@/locales/it/biome';
import { biome as dataKO } from '@/locales/ko/biome';
import { biome as dataPT_BR } from '@/locales/pt_BR/biome';
import { biome as dataZH_CN } from '@/locales/zh_CN/biome';
import { biome as dataZH_TW } from '@/locales/zh_TW/biome';

interface AbilityTranslationEntry {
  name: string;
  description: string;
}

interface AbilityTranslationEntries {
  [key: string]: AbilityTranslationEntry;
}

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'json','biome');

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
      const outputFilePath = path.join(OUTPUT_DIR, locale, 'biome.json');
      const dataTranslations = data as SimpleTranslationEntries;

      const transformedData = {
        Biome: {          
        } ,
      };

      for (const [key, value] of Object.entries(dataTranslations)) {
        transformedData.Biome[key] = value;
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
