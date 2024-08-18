import { NextRequest, NextResponse } from "next/server";
import { getDb } from '@/lib/db';
import { Biome } from '@/enums/biome'; 

import { biomeLinks } from '@/data/biomes';

// Create a mapping of enum values to enum names
const BiomeEnumMap = new Map<string, string>();
Object.keys(Biome).forEach(key => {
    if (isNaN(Number(key))) {
        const value = String(Biome[key as keyof typeof Biome]);
        BiomeEnumMap.set(value, key);
    }
});

// Auxiliary function: calculates the arrival probability
function calculateChances(links: any): Map<string, number> {
    const chances = new Map<string, number>();
    let remainingChance = 1;
    let unweightedCount = 0;
  
    // Handle the weighted biomes first
    if (Array.isArray(links)) {
      links.forEach(link => {
        if (Array.isArray(link)) {
          const [biome, weight] = link;
          const chance = Number(((100 / weight) / 100).toFixed(2));
          chances.set(String(biome), chance);
          remainingChance -= chance;
        } else {
          unweightedCount++;
        }
      });
    } else if (typeof links === 'number') {
      chances.set(String(links), 1);
      return chances;
    } else {
      unweightedCount = 1;
    }
  
    // Then deal with biomes that are not heavy
    if (unweightedCount > 0) {
      const unweightedChance = Number((remainingChance / unweightedCount).toFixed(2));
      if (Array.isArray(links)) {
        links.forEach(link => {
          if (!Array.isArray(link)) {
            chances.set(String(link), unweightedChance);
          }
        });
      } else if (typeof links !== 'number') {
        chances.set(String(links), 1);
      }
    }
  
    return chances;
  }

// Prepare biome data
const biomeData = Object.entries(biomeLinks).flatMap(([fromBiome, toLinks]) => {
    const fromBiomeName = BiomeEnumMap.get(fromBiome) || fromBiome;
    const chances = calculateChances(toLinks);
  
    return Array.from(chances.entries()).map(([toBiome, chance]) => ({
      from_biome: fromBiomeName,
      to_biome: BiomeEnumMap.get(toBiome) || toBiome,
      chance: chance
    }));
  });

export async function GET(request: NextRequest) {
    const client = await getDb().connect();
    try {
        console.debug("---------- Insert Biomes Begin ----------");

        await client.query('BEGIN');
        const insertQuery = 'INSERT INTO prg_biome_connect (from_biome, to_biome, chance) VALUES ($1, $2, $3) ON CONFLICT (from_biome, to_biome) DO UPDATE SET chance = $3';

        for (const biome of biomeData) {
            await client.query(insertQuery, [biome.from_biome, biome.to_biome, biome.chance]);
          }    

        await client.query('COMMIT');
        return NextResponse.json({ message: 'Biomes inserted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error inserting biomes:', error);
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Error inserting biomes' }, { status: 500 });
    } finally {
        client.release();
    }
}