import React, { useState, useEffect, useCallback } from 'react';
import armorQualities from "./armorQualities.json";
import QualityDropdown from './QualityDrop';
import QualitiesList from './QualitiesList';

const RareAccessory = () => {
  const [selectedQuality, setSelectedQuality] = useState(armorQualities[0]);
  const [customName, setCustomName] = useState('');
  const [combinedAccessory, setCombinedAccessory] = useState(null);

  const copyToClipboard = useCallback(() => {
    if (!combinedAccessory) return;

    const jsonText = JSON.stringify(combinedAccessory, null, 2);
    navigator.clipboard.writeText(jsonText).then(
      () => alert('Copied to clipboard!'),
      () => alert('Failed to copy to clipboard.')
    );
  }, [combinedAccessory]);

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
              setCombinedAccessory({ ...combinedAccessory, qualities: newQualities })
            }
            }
          />
          </ul>
        
          <button className="btn btn-primary mt-2" onClick={copyToClipboard}>
            Copy to Clipboard
          </button>
        </div>
      )}
    </div>
  );
};

export default RareAccessory;
