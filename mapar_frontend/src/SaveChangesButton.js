import React from 'react';
import PropTypes from 'prop-types';
import './SaveChangesButton.css';

function SaveChangesButton({ onSave, visible }) {
  if (!visible) return null;

  return (
    <div className="save-changes-container">
      <button
        onClick={onSave}
        className="save-changes-button"
      >
        <svg className="save-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H16L21 8V19C21 20.1046 20.1046 21 19 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M17 21V13H7V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7 3V8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span>Сохранить изменения</span>
      </button>
    </div>
  );
}

SaveChangesButton.propTypes = {
  onSave: PropTypes.func.isRequired,
  visible: PropTypes.bool.isRequired
};

export default SaveChangesButton;
