import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';

const QualitiesList = ({ combinedQualities, setCombinedQualities }) => {
    const [editItem, setEditItem] = useState(null);
    const [editValue, setEditValue] = useState('');

    const handleEditClick = (quality) => {
        setEditItem(quality.name);
        setEditValue(quality.effect);
    };

    const handleConfirmEdit = () => {
        setCombinedQualities(combinedQualities.map(quality => {
            if (quality.name === editItem) {
                return { ...quality, effect: editValue };
            }
            return quality;
        }));
        setEditItem(null);
        setEditValue('');
    };

    const handleCancelEdit = () => {
        setEditItem(null);
        setEditValue('');
    };

    return (
        <li className="list-group-item">Qualities:
            <ul>
                {combinedQualities.map((quality) => (
                    <li key={quality.name}>
                        {quality.name} :
                        {editItem === quality.name ? (
                            <React.Fragment>
                                <input
                                    type="textarea"
                                    className="form-control"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                />
                                <div className="mt-3">
                                    <button className="ms-3 btn btn-success btn-sm" onClick={handleConfirmEdit}>Confirm</button>
                                    <button className="ms-3 btn btn-danger btn-sm" onClick={handleCancelEdit}>Cancel</button>
                                </div>
                            </React.Fragment>
                        ) : (
                            <React.Fragment>
                                {quality.effect}
                                <button className="ms-3 btn btn-primary btn-sm" onClick={() => handleEditClick(quality)}>
                                    <FontAwesomeIcon icon={faEdit} /></button>
                            </React.Fragment>
                        )}
                    </li>
                ))}
            </ul>
        </li>
    );
};

export default QualitiesList;