import { allSpecies, speciesStarters, starterPassiveAbilities } from '../data/pokemon-species';
import { Species } from '@/enums/species';
import { Type } from '@/enums/type';
import { Abilities } from '@/enums/abilities';
import PokemonSpecies from '../data/pokemon-species';

interface PokemonInfo {
  species_id: number;
  form_index: number;
  species_name: string;
  form_name: string;
  form_key: string;
  image_url: string | null;
  generation: number;
  type1: number;
  type2: number | null;
  height: number;
  weight: number;
  ability1: number;
  ability2: number | null;
  ability_hidden: number | null;
  base_total: number;
  base_hp: number;
  base_atk: number;
  base_def: number;
  base_spatk: number;
  base_spdef: number;
  base_spd: number;
  catch_rate: number;
  base_friendship: number;
  base_exp: number;
  growth_rate: number;
  male_percent: number | null;
  gender_diffs: boolean;
  species_intro: string;
  sub_legendary: boolean;
  legendary: boolean;
  mythical: boolean;
  can_change_form: boolean;
  type1_name: string;
  type2_name: string | null;
  ability1_name: string;
  ability2_name: string | null;
  ability_hidden_name: string | null;
  starter_ability_id: number;
  starter_ability_name: string;
  starter_cost: number;
  slug: string;
}

export const toKebabCase = (str: string): string => {
  return str.replaceAll('_', '-').toLowerCase();
}

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

export function flattenPokemonSpecies(allSpecies: PokemonSpecies[]): PokemonInfo[] {
  const speciesEnumMap = new Map<string, string>();
  const typeEnumMap = new Map<string, string>();
  const abilityEnumMap = new Map<string, string>();

  // Create a mapping of enum values to enum names
  Object.keys(Species).forEach(key => {
    if (isNaN(Number(key))) {
      const value = String(Species[key as keyof typeof Species]); 
      speciesEnumMap.set(value, key.toLowerCase());
    }
  });

  Object.keys(Type).forEach(key => {
    if (isNaN(Number(key))) {
      const value = String(Type[key as keyof typeof Type]); 
      typeEnumMap.set(value, key.toUpperCase()); 
    }
  });

  Object.keys(Abilities).forEach(key => {
    if (isNaN(Number(key))) {
      const value = String(Abilities[key as keyof typeof Abilities]); 
      abilityEnumMap.set(value, toCamelCase(key)); 
    }
  });


  const flattenedData: PokemonInfo[] = [];

  allSpecies.forEach(species => {
    // If there is no form, push directly into the base form
    if (!species.forms || species.forms.length === 0) {
      flattenedData.push({
        species_id: species.speciesId,
        form_index: 0,
        species_name: speciesEnumMap.get(String(species.speciesId)),
        form_name: '',
        form_key: '',
        image_url: null,
        generation: species.generation,
        type1: species.type1,
        type2: species.type2,
        height: species.height,
        weight: species.weight,
        ability1: species.ability1,
        ability2: species.ability2,
        ability_hidden: species.abilityHidden,
        base_total: species.baseTotal,
        base_hp: species.baseStats[0],
        base_atk: species.baseStats[1],
        base_def: species.baseStats[2],
        base_spatk: species.baseStats[3],
        base_spdef: species.baseStats[4],
        base_spd: species.baseStats[5],
        catch_rate: species.catchRate,
        base_friendship: species.baseFriendship,
        base_exp: species.baseExp,
        growth_rate: species.growthRate,
        male_percent: species.malePercent,
        gender_diffs: species.genderDiffs,
        species_intro: species.species,
        sub_legendary: species.subLegendary,
        legendary: species.legendary,
        mythical: species.mythical,
        can_change_form: species.canChangeForm,
        type1_name: typeEnumMap.get(String(species.type1)),
        type2_name: typeEnumMap.get(String(species.type2)),
        ability1_name: abilityEnumMap.get(String(species.ability1)),
        ability2_name: abilityEnumMap.get(String(species.ability2)),
        ability_hidden_name: abilityEnumMap.get(String(species.abilityHidden)),
        starter_ability_id: starterPassiveAbilities[species.speciesId],
        starter_ability_name: abilityEnumMap.get(String(starterPassiveAbilities[species.speciesId])),
        starter_cost: speciesStarters[species.speciesId],
        slug: toKebabCase(speciesEnumMap.get(String(species.speciesId)))
      });
    } else {
      // Deal with each form
      species.forms.forEach((form, formIndex) => {
        flattenedData.push({
          species_id: species.speciesId,
          form_index: formIndex,
          species_name: speciesEnumMap.get(String(species.speciesId)),
          form_name: form.formName,
          form_key: form.formKey,
          image_url: null,
          generation: species.generation,
          type1: form.type1,
          type2: form.type2,
          height: form.height,
          weight: form.weight,
          ability1: form.ability1,
          ability2: form.ability2,
          ability_hidden: form.abilityHidden,
          base_total: form.baseTotal,
          base_hp: form.baseStats[0],
          base_atk: form.baseStats[1],
          base_def: form.baseStats[2],
          base_spatk: form.baseStats[3],
          base_spdef: form.baseStats[4],
          base_spd: form.baseStats[5],
          catch_rate: form.catchRate,
          base_friendship: form.baseFriendship,
          base_exp: form.baseExp,
          growth_rate: species.growthRate,
          male_percent: species.malePercent,
          gender_diffs: species.genderDiffs,
          species_intro: species.species,
          sub_legendary: species.subLegendary,
          legendary: species.legendary,
          mythical: species.mythical,
          can_change_form: species.canChangeForm,
          type1_name: typeEnumMap.get(String(form.type1)),
          type2_name: typeEnumMap.get(String(form.type2)),
          ability1_name: abilityEnumMap.get(String(form.ability1)),
          ability2_name: abilityEnumMap.get(String(form.ability2)),
          ability_hidden_name: abilityEnumMap.get(String(form.abilityHidden)),
          starter_ability_id: starterPassiveAbilities[species.speciesId],
          starter_ability_name: abilityEnumMap.get(String(starterPassiveAbilities[species.speciesId])),
          starter_cost: speciesStarters[species.speciesId],
          slug: toKebabCase(speciesEnumMap.get(String(species.speciesId)) + '-' + form.formKey)
        });
      });
    }
  });

  return flattenedData;
}

