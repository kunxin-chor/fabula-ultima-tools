import React, { useState, useEffect, useRef } from "react";
import "./qualityDropdown.css";

const QualityDropdown = ({ qualities, selectedQuality, onSelect, effectKey = "description" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [customQuality, setCustomQuality] = useState({ name: '', effect: '', cost: '' });
    const dropdownRef = useRef(null);
  
    const toggleDropdown = (e) => {
      e.preventDefault();
      setIsOpen(!isOpen);
    };
  
    const handleSelection = (quality) => {
      onSelect(quality);
      setIsOpen(false);
    };
  
    const handleCustomQualityChange = (event) => {
        const { name, value } = event.target;
        const parsedValue = name === "cost" ? parseInt(value, 10) || 0 : value;
        setCustomQuality((prevValues) => ({ ...prevValues, [name]: parsedValue }));
      };
  
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
  
    useEffect(() => {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    return (
        <div ref={dropdownRef} className="quality-dropdown">
          <button className="quality-dropdown__toggle" onClick={toggleDropdown}>
            {selectedQuality.name}
          </button>
          {isOpen && (
            <div className="quality-dropdown__menu">
              {qualities.map((quality) => (
                <div
                  key={quality.name}
                  className="quality-dropdown__menu-item"
                  onClick={() => handleSelection(quality)}
                >
                  <div className="quality-dropdown__menu-item-name">
                    {quality.name} ({quality.cost})
                  </div>
                  <div className="quality-dropdown__menu-item-effect">
                    {quality[effectKey]}
                  </div>
                </div>
              ))}
              <hr />
              <div>
                <strong>Custom Quality</strong>
                <div className="mb-3">
                  <label htmlFor="customQualityName" className="form-label">Name:</label>
                  <input
                    type="text"
                    id="customQualityName"
                    name="name"
                    value={customQuality.name}
                    onChange={handleCustomQualityChange}
                    className="form-control"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="customQualityEffect" className="form-label">Effect:</label>
                  <input
                    type="text"
                    id="customQualityEffect"
                    name="effect"
                    value={customQuality.effect}
                    onChange={handleCustomQualityChange}
                    className="form-control"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="customQualityCost" className="form-label">Cost:</label>
                  <input
                    type="number"
                    id="customQualityCost"
                    name="cost"
                    value={customQuality.cost}
                    onChange={handleCustomQualityChange}
                    className="form-control"
                  />
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => handleSelection(customQuality)}
                  disabled={!customQuality.name || !customQuality.effect || !customQuality.cost}
                >
                  Select Custom Quality
                </button>
              </div>
            </div>
          )}
        </div>
      );
};

export default QualityDropdown;
