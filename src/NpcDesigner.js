import React, { useReducer, useMemo, useCallback } from 'react';
import npcReducer from './NpcDesigner/NpcReducer';
import "./NpcDesigner/npc.css"
import speciesList from "./NpcDesigner/species.json"
import elements from "./elements.json";
const attributes = ["DEX", "INS", "MIG", "WLP"];
const statuses = ["enraged", "shaken", "poisoned", "weak", "dazed", "slowed"];

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
    improvedDefense: {
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
        "use_equipment": false,
    }
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

    function getSkillPointsLeft(level, elementalAffinities, baseSkillPoints, skillOptions) {
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
        const immuneCost = Math.max(0, extraImmunities);
        const absorbCost = Object.values(elementalAffinities).filter(
            (affinity) => affinity === "absorb"
        ).length;

        // account for selected species' base elemental affinities cost as discount

        const selectedSpecies = speciesList[state.species] || {
            elementalAffinities: {}
        };
        const existingElementCost = Object.entries(selectedSpecies.elementalAffinities)
            .reduce((total, [element, affinity]) => {
                if (affinity === "resistant") {
                    return total + 0.5;
                } else if (affinity === "immune") {
                    return total + 1;
                } else if (affinity === "absorb") {
                    return total + 1;
                };
                return total;
            }, 0);


        const totalElementalCost = resistantCost + immuneCost + absorbCost - existingElementCost;

        const improvedDefenseCost = skillOptions.improved_defenses.filter(option => option.defense !== 0).length;

        const specializedCost = Object.values(skillOptions.specialized).filter(value => value).length;

        const improvedHitPointsCost = skillOptions.improved_hit_points;

        const improvedInitiativeCost = skillOptions.improved_initative;

        const useEquipmentCost = skillOptions.use_equipment ? 1 : 0;

        const totalOtherCost = improvedDefenseCost + specializedCost + improvedHitPointsCost + improvedInitiativeCost + useEquipmentCost;

        return baseSkillPoints + skillPointsFromLevel + skillPointsFromVulnerabilities - totalElementalCost - totalOtherCost;
    }

    const skillPointsLeft = useMemo(
        () => getSkillPointsLeft(state.level, state.elementalAffinities, state.baseSkillPoints, state.skillOptions),
        [state.level, state.elementalAffinities, state.baseSkillPoints, state.skillOptions]
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

            {/* Name and Level */}
            <div className="row">
                <div className="col-md-6 mb-3">
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

                <div className="col-md-6 mb-3">
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
            </div>

            {/* Traits */}
            <div className="mb-4">
                <h3>Traits</h3>
                {state.traits.map((t, index) => (
                    <div key={index} className="form-group">
                        <input
                            type="text"
                            className="form-control mb-2"
                            value={t}
                            onChange={(e) => {
                                dispatch({
                                    type: "UPDATE_TRAIT_TEXT",
                                    payload: { index, value: e.target.value },
                                });
                            }}
                        />
                    </div>
                ))}
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        dispatch({
                            type: "ADD_TRAIT",
                        });
                    }}
                >
                    Add Trait
                </button>
            </div>

            {/* Attributes */}
            <div className="mb-4">
                <h3>Attributes</h3>
                <div className="row">
                    {Object.entries(state.attributes).map(([key, value]) => (
                        <div key={key} className="col-md-6 mb-3">
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

            {/* Species */}
            <div className="mb-4">
                <h3>Species</h3>
                <div className="form-group">
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

            {/* Elemental Affinities */}
            <div className="mb-4">
                <h3>Elemental Affinities</h3>
                <ul>
                    <li>Free Resistances: {freeResistancesLeft}</li>
                    <li>Free Immunities: {freeImmunitiesLeft}</li>
                </ul>
                <div className="row mt-3">
                    {elements.map(({ name: value }) => (
                        <div key={value} className="col-sm-6 mb-2">
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
            </div>
            {/* Status Affinities */}
            <div className="mb-4">
                <h3>Status Affinities</h3>
                <div className="row">
                    {statuses.map((status, index) => (
                        <div key={status} className="col-12 col-md-6 col-lg-4">
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

            {/* Skills */}
            <div className="mb-4">
                <h3>Skills</h3>
                <p>Max Skill Points:{maxSkillPoints}</p>
                <p>Skill Points Left:{skillPointsLeft}</p>

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
            <div className="mb-4">
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

            {/* Improved Hit Points */}
            <div className="form-group mb-3">
                <label htmlFor="improved_hit_points">Improved Hit Points:</label>
                <input
                    type="number"
                    className="form-control"
                    id="improved_hit_points"
                    name="improved_hit_points"
                    value={state.skillOptions.improved_hit_points}
                    min="0"
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
            <div className="form-group mb-3">
                <label htmlFor="improved_initiative">Improved Initiative:</label>
                <input
                    type="number"
                    className="form-control"
                    id="improved_initiative"
                    name="improved_initiative"
                    value={state.skillOptions.improved_initative}
                    min="0"
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

            {/* Use Equipment */}
            <div className="form-group mb-3">
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
    );


}

export default NpcDesigner;
