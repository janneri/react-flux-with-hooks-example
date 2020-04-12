import React from 'react';
import VisibilityFilters from '../utils/visibilityFilters';

const VisibilityFilterPanel = ({currentFilterId, updateCurrentFilterId}) => (
    <div className="filters">
            {Object.values(VisibilityFilters).map(filter => (
                <span
                    key={filter.id}
                    className={"filter" + (currentFilterId === filter.id ? " active" : "")}
                    onClick={() => updateCurrentFilterId(filter.id)}
                >
                    {filter.text}
                </span>
            ))}
    </div>
);

export default VisibilityFilterPanel;
