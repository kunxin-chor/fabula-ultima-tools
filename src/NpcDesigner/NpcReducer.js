import spieces from "./species.json"

// Create a reducer function to handle state updates
function npcReducer(state, action) {
    switch (action.type) {

        case "UPDATE_FIELD": {
            return {
                ...state,
                [action.payload.name]: action.payload.value
            }
        }

        case "UPDATE_ELEMENTAL_AFFINITY": {
            const { element, value } = action.payload;
            const updatedElementalAffinities = {
                ...state.elementalAffinities,
                [element]: value
            }
            return {
                ...state,
                elementalAffinities: updatedElementalAffinities
            }
        }

        case "UPDATE_AFFINITY": {
            const { affinity, value } = action.payload;
            const newElementalAffinities = {
                ...state.elementalAffinities,
                [affinity]: value,
            };

            return {
                ...state,
                elementalAffinities: newElementalAffinities,
            };
        }

        case "UPDATE_SPECIES": {
            const selectedSpecies = action.payload.species;
            const speciesData = spieces[selectedSpecies];

            // Merge elemental affinities with the current state
            const elementalAffinities = {
                ...state.elementalAffinities,
                ...speciesData.elementalAffinities,
            };

            return {
                ...state,
                species: selectedSpecies,
                baseSkillPoints: speciesData.startingSkills,
                skills: speciesData.startingSkills,
                elementalAffinities: elementalAffinities,
                customActions: speciesData.customActions,
                freeResistances: speciesData.freeResistances || 0,
                freeImmunities: speciesData.freeImmunities || 0,

            };
        }


        case "UPDATE_ATTRIBUTE": {
            return {
                ...state,
                attributes: {
                    ...state.attributes,
                    [action.payload.attribute]: action.payload.value
                }
            }
        }

        // Add new traitsd
        case "ADD_TRAIT": {
            const updatedTraits = [...state.traits, ""];
            return {
                ...state,
                traits: updatedTraits
            }
        }
        // Handle different actions here    
        case "UPDATE_TRAIT_TEXT": {
            const { index, value } = action.payload;
            const updatedTraits = [...state.traits.slice(0, index), value, ...state.traits.slice(index + 1)];
            return {
                ...state,
                traits: updatedTraits
            }
        }

        case "UPDATE_IMPROVED_DEFENSE": {
            const { index, value } = action.payload;
            const improved_defenses = [...state.skillOptions.improved_defenses];
            improved_defenses[index] = value;

            return {
                ...state,
                skillOptions: {
                    ...state.skillOptions,
                    improved_defenses,
                },
            };
        }

        case "UPDATE_SPECIALIZED": {
            const { option, value } = action.payload;
            const specialized = { ...state.skillOptions.specialized, [option]: value };

            return {
                ...state,
                skillOptions: {
                    ...state.skillOptions,
                    specialized,
                },
            };
        }

        case "UPDATE_IMPROVED_HIT_POINTS": {
            const { value } = action.payload;

            return {
                ...state,
                skillOptions: {
                    ...state.skillOptions,
                    improved_hit_points: value,
                },
            };
        }

        case "UPDATE_IMPROVED_INITIATIVE": {
            const { value } = action.payload;

            return {
                ...state,
                skillOptions: {
                    ...state.skillOptions,
                    improved_initative: value,
                },
            };
        }

        case 'TOGGLE_USE_EQUIPMENT':
            return {
                ...state,
                skillOptions: {
                    ...state.skillOptions,
                    use_equipment: action.payload.value,
                },
            };
        

        case 'UPDATE_SHIELD': {
            return {
                ...state,
                selected_shield: {
                    ...state.selected_shield,
                    [action.payload.key]: action.payload.value,
                },
            };
        }

        case 'UPDATE_ARMOR': {
            return {
                ...state,
                selected_armor: {       
                    ...state.selected_armor,
                    [action.payload.key]: action.payload.value,

                    
                }
               
            };
        }

        case "ADD_WEAPON_ATTACK":
            return {
                ...state,
                weaponAttacks: [
                    ...state.weaponAttacks,
                    {
                        name: "",
                        weapon: {},
                        extraDamage: false,
                        specialEffect: {
                            description: "",
                            cost: 0,
                        },
                    },
                ],
            };

        case "UPDATE_WEAPON_ATTACK_NAME":
            return {
                ...state,
                weaponAttacks: state.weaponAttacks.map((weaponAttack, index) =>
                    index === action.payload.index
                        ? { ...weaponAttack, name: action.payload.name }
                        : weaponAttack
                ),
            };


        case "UPDATE_WEAPON_ATTACK_WEAPON":
            return {
                ...state,
                weaponAttacks: state.weaponAttacks.map((weaponAttack, index) =>
                    index === action.payload.index
                        ? { ...weaponAttack, weapon: action.payload.weapon }
                        : weaponAttack
                ),
            };

        case "UPDATE_WEAPON_ATTACK_EXTRA_DAMAGE":
            return {
                ...state,
                weaponAttacks: state.weaponAttacks.map((weaponAttack, index) =>
                    index === action.payload.index
                        ? { ...weaponAttack, extraDamage: action.payload.extraDamage }
                        : weaponAttack
                ),
            };

        case "UPDATE_WEAPON_ATTACK_SPECIAL_EFFECT_DESCRIPTION":
            return {
                ...state,
                weaponAttacks: state.weaponAttacks.map((weaponAttack, index) =>
                    index === action.payload.index
                        ? {
                            ...weaponAttack,
                            specialEffect: {
                                ...weaponAttack.specialEffect,
                                description: action.payload.description,
                            },
                        }
                        : weaponAttack
                ),
            };

        case "UPDATE_WEAPON_ATTACK_SPECIAL_EFFECT_COST":
            return {
                ...state,
                weaponAttacks: state.weaponAttacks.map((weaponAttack, index) =>
                    index === action.payload.index
                        ? {
                            ...weaponAttack,
                            specialEffect: {
                                ...weaponAttack.specialEffect,
                                cost: action.payload.cost,
                            },
                        }
                        : weaponAttack
                ),
            };

        case "REMOVE_WEAPON_ATTACK":
            return {
                ...state,
                weaponAttacks: state.weaponAttacks.filter((_, index) => index !== action.payload.index),
            };

        // ... other cases
        case "ADD_BASE_ATTACK":
            return {
                ...state,
                baseAttacks: [
                    ...state.baseAttacks,
                    {
                        stat1: "",
                        stat2: "",
                        type: "melee",
                        element: "",
                        specialEffect: false,
                        extraDamage: false,
                    },
                ],
            };

        case "REMOVE_BASE_ATTACK":
            return {
                ...state,
                baseAttacks: state.baseAttacks.filter((_, index) => index !== action.payload.index),
            };

        case "UPDATE_BASE_ATTACK":
            return {
                ...state,
                baseAttacks: state.baseAttacks.map((baseAttack, index) =>
                    index === action.payload.index
                        ? { ...baseAttack, ...action.payload.updatedBaseAttack }
                        : baseAttack
                ),
            };

        case "ADD_SPELL":
            return {
                ...state,
                spells: [
                    ...state.spells,
                    {
                        name: "",
                        targets: 1,
                        mpCost: 0,
                        effect: "",
                        offensive: false,
                        damage: 0,
                        element: "",
                      },
                ],
            };


        case "UPDATE_SPELL":
            const updatedSpells = state.spells.map((spell, index) => {
                if (index === action.payload.index) {
                    return { ...spell, ...action.payload.updatedSpell };
                }
                return spell;
            });

            return {
                ...state,
                spells: updatedSpells,
            };
        case "REMOVE_SPELL":
            const remainingSpells = state.spells.filter(
                (_, index) => index !== action.payload.index
            );

            return {
                ...state,
                spells: remainingSpells,
            };

            case "ADD_CUSTOM_RULE":
                return {
                    ...state,
                    customRules: [
                        ...state.customRules,
                        {
                            text: "",
                            skillCost: 0,
                        },
                    ],
                };
            case "UPDATE_CUSTOM_RULE":
                return {
                    ...state,
                    customRules: state.customRules.map((rule, index) =>
                        index === action.payload.index
                            ? { ...rule, ...action.payload.updatedRule }
                            : rule
                    ),
                };
            case "REMOVE_CUSTOM_RULE":
                return {
                    ...state,
                    customRules: state.customRules.filter((_, index) => index !== action.payload.index),
                };    

        default:
            return state;
    }



}

export default npcReducer;