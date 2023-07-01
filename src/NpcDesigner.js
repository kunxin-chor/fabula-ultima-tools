import React, { useReducer, useMemo, useCallback, useState, useEffect } from 'react';
import npcReducer from './NpcDesigner/NpcReducer';
import "./NpcDesigner/npc.css"
import speciesList from "./NpcDesigner/species.json"
import elements from "./elements.json";
import weapons from "./baseItems.json"
import armorShields from "./baseArmor.json";
import { v4 as uuidv4 } from 'uuid';

const attributes = ["DEX", "INS", "MIG", "WLP"];
const statuses = ["enraged", "shaken", "poisoned", "weak", "dazed", "slow"];
const spellTypes = ["damage", "heal", "others"];

// split armorShields into armors and shields array
const armors = armorShields.filter(item => !item.name.includes("Shield"));
const shields = armorShields.filter(item => item.name.includes("Shield") || item.name === "Buckler");

// Define the initial state for the NPC
const initialState = {
    name: "",
    traits: "",
    level: 5,
    species: '',
    // generate a random character id
    characterId: uuidv4(),
    rank: 1, // rank 1 is solider, rank 2 is elite, 3 to 5 are champions
    // the rank is the equalvalent to number of soliders
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
    improvedDefense: {
        defenseBonus: 0,
        magicDefenseBonus: 0,
        skillPointCost: 0
    },
    accuracyBonus: 0,
    magicBonus: 0,
    damageBonus: 0,
    baseSkillPoints: 0,
    freeResistances: 0,
    freeImmunities: 0,
    skillOptions: {
        "specialized": {
            "accuracy": false,
            "magic": false,
            "opposed-checks": false
        },
        "improved_defenses": [
            {
                "defense": 0,
                "magic-defense": 0
            },
            {
                "defense": 0,
                "magic-defense": 0
            }
        ],
        "improved_hit_points": 0,
        "improved_initative": 0,
        "improved_mp": 0,
        "use_equipment": false,
    },
    weaponAttacks: [],
    baseAttacks: [],
    spells: [],
    customRules: [],
    selected_armor: {
        armor: {},
        customQuality: "",
        skillCost: 0,
    },
    selected_shield: {
        shield: {},
        customQuality: "",
        skillCost: 0,
    },
};

// the key that store all the characters in localstorage
const localStorageKey = "npcs";


