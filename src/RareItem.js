import React, { useState, useEffect, useCallback } from 'react';
import qualitiesData from './qualities.json';
import baseItemsData from './baseItems.json';
import elementsData from './elements.json';
import QualityDropdown from './QualityDrop';
import QualitiesList from './QualitiesList';

const LOCAL_STORAGE_KEY = 'rare-weapons';

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
            stat1: 'DEX',
            stat2: 'DEX',
        },


    });

    

    // for saving/loading from localstorage
    const [savedItems, setSavedItems] = useState([]);
    const [loadedItemIndex, setLoadedItemIndex] = useState(null);

    const [totalCost, setTotalCost] = useState(0);
    const [modifiedDamage, setModifiedDamage] = useState('');
    const [combinedQualities, setCombinedQualities] = useState([]);
    const [alreadyHaveAccuracyBonus, setAlreadyHaveAccuracyBonus] = useState(false);

    const loadFromLocalStorage = (index) => {
        if (index === "") {
            setLoadedItemIndex(null);
            return;
        }
        console.log(savedItems[index]);
        const { combinedQualities, ...loadedItem} = savedItems[index];
        setFormValues(loadedItem);
        
        setTimeout(function(){
               // updated combined qualities after the form has been set
        setCombinedQualities(combinedQualities);

        },
        200)
     
    

        setLoadedItemIndex(index);
    };

    const saveToLocalStorage = () => {
        const currentSavedItems = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];

        const toSave =   JSON.parse(JSON.stringify(formValues));
        toSave.combinedQualities = combinedQualities;
      

        if (loadedItemIndex !== null) {
            // Update the existing item in the local 
            currentSavedItems[loadedItemIndex] = toSave;
          
        } else {
            // Add a new item to the local storage
            currentSavedItems.push(toSave);
        }

        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentSavedItems));
        setSavedItems(currentSavedItems);
    };


    const deleteFromLocalStorage = () => {
        if (loadedItemIndex === null) {
            alert("Please load an item before attempting to delete it.");
            return;
        }

        const currentSavedItems = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
        currentSavedItems.splice(loadedItemIndex, 1);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentSavedItems));
        setSavedItems(currentSavedItems);
        setLoadedItemIndex(null);
        alert("Item deleted from local storage.");
    };

    // Add an effect to initialize the saved items from local storage
    useEffect(() => {
        const currentSavedItems = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
        setSavedItems(currentSavedItems);
    }, []);

    const escapeCSVValue = (value) => {
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      };

      const flattenObject = (obj, prefix = '') => {
        const flattened = {};
      
        for (const key in obj) {
          if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
            Object.assign(flattened, flattenObject(obj[key], `${prefix}${key}.`));
          } else {
            flattened[`${prefix}${key}`] = obj[key];
          }
        }
      
        return flattened;
      };
      
      const formatQuality = (quality) => {
        return `${quality.name}: ${quality.effect}`;
      };
      

      const exportToCSV = () => {
        const currentSavedItems = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
      
        if (currentSavedItems.length === 0) {
          alert("No items found in local storage to export.");
          return;
        }

        const formattedItems = currentSavedItems.map(item => {

          const {combinedQualities, ...toSave} = item;

          const flattened = flattenObject(toSave);
          flattened.qualities = item.combinedQualities.map(formatQuality).join('|');
          return flattened;
        });
      
        const header = Object.keys(formattedItems[0]).map(escapeCSVValue).join(',') + '\n';
        const csvData = formattedItems.map(item => Object.values(item).map(escapeCSVValue).join(',')).join('\n');
        const csv = header + csvData;
      
        navigator.clipboard.writeText(csv)
          .then(() => alert("CSV data copied to clipboard."))
          .catch(() => alert("Failed to copy CSV data to clipboard."));
      };

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

    const handleQualitySelection = (quality) => {
        setFormValues((prevValues) => ({ ...prevValues, quality: quality.name }));
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
        let damageValue = parseInt(damage.match(/\d+/)[0], 10);
        if (formValues.modifiers.damageIncrease) {
            damageValue += 4;
        }
        if (formValues.modifiers.twoHanded) {
            damageValue += 4;
        }
        if (formValues.modifiers.oneHanded) {
            damageValue -= 4;
        }

        damage = damage.replace(/\d+/, damageValue.toString());
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


    useEffect(() => {
        const attributes = getAttributesFromAccuracy(selectedBaseItem.accuracy);
        updateAccuracyCheckStats(attributes[0], attributes[1]);
        let accuracyBonus = attributes[2] ? true : false;

        const qualitiyEffects = [];

        // if there is a quality, and it is not "No Quality"
        // add the quality to the list of quality effects
        if (selectedBaseItem.qualities && selectedBaseItem.qualities !== 'No Quality') {
            qualitiyEffects.push(...selectedBaseItem.qualities.map((quality) => {
                return {
                    "name": quality.name,
                    "effect": quality.description
                }
            }));

        }

        if (selectedQuality) {
            qualitiyEffects.push({
                "name": selectedQuality.name,
                "effect": selectedQuality.description
            });
        }



        setFormValues((prevValues) => ({
            ...prevValues,
            modifiers: {
                ...prevValues.modifiers,
            }
        }));

        setCombinedQualities(qualitiyEffects);

        setAlreadyHaveAccuracyBonus(accuracyBonus);

    }, [selectedBaseItem, selectedQuality]);


    const generateJsonOutput = () => {
        const jsonOutput = {
            itemName: formValues.itemName,
            accuracyCheck: {
                stat1: formValues.accuracyCheck.stat1,
                stat2: formValues.accuracyCheck.stat2,
            },
            accuracyModifier: formValues.modifiers.accuracyBonus ? 1 : 0,
            damage: modifiedDamage,
            hands: selectedBaseItem.hands.toLowerCase(),
            reach: selectedBaseItem.reach.toLowerCase(),
            damageType: formValues.damageType.toLowerCase(),
            qualities: combinedQualities,
            baseItem: selectedBaseItem.name,
            totalCost: totalCost,
        };

        return JSON.stringify(jsonOutput, null, 2);
    };

    const copyStateToClipboard = async () => {
        try {
            const jsonState = generateJsonOutput();
            await navigator.clipboard.writeText(jsonState);
            alert('State copied to clipboard');
        } catch (err) {
            alert('Failed to copy state to clipboard');
        }
    };



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
                                value={formValues.baseItem}
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
                        <div className="form-group mt-2 mb-2">
                            <label>Quality</label>
                            <QualityDropdown
                                qualities={qualitiesData}
                                selectedQuality={selectedQuality}
                                onSelect={handleQualitySelection}
                            />
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
                            <label className="form-check-label" htmlFor="accuracyBonus" disabled={alreadyHaveAccuracyBonus}>
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
                                <li className="list-group-item">Accuracy Check: {formValues.accuracyCheck.stat1}
                                    + {formValues.accuracyCheck.stat2}
                                    {formValues.modifiers.accuracyBonus ? <span> + 1</span> : null}
                                </li>
                                <li className="list-group-item">Damage: {modifiedDamage}</li>
                                <li className="list-group-item">Hands: {selectedBaseItem.hands}</li>
                                <li className="list-group-item">Reach: {selectedBaseItem.reach}</li>
                                <li className="list-group-item">Element: {formValues.damageType}</li>
                                <QualitiesList
                                    setCombinedQualities={setCombinedQualities}
                                    combinedQualities={combinedQualities}
                                />
                                <li className="list-group-item">Base Item: {selectedBaseItem.name}</li>
                                <li className="list-group-item">Reach: {selectedBaseItem.reach}</li>
                                <li className="list-group-item">Total Cost: {totalCost} zenit</li>

                            </ul>
                            <button className="mt-3" onClick={copyStateToClipboard}>Copy State to Clipboard</button>
                            <button className="mt-3 ml-3" onClick={saveToLocalStorage}>
                                Save to Local Storage
                            </button>
                            <div className="form-group mt-3">
                                <label htmlFor="savedItems">Load from Local Storage:</label>
                                <select
                                    name="savedItems"
                                    onChange={(e) => loadFromLocalStorage(e.target.value)}
                                    className="form-control"
                                    id="savedItems"
                                >
                                    <option value="">Select a saved item</option>
                                    {savedItems.map((item, index) => (
                                        <option key={index} value={index}>
                                            {item.itemName}
                                        </option>
                                    ))}
                                </select>

                                <button className="mt-3 ml-3" onClick={deleteFromLocalStorage}>
                                    Delete from Local Storage
                                </button>

                                <button classname="mt-3 ms-3" onClick={exportToCSV}>Exported Save Items</button>
                            </div>

                        </div>
                    </div>
                </div>
            </div>


        </div>
    );

};

export default CreateRareItem;
