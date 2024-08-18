CREATE TABLE prg_ability (
	id varchar DEFAULT uuid_generate_v4() NOT NULL,
	ability_id int4 NULL,
	ability_name varchar NULL,
	CONSTRAINT prg_ability_pk PRIMARY KEY (id),
	CONSTRAINT prg_ability_un_ability_id UNIQUE (ability_id)
);

CREATE TABLE prg_ability_i18n (
	id varchar DEFAULT uuid_generate_v4() NOT NULL,
	ability_id int4 NULL,
	ability_name varchar NULL,
	ability_description varchar NULL,
	ability_show_name varchar NULL,
	locale varchar NULL,
	CONSTRAINT prg_ability_i18n_pk PRIMARY KEY (id),
	CONSTRAINT prg_ability_i18n_un UNIQUE (ability_id, locale)
);

CREATE TABLE prg_biome (
	id varchar DEFAULT uuid_generate_v4() NOT NULL,
	biome varchar NULL,
	image_url varchar NULL,
	CONSTRAINT prg_biome_pk PRIMARY KEY (id),
	CONSTRAINT prg_biome_unique UNIQUE (biome)
);

CREATE TABLE prg_biome_connect (
	id varchar DEFAULT uuid_generate_v4() NOT NULL,
	from_biome varchar NULL,
	to_biome varchar NULL,
	chance float4 NULL,
	from_biome_img_url varchar NULL,
	to_biome_img_url varchar NULL,
	CONSTRAINT prg_biome_connect_pk PRIMARY KEY (id),
	CONSTRAINT prg_biome_connect_unique UNIQUE (from_biome, to_biome)
);

CREATE TABLE prg_biome_pool (
	id varchar DEFAULT uuid_generate_v4() NOT NULL,
	biome varchar NULL,
	tier varchar NULL,
	time_of_day varchar NULL,
	species_id int4 NULL,
	CONSTRAINT prg_biome_pool_pk PRIMARY KEY (id),
	CONSTRAINT prg_biome_pool_unique UNIQUE (biome, tier, species_id)
);

CREATE TABLE prg_egg_move (
	id varchar DEFAULT uuid_generate_v4() NOT NULL,
	move_id int4 NULL,
	species_id int4 NULL,
	species_slug varchar NULL,
	CONSTRAINT prg_egg_move_pk PRIMARY KEY (id),
	CONSTRAINT prg_egg_move_unique UNIQUE (move_id, species_slug)
);
CREATE INDEX prg_egg_move_move_id_idx ON public.prg_egg_move USING btree (move_id);
CREATE INDEX prg_egg_move_species_slug_idx ON public.prg_egg_move USING btree (species_slug);

CREATE TABLE prg_evolution (
	id varchar DEFAULT uuid_generate_v4() NOT NULL,
	pre_species_id varchar NULL,
	evo_species_id varchar NULL,
	evo_level int4 NULL,
	item_id int4 NULL,
	pre_form_key varchar NULL,
	evo_form_key varchar NULL,
	pre_slug varchar NULL,
	evo_slug varchar NULL,
	conditions jsonb NULL,
	item_name varchar NULL,
	CONSTRAINT prg_evolution_pk PRIMARY KEY (id),
	CONSTRAINT prg_evolution_unique_1 UNIQUE (pre_slug, evo_slug)
);

CREATE TABLE prg_level_move (
	id varchar DEFAULT uuid_generate_v4() NOT NULL,
	"level" int4 NULL,
	move_id int4 NULL,
	species_id int4 NULL,
	species_slug varchar NULL,
	CONSTRAINT prg_level_move_pk PRIMARY KEY (id),
	CONSTRAINT prg_level_move_unique UNIQUE (move_id, species_slug)
);
CREATE INDEX prg_level_move_move_id_idx ON public.prg_level_move USING btree (move_id);
CREATE INDEX prg_level_move_species_slug_idx ON public.prg_level_move USING btree (species_slug);

CREATE TABLE prg_move (
	id varchar DEFAULT uuid_generate_v4() NOT NULL,
	move_id int4 NULL,
	move_name varchar NULL,
	type_id int4 NULL,
	type_name varchar NULL,
	category int4 NULL,
	power int4 NULL,
	accuracy int4 NULL,
	pp int4 NULL,
	chance int4 NULL,
	generation int4 NULL,
	CONSTRAINT prg_move_pk PRIMARY KEY (id),
	CONSTRAINT prg_move_un_move_id UNIQUE (move_id)
);

