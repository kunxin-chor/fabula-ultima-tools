import React, { useState, useEffect, useCallback } from 'react';
import armorQualities from "./armorQualities.json";
import QualityDropdown from './QualityDrop';
import QualitiesList from './QualitiesList';

const RareAccessory = () => {
  const storageKey = 'rareAccessories';
  const [selectedQuality, setSelectedQuality] = useState(armorQualities[0]);
  const [customName, setCustomName] = useState('');
  const [combinedAccessory, setCombinedAccessory] = useState(null);
  const [storedAccessories, setStoredAccessories] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [budget, setBudget] = useState(1000);

  const randomizeAccessory = () => {
    let randomQuality;
    do {
      randomQuality = armorQualities[Math.floor(Math.random() * armorQualities.length)];
    } while (randomQuality.cost > budget);
  
    setSelectedQuality(randomQuality);
  };


  const copyToClipboard = useCallback(() => {
    if (!combinedAccessory) return;

    const jsonText = JSON.stringify(combinedAccessory, null, 2);
    navigator.clipboard.writeText(jsonText).then(
      () => alert('Copied to clipboard!'),
      () => alert('Failed to copy to clipboard.')
    );
  }, [combinedAccessory]);

  const saveToLocalStorage = () => {
    if (!combinedAccessory) return;

    const toSave = {
      ...combinedAccessory,
      quality: selectedQuality.name,
    };

    if (selectedIndex > -1) {
      storedAccessories[selectedIndex] = toSave;
    } else {
      storedAccessories.push(toSave);
    }

    localStorage.setItem(storageKey, JSON.stringify(storedAccessories));
    setStoredAccessories([...storedAccessories]);
    alert('Saved to Local Storage!');
  };

  const deleteFromLocalStorage = (index) => {
    const filteredAccessories = storedAccessories.filter((_, i) => i !== index);
    localStorage.setItem(storageKey, JSON.stringify(filteredAccessories));
    setStoredAccessories(filteredAccessories);
    alert('Deleted from Local Storage!');
  };

  const handleStoredAccessorySelect = (e) => {
    const accessoryName = e.target.value;
    const index = storedAccessories.findIndex(a => a.name === accessoryName);

    if (index > -1) {
      const accessory = storedAccessories[index];
      const quality = armorQualities.find(q => q.name === accessory.quality);
      setSelectedQuality(quality);
      setCustomName(accessory.customName || '');
      setSelectedIndex(index);
      setTimeout(() => {
        setCombinedAccessory(accessory);
      }, 500);
    } else {
      setSelectedIndex(-1);
    }
  };

  useEffect(() => {
    const storedAccessories = JSON.parse(localStorage.getItem(storageKey)) || [];
    setStoredAccessories(storedAccessories);
  }, []);

  useEffect(() => {
    if (!selectedQuality) {
      setCombinedAccessory(null);
      return;
    }

    const accessory = {
      name: customName || `Accessory with ${selectedQuality.name}`,
      cost: selectedQuality.cost,
      qualities: [
        {
          name: selectedQuality.name,
          effect: selectedQuality.effect,
        },
      ],
    };
    setCombinedAccessory(accessory);
  }, [selectedQuality, customName]);

  return (
    <div className="container">
      <h1>Create Accessory</h1>
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
  <label htmlFor="budget" className="form-label">Enter your budget: </label>
  <input id="budget" className="form-control" type="number" value={budget} onChange={e => setBudget(e.target.value)} />
  <button className="btn btn-primary btn-sm mt-3" onClick={randomizeAccessory}>
          Randomize
        </button>
</div>
      <div className="mb-3">
        <label htmlFor="custom-name" className="form-label">Assign a custom name (optional): </label>
        <input id="custom-name" className="form-control" type="text" value={customName} onChange={e => setCustomName(e.target.value)} />
      </div>
      {combinedAccessory && (
        <div>
          <h2>Result:</h2>
          <ul className="list-group">
            <li className="list-group-item"><strong>Name:</strong> {combinedAccessory.name}</li>
            <li className="list-group-item"><strong>Cost:</strong> {combinedAccessory.cost}</li>
            <QualitiesList
              combinedQualities={combinedAccessory.qualities}
              setCombinedQualities={(newQualities) => {
                setCombinedAccessory({ ...combinedAccessory, qualities: newQualities });
              }}
            />
          </ul> <button className="btn btn-primary mt-2" onClick={copyToClipboard}>
            Copy to Clipboard
          </button>
          <button className="btn btn-primary mt-2" onClick={saveToLocalStorage}>
            Save to Local Storage
          </button>
        </div>
      )}

      <div className="mt-3">
        <label htmlFor="stored-accessories" className="form-label">Select stored accessory: </label>
        <select id="stored-accessories" className="form-select" onChange={handleStoredAccessorySelect}>
          <option value="">Choose...</option>
          {storedAccessories.map((accessory, index) => (
            <option key={accessory.name} value={accessory.name}>
              {accessory.name}
            </option>
          ))}
        </select>
        {selectedIndex > -1 && (
          <button className="btn btn-danger mt-2 ms-2" onClick={() => deleteFromLocalStorage(selectedIndex)}>
            Delete from Local Storage
          </button>
        )}
      </div>
    </div>
  );
};

export default RareAccessory;


