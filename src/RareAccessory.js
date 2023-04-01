import React, { useState, useEffect, useCallback } from 'react';
import armorQualities from "./armorQualities.json"

const RareAccessory = () => {
  const [selectedQuality, setSelectedQuality] = useState(null);
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

    const quality = armorQualities.find(q => q.name === selectedQuality);

    const accessory = {
      name: customName || `Accessory with ${selectedQuality}`,
      cost: quality.cost,
      qualities: [
        {
          name: quality.name,
          effect: quality.effect,
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
      {combinedAccessory && (
        <div>
          <h2>Result:</h2>
          <ul className="list-group">
            <li className="list-group-item"><strong>Name:</strong> {combinedAccessory.name}</li>
            <li className="list-group-item"><strong>Cost:</strong> {combinedAccessory.cost}</li>
            <li className="list-group-item">
              <strong>Qualities:</strong>
              <ul>
                {combinedAccessory.qualities.map(q => (
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

export default RareAccessory;
