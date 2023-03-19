import React, { useState, useEffect, useCallback } from 'react';
import qualitiesData from './qualities.json';
import baseItemsData from './homebrew-items.json';
import elementsData from './elements.json';


const CreateRareItem = () => {
    const [formValues, setFormValues] = useState({
        itemName: '',
        baseItem: baseItemsData[0].name,
        damageType: 'physical',
        quality: qualitiesData[0].name,
        modifiers: {
            oneHanded: false,
            twoHanded: false,
            accuracyBonus: false,
            damageIncrease: false,
        },
        accuracyCheck: {
            stat1: 'MIG',
            stat2: 'DEX',
        },
    });

    const [totalCost, setTotalCost] = useState(0);
    const [modifiedDamage, setModifiedDamage] = useState('');

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormValues((prevValues) => ({ ...prevValues, [name]: value }));
    };

    const handleModifierChange = (event) => {
        const { name, checked } = event.target;
        setFormValues((prevValues) => ({
            ...prevValues,
            modifiers: { ...prevValues.modifiers, [name]: checked },
        }));
    };

    const handleAccuracyCheckChange = (event) => {
        const { name, value } = event.target;
        setFormValues((prevValues) => ({
            ...prevValues,
            accuracyCheck: { ...prevValues.accuracyCheck, [name]: value },
        }));
    };    

    const selectedBaseItem = baseItemsData.find(
        (item) => item.name === formValues.baseItem
    );

    const selectedQuality = qualitiesData.find(
        (quality) => quality.name === formValues.quality
    )

    const getAttributesFromAccuracy = (accuracyStr) => {
        return accuracyStr.split(' + ').map((attr) => attr.trim());
    };

    const updateAccuracyCheckStats = (stat1, stat2) => {
        setFormValues((prevValues) => ({
          ...prevValues,
          accuracyCheck: {
            ...prevValues.accuracyCheck,
            stat1,
            stat2,
          },
        }));
      };
    
  

    const calculateCost = useCallback(() => {

        // Modify the damage based on the increaseDamageBonus checkbox
        let damage = selectedBaseItem.damage;
        if (formValues.modifiers.damageIncrease) {
            const damageValue = parseInt(damage.match(/\d+/)[0], 10) + 4;
            damage = damage.replace(/\d+/, damageValue.toString());
        }
        setModifiedDamage(damage);

        // If the base item is not found, return early
        if (!selectedBaseItem) {
            return;
        }

        let cost = selectedBaseItem.cost;

        if (formValues.damageType !== 'physical') {
            cost += 100;
        }

        cost += selectedQuality.cost;

        if (formValues.modifiers.oneHanded) {
            cost += 100;
        }

        if (formValues.modifiers.twoHanded) {
            cost += 100;
        }

        if (formValues.modifiers.accuracyBonus) {
            cost += 100;
        }

        if (formValues.modifiers.damageIncrease) {
            cost += 200;
        }

        if (formValues.accuracyCheck.stat1 === formValues.accuracyCheck.stat2) {
            cost += 50;
        }

        setTotalCost(cost);
    }, [formValues, selectedBaseItem, selectedQuality]);

    
    // recalculate the cost if the formvalues have changed
    useEffect(() => {
        calculateCost();
    }, [calculateCost]);

    // calculate the initial cost
    useEffect(() => {
        calculateCost();
    }, [calculateCost]);

    useEffect(() => {
        const attributes = getAttributesFromAccuracy(selectedBaseItem.accuracy);
        updateAccuracyCheckStats(attributes[0], attributes[1]);
      }, [selectedBaseItem]);

    return (
        <div className="container">
            <h2>Create Rare Item</h2>
            <div class="row">
                <div class="col">
                    <form>
                        <div className="form-group">
                            <label htmlFor="itemName">Item Name:</label>
                            <input
                                type="text"
                                name="itemName"
                                value={formValues.itemName}
                                onChange={handleInputChange}
                                className="form-control"
                                id="itemName"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="baseItem">Base Item:</label>
                            <select
                                name="baseItem"
                                value={formValues.baseItem.name}
                                onChange={handleInputChange}
                                className="form-control"
                                id="baseItem"
                            >
                                {baseItemsData.map((item) => (
                                    <option key={item.name} value={item.name}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="damageType">Damage Type:</label>
                            <select
                                name="damageType"
                                value={formValues.damageType}
                                onChange={handleInputChange}
                                className="form-control"
                                id="damageType"
                            >
                                {elementsData.map((element) => (
                                    <option key={element.name} value={element.name}>
                                        {element.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="quality">Quality:</label>
                            <select
                                name="quality"
                                value={formValues.quality.name}
                                onChange={handleInputChange}
                                className="form-control"
                                id="quality"
                            >
                                {qualitiesData.map((quality) => (
                                    <option key={quality.name} value={quality.name}>
                                        {quality.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <h3>Modifiers</h3>
                        <div className="form-check">
                            <input
                                type="checkbox"
                                name="oneHanded"
                                checked={formValues.modifiers.oneHanded}
                                onChange={handleModifierChange}
                                className="form-check-input"
                                id="oneHanded"
                                disabled={selectedBaseItem.hands === "One-Handed"}
                            />
                            <label className="form-check-label" htmlFor="oneHanded">
                                One-Handed (-4 damage, -100 zenit)
                            </label>
                        </div>
                        <div className="form-check">
                            <input
                                type="checkbox"
                                name="twoHanded"
                                checked={formValues.modifiers.twoHanded}
                                onChange={handleModifierChange}
                                className="form-check-input"
                                id="twoHanded"
                                disabled={selectedBaseItem.hands === "Two-Handed"}
                            />
                            <label className="form-check-label" htmlFor="twoHanded">
                                Two-Handed (+4 damage, +100 zenit)
                            </label>
                        </div>
                        <div className="form-check">
                            <input
                                type="checkbox"
                                name="accuracyBonus"
                                checked={formValues.modifiers.accuracyBonus}
                                onChange={handleModifierChange}
                                className="form-check-input"
                                id="accuracyBonus"
                            />
                            <label className="form-check-label" htmlFor="accuracyBonus">
                                +1 Accuracy Bonus (+100 zenit)
                            </label>
                        </div>
                        <div className="form-check">
                            <input
                                type="checkbox"
                                name="damageIncrease"
                                checked={formValues.modifiers.damageIncrease}
                                onChange={handleModifierChange}
                                className="form-check-input"
                                id="damageIncrease"
                            />
                            <label className="form-check-label" htmlFor="damageIncrease">
                                Increase Damage by 4 (+200 zenit)
                            </label>
                        </div>

                        <h3>Accuracy Check</h3>
                        <div className="form-group">
                            <label htmlFor="stat1">Stat 1:</label>
                            <select
                                name="stat1"
                                value={formValues.accuracyCheck.stat1}
                                onChange={handleAccuracyCheckChange}
                                className="form-control"
                                id="stat1"
                            >
                                <option value="MIG">MIG</option>
                                <option value="DEX">DEX</option>
                                <option value="INS">INS</option>
                                <option value="WLP">WLP</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="stat2">Stat 2:</label>
                            <select
                                name="stat2"
                                value={formValues.accuracyCheck.stat2}
                                onChange={handleAccuracyCheckChange}
                                className="form-control"
                                id="stat2"
                            >
                                <option value="MIG">MIG</option>
                                <option value="DEX">DEX</option>
                                <option value="INS">INS</option>
                                <option value="WLP">WLP</option>
                            </select>
                        </div>
                    </form>
                </div>
                <div class="col">
                    <div className="card mt-4">
                        <div className="card-header">
                            <h5>Weapon Details</h5>
                        </div>
                        <div className="card-body">
                            <ul className="list-group list-group-flush">
                                <li className="list-group-item">Name: {formValues.itemName}</li>
                                <li className="list-group-item">Accuracy Check: {formValues.accuracyCheck.stat1} + {formValues.accuracyCheck.stat2}</li>
                                <li className="list-group-item">Damage: {modifiedDamage}</li>
                                <li className="list-group-item">Hands: {selectedBaseItem.hands}</li>
                                <li className="list-group-item">Reach: {selectedBaseItem.reach}</li>
                                <li className="list-group-item">Element: {formValues.damageType}</li>
                                <li className="list-group-item">Qualities: {selectedBaseItem.qualities} {selectedQuality.name}</li>
                                <li className="list-group-item">Base Item: {selectedBaseItem.name}</li>
                                <li className="list-group-item">Total Cost: {totalCost} zenit</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );

};

export default CreateRareItem;
