import React, { useState, useEffect, useCallback } from 'react';
import baseArmors from "./baseArmor.json"
import armorQualities from "./armorQualities.json"

const RareDefensiveGear = () => {
    const [selectedBase, setSelectedBase] = useState(null);
    const [selectedQuality, setSelectedQuality] = useState(null);
    const [customName, setCustomName] = useState('');
    const [combinedArmor, setCombinedArmor] = useState(null);

    const copyToClipboard = useCallback(() => {
        if (!combinedArmor) return;

        const jsonText = JSON.stringify(combinedArmor, null, 2);
        navigator.clipboard.writeText(jsonText).then(
            () => alert('Copied to clipboard!'),
            () => alert('Failed to copy to clipboard.')
        );
    }, [combinedArmor]);

    useEffect(() => {
        if (!selectedBase || !selectedQuality) {
            setCombinedArmor(null);
            return;
        }

        const baseArmor = baseArmors.find(armor => armor.name === selectedBase);

        const mergedQualities = baseArmor.quality && baseArmor.quality !== "No Quality"
            ? [baseArmor.quality, selectedQuality]
            : [selectedQuality];

        const quality = armorQualities.find(q => q.name === selectedQuality);     
        const qualityEffects = [];

        if(baseArmor.quality && baseArmor.quality !== "No Quality") {
            qualityEffects.push({
                "name": baseArmor.quality.name,
                "effect": baseArmor.quality.effect
            })
        }

        if (quality) {
            qualityEffects.push({
                "name": quality.name,
                "effect": quality.effect,                
            })
        }

        const rareArmor = {
            ...baseArmor,
            name: customName || `${baseArmor.name} with ${selectedQuality}`,
            cost: baseArmor.cost + quality.cost,
            qualities: qualityEffects,
        };
        setCombinedArmor(rareArmor);
    }, [selectedBase, selectedQuality, customName]);

    return (
        <div className="container">
            <h1>Create Rare Armor or Shield</h1>
            <div className="mb-3">
                <label htmlFor="base-armor" className="form-label">Select base armor or shield: </label>
                <select id="base-armor" className="form-select" onChange={e => setSelectedBase(e.target.value)}>
                    <option value="">Choose...</option>
                    {baseArmors.map(armor => (
                        <option key={armor.name} value={armor.name}>
                            {armor.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="mb-3">
                <label htmlFor="quality" className="form-label">Select a quality: </label>
                <select id="quality" className="form-select" onChange={e => setSelectedQuality(e.target.value)}>
                    <option value="">Choose...</option>
                    {armorQualities.map(quality => (
                        <option key={quality.name} value={quality.name}>
                            {quality.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="mb-3">
                <label htmlFor="custom-name" className="form-label">Assign a custom name (optional): </label>
                <input id="custom-name" className="form-control" type="text" value={customName} onChange={e => setCustomName(e.target.value)} />
            </div>
            {combinedArmor && (
                <div>
                    <h2>Result:</h2>
                    <ul className="list-group">
                        <li className="list-group-item"><strong>Name:</strong> {combinedArmor.name}</li>
                        <li className="list-group-item"><strong>Defense:</strong> {combinedArmor.defense}</li>
                        <li className="list-group-item"><strong>Martial:</strong> {combinedArmor.martial.toString()}</li>
                        <li className="list-group-item"><strong>Cost:</strong> {combinedArmor.cost}</li>
                        <li className="list-group-item"><strong>Initiative:</strong> {combinedArmor.initiative}</li>
                        <li className="list-group-item"><strong>Magic Defense:</strong> {combinedArmor.magicDefense}</li>
                        <li className="list-group-item">
                            <strong>Qualities:</strong>
                            <ul>
                                {combinedArmor.qualities.map(q => (
                                    <li key={q.name}>
                                        {q.name}: {q.effect}
                                    </li>
                                ))}
                            </ul>
                        </li>
                    </ul>
                    <button className="btn btn-primary mt-2" onClick={copyToClipboard}>
                        Copy to Clipboard
                    </button>
                </div>
            )}
        </div>
    );
};

export default RareDefensiveGear;