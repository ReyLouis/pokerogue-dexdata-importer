import { NextRequest, NextResponse } from "next/server";
import { getDb } from '@/lib/db';
import { allSpecies, speciesStarters, starterPassiveAbilities } from '@/data/pokemon-species';
import { initEvolutionLine } from "@/lib/simpleEvolutionLine";
import { Abilities } from '@/enums/abilities';

function toCamelCase(str: string) {
    const parts = str.split('_');
    const camelCaseParts = parts.map((part, index) => {
        if (index === 0) {
            return part.toLowerCase();
        } else {
            return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
        }
    });
    return camelCaseParts.join('');
}

export async function GET(request: NextRequest) {
    try {

        const client = await getDb().connect();

        //Get the evolutionary route of species

        let evolutionLineSet = initEvolutionLine();
        let starterMap = new Map<number, number>();
        let costMap = new Map<number, number>();

        //map of property values and names
        const abilityEnumMap = new Map<number, string>();

        //Gets passive properties, initial cost points
        Object.keys(starterPassiveAbilities).forEach(key => {
            if (!isNaN(Number(key))) {
                // Get enum value
                const value = Number(starterPassiveAbilities[key]); 
                starterMap.set(Number(key), value);
            }
        });

        Object.keys(speciesStarters).forEach(key => {
            if (!isNaN(Number(key))) {
                const value = Number(speciesStarters[key]); 
                costMap.set(Number(key), value);
            }
        });

        //Attribute id enum mapping
        Object.keys(Abilities).forEach(key => {
            if (isNaN(Number(key))) {
                const value = Number(Abilities[key as keyof typeof Abilities]); 
                abilityEnumMap.set(value, toCamelCase(key)); 
            }
        });

        //Traverse the evolutionary path
        Object.keys(evolutionLineSet).forEach(async key => {
            if (!isNaN(Number(key))) {
                //The passivity and cost of the current species
                let passiveAbility = starterMap.get(Number(key));
                let startCost = costMap.get(Number(key));

                if (null == passiveAbility || null == startCost) {
                    //Initial form of evolutionary line
                    let initForm = evolutionLineSet[key][0];
                    let initFormpassiveAbilities = starterMap.get(initForm);
                    let initFormStartCost = costMap.get(initForm);
                    
                    const query = `select id, species_id ,starter_ability_id , starter_cost  from prg_pokemon_info ppi 
                            where (ppi.starter_ability_id is null or ppi.starter_cost is null )
                            and species_id = $1;`;
                    const queryResult = await client.query(query, [Number(key)]);
                    
                    //Traverse the species form found, initialize passive, and cost
                    for (let i = 0; i < queryResult.rows.length; i++) {
                        let dbId = queryResult.rows[i].id;
                        let passiveAbilityDb = queryResult.rows[i].starter_ability_id;
                        let startCostDb = queryResult.rows[i].starter_cost;

                        if (null != initFormpassiveAbilities && null == passiveAbilityDb) {
                            passiveAbilityDb = initFormpassiveAbilities;
                        }

                        if (null != initFormStartCost && null == startCostDb) {
                            startCostDb = initFormStartCost;
                        }
                        let passiveAbilityName = abilityEnumMap.get(passiveAbilityDb);

                       
                        const insertQuery = `update prg_pokemon_info set starter_ability_id = $1 , starter_ability_name =$2 , starter_cost = $3 
                            where id = $4;`;
                        await client.query(insertQuery, [passiveAbilityDb, passiveAbilityName, startCostDb, dbId]);
                       
                    }

                }
            }
        });



        return NextResponse.json({ message: 'Evolution init successfully' }, { status: 200 })
    } catch (error) {
        console.error('Error inserting types:', error);
        return NextResponse.json({ error: 'Error inserting types' }, { status: 500 });
    }
}