// Create the NPC form component
function NpcDesigner() {

    const [state, dispatch] = useReducer(npcReducer, initialState);
    const [characterId, setCharacterId] = useState(0);
    const [characters, setCharacters] =  useState([]);

    // helper function to save the current character to localstorage
    const saveToLocalStorage = useCallback(() => {

       
        // get the current list of characters from localstorage
        const characters = JSON.parse(localStorage.getItem(localStorageKey)) || [];
      
        // if the character already exists, replace it
        if (characterId!==0) {
            // find index of current character
            const index = characters.findIndex((character) => character.characterId === characterId);
   
            // replace the character
            if (index !== -1) {
                characters[index] = state;
            } else {
                // otherwise, add it to the end of the list
                characters.push(state);
            }
        } else {
            // otherwise, add it to the end of the list   
            let newCharacterId = uuidv4();                  
            characters.push({
                ...state,
                characterId: state.characterId || uuidv4(),
            });
            setCharacterId(state.characterId || newCharacterId);
        }
        // save the updated list to localstorage
        localStorage.setItem(localStorageKey, JSON.stringify(characters));
        setCharacters(characters);
    }, [state, characterId]);

    // helper function to load from localstorage
    const loadFromLocalStorage = useCallback((characterId) => {
        // get the current list of characters from localstorage
        const characters = JSON.parse(localStorage.getItem(localStorageKey)) || [];
        // if the character already exists, replace it
        if (characterId !== null) {
            // find index
            const index = characters.findIndex((character) => character.characterId === characterId);
            const character = characters[index];
            setCharacterId(characterId);
            if (character) {
                dispatch({
                    type: 'LOAD_CHARACTER',
                    payload: character,
                });
            }
        }
    }, []);

    const deleteCharacterFromLocalStorage = useCallback(() => {
        // get the current list of characters from localstorage
        const characters = JSON.parse(localStorage.getItem(localStorageKey)) || [];
        // if the character already exists, replace it
        if (characterId !== 0) {
            // find the index of the character by ID
            const index = characters.findIndex((character) => character.characterId === characterId);
            
            if (index !== -1) {
                // remove the character from the list
                characters.splice(index, 1);
                // save the updated list to localstorage
                localStorage.setItem(localStorageKey, JSON.stringify(characters));
                // set the character id to null
                setCharacterId(0);
                setCharacters(characters);
                // reset character
                dispatch({
                    type:"LOAD_CHARACTER",
                    payload: initialState,
                });
            }
        }
    }, [characterId]);

    // load in all characters from localstorage
    // just the name and the id will do
    useEffect(() => {
        const characters = JSON.parse(localStorage.getItem(localStorageKey)) || [];
        setCharacters(characters.map((character) => {
            console.log(character);
            return {
                name: character.name,
                characterId: character.characterId,
            }
        }));
    }, []);


    const handleFormChange = (event) => {
        const { name, value } = event.target;
        dispatch({
            type: 'UPDATE_FIELD',
            payload: { name, value },
        });
    };

    const freeResistancesLeft = useMemo(() => {
        return Math.max(state.freeResistances - Object.values(state.elementalAffinities).filter(
            (affinity) => affinity === "resistant"
        ).length, 0);
    }, [state.elementalAffinities, state.freeResistances]);

    const freeImmunitiesLeft = useMemo(() => {
        return Math.max(state.freeImmunities - Object.values(state.elementalAffinities).filter(
            (affinity) => affinity === "immune"
        ).length, 0);
    }, [state.elementalAffinities, state.freeImmunities]);

    const getSkillPointsLeft = useCallback((level, elementalAffinities, baseSkillPoints, skillOptions, weaponAttacks, baseAttacks) => {
        const skillPointsFromLevel = Math.floor(level / 10);

        const skillPointsFromVulnerabilities = Object.values(elementalAffinities).filter(
            (affinity) => affinity === "vulnerable"
        ).length;

        const extraResistances = Object.values(elementalAffinities).filter(
            (affinity) => affinity === "resistant"
        ).length - state.freeResistances;

        const extraImmunities = (Object.values(elementalAffinities).filter(
            (affinity) => affinity === "immune"
        ).length - state.freeImmunities)

        const resistantCost = Math.max(0, extraResistances * 0.5);
        const immuneCost = Math.max(0, extraImmunities * 0.5); 
        const absorbCost = Object.values(elementalAffinities).filter(
            (affinity) => affinity === "absorb"
        ).length;

        // account for selected species' base elemental affinities cost as discount

        // const selectedSpecies = speciesList[state.species] || {
        //     elementalAffinities: {}
        // };
        // const existingElementCost = Object.entries(selectedSpecies.elementalAffinities)
        //     .reduce((total, [element, affinity]) => {
        //         if (affinity === "resistant") {
        //             return total + 0.5;
        //         } else if (affinity === "immune") {
        //             return total + 1;
        //         } else if (affinity === "absorb") {
        //             return total + 1;
        //         };
        //         return total;
        //     }, 0);


        const totalElementalCost = resistantCost + immuneCost + absorbCost;

        const improvedDefenseCost = skillOptions.improved_defenses.filter(option => option.defense !== 0).length;

        const specializedCost = Object.values(skillOptions.specialized).filter(value => value).length;

        const useEquipmentCost = skillOptions.use_equipment ? 1 : 0;

        // every 10 points of bonus hit points costs 1 skill point
        const bonusHitPointCost = Math.floor(skillOptions.improved_hit_points / 10);

        // every 4 points of initiative costs 1 skill point
        const bonusInitiativeCost = Math.floor(skillOptions.improved_initative / 4);

        // every 10 MP costs 0.5 skill point
        const bonusMPCost = Math.floor(skillOptions.improved_mp / 10) * 0.5;

        // each spell costs 0.5 skill point
        const spellCost = state.spells.length * 0.5;

        const totalOtherCost = improvedDefenseCost + specializedCost +
            useEquipmentCost + bonusHitPointCost + bonusInitiativeCost;

        const weaponAttackCost = weaponAttacks.reduce((total, attack) => {

            if (attack.extraDamage) {
                total++;
            }

            total += attack.specialEffect.cost;
            return total;
        }, 0);

        const baseAttackCost = baseAttacks.reduce((total, attack) => {
            total += parseInt(attack.skillCost);
            if (attack.extraDamage) {
                total++;
            }
            return total;
        }, 0);

        const customRulesCost = state.customRules.reduce((total, rule) => total + rule.skillCost, 0);

        const equipmentCost = state.selected_armor.skillCost + state.selected_shield.skillCost;

        return (
            baseSkillPoints +
            skillPointsFromLevel +
            skillPointsFromVulnerabilities -
            totalElementalCost -
            totalOtherCost -
            weaponAttackCost -
            baseAttackCost -
            customRulesCost -
            equipmentCost -
            spellCost -
            bonusMPCost
        );
    }, [state.freeResistances, state.freeImmunities, state.customRules, state.selected_armor.skillCost, state.selected_shield.skillCost, state.spells.length]);

    const skillPointsLeft = useMemo(
        () => getSkillPointsLeft(state.level,
            state.elementalAffinities,
            state.baseSkillPoints,
            state.skillOptions,
            state.weaponAttacks,
            state.baseAttacks),
        [getSkillPointsLeft, state.level, state.elementalAffinities, state.baseSkillPoints, state.skillOptions, state.weaponAttacks, state.baseAttacks]
    );


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

            <h1 className="my-4">NPC Creation</h1>

            {/* display all saved characters and allow selection of one to load */}
            <div className="row">
                <div className="col-md mb-3">
                    <div className="form-group">
                        <label>Load Character:</label>
                        <select
                            className="form-control"
                            value={characterId}
                            onChange={(e) => {
                                setCharacterId(e.target.value);
                                loadFromLocalStorage(e.target.value);
                            }}                           
                            name="selectedCharacter"
                        >
                            <option value="0">Select a Character</option>
                            {characters.map((character) => (
                                <option key={character.characterId} value={character.characterId}>
                                    {character.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="col-md mb-3">
                    <div className="form-group">                      

                        {/* Button to save character. */}
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                saveToLocalStorage();
                            }}
                        >
                            Save Character
                        </button>                    

                          {/* Import JSON into state */}
                        <button
                            className="btn btn-primary ms-3"
                            onClick={() => {
                                const json = prompt("Paste JSON here");
                                if (json) {
                                    try {
                                        const parsed = JSON.parse(json);
                                        parsed.characterId = 0;
                                        dispatch({
                                            type: "SET_FROM_JSON",
                                            payload: parsed,
                                        })
                                    } catch (e) {
                                        alert("Invalid JSON");
                                    }
                                }
                            }}
                        >
                            Import JSON
                        </button>

                        {/* Button to delete currently loaded character */}
                        <button
                            className="btn btn-danger ms-3"
                            onClick={() => {
                                if (window.confirm("Are you sure you want to delete this character?")) {
                                    deleteCharacterFromLocalStorage(characterId);
                                    setCharacterId(0);
                                }
                            }}
                        >Delete</button>

                        {/* Copy the state as JSON to clipboard */}
                        <button
                            className="btn btn-primary ms-3"
                            onClick={() => {
                                navigator.clipboard.writeText(JSON.stringify(state));
                            }}
                        >
                            Copy JSON
                        </button>


                    </div>
                </div>
            </div>
            

            {/* Name and Level */}
            <div className="row">
                <div className="col-md mb-3">
                    <div className="form-group">
                        <label>Name:</label>
                        <input
                            type="text"
                            name="name"
                            className="form-control"
                            value={state.name}
                            onChange={handleFormChange}
                        />
                    </div>
                </div>

                <div className="col-md mb-3">
                    <div className="form-group">
                        <label>Level:</label>
                        <input
                            type="text"
                            name="level"
                            className="form-control"
                            value={state.level}
                            onChange={handleFormChange}
                        />
                    </div>
                </div>

                {/* Rank (1 to 5)*/}
                <div className="col-md mb-3">
                    <div className="form-group">
                        <label>Rank:</label>
                        <select name="rank" className="form-control" value={state.rank} onChange={handleFormChange}>
                            <option value="1">Solider</option>
                            <option value="2">Elite</option>
                            <option value="3">Champion (2)</option>
                            <option value="4">Champion (3)</option>
                            <option value="5">Champion (4)</option>
                            <option value="6">Champion (5)</option>
                        </select>
                    </div>
                </div>

                {/* Species */}
                <div className="col-md mb-3 form-group">
                    <label>Species:</label>
                    <select
                        name="species"
                        className="form-control"
                        value={state.species}
                        onChange={(e) => {
                            dispatch({
                                type: "UPDATE_SPECIES",
                                payload: {
                                    species: e.target.value,
                                },
                            });
                        }}
                    >
                        <option value="">Select a species</option>
                        {Object.entries(speciesList).map(([key, value]) => {
                            return (
                                <option key={key} value={key}>
                                    {value.name}
                                </option>
                            );
                        })}
                    </select>
                </div>

            </div>

            {/* Attributes */}
            <div className="mb-4">
                <h3>Attributes</h3>
                <div className="row">
                    {Object.entries(state.attributes).map(([key, value]) => (
                        <div key={key} className="col-md mb-3">
                            <div className="form-group">
                                <label htmlFor={key}>
                                    {key}:
                                </label>
                                <input
                                    type="number"
                                    className="form-control"
                                    id={key}
                                    name={key}
                                    value={value}
                                    min="6"
                                    max="12"
                                    step="2"
                                    onChange={(e) => {
                                        const diceSize = parseInt(e.target.value);
                                        dispatch({
                                            type: "UPDATE_ATTRIBUTE",
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


            {/* Traits */}
            {/* Text input */}
            <div className="mb-4 form-group">
                <h3>Traits</h3>
                <input type="text"
                    className="form-control"
                    id="traits"
                    name="traits"
                    value={state.traits}
                    onChange={handleFormChange}
                />
            </div>


            <div className="row">
                {/* Elemental Affinities */}
                <div className="mb-4 col-md">
                    <h3>Elemental Affinities</h3>

                    <div className="row mt-3">
                        {elements.map(({ name: value }) => (
                            <div key={value} className="col-sm-3 mb-2">
                                <div className="form-group">
                                    <label htmlFor={value}>
                                        {value}:
                                    </label>
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
                        ))}
                    </div>
                    <ul>
                        <li>Free Resistances: {freeResistancesLeft}</li>
                        <li>Free Immunities: {freeImmunitiesLeft}</li>
                    </ul>
                </div>
                {/* Status Affinities */}
                <div className="mb-4 col-md">
                    <h3>Status Affinities</h3>
                    <div className="row mt-3">
                        {statuses.map((status, index) => (
                            <div key={status} className="col-12 col-md-4 col-lg-3 mb-2">
                                <div className="form-group">
                                    <label htmlFor={`statusAffinity-${status}`}>
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </label>
                                    <select
                                        className="form-control"
                                        id={`statusAffinity-${status}`}
                                        name={status}
                                        value={state.elementalAffinities[status] || "normal"}
                                        onChange={(event) =>
                                            dispatch({
                                                type: "UPDATE_AFFINITY",
                                                payload: { affinity: status, value: event.target.value },
                                            })
                                        }
                                    >
                                        <option value="normal">Normal</option>
                                        <option value="immune">Immune</option>
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Skills */}
            <h2>Skills</h2>
            <div className="row">
                <div className="mb-4 col-md-2">
                    <h4>Skill Points</h4>
                    <p>Max Skill Points:{maxSkillPoints}</p>
                    <p>Skill Points Left:{skillPointsLeft}</p>
                </div>

                <div className="col-md">
                    {/* Improved Defenses */}
                    <h4>Improved Defenses</h4>
                    {state.skillOptions.improved_defenses.map((defenseOption, index) => (
                        <div key={index} className="d-flex align-items-center mb-2">
                            <label htmlFor={`defenseOption${index}`} className="me-2">
                                Defense Option {index + 1}:
                            </label>
                            <select
                                className="form-control"
                                id={`defenseOption${index}`}
                                name={`defenseOption${index}`}
                                value={JSON.stringify(defenseOption[index])}
                                onChange={(e) => {
                                    const value = JSON.parse(e.target.value);
                                    dispatch({
                                        type: "UPDATE_IMPROVED_DEFENSE",
                                        payload: {
                                            index,
                                            value,
                                        },
                                    });
                                }}
                                disabled={index === 1 && state.skillOptions.improved_defenses[0].defense === 0}
                            >
                                <option value='{"defense": 0, "magic-defense": 0}'>
                                    No Option Selected
                                </option>
                                <option value='{"defense":1, "magic-defense": 2}'>
                                    +1 Defense, +2 Magic Defense
                                </option>
                                <option value='{"defense": 2, "magic-defense": 1}'>
                                    +2 Defense, +1 Magic Defense
                                </option>
                            </select>
                        </div>
                    ))}
                </div>

                {/* Specialized */}
                <div className="col-md mb-4">
                    <h4>Specialized</h4>
                    <div className="form-check">
                        {Object.entries(state.skillOptions.specialized).map(([key, value]) => (
                            <div key={key} className="form-check mb-2">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id={key}
                                    name={key}
                                    checked={value}
                                    onChange={(e) => {
                                        dispatch({
                                            type: "UPDATE_SPECIALIZED",
                                            payload: {
                                                option: key,
                                                value: e.target.checked,
                                            },
                                        });
                                    }}
                                />
                                <label className="form-check-label" htmlFor={key}>
                                    {key.charAt(0).toUpperCase() + key.slice(1)}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div class="row">
                {/* Improved Hit Points */}
                <div className="col-md col form-group mb-3">
                    <label htmlFor="improved_hit_points">Improved Hit Points:</label>
                    <input
                        type="number"
                        className="form-control"
                        id="improved_hit_points"
                        name="improved_hit_points"
                        value={state.skillOptions.improved_hit_points}
                        min="0"
                        step="10"
                        onBlur={(e) => {
                            const inputValue = parseInt(e.target.value);
                            const roundedValue = Math.round(inputValue / 10) * 10;
                            dispatch({
                                type: "UPDATE_IMPROVED_HIT_POINTS",
                                payload: {
                                    value: parseInt(roundedValue),
                                },
                            });
                        }}


                        onChange={(e) => {
                            dispatch({
                                type: "UPDATE_IMPROVED_HIT_POINTS",
                                payload: {
                                    value: parseInt(e.target.value),
                                },
                            });
                        }}
                    />
                </div>

                {/* Improved Initiative */}
                <div className="col-md col form-group mb-3">
                    <label htmlFor="improved_initiative">Improved Initiative:</label>
                    <input
                        type="number"
                        className="form-control"
                        id="improved_initiative"
                        name="improved_initiative"
                        value={state.skillOptions.improved_initative}
                        min="0"
                        max="4"
                        step="4"
                        onBlur={(e) => {
                            const inputValue = parseInt(e.target.value);
                            const roundedValue = Math.round(inputValue / 4) * 4;
                            dispatch({
                                type: "UPDATE_IMPROVED_INITIATIVE",
                                payload: {
                                    value: parseInt(roundedValue),
                                },
                            });
                        }}
                        onChange={(e) => {
                            dispatch({
                                type: "UPDATE_IMPROVED_INITIATIVE",
                                payload: {
                                    value: parseInt(e.target.value),
                                },
                            });
                        }}
                    />
                </div>

                {/* Improved MP */}
                <div className="col-md col form-group mb-3">
                    <label htmlFor="improved_mp">Improved MP:</label>
                    <input
                        type="number"
                        className="form-control"
                        id="improved_mp"
                        name="improved_mp"
                        value={state.skillOptions.improved_mp}
                        min="0"
                        step="10"
                        onBlur={(e) => {
                            const inputValue = parseInt(e.target.value);
                            const roundedValue = Math.round(inputValue / 10) * 10;
                            dispatch({
                                type: "UPDATE_IMPROVED_MP",
                                payload: {
                                    value: parseInt(roundedValue),
                                },
                            });
                        }}
                        onChange={(e) => {
                            dispatch({
                                type: "UPDATE_IMPROVED_MP",
                                payload: {
                                    value: parseInt(e.target.value),
                                },
                            });
                        }}
                    />
                </div>

                {/* Use Equipment */}
                <div className="col-md col form-group mb-3">
                    <label htmlFor="use_equipment">Use Equipment:</label>
                    <input
                        type="checkbox"
                        className="form-check-input"
                        id="use_equipment"
                        name="use_equipment"
                        checked={state.skillOptions.use_equipment}
                        onChange={(e) => {
                            dispatch({
                                type: 'TOGGLE_USE_EQUIPMENT',
                                payload: { value: e.target.checked },
                            });
                        }}
                    />
                </div>
            </div>

            {/* Equipment */}
            {state.skillOptions.use_equipment && (
                <div className="mb-4">
                    <h4>Equipment</h4>

                    <div className="form-group mb-3">
                        <label htmlFor="selected_armor">Armor:</label>
                        <select
                            className="form-control"
                            id="selected_armor"
                            name="selected_armor"
                            value={JSON.stringify(state.selected_armor.armor)}
                            onChange={(e) => {
                                const armor = JSON.parse(e.target.value);
                                dispatch({
                                    type: "UPDATE_ARMOR",
                                    payload: {
                                        key: 'armor',
                                        value: armor,
                                    }
                                });
                            }}
                        >
                            <option value="">Select armor</option>
                            {armors.map((armorItem) => (
                                <option key={armorItem.name} value={JSON.stringify(armorItem)}>
                                    {armorItem.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-3">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Custom Armor Quality"
                            value={state.selected_armor.customQuality}
                            onChange={(e) =>
                                dispatch({
                                    type: "UPDATE_ARMOR",
                                    payload: { key: "customQuality", value: e.target.value },
                                })
                            }
                        />
                        <input
                            type="number"
                            className="form-control mt-2"
                            placeholder="Custom Armor Skill Cost"
                            value={state.selected_armor.skillCost}
                            onChange={(e) =>
                                dispatch({
                                    type: "UPDATE_ARMOR",
                                    payload: { key: "skillCost", value: Number(e.target.value) },
                                })
                            }
                        />
                    </div>

                    {/* Shield */}
                    <div className="form-group mb-3">
                        <label htmlFor="selected_shield">Shield:</label>
                        <select
                            className="form-control"
                            id="selected_shield"
                            name="selected_shield"
                            value={JSON.stringify(state.selected_shield.shield)}
                            onChange={(e) => {
                                const shield = JSON.parse(e.target.value);
                                dispatch({
                                    type: "UPDATE_SHIELD",
                                    payload: { key: 'shield', value: shield },
                                });
                            }}
                        >
                            <option value="">Select a shield</option>
                            {shields.map((shieldItem) => (
                                <option key={shieldItem.name} value={JSON.stringify(shieldItem)}>
                                    {shieldItem.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-3">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Custom Shield Quality"
                            value={state.selected_shield.customQuality}
                            onChange={(e) =>
                                dispatch({
                                    type: "UPDATE_SHIELD",
                                    payload: {
                                        key: 'customQuality', value: e.target.value,
                                    },
                                })
                            }
                        />
                        <input
                            type="number"
                            className="form-control mt-2"
                            placeholder="Custom Shield Skill Cost"
                            value={state.selected_shield.skillCost}
                            onChange={(e) =>
                                dispatch({
                                    type: "UPDATE_SHIELD",
                                    payload: {
                                        key: 'skillCost', value: Number(e.target.value),
                                    },
                                })
                            }
                        />
                    </div>

                </div>
            )}

            {/* Weapon Attacks */}
            <div className="row">
                <div className="col-md-12 mb-3">
                    <h2 className="my-3">Weapon Attacks</h2>
                    {state.weaponAttacks.map((weaponAttack, index) => (
                        <div key={index} className="d-flex align-items-center mb-2">
                            <div className="form-group me-3">
                                <input type="text"
                                    className="form-control"
                                    value={weaponAttack.name}
                                    onChange={(e) => {
                                        dispatch({
                                            type: "UPDATE_WEAPON_ATTACK_NAME",
                                            payload: { index, name: e.target.value },
                                        });
                                    }}
                                />
                            </div>

                            <div className="form-group me-3">
                                <select
                                    className="form-control"
                                    value={JSON.stringify(weaponAttack.weapon)}
                                    onChange={(e) => {
                                        const weapon = JSON.parse(e.target.value);
                                        dispatch({
                                            type: "UPDATE_WEAPON_ATTACK_WEAPON",
                                            payload: { index, weapon },
                                        });
                                    }}
                                >
                                    <option value="">Select a weapon</option>
                                    {weapons.map((weapon) => (
                                        <option
                                            key={weapon.name}
                                            value={JSON.stringify(weapon)}
                                        >
                                            {weapon.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group me-3">
                                <label className="me-2">
                                    <input
                                        type="checkbox"
                                        checked={weaponAttack.extraDamage}
                                        onChange={(e) => {
                                            dispatch({
                                                type: "UPDATE_WEAPON_ATTACK_EXTRA_DAMAGE",
                                                payload: { index, extraDamage: e.target.checked },
                                            });
                                        }}
                                    />
                                    Extra Damage (+5)
                                </label>
                            </div>
                            <div className="form-group me-3">
                                <label>Special Effect:</label>
                                <input
                                    type="text"
                                    className="form-control ms-2"
                                    value={weaponAttack.specialEffect.description}
                                    onChange={(e) => {
                                        const description = e.target.value;
                                        dispatch({
                                            type: "UPDATE_WEAPON_ATTACK_SPECIAL_EFFECT_DESCRIPTION",
                                            payload: { index, description },
                                        });
                                    }}
                                />
                            </div>
                            <div className="form-group me-3">
                                <label>Effect Cost:</label>
                                <input
                                    type="number"
                                    className="form-control ms-2"
                                    value={weaponAttack.specialEffect.cost}
                                    onChange={(e) => {
                                        const cost = Number(e.target.value);
                                        dispatch({
                                            type: "UPDATE_WEAPON_ATTACK_SPECIAL_EFFECT_COST",
                                            payload: { index, cost },
                                        });
                                    }}
                                />
                            </div>
                            <button
                                type="button"
                                className="btn btn-danger"
                                onClick={() =>
                                    dispatch({ type: "REMOVE_WEAPON_ATTACK", payload: { index } })
                                }
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => dispatch({ type: "ADD_WEAPON_ATTACK" })}
                    >
                        Add Weapon Attack
                    </button>
                </div>
            </div>

            <div className="row">


                {/* Start */}
                <div className="col-md-12 mb-3">
                    <h2 className="my-3">Base Attacks</h2>
                    {state.baseAttacks.map((baseAttack, index) => (
                        <div key={index} className="d-flex align-items-center mb-2">

                            {/* Name */}
                            <div className="form-group me-3">
                                <label className="form-label">Name:</label>
                                <input type="text" className="form-control ms-2" value={baseAttack.name} onChange={(e) => {
                                    dispatch({
                                        type: "UPDATE_BASE_ATTACK",
                                        payload: {
                                            index,
                                            updatedBaseAttack: { name: e.target.value },
                                        },
                                    });
                                }} />
                            </div>

                            {/* Stat 1 */}
                            <div className="form-group me-3">
                                <label className="form-label">Stat 1:</label>
                                <select
                                    className="form-select ms-2"
                                    value={baseAttack.stat1}
                                    onChange={(e) => {
                                        dispatch({
                                            type: "UPDATE_BASE_ATTACK",
                                            payload: {
                                                index,
                                                updatedBaseAttack: { stat1: e.target.value },
                                            },
                                        });
                                    }}
                                >
                                    {attributes.map((attribute) => (
                                        <option key={attribute} value={attribute}>
                                            {attribute}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Stat 2 */}
                            <div className="form-group me-3">
                                <label className="form-label">Stat 2:</label>
                                <select
                                    className="form-select ms-2"
                                    value={baseAttack.stat2}
                                    onChange={(e) => {
                                        dispatch({
                                            type: "UPDATE_BASE_ATTACK",
                                            payload: {
                                                index,
                                                updatedBaseAttack: { stat2: e.target.value },
                                            },
                                        });
                                    }}
                                >
                                    {attributes.map((attribute) => (
                                        <option key={attribute} value={attribute}>
                                            {attribute}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Ranged or Melee */}
                            <div className="form-group me-3">
                                <label className="form-label">Type:</label>
                                <select
                                    className="form-select ms-2"
                                    value={baseAttack.type}
                                    onChange={(e) => {
                                        dispatch({
                                            type: "UPDATE_BASE_ATTACK",
                                            payload: {
                                                index,
                                                updatedBaseAttack: { type: e.target.value },
                                            },
                                        });
                                    }}
                                >
                                    <option value="melee">Melee</option>
                                    <option value="ranged">Ranged</option>
                                </select>
                            </div>

                            {/* Element */}
                            <div className="form-group me-3">
                                <label className="form-label">Element:</label>
                                <select
                                    className="form-select ms-2"
                                    value={baseAttack.element}
                                    onChange={(e) => {
                                        dispatch({
                                            type: "UPDATE_BASE_ATTACK",
                                            payload: {
                                                index,
                                                updatedBaseAttack: { element: e.target.value },
                                            },
                                        });
                                    }}
                                >
                                    <option value="">Select element</option>
                                    {elements.map((element, index) => (
                                        <option key={index} value={element.name}>
                                            {element.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Special Effect */}
                            <div class="form-group me-3">
                                <label className="form-label">Special Effect</label>
                                <input
                                    type="text"
                                    className="form-control ms-2"
                                    placeholder="Special Effect"
                                    value={baseAttack.specialEffect}
                                    onChange={(e) => {
                                        dispatch({
                                            type: "UPDATE_BASE_ATTACK",
                                            payload: {
                                                index,
                                                updatedBaseAttack: { specialEffect: e.target.value },
                                            },
                                        });
                                    }}
                                />
                            </div>

                            <div className="form-group me-3">
                                <label className="form-label">Cost:</label>
                                <input
                                    type="number"
                                    className="form-control ms-2"
                                    value={baseAttack.skillCost}
                                    style={{ width: "60px" }}
                                    onChange={(e) => {
                                        const skillCost = Number(e.target.value);
                                        dispatch({
                                            type: "UPDATE_BASE_ATTACK",
                                            payload: {
                                                index,
                                                updatedBaseAttack: { skillCost: skillCost },
                                            },
                                        });
                                    }}
                                />
                            </div>



                            {/* Extra Damage */}
                            <div className="form-group me-3">
                                <label className="form-check-label">
                                    <input
                                        type="checkbox"
                                        className="form-check-input ms-2"
                                        checked={baseAttack.extraDamage}
                                        onChange={(e) => {
                                            dispatch({
                                                type: "UPDATE_BASE_ATTACK",
                                                payload: {
                                                    index,
                                                    updatedBaseAttack: { extraDamage: e.target.checked },
                                                },
                                            });
                                        }}
                                    />
                                    Extra Damage (+5)
                                </label>
                            </div>

                            {/* Remove Button */}
                            <button
                                type="button"
                                className="btn btn-danger"
                                onClick={() => {
                                    dispatch({ type: "REMOVE_BASE_ATTACK", payload: { index } });
                                }}
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                    {/* Add Base Attack Button */}
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => {
                            dispatch({ type: "ADD_BASE_ATTACK" });
                        }}
                    >
                        Add Base Attack
                    </button>
                </div>


                {/* Start */}
                <div className="col-md-12 mb-3">
                    <h2 className="my-3">Spells</h2>
                    {state.spells.map((spell, index) => (
                        <div key={index} className="d-flex align-items-center mb-2">
                            {/* Name */}
                            <div className="form-group me-3">
                                <label className="form-label">Name:</label>
                                <input
                                    type="text"
                                    className="form-control ms-2"
                                    value={spell.name}
                                    onChange={(e) => {
                                        dispatch({
                                            type: "UPDATE_SPELL",
                                            payload: {
                                                index,
                                                updatedSpell: { name: e.target.value },
                                            },
                                        });
                                    }}
                                />
                            </div>

                            {/* Number of targets */}
                            <div className="form-group me-3">
                                <label className="form-label">Targets:</label>
                                <input
                                    type="number"
                                    className="form-control ms-2"
                                    value={spell.targets}
                                    style={{ width: "60px" }}
                                    onChange={(e) => {
                                        dispatch({
                                            type: "UPDATE_SPELL",
                                            payload: {
                                                index,
                                                updatedSpell: { targets: Number(e.target.value) },
                                            },
                                        });
                                    }}
                                />
                            </div>

                            {/* MP cost */}
                            <div className="form-group me-3">
                                <label className="form-label">MP Cost:</label>
                                <input
                                    type="number"
                                    className="form-control ms-2"
                                    value={spell.mpCost}
                                    style={{ width: "60px" }}
                                    onChange={(e) => {
                                        dispatch({
                                            type: "UPDATE_SPELL",
                                            payload: {
                                                index,
                                                updatedSpell: { mpCost: Number(e.target.value) },
                                            },
                                        });
                                    }}
                                />
                            </div>

                            {/* Stat 1 */}
                            <div className="form-group me-3">
                                <label className="form-label">Stat 1:</label>
                                <select
                                    className="form-select ms-2"
                                    value={spell.stat1}
                                    onChange={(e) => {
                                        dispatch({
                                            type: "UPDATE_SPELL",
                                            payload: {
                                                index,
                                                updatedSpell: { stat1: e.target.value },
                                            },
                                        });
                                    }}
                                >
                                    {attributes.map((attribute) => (
                                        <option key={attribute} value={attribute}>
                                            {attribute}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Stat 2 */}
                            <div className="form-group me-3">
                                <label className="form-label">Stat 2:</label>
                                <select
                                    className="form-select ms-2"
                                    value={spell.stat2}
                                    onChange={(e) => {
                                        dispatch({
                                            type: "UPDATE_SPELL",
                                            payload: {
                                                index,
                                                updatedSpell: { stat2: e.target.value },
                                            },
                                        });
                                    }}
                                >
                                    {attributes.map((attribute) => (
                                        <option key={attribute} value={attribute}>
                                            {attribute}
                                        </option>
                                    ))}
                                </select>
                            </div>


                            {/* Effect */}
                            <div className="form-group me-3">
                                <label className="form-label">Effect:</label>
                                <input
                                    type="text"
                                    className="form-control ms-2"
                                    value={spell.effect}
                                    onChange={(e) => {
                                        dispatch({
                                            type: "UPDATE_SPELL",
                                            payload: {
                                                index,
                                                updatedSpell: { effect: e.target.value },
                                            },
                                        });
                                    }}
                                />
                            </div>

                            {/* Offensive */}
                            <div className="form-group me-3">
                                <label className="form-check-label">
                                    <input
                                        type="checkbox"
                                        className="form-check-input ms-2"
                                        checked={spell.offensive}
                                        onChange={(e) => {
                                            dispatch({
                                                type: "UPDATE_SPELL",
                                                payload: {
                                                    index,
                                                    updatedSpell: { offensive: e.target.checked },
                                                },
                                            });
                                        }}
                                    />
                                    Offensive
                                </label>
                            </div>

                            {/* Type: dropdown, can be heal,damage or others */}
                            <div className="form-group me-3">
                                <label className="form-label">Type:</label>
                                <select
                                    className="form-select ms-2"
                                    value={spell.type}
                                    onChange={(e) => {
                                        dispatch({
                                            type: "UPDATE_SPELL",
                                            payload: {
                                                index,
                                                updatedSpell: { type: e.target.value },
                                            },
                                        });
                                    }}
                                >
                                    {spellTypes.map((spellType) => (
                                        <option key={spellType} value={spellType}>
                                            {spellType}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Damage */}
                            <div className="form-group me-3">
                                <label className="form-label">Damage:</label>
                                <input
                                    type="number"
                                    className="form-control ms-2"
                                    style={{ width: "60px" }}
                                    value={spell.damage}
                                    onChange={(e) => {
                                        const damage = Number(e.target.value);
                                        dispatch({
                                            type: "UPDATE_SPELL",
                                            payload: {
                                                index,
                                                updatedSpell: { damage },
                                            },
                                        });
                                    }}
                                />
                            </div>

                            {/* Element */}
                            <div className="form-group me-3">
                                <label className="form-label">Element:</label>
                                <select
                                    className="form-select ms-2"
                                    value={spell.element}
                                    onChange={(e) => {
                                        dispatch({
                                            type: "UPDATE_SPELL",
                                            payload: {
                                                index,
                                                updatedSpell: { element: e.target.value },
                                            },
                                        });
                                    }}
                                >
                                    <option value="">Select element</option>
                                    {elements.map((element) => (
                                        <option key={element.name} value={element.name}>
                                            {element.name}
                                        </option>
                                    ))}
                                </select>
                            </div>


                            {/* Remove Button */}
                            <button
                                type="button"
                                className="btn btn-danger"
                                onClick={() => {
                                    dispatch({ type: "REMOVE_SPELL", payload: { index } });
                                }}
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                    {/* Add Spell Button */}
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => {
                            dispatch({ type: "ADD_SPELL" });
                        }}
                    >
                        Add Spell
                    </button>
                </div>
            </div>

            {/* Custom Rules */}
            <div className="col-md-12 mb-3">
                <h2 className="my-3">Custom Rules</h2>
                {state.customRules.map((rule, index) => (
                    <div key={index} className="d-flex align-items-center mb-2">

                        {/* Name */}
                        <div className="form-group me-3">
                            <label className="form-label">Name:</label>
                            <input
                                type="text"
                                className="form-control ms-2"
                                style={{ width: "200px" }}
                                placeholder="Name"
                                value={rule.name}
                                onChange={(e) => {
                                    dispatch({
                                        type: "UPDATE_CUSTOM_RULE",
                                        payload: {
                                            index,
                                            updatedRule: { name: e.target.value },
                                        },
                                    });
                                }}
                            />
                        </div>

                        {/* Rule Text */}
                        <div className="form-group me-3">
                            <label className="form-label">Rule</label>
                            <input
                                type="text"
                                className="form-control"
                                style={{ width: "600px" }}
                                placeholder="Custom Rule"
                                value={rule.text}
                                onChange={(e) => {
                                    dispatch({
                                        type: "UPDATE_CUSTOM_RULE",
                                        payload: {
                                            index,
                                            updatedRule: { text: e.target.value },
                                        },
                                    });
                                }}
                            />
                        </div>

                        {/* Rule Skill Cost */}
                        <div className="form-group me-3">
                            <label className="form-label">Skill Cost:</label>
                            <input
                                type="number"
                                className="form-control ms-2"
                                value={rule.skillCost}
                                onChange={(e) => {
                                    const skillCost = Number(e.target.value);
                                    dispatch({
                                        type: "UPDATE_CUSTOM_RULE",
                                        payload: {
                                            index,
                                            updatedRule: { skillCost },
                                        },
                                    });
                                }}
                            />
                        </div>

                        {/* Remove Button */}
                        <button
                            type="button"
                            className="btn btn-danger mt-4"
                            onClick={() => {
                                dispatch({ type: "REMOVE_CUSTOM_RULE", payload: { index } });
                            }}
                        >
                            Remove
                        </button>
                    </div>
                ))}
                {/* Add Custom Rule Button */}
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                        dispatch({ type: "ADD_CUSTOM_RULE" });
                    }}
                >
                    Add Custom Rule
                </button>
            </div>

        </div>
    );


}

export default NpcDesigner;
