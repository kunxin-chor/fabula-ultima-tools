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

        default:
            return state;
    }
}

export default npcReducer;