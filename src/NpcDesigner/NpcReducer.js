// Create a reducer function to handle state updates
function npcReducer(state, action) {
    switch (action.type) {
  
      case "UPDATE_FIELD": {
          return {
              ...state,
              [action.payload.name]: action.payload.value
          }
      }
  
      case "UPDATE_ATTRIBUTE": {
        return {
            ...state,
            attributes: {...state.attributes,
                [action.payload.attribute] : action.payload.value
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
          const updatedTraits = [...state.traits.slice(0, index), value, ...state.traits.slice(index+1)];
          return {
              ...state,
              traits: updatedTraits
          }
      }
      default:
        return state;
    }
  }

  export default npcReducer;