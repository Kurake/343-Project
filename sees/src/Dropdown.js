import React, { useState } from 'react';

const Dropdown = ({ buttonText, options, onSelect, className }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleMouseEnter = () => {
        setIsOpen(true);
      };
    
      // Hide the dropdown when the mouse leaves the button or menu
      const handleMouseLeave = () => {
        setIsOpen(false);
      };

    return (
        <div
            className={`dropdown ${className}`}
            onMouseLeave={handleMouseLeave} // Hide dropdown when mouse leaves the entire dropdown
        >
            <button
                onMouseEnter={handleMouseEnter} // Show dropdown when mouse enters the button
                className="dropdown-button"
            >
                {buttonText}
            </button>
            {isOpen && (
                <ul className="dropdown-menu">
                    {options.map((option, index) => (
                        <li
                            key={index}
                            className="dropdown-item"
                            onClick={() => onSelect(option)}
                        >
                            {option}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Dropdown;