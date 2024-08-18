import { Biome } from "@/enums/biome";
import { TimeOfDay } from "@/enums/time-of-day";
import { BiomePoolTier } from "@/data/biomes";

export const biomeValueMap = {
    [Biome.TOWN]: "TOWN",
    [Biome.PLAINS]: "PLAINS",
    [Biome.GRASS]: "GRASS",
    [Biome.TALL_GRASS]: "TALL_GRASS",
    [Biome.METROPOLIS]: "METROPOLIS",
    [Biome.FOREST]: "FOREST",
    [Biome.SEA]: "SEA",
    [Biome.SWAMP]: "SWAMP",
    [Biome.BEACH]: "BEACH",
    [Biome.LAKE]: "LAKE",
    [Biome.SEABED]: "SEABED",
    [Biome.MOUNTAIN]: "MOUNTAIN",
    [Biome.BADLANDS]: "BADLANDS",
    [Biome.CAVE]: "CAVE",
    [Biome.DESERT]: "DESERT",
    [Biome.ICE_CAVE]: "ICE_CAVE",
    [Biome.MEADOW]: "MEADOW",
    [Biome.POWER_PLANT]: "POWER_PLANT",
    [Biome.VOLCANO]: "VOLCANO",
    [Biome.GRAVEYARD]: "GRAVEYARD",
    [Biome.DOJO]: "DOJO",
    [Biome.FACTORY]: "FACTORY",
    [Biome.RUINS]: "RUINS",
    [Biome.WASTELAND]: "WASTELAND",
    [Biome.ABYSS]: "ABYSS",
    [Biome.SPACE]: "SPACE",
    [Biome.CONSTRUCTION_SITE]: "CONSTRUCTION_SITE",
    [Biome.JUNGLE]: "JUNGLE",
    [Biome.FAIRY_CAVE]: "FAIRY_CAVE",
    [Biome.TEMPLE]: "TEMPLE",
    [Biome.SLUM]: "SLUM",
    [Biome.SNOWY_FOREST]: "SNOWY_FOREST",
    [Biome.ISLAND]: "ISLAND",
    [Biome.LABORATORY]: "LABORATORY",
    [Biome.END]: "END"
};

export const timeOfDayValueMap = {
    [TimeOfDay.ALL]: "ALL",
    [TimeOfDay.DAWN]: "DAWN",
    [TimeOfDay.DAY]: "DAY",
    [TimeOfDay.DUSK]: "DUSK",
    [TimeOfDay.NIGHT]: "NIGHT"
}

export const biomePoolTierValueMap = {
    [BiomePoolTier.COMMON]: "COMMON",
    [BiomePoolTier.UNCOMMON]: "UNCOMMON",
    [BiomePoolTier.RARE]: "RARE",
    [BiomePoolTier.SUPER_RARE]: "SUPER_RARE",
    [BiomePoolTier.ULTRA_RARE]: "ULTRA_RARE",
    [BiomePoolTier.BOSS]: "BOSS",
    [BiomePoolTier.BOSS_RARE]: "BOSS_RARE",
    [BiomePoolTier.BOSS_SUPER_RARE]: "BOSS_SUPER_RARE",
    [BiomePoolTier.BOSS_ULTRA_RARE]: "BOSS_ULTRA_RARE"
}