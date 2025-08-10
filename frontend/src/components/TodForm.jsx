import React, { useState } from 'react';

const TodForm = ({ onCalculate, loading, onReset }) => {
  const [formData, setFormData] = useState({
    ambientTempC: 20,
    bodyTempC: 32,
    timeSinceFirstReadingHours: 0,
    normalBodyTempC: 37,
    k: '',
    sceneDateTime: '',
    useSecondReading: false,
    secondReading: {
      bodyTempC: '',
      deltaHoursFromFirst: ''
    }
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith('secondReading.')) {
      const fieldName = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        secondReading: {
          ...prev.secondReading,
          [fieldName]: value
        }
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.ambientTempC || formData.ambientTempC < -30 || formData.ambientTempC > 50) {
      newErrors.ambientTempC = 'Ambient temperature must be between -30°C and 50°C';
    }

    if (!formData.bodyTempC || formData.bodyTempC < 0 || formData.bodyTempC > 45) {
      newErrors.bodyTempC = 'Body temperature must be between 0°C and 45°C';
    }

    if (!formData.normalBodyTempC || formData.normalBodyTempC < 35 || formData.normalBodyTempC > 42) {
      newErrors.normalBodyTempC = 'Normal body temperature must be between 35°C and 42°C';
    }

    if (formData.timeSinceFirstReadingHours < 0) {
      newErrors.timeSinceFirstReadingHours = 'Time since first reading cannot be negative';
    }

    if (formData.k && (parseFloat(formData.k) <= 0 || parseFloat(formData.k) > 5)) {
      newErrors.k = 'Cooling constant k must be between 0 and 5';
    }

    if (formData.useSecondReading) {
      if (!formData.secondReading.bodyTempC || formData.secondReading.bodyTempC < 0 || formData.secondReading.bodyTempC > 45) {
        newErrors['secondReading.bodyTempC'] = 'Second body temperature must be between 0°C and 45°C';
      }

      if (!formData.secondReading.deltaHoursFromFirst || parseFloat(formData.secondReading.deltaHoursFromFirst) <= 0) {
        newErrors['secondReading.deltaHoursFromFirst'] = 'Time between readings must be positive';
      }
    }

    // Logical validations
    if (formData.bodyTempC && formData.ambientTempC && 
        Math.abs(parseFloat(formData.bodyTempC) - parseFloat(formData.ambientTempC)) < 0.5) {
      newErrors.bodyTempC = 'Body temperature should be significantly different from ambient temperature';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Prepare request data
    const requestData = {
      ambientTempC: parseFloat(formData.ambientTempC),
      bodyTempC: parseFloat(formData.bodyTempC),
      timeSinceFirstReadingHours: parseFloat(formData.timeSinceFirstReadingHours) || 0,
      normalBodyTempC: parseFloat(formData.normalBodyTempC) || 37
    };

    if (formData.k && formData.k.trim() !== '') {
      requestData.k = parseFloat(formData.k);
    }

    if (formData.sceneDateTime && formData.sceneDateTime.trim() !== '') {
      requestData.sceneDateTime = formData.sceneDateTime;
    }

    if (formData.useSecondReading && formData.secondReading.bodyTempC && formData.secondReading.deltaHoursFromFirst) {
      requestData.secondReading = {
        bodyTempC: parseFloat(formData.secondReading.bodyTempC),
        deltaHoursFromFirst: parseFloat(formData.secondReading.deltaHoursFromFirst)
      };
    }

    onCalculate(requestData);
  };

  const handleReset = () => {
    setFormData({
      ambientTempC: 20,
      bodyTempC: 32,
      timeSinceFirstReadingHours: 0,
      normalBodyTempC: 37,
      k: '',
      sceneDateTime: '',
      useSecondReading: false,
      secondReading: {
        bodyTempC: '',
        deltaHoursFromFirst: ''
      }
    });
    setErrors({});
    onReset();
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    border: '2px solid #ddd',
    borderRadius: '6px',
    fontSize: '16px',
    marginBottom: '5px'
  };

  const errorStyle = {
    color: '#dc3545',
    fontSize: '14px',
    marginBottom: '10px'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 'bold',
    color: '#2c3e50'
  };

  return (
    <div style={{ 
      backgroundColor: 'white', 
      padding: '30px', 
      borderRadius: '10px', 
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
    }}>
      <h2 style={{ marginBottom: '25px', color: '#2c3e50' }}>Temperature Measurements</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>
            Ambient Temperature (°C) *
          </label>
          <input
            type="number"
            name="ambientTempC"
            value={formData.ambientTempC}
            onChange={handleInputChange}
            placeholder="e.g., 20"
            style={{
              ...inputStyle,
              borderColor: errors.ambientTempC ? '#dc3545' : '#ddd'
            }}
            step="0.1"
          />
          {errors.ambientTempC && <div style={errorStyle}>{errors.ambientTempC}</div>}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>
            Body Temperature (°C) *
          </label>
          <input
            type="number"
            name="bodyTempC"
            value={formData.bodyTempC}
            onChange={handleInputChange}
            placeholder="e.g., 32"
            style={{
              ...inputStyle,
              borderColor: errors.bodyTempC ? '#dc3545' : '#ddd'
            }}
            step="0.1"
          />
          {errors.bodyTempC && <div style={errorStyle}>{errors.bodyTempC}</div>}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>
            Normal Body Temperature (°C)
          </label>
          <input
            type="number"
            name="normalBodyTempC"
            value={formData.normalBodyTempC}
            onChange={handleInputChange}
            placeholder="37.0"
            style={{
              ...inputStyle,
              borderColor: errors.normalBodyTempC ? '#dc3545' : '#ddd'
            }}
            step="0.1"
          />
          {errors.normalBodyTempC && <div style={errorStyle}>{errors.normalBodyTempC}</div>}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>
            Time Since First Reading (hours)
          </label>
          <input
            type="number"
            name="timeSinceFirstReadingHours"
            value={formData.timeSinceFirstReadingHours}
            onChange={handleInputChange}
            placeholder="0"
            style={{
              ...inputStyle,
              borderColor: errors.timeSinceFirstReadingHours ? '#dc3545' : '#ddd'
            }}
            step="0.1"
            min="0"
          />
          {errors.timeSinceFirstReadingHours && <div style={errorStyle}>{errors.timeSinceFirstReadingHours}</div>}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>
            <input
              type="checkbox"
              name="useSecondReading"
              checked={formData.useSecondReading}
              onChange={handleInputChange}
              style={{ marginRight: '8px' }}
            />
            Use Second Temperature Reading (to estimate k)
          </label>
        </div>

        {formData.useSecondReading && (
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '8px', 
            marginBottom: '20px' 
          }}>
            <h3 style={{ marginBottom: '15px', color: '#2c3e50' }}>Second Reading</h3>

            <div style={{ marginBottom: '15px' }}>
              <label style={labelStyle}>
                Second Body Temperature (°C) *
              </label>
              <input
                type="number"
                name="secondReading.bodyTempC"
                value={formData.secondReading.bodyTempC}
                onChange={handleInputChange}
                placeholder="e.g., 30"
                style={{
                  ...inputStyle,
                  borderColor: errors['secondReading.bodyTempC'] ? '#dc3545' : '#ddd'
                }}
                step="0.1"
              />
              {errors['secondReading.bodyTempC'] && 
                <div style={errorStyle}>{errors['secondReading.bodyTempC']}</div>}
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={labelStyle}>
                Hours Between Readings *
              </label>
              <input
                type="number"
                name="secondReading.deltaHoursFromFirst"
                value={formData.secondReading.deltaHoursFromFirst}
                onChange={handleInputChange}
                placeholder="e.g., 1.0"
                style={{
                  ...inputStyle,
                  borderColor: errors['secondReading.deltaHoursFromFirst'] ? '#dc3545' : '#ddd'
                }}
                step="0.1"
                min="0.1"
              />
              {errors['secondReading.deltaHoursFromFirst'] && 
                <div style={errorStyle}>{errors['secondReading.deltaHoursFromFirst']}</div>}
            </div>
          </div>
        )}

        {!formData.useSecondReading && (
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>
              Cooling Constant k (h⁻¹) - Optional
            </label>
            <input
              type="number"
              name="k"
              value={formData.k}
              onChange={handleInputChange}
              placeholder="e.g., 0.1947 (leave empty for default)"
              style={{
                ...inputStyle,
                borderColor: errors.k ? '#dc3545' : '#ddd'
              }}
              step="0.0001"
              min="0.001"
              max="5"
            />
            {errors.k && <div style={errorStyle}>{errors.k}</div>}
            <small style={{ color: '#6c757d' }}>
              Typical range: 0.1-0.3 h⁻¹ for human bodies. Leave empty to use default value (0.1947).
            </small>
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>
            Scene Date/Time (Optional)
          </label>
          <input
            type="datetime-local"
            name="sceneDateTime"
            value={formData.sceneDateTime}
            onChange={handleInputChange}
            style={{
              ...inputStyle,
              borderColor: errors.sceneDateTime ? '#dc3545' : '#ddd'
            }}
          />
          <small style={{ color: '#6c757d' }}>
            If not provided, current time will be used as reference.
          </small>
        </div>

        <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              flex: 1,
              padding: '15px',
              backgroundColor: loading ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Calculating...' : 'Calculate Time of Death'}
          </button>

          <button
            type="button"
            onClick={handleReset}
            style={{
              padding: '15px 25px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default TodForm;
