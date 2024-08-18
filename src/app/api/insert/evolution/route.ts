
import { NextRequest, NextResponse } from "next/server";
import { getDb } from '@/lib/db';
import { pokemonEvolutions, initPokemonPrevolutions, SpeciesEvolution, SpeciesFriendshipEvolutionCondition, EvolutionItem } from '@/data/pokemon-evolutions';
import { Species } from '@/enums/species';

export async function GET(request: NextRequest) {
    //Initialize the evolution data
    initPokemonPrevolutions(); 

    // Create a mapping of enum values to enum names
    const speciesEnumMap = new Map<string, string>();
    Object.keys(Species).forEach(key => {
        if (isNaN(Number(key))) {
            const value = String(Species[key as keyof typeof Species]); 
            speciesEnumMap.set(value, key.toLowerCase());
        }
    });

    const evoItemEnumMap = new Map<string, string>();
    Object.keys(EvolutionItem).forEach(key => {
        if (isNaN(Number(key))) {
            const value = String(EvolutionItem[key as keyof typeof EvolutionItem]); 
            evoItemEnumMap.set(value, key);
        }
    });

    const client = await getDb().connect();
    try {
        await client.query('BEGIN');

        const insertQuery = `
        INSERT INTO prg_evolution (
            pre_species_id, evo_species_id, evo_level, item_id, item_name, pre_form_key, evo_form_key, pre_slug, evo_slug, conditions
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (pre_slug, evo_slug) DO UPDATE SET
            evo_level = EXCLUDED.evo_level,
            item_id = EXCLUDED.item_id,
            item_name = EXCLUDED.item_name,
            pre_slug = EXCLUDED.pre_slug,
            evo_slug = EXCLUDED.evo_slug,
            conditions = EXCLUDED.conditions
        `;

        let insertCount = 0;

        for (const [speciesKey, evolutions] of Object.entries(pokemonEvolutions)) {
            const preSpeciesId = speciesKey;

            for (const evolution of evolutions) {
                const evoSpeciesId = evolution.speciesId.toString();

                // Only evolutionary chains with special evolutionary requirements are dealt with
                // if (!evolution.condition){
                //     continue;
                // }

                const conditions = parseEvolutionCondition(evolution);
                let preFormKey = evolution.preFormKey;
                let evoFormKey = evolution.evoFormKey;

                await client.query(insertQuery, [
                    preSpeciesId,
                    evoSpeciesId,
                    evolution.level,
                    evolution.item,
                    evoItemEnumMap.get(String(evolution.item)),
                    evolution.preFormKey || null,
                    evolution.evoFormKey || null,
                    getSlugBySpeciesId(speciesEnumMap.get(preSpeciesId), preFormKey), 
                    getSlugBySpeciesId(speciesEnumMap.get(evoSpeciesId), evoFormKey), 
                    conditions ? JSON.stringify(conditions) : null
                ]);

                insertCount++;

                if (insertCount >= 50) {
                    await client.query('COMMIT');
                    await client.query('BEGIN');
                    console.log(`Commit. Latest preSpeciesId: ${preSpeciesId}, evoSpeciesId: ${evoSpeciesId}`);
                    insertCount = 0;
                }
            }
        }

        if (insertCount > 0) {
            await client.query('COMMIT');
        }

        console.log(`All Commit.`);
        return NextResponse.json({ message: 'Evolutions inserted successfully' }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error inserting evolutions' }, { status: 500 });
    } finally {
        client.release();
    }
}


function parseEvolutionCondition(evolution: SpeciesEvolution): any {
    let conditions = {} as any;

    if (evolution.condition) {
        const predicateStr = evolution.condition.predicate.toString();

        // Deal with gender conditions
        if (predicateStr.includes('gender')) {
            const genderMatch = predicateStr.match(/Gender\.(\w+)/);
            if (genderMatch) conditions.gender = genderMatch[1];
        }

        // Deal with biome condition
        if (predicateStr.includes('biomeType')) {
            const biomeMatch = predicateStr.match(/Biome\.(\w+)/g);

            if (biomeMatch) {
                const biomes = biomeMatch.map(match => match.split('.')[1]);
                conditions.biomes = biomes;
            }
        }

        // Deal with TimeOfDay condition
        if (predicateStr.includes('getTimeOfDay')) {
            const timeOfDayMatch = predicateStr.match(/TimeOfDay\.(\w+)/g);
            // conditions.timeOfDay = [];

            if (timeOfDayMatch) {
                const timeOfDays = timeOfDayMatch.map(match => match.split('.')[1]);
                conditions.timeOfDays = timeOfDays;
            }
        }

        // Deal with Weather condition
        if (predicateStr.includes('WeatherType')) {
            const weatherMatch = predicateStr.match(/WeatherType\.(\w+)/g);
            if (weatherMatch) {
                const weathers = weatherMatch.map(match => match.split('.')[1])
                    .filter(weather => weather !== 'NONE');
                conditions.weathers = weathers;
            }
        }

        // Deal with Ability condition
        if (predicateStr.includes('Nature')) {
            const naturesMatch = predicateStr.match(/Nature\.(\w+)/g);
            if (naturesMatch) {
                const natures = naturesMatch.map(match => match.split('.')[1]);
                conditions.natures = natures;
            }
        }

        // Deal with Moves condition
        if (predicateStr.includes('Moves')) {
            const moveMatch = predicateStr.match(/Moves\.(\w+)/g);
            if (moveMatch) {
                const moves = moveMatch.map(match => match.split('.')[1]);
                conditions.moves = moves;
            }
        }

        // Deal with Moves Type condition
        if (predicateStr.includes('getMove().type')) {
            const typeMatch = predicateStr.match(/Type\.(\w+)/g);
            if (typeMatch) {
                const moveTypes = typeMatch.map(match => match.split('.')[1]);
                conditions.moveTypes = moveTypes;
            }
        }

        // Deal with Pokemon Unlock condition
        if (predicateStr.includes('gameData.dexData')) {
            const speciesMatch = predicateStr.match(/Species\.(\w+)/g);
            if (speciesMatch) {
                const unlockPokes = speciesMatch.map(match => match.split('.')[1].toLowerCase());
                conditions.unlockPokes = unlockPokes;
            }
        }

        // Deal with Friendship condition
        if (evolution.condition instanceof SpeciesFriendshipEvolutionCondition) {
            conditions.friendship = evolution.condition.friendshipAmount;
        }


        //Special cases of Pokemon manually add conditions
        //sylveon
        if (700 == evolution.speciesId) {
            conditions.moveTypes = ["FAIRY"];
        }
        //espeon
        if (196 == evolution.speciesId) {
            conditions.timeOfDays = ["DAY"];
        }
        //umbreon
        if (197 == evolution.speciesId) {
            conditions.timeOfDays = ["NIGHT"];
        }
        //pangoro
        if (675 == evolution.speciesId) {
            conditions.partyTypes = ["DARK"];
        }
        //lycanroc(dusk)
        if (745 == evolution.speciesId && 'dusk' == evolution.evoFormKey) {
            conditions.abilities = ['ownTempo'];
        }
        //shedinja
        if (292 == evolution.speciesId) {
            conditions.shedinja = 'shedinja';
        }
        //hitmonlee
        if (106 == evolution.speciesId) {
            conditions.atkVsDef = '>';
        }
        //hitmonchan
        if (107 == evolution.speciesId) {
            conditions.atkVsDef = '<';
        }
        //hitmontop
        if (237 == evolution.speciesId) {
            conditions.atkVsDef = '=';
        }

    }

    return Object.keys(conditions).length > 0 ? conditions : null;
}


function getSlugBySpeciesId(name: string, form_key: string) {
    let slug = name
    if (null != form_key && '' != form_key) {
        slug = slug + '-' + form_key;
    }
    slug = slug.replaceAll('_', '-').toLowerCase();
    return slug;
}