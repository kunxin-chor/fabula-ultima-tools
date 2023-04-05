import React, { useReducer, useEffect, useMemo } from 'react';
import npcReducer from './NpcDesigner/NpcReducer';
import "./NpcDesigner/npc.css"
import speices from "./NpcDesigner/species.json"
import elements from "./elements.json";
const attributes = ["DEX", "INS", "MIG", "WLP"];

// Define the initial state for the NPC
const initialState = {
    name: "",
    traits: [],
    level: 5,
    species: '',
    elementalAffinities: [

    ],
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
    improvedDefense:{
        defenseBonus: 0,
        magicDefenseBonus: 0,    
        skillPointCost: 0
    },   
    accuracyBonus: 0,
    magicBonus: 0,
    damageBonus: 0,
    equipment: {
        weapons: [],
        armor: {},
        shield: {}
    },
    baseSkillPoints: 0
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

    function getMaxSkillPoints(level, elementalAffinities, baseSkillPoints) {
        const skillPointsFromLevel = Math.floor(level / 10);
    
        const skillPointsFromVulnerabilities = Object.values(elementalAffinities).filter(
          (affinity) => affinity === "vulnerable"
        ).length;        
        return baseSkillPoints + skillPointsFromLevel + skillPointsFromVulnerabilities;
      }  

    const maxSkillPoints = useMemo(
        () => getMaxSkillPoints(state.level, state.elementalAffinities, state.baseSkillPoints),
        [state.level, state.elementalAffinities, state.baseSkillPoints]
      );

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
                                    min="6"
                                    max="12"
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

            {/* Species */}
            <div className="form-group">
                <label>Species:</label>
                <select name="species" className="form-control" value={state.species} onChange={(e) => {
                    dispatch({
                        type: "UPDATE_SPECIES",
                        payload: {
                            species: e.target.value
                        }
                    })
                }}>
                    <option value="">Select a species</option>
                    {
                        Object.entries(speices).map(([key, value]) => {
                            return <option value={key}>{value.name}</option>
                        })
                    }
                </select>
            </div>

            {/* Elemental Affinities */}
            {/* For each element, if it exists inside Elemental Affinities, use its
            value, otherwise set to "normal" */}
            <h2>Elemental Affinities</h2>
            <div className="row mt-3">
                {elements.map(({ name: value }) => (
                    <div key={value} className="col-sm-6 mb-2">
                        <div className="form-group d-flex align-items-center attribute-container">
                            <label htmlFor={value} className="me-2">
                                {value}:
                            </label>
                            <div className="d-inline-flex align-items-center">
                                <select
                                    className="form-control"
                                    id={value}
                                    name={value}
                                    value={state.elementalAffinities[value] || "normal"}
                                    onChange={(e) => {
                                        const affinity = e.target.value;
                                        dispatch({
                                            type: "UPDATE_ELEMENTAL_AFFINITY",
                                            payload: {
                                                element: value,
                                                value: affinity,
                                            },
                                        });
                                    }}
                                >
                                    <option value="normal">Normal</option>
                                    <option value="vulnerable">Vulnerable</option>
                                    <option value="resistant">Resistant</option>
                                    <option value="immune">Immune</option>
                                    <option value="absorb">Absorb</option>
                                </select>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Skills */}
            <h2>Skills</h2>
            <p>Max Skill Points:{maxSkillPoints}</p>
        </div>
    );
}

export default NpcDesigner;
