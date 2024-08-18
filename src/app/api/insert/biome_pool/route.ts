import { NextRequest, NextResponse } from "next/server";
import { getDb } from '@/lib/db';
import { Biome } from '@/enums/biome';
import { TimeOfDay } from "@/enums/time-of-day";
import { Species } from "@/enums/species";
import { biomeValueMap, timeOfDayValueMap, biomePoolTierValueMap } from "@/config/enumValueMap";
import { BiomePoolTier, BiomeTierPokemonPools, biomePokemonPools, PokemonPools, SpeciesTree } from '@/data/biomes';


export interface PokemonEntry {
    speciesId: Species;
    timeOfDay: string[];
}

export type OrganizedBiomePokemonData = Record<BiomePoolTier, PokemonEntry[]>;

// Create a mapping of enum values to enum names
const BiomeEnumMap = new Map<string, string>();
Object.keys(Biome).forEach(key => {
    if (isNaN(Number(key))) {
        const value = String(Biome[key as keyof typeof Biome]);
        BiomeEnumMap.set(value, key);
    }
});

export async function GET(request: NextRequest) {
    const client = await getDb().connect();
    try {
        console.debug("---------- Insert Biomes Pool Begin ----------");

        await client.query('BEGIN');

        const batchSize = 100;

        Object.keys(Biome).forEach(async key => {
            if (isNaN(Number(key)) && 'END' != String(key)) {
                const biomeValue = String(Biome[key as keyof typeof Biome]);
                const biomeData: BiomeTierPokemonPools = biomePokemonPools[biomeValue];
                let biomeStr = String(key);

                const result: OrganizedBiomePokemonData = {
                    [BiomePoolTier.COMMON]: [],
                    [BiomePoolTier.UNCOMMON]: [],
                    [BiomePoolTier.RARE]: [],
                    [BiomePoolTier.SUPER_RARE]: [],
                    [BiomePoolTier.ULTRA_RARE]: [],
                    [BiomePoolTier.BOSS]: [],
                    [BiomePoolTier.BOSS_RARE]: [],
                    [BiomePoolTier.BOSS_SUPER_RARE]: [],
                    [BiomePoolTier.BOSS_ULTRA_RARE]: []
                };

                //Traverse rarity
                Object.entries(biomeData).forEach(([tierKey, tierData]) => {

                    const tier = parseInt(tierKey) as BiomePoolTier;

                    //Traversal Time-Of-Day
                    Object.entries(tierData).forEach(([timeKey, pokemonList]: [string, PokemonPools[keyof PokemonPools]]) => {
                        const time = parseInt(timeKey) as TimeOfDay;

                        //Traverse Species
                        pokemonList.forEach((entry: Species | SpeciesTree) => {
                            if (typeof entry === 'number') {
                                addPokemonToResult(result, tier, entry, time);                                
                            } else {
                                Object.entries(entry).forEach(([level, speciesList]) => {
                                    speciesList.forEach(species => {
                                        addPokemonToResult(result, tier, species, time, parseInt(level));                                        
                                    });
                                });
                            }
                        });
                    });
                });

                let values = [];

                // Prepare data for storage
                Object.entries(result).forEach(([tier, pokemonEntries]) => {
                    let tierStr = biomePoolTierValueMap[tier];
                    pokemonEntries.forEach(entry => {
                        let timeStr = entry.timeOfDay.join(",");
                        values.push(`('${biomeStr}', '${tierStr}', '${timeStr}', '${entry.speciesId}')`);
                    });
                });

                // Batch Commit
                for (let i = 0; i < values.length; i += batchSize) {
                    const batch = values.slice(i, i + batchSize);
                    const query = `INSERT INTO prg_biome_pool (biome, tier, time_of_day, species_id) VALUES ${batch.join(',')}
                                ON CONFLICT (biome, tier, species_id) DO UPDATE SET 
                                time_of_day = EXCLUDED.time_of_day
                    `;
                    await client.query(query);
                    console.log(`Inserted ${batch.length} rows. Biome:${biomeStr}`);
                }

            }
        });


        await client.query('COMMIT');
        return NextResponse.json({ message: 'Biomes Pool inserted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error inserting data:', error);
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Error inserting data' }, { status: 500 });
    } finally {
        client.release();
    }
}


function addPokemonToResult(result: OrganizedBiomePokemonData, tier: BiomePoolTier, speciesId: Species, time: TimeOfDay, evolutionLevel?: number) {
    const existingEntry = result[tier].find(entry => entry.speciesId === speciesId);

    if (existingEntry) {
        if (!existingEntry.timeOfDay.includes(timeOfDayValueMap[time])) {
            existingEntry.timeOfDay.push(timeOfDayValueMap[time]);
        }
    } else {
        const newEntry: PokemonEntry = { speciesId: speciesId, timeOfDay: [timeOfDayValueMap[time]] };
        result[tier].push(newEntry);
    }
}
