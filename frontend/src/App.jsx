import React, { useState, useEffect } from 'react';
import TodForm from './components/TodForm';
import ResultCard from './components/ResultCard';
import ApiService from './api';

function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiHealthy, setApiHealthy] = useState(false);

  useEffect(() => {
    // Check API health on component mount
    ApiService.checkHealth().then(setApiHealthy);
  }, []);

  const handleCalculate = async (formData) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await ApiService.estimateTimeOfDeath(formData);
      setResult(response);
    } catch (err) {
      setError(err.message || 'An error occurred while calculating time of death');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#2c3e50', marginBottom: '10px' }}>
          Time of Death Calculator
        </h1>
        <p style={{ color: '#7f8c8d', fontSize: '18px' }}>
          Forensic TOD Estimation using Newton's Law of Cooling
        </p>
        <div style={{ 
          padding: '8px 16px', 
          borderRadius: '4px', 
          fontSize: '14px',
          display: 'inline-block',
          backgroundColor: apiHealthy ? '#d4edda' : '#f8d7da',
          color: apiHealthy ? '#155724' : '#721c24',
          border: `1px solid ${apiHealthy ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          API Status: {apiHealthy ? 'Connected' : 'Disconnected'}
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1fr' : '1fr', gap: '30px' }}>
        <div>
          <TodForm onCalculate={handleCalculate} loading={loading} onReset={handleReset} />
          {error && (
            <div style={{
              backgroundColor: '#f8d7da',
              color: '#721c24',
              padding: '15px',
              borderRadius: '8px',
              border: '1px solid #f5c6cb',
              marginTop: '20px'
            }}>
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>

        {result && (
          <div>
            <ResultCard result={result} />
          </div>
        )}
      </div>

      <footer style={{ 
        marginTop: '50px', 
        padding: '20px', 
        backgroundColor: '#fff3cd', 
        borderRadius: '8px',
        border: '1px solid #ffeaa7'
      }}>
        <h3 style={{ color: '#856404', marginBottom: '15px' }}>Important Disclaimer</h3>
        <p style={{ color: '#856404', margin: '0', lineHeight: '1.6' }}>
          This Time of Death calculator is an <strong>educational tool</strong> that demonstrates the application 
          of Newton's Law of Cooling in forensic science. Results are estimations based on simplified models and 
          should <strong>not be used for official forensic determinations</strong> without proper expert validation. 
          Actual TOD estimation requires consideration of numerous factors including body mass, clothing, 
          environmental conditions, humidity, airflow, and other variables not accounted for in this basic model.
          Always consult qualified forensic experts for professional analysis.
        </p>
      </footer>
    </div>
  );
}

export default App;