CREATE TABLE prg_move_i18n (
	id varchar DEFAULT uuid_generate_v4() NOT NULL,
	move_id int4 NULL,
	move_name varchar NULL,
	move_effect varchar NULL,
	move_show_name varchar NULL,
	locale varchar NULL,
	CONSTRAINT prg_move_i18n_pk PRIMARY KEY (id),
	CONSTRAINT prg_move_i18n_unique UNIQUE (move_id, locale)
);

CREATE TABLE prg_pokemon_info (
	id varchar DEFAULT uuid_generate_v4() NOT NULL,
	species_id int4 NULL,
	form_index int4 NULL,
	species_name varchar NULL,
	form_name varchar NULL,
	form_key varchar NULL,
	image_url varchar NULL,
	generation int4 NULL,
	type1 int4 NULL,
	type2 int4 NULL,
	height float4 NULL,
	weight float4 NULL,
	ability1 int4 NULL,
	ability2 int4 NULL,
	ability_hidden int4 NULL,
	base_total int4 NULL,
	base_hp int4 NULL,
	base_atk int4 NULL,
	base_def int4 NULL,
	base_spatk int4 NULL,
	base_spdef int4 NULL,
	base_spd int4 NULL,
	catch_rate int4 NULL,
	base_friendship int4 NULL,
	base_exp int4 NULL,
	growth_rate int4 NULL,
	male_percent float4 NULL,
	gender_diffs bool NULL,
	species_intro varchar NULL,
	sub_legendary bool NULL,
	legendary bool NULL,
	mythical bool NULL,
	can_change_form bool NULL,
	slug varchar NULL,
	type1_name varchar NULL,
	type2_name varchar NULL,
	ability1_name varchar NULL,
	ability2_name varchar NULL,
	ability_hidden_name varchar NULL,
	starter_ability_id int4 NULL,
	starter_ability_name varchar NULL,
	starter_cost int4 NULL,
	is_deleted bool DEFAULT false NULL,
	CONSTRAINT prg_pokemon_info_pk PRIMARY KEY (id),
	CONSTRAINT prg_pokemon_info_un_1 UNIQUE (species_id, form_key),
	CONSTRAINT prg_pokemon_info_un_2 UNIQUE (slug)
);

CREATE TABLE prg_species (
	id varchar DEFAULT uuid_generate_v4() NOT NULL,
	species_id int4 NULL,
	species_name varchar NULL,
	CONSTRAINT prg_species_pk PRIMARY KEY (id),
	CONSTRAINT prg_species_un_species_id UNIQUE (species_id)
);

CREATE TABLE prg_species_i18n (
	id varchar DEFAULT uuid_generate_v4() NOT NULL,
	species_id int4 NULL,
	species_name varchar NULL,
	species_show_name varchar NULL,
	locale varchar NULL,
	CONSTRAINT prg_species_i18n_pk PRIMARY KEY (id),
	CONSTRAINT prg_species_i18n_un_1 UNIQUE (species_id, locale)
);

CREATE TABLE prg_tm_move (
	id varchar DEFAULT uuid_generate_v4() NOT NULL,
	move_id int4 NULL,
	species_id int4 NULL,
	species_slug varchar NULL,
	CONSTRAINT prg_tm_move_pk PRIMARY KEY (id),
	CONSTRAINT prg_tm_move_unique UNIQUE (move_id, species_slug)
);
CREATE INDEX prg_tm_move_move_id_idx ON public.prg_tm_move USING btree (move_id);
CREATE INDEX prg_tm_move_species_slug_idx ON public.prg_tm_move USING btree (species_slug);

CREATE TABLE prg_type (
	id varchar DEFAULT uuid_generate_v4() NOT NULL,
	type_id int4 NULL,
	type_name varchar NULL,
	CONSTRAINT prg_type_pk PRIMARY KEY (id),
	CONSTRAINT prg_type_un_type_id UNIQUE (type_id)
);

CREATE TABLE prg_type_i18n (
	id varchar DEFAULT uuid_generate_v4() NOT NULL,
	type_id int4 NULL,
	type_name varchar NULL,
	type_show_name varchar NULL,
	locale varchar NULL,
	CONSTRAINT prg_type_i18n_pk PRIMARY KEY (id),
	CONSTRAINT prg_type_i18n_un_type_id_locale UNIQUE (type_id, locale)
);