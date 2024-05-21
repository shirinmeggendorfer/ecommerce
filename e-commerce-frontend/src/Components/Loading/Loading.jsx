import React from 'react';
import './Loading.css';

const Loading = () => {
  return (
    <div className="loading-container">
      <div className="spinner" role="status" aria-hidden="true"></div>
      <p>Processing your payment, please wait...</p>
    </div>
  );
};

export default Loading;
