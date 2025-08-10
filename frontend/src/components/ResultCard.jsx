import React, { useState } from 'react';

const ResultCard = ({ result }) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!result) {
    return null;
  }

  const formatTime = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  return (
    <div style={{ 
      backgroundColor: 'white', 
      padding: '30px', 
      borderRadius: '10px', 
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
    }}>
      <h2 style={{ marginBottom: '25px', color: '#2c3e50' }}>Results</h2>

      {/* Main Results */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{
          backgroundColor: '#e8f5e8',
          border: '1px solid #c3e6cb',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h3 style={{ color: '#155724', marginBottom: '15px' }}>Key Findings</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', color: '#155724', marginBottom: '5px' }}>
                Cooling Constant (k)
              </label>
              <div style={{ fontSize: '18px', color: '#155724' }}>
                {result.k?.toFixed(4)} h⁻¹
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 'bold', color: '#155724', marginBottom: '5px' }}>
                Time Since Death
              </label>
              <div style={{ fontSize: '18px', color: '#155724' }}>
                {formatTime(result.timeSinceDeathHours)} ({result.timeSinceDeathHours?.toFixed(2)} hours)
              </div>
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', color: '#155724', marginBottom: '5px' }}>
              Estimated Time of Death
            </label>
            <div style={{ fontSize: '20px', color: '#155724', fontWeight: 'bold' }}>
              {formatDateTime(result.estimatedTimeOfDeath)}
            </div>
          </div>
        </div>
      </div>

      {/* Computation Details */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setShowDetails(!showDetails)}
          style={{
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            width: '100%'
          }}
        >
          {showDetails ? '▼ Hide' : '▶ Show'} Computation Details
        </button>
      </div>

      {showDetails && (
        <div style={{
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h4 style={{ color: '#2c3e50', marginBottom: '15px' }}>Mathematical Steps</h4>
          <ol style={{ paddingLeft: '20px' }}>
            {result.steps?.map((step, index) => (
              <li key={index} style={{ 
                marginBottom: '8px', 
                lineHeight: '1.6',
                fontFamily: 'Monaco, Consolas, monospace',
                fontSize: '14px'
              }}>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Warnings and Limitations */}
      {result.warnings && result.warnings.length > 0 && (
        <div style={{
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <h4 style={{ color: '#856404', marginBottom: '15px' }}>
            ⚠️ Important Assumptions & Limitations
          </h4>
          <ul style={{ paddingLeft: '20px', margin: '0' }}>
            {result.warnings.map((warning, index) => (
              <li key={index} style={{ 
                marginBottom: '8px', 
                color: '#856404',
                lineHeight: '1.6'
              }}>
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Formula Reference */}
      <div style={{
        backgroundColor: '#e7f3ff',
        border: '1px solid #b8daff',
        borderRadius: '8px',
        padding: '20px',
        marginTop: '20px'
      }}>
        <h4 style={{ color: '#004085', marginBottom: '15px' }}>Newton's Law of Cooling</h4>
        <div style={{
          fontFamily: 'Monaco, Consolas, monospace',
          fontSize: '16px',
          color: '#004085',
          textAlign: 'center',
          marginBottom: '10px'
        }}>
          T(t) = T<sub>e</sub> + (T<sub>0</sub> - T<sub>e</sub>) × e<sup>(-k×t)</sup>
        </div>
        <div style={{ fontSize: '14px', color: '#004085' }}>
          <strong>Where:</strong><br />
          • T(t) = body temperature at time t<br />
          • T<sub>e</sub> = ambient (environmental) temperature<br />
          • T<sub>0</sub> = normal body temperature at death<br />
          • k = cooling constant (depends on body mass, clothing, etc.)<br />
          • t = time since death
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
