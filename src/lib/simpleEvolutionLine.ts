import { pokemonEvolutions } from '@/data/pokemon-evolutions';
import { Species } from '@/enums/species';

export function initEvolutionLine() {
    //The key in the line is the Pokemon id, and the value is an array of all Pokemon ids for that evolution line
    let line = {} as any;

    //Traverse the Species
    Object.keys(Species).forEach(key => {

        if (!isNaN(Number(key))) {
            let speciesId = Number(key)
            let evolutionLine = [speciesId];
            //Traverse the evolutionary line
            for (let i = 0; i < evolutionLine.length; i++) {
                let targetSpecies = evolutionLine[i];
                //See if the species in the evolutionary line can still evolve
                if (pokemonEvolutions[targetSpecies] && pokemonEvolutions[targetSpecies].length > 0) {
                    let evoArr = pokemonEvolutions[targetSpecies];
                    for (let j in evoArr){                        
                        let targetSpeciesEvo = Number(evoArr[j].speciesId);
                        if (!evolutionLine.includes(targetSpeciesEvo)) {
                            evolutionLine.push(targetSpeciesEvo);
                        }
                    }
                }
            }

            //Synchronizing all species in the same evolutionary line
            for (let i = 0; i < evolutionLine.length; i++) {
                let targetSpecies = evolutionLine[i];
                if (!line[targetSpecies] || evolutionLine.length > line[targetSpecies].length) {
                    line[targetSpecies] = evolutionLine;
                }
            }
        }
    });

    return line;
}