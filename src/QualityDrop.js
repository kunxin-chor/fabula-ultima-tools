import React, { useState, useEffect, useRef } from "react";
import "./qualityDropdown.css";

const QualityDropdown = ({ qualities, selectedQuality, onSelect, effectKey="description" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = (e) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  const handleSelection = (quality) => {
    onSelect(quality);
    setIsOpen(false);
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
        </div>
      )}
    </div>
  );
};

export default QualityDropdown;
