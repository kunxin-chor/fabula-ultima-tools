import React, { useState, useEffect, useCallback } from 'react';
import baseArmors from "./baseArmor.json"
import armorQualities from "./armorQualities.json"
import QualityDropdown from './QualityDrop';
import QualitiesList from './QualitiesList';


const RareDefensiveGear = () => {
    const storageKey = 'rareDefensiveGears';
    const [selectedBase, setSelectedBase] = useState(baseArmors[0].name);
    const [selectedQuality, setSelectedQuality] = useState(armorQualities[0]);
    const [customName, setCustomName] = useState('');
    const [combinedArmor, setCombinedArmor] = useState(null);
    const [storedGears, setStoredGears] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [budget, setBudget] = useState(1000);

    const copyToClipboard = useCallback(() => {
        if (!combinedArmor) return;

        const jsonText = JSON.stringify(combinedArmor, null, 2);
        navigator.clipboard.writeText(jsonText).then(
            () => alert('Copied to clipboard!'),
            () => alert('Failed to copy to clipboard.')
        );
    }, [combinedArmor]);

    const saveToLocalStorage = () => {
        if (!combinedArmor) return;

        const toSave  = {
            ...combinedArmor,
            base: selectedBase,
        }

        if (selectedIndex > -1) {
            storedGears[selectedIndex] = toSave;
        } else {
            storedGears.push(toSave);
        }

        localStorage.setItem(storageKey, JSON.stringify(storedGears));
        setStoredGears([...storedGears]);
        alert('Saved to Local Storage!');
    };

    const handleStoredGearSelect = (e) => {
        const gearName = e.target.value;
        const index = storedGears.findIndex(g => g.name === gearName);
        if (index > -1) {
            const gear = storedGears[index];
            
            setSelectedBase(gear.base);
            const quality = armorQualities.find(q => q.name === gear.quality);
            setSelectedQuality(quality);
            setCustomName(gear.customName || '');
            setTimeout(() => {
                setCombinedArmor(gear);
            }, 500);
      
            setSelectedIndex(index);
        } else {
            setSelectedIndex(-1);
        }
    };

    const deleteFromLocalStorage = () => {
        if (selectedIndex === -1) {
            alert("No gear selected to delete");
            return;
        }

        const filteredGears = storedGears.filter((gear, index) => index !== selectedIndex);
        localStorage.setItem(storageKey, JSON.stringify(filteredGears));
        setStoredGears(filteredGears);
        setSelectedIndex(-1);
        alert('Deleted from Local Storage!');
    };

    const generateRandomItem = (budget) => {
       
        let limit = 0;
        let randomQuality, randomBaseArmor, cost=0;
        
        do {

            if (limit > 1000) {
                alert("Unable to generate a random defensive gear")
                break;              
            }
            limit++;
            randomBaseArmor = baseArmors[Math.floor(Math.random() * baseArmors.length)];
            randomQuality = armorQualities[Math.floor(Math.random() * armorQualities.length)];

            // calculate the cost of the item
            cost = randomBaseArmor.cost + randomQuality.cost;


        } while (cost > budget);
     
        
        // if the cost is within the budget, set the selected quality to the random quality
        if (cost <= budget) {
            setSelectedBase(randomBaseArmor.name);
            setSelectedQuality(randomQuality);
            
        }

    }

    useEffect(() => {
        const storedGears = JSON.parse(localStorage.getItem(storageKey)) || [];
        setStoredGears(storedGears);
    }, []);




    useEffect(() => {
        if (!selectedBase || !selectedQuality) {
            setCombinedArmor(null);
            return;
        }

        const baseArmor = baseArmors.find(armor => armor.name === selectedBase);

        // const quality = armorQualities.find(q => q.name === selectedQuality);
        // console.log("found quality ==", quality)
        const qualityEffects = [];

        if (baseArmor.quality && baseArmor.quality !== "No Quality") {
            qualityEffects.push({
                "name": baseArmor.quality.name,
                "effect": baseArmor.quality.effect
            })
        }

        if (selectedQuality) {        
            qualityEffects.push({
                "name": selectedQuality.name,
                "effect": selectedQuality.effect,
            })
        }

        const rareArmor = {
            ...baseArmor,
            name: customName || `${baseArmor.name} with ${selectedQuality.name}`,
            cost: baseArmor.cost + (selectedQuality?.cost || 0),
            quality: selectedQuality.name,
            qualities: qualityEffects,
        };
        setCombinedArmor(rareArmor);
    }, [selectedBase, selectedQuality, customName]);

    return (
        <div className="container">
            <h1>Create Rare Armor or Shield</h1>
            <div className="mb-3">
                <label htmlFor="base-armor" className="form-label">Select base armor or shield: </label>
                <select id="base-armor" value={selectedBase} className="form-select" onChange={e => setSelectedBase(e.target.value)}>
                    <option value="">Choose...</option>
                    {baseArmors.map(armor => (
                        <option key={armor.name} value={armor.name}>
                            {armor.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="mb-3">
                <label htmlFor="budget" className="form-label">Enter your budget: </label>
                <input id="budget" className="form-control" type="number" value={budget} onChange={e => setBudget(e.target.value)} />
                <button className="btn btn-primary btn-sm mt-3" onClick={()=>{
                    generateRandomItem(budget);
                }}>Randomize</button>        
            </div>
            <div className="mb-3">                
                <label htmlFor="quality" className="form-label">Select a quality: </label>
                <QualityDropdown
                    qualities={armorQualities}
                    selectedQuality={selectedQuality}
                    onSelect={setSelectedQuality}
                    effectKey="effect"
                />                
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
                        <QualitiesList
                            combinedQualities={combinedArmor.qualities}
                            setCombinedQualities={(newQualities) => {
                                setCombinedArmor({ ...combinedArmor, qualities: newQualities });
                            }}
                        />
                    </ul>
                    <button className="btn btn-primary mt-2" onClick={copyToClipboard}>
                        Copy to Clipboard
                    </button>
                    <button className="btn btn-primary mt-2" onClick={saveToLocalStorage}>
                        Save to Local Storage
                    </button>
                  
                </div>

            )}
              <div className="mt-3">
                <label htmlFor="stored-gears" className="form-label">Select stored gear: </label>
                <select id="stored-gears" className="form-select" onChange={handleStoredGearSelect}>
                    <option value="">Choose...</option>
                    {storedGears.map(gear => (
                        <option key={gear.name} value={gear.name}>
                            {gear.name}
                        </option>
                    ))}
                </select>
                <button className="btn btn-danger mt-2 ms-2" onClick={deleteFromLocalStorage}>
                        Delete from Local Storage
                    </button>
            </div>
        </div>
    );
};

export default RareDefensiveGear;
