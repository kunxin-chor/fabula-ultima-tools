import React, { useReducer } from 'react';
import npcReducer from './NpcDesigner/NpcReducer';
import "./NpcDesigner/npc.css"

const attributes = ["DEX", "INS", "MIG", "WLP"];

// Define the initial state for the NPC
const initialState = {
    name: "",
    traits: [],
    level: 5,
    species: '',
    speciesInfo: {
        baseSkills: 0,
        resistances: [],
        vulnerabilities: [],
        immunities: [],
        absorptions: [],
        customActions: [],
    },
    attributes: {
        DEX: 6,
        INS: 6,
        MIG: 6,
        WLP: 6,
    },
    attacks: [],
    skills: [],
    vulnerabilities: [],
    extraSkills: 0,
    initiative: 0,
    maxHP: 0,
    crisisScore: 0,
    maxMP: 0,
    defense: 0,
    magicDefense: 0,
    accuracyBonus: 0,
    magicBonus: 0,
    damageBonus: 0,
    equipment: {
        weapons: [],
        armor: {},
        shield: {}
    },
    skills: 0
};


// Create the NPC form component
function NpcDesigner() {
    const [state, dispatch] = useReducer(npcReducer, initialState);

    const handleFormChange = (event) => {
        const { name, value } = event.target;

        dispatch({
            type: 'UPDATE_FIELD',
            payload: { name, value },
        });
    };

    return (
        <div className="container">
            <div className="form-group">
                <label>Name:</label>
                <input type="text" name="name" className="form-control" value={state.name} onChange={handleFormChange} />
            </div>

            <div className="form-group">
                <label>Level:</label>
                <input type="text" name="level" className="form-control" value={state.level} onChange={handleFormChange} />
            </div>

            {/* Traits */}
            <div className="form-group">
                <label htmlFor="traits">Traits:</label>
                {state.traits.map((t, index) => <input type="text"
                    class="form-control"
                    value={t}
                    key={index}
                    onChange={e => {
                        dispatch({
                            type: "UPDATE_TRAIT_TEXT",
                            payload: { index, value: e.target.value }
                        })
                    }}
                />)}
                <button onClick={() => {
                    dispatch({
                        type: "ADD_TRAIT",
                    })
                }}>Add Trait</button>
            </div>

            {/* Attributes */}
            <div className="form-group">
                <label>Attributes:</label>
                <div className="d-flex flex-wrap">
                    {Object.entries(state.attributes).map(([key, value]) => (
                        <div key={key} className="form-group d-flex align-items-center attribute-container">
                            <label htmlFor={key} className="me-2">
                                {key}:
                            </label>
                            <div className="d-inline-flex align-items-center">
                                <span className="me-1">D</span>
                                <input
                                    type="number"
                                    className="form-control attribute-input"
                                    id={key}
                                    name={key}
                                    value={value}
                                    min="2"
                                    step="2"
                                    onChange={(e) => {
                                        const diceSize = parseInt(e.target.value);
                                        dispatch({
                                            type: 'UPDATE_ATTRIBUTE',
                                            payload: {
                                                attribute: key,
                                                value: diceSize,
                                            },
                                        });
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>




        </div>
    );
}

export default NpcDesigner;
