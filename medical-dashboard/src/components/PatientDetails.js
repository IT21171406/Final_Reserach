import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ENV from '../data/Env';
import { useOutletContext } from 'react-router-dom';

const PatientDetails = () => {
  const { selectedUser } = useOutletContext();
  const [userData, setUserData] = useState(null);
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${ENV.SERVER}/users/${selectedUser?.username}/all`);
        console.log('User & Health Data Response:', response.data);
        setUserData(response.data.user);
        
        // Calculate age from DOB if available
        const personalHealth = response.data.personal_health;
        let age = null;
        if (personalHealth?.dob) {
          age = calculateAge(personalHealth.dob);
        }
        
        setHealthData({
          ...personalHealth,
          bmi: calculateBMI(personalHealth?.weight, personalHealth?.height),
          age: age // Add calculated age
        });
      } catch (err) {
        console.error('Error fetching user health data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [selectedUser]);

  const calculateAge = (dobString) => {
    if (!dobString) return null;
    
    const dob = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    
    return age;
  };

  const calculateBMI = (weight, height) => {
    if (weight && height) {
      const heightInMeters = height / 100; // Convert cm to meters
      return (weight / (heightInMeters * heightInMeters)).toFixed(1);
    }
    return 'N/A';
  };

  const handleInputChange = (key, value) => {
    const updatedHealthData = { ...healthData, [key]: value };

    if (key === 'height' || key === 'weight') {
      updatedHealthData.bmi = calculateBMI(
        key === 'weight' ? value : updatedHealthData.weight,
        key === 'height' ? value : updatedHealthData.height
      );
    }

    if (key === 'blood_pressure') {
      const bpRegex = /^(\d{1,3})\/(\d{1,3})$/;
      const isValidBP = bpRegex.test(value);
      
      if (value === '' || isValidBP) {
        if (isValidBP) {
          const [systolic, diastolic] = value.split('/').map(Number);
          if (systolic < 50 || systolic > 250 || diastolic < 30 || diastolic > 150) {
            updatedHealthData.bpError = 'Invalid BP range (50-250/30-150)';
          } else {
            updatedHealthData.bpError = '';
          }
        } else {
          updatedHealthData.bpError = '';
        }
      } else {
        updatedHealthData.bpError = 'Format: XXX/XX';
      }
    }

    // Recalculate age if DOB changes
    if (key === 'dob') {
      updatedHealthData.age = calculateAge(value);
    }

    setHealthData(updatedHealthData);
  };

  const handleUpdate = async () => {
    try {
      // Create payload without the calculated age field
      // const { age, ...payload } = healthData;
      const response = await axios.post(`${ENV.SERVER}/health`, healthData);
      console.log('Update Response:', response.data);
      alert('Health data updated successfully!');
    } catch (err) {
      console.error('Error updating health data:', err);
      alert('Failed to update health data');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="recentOrders">
      <h2 style={{ marginBottom: '20px', color: '#333' }}>Healthcare Details</h2>
      
      {/* User Information Section */}
      <div className="user-info" style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginBottom: '10px', color: '#444' }}>User Information</h3>
        <p style={{ margin: '5px 0' }}><strong>Full Name:</strong> {userData.full_name}</p>
      </div>

      {/* Health Information Section */}
      <div className="health-info" style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginBottom: '20px', color: '#444' }}>Health Data</h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '15px'
        }}>
          {/* Left Column */}
          <div>
            {/* Checkbox Fields */}
            {[
              { label: 'Family had Heart Diseases', key: 'heart_diseases', type: 'checkbox' },
              { label: 'Previously had Heart Attack', key: 'heart_attack', type: 'checkbox' },
              { label: 'Diabetes', key: 'diabetes', type: 'checkbox' },
            ].map((field) => (
              <div key={field.key} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '15px',
                justifyContent: 'space-between'
              }}>
                <label style={{ flex: 1, marginRight: '10px' }}>{field.label}:</label>
                <input
                  type={field.type}
                  checked={healthData[field.key] || false}
                  onChange={(e) => handleInputChange(field.key, e.target.checked)}
                  style={{ 
                    width: '20px', 
                    height: '20px',
                    accentColor: '#007bff'
                  }}
                />
              </div>
            ))}

            {/* Text Input Fields */}
            {[
              { 
                label: 'Blood Pressure', 
                key: 'blood_pressure', 
                type: 'text', 
                placeholder: 'e.g. 120/80',
                pattern: '\\d{1,3}/\\d{1,3}',
                title: 'Format: XXX/XX (e.g. 120/80)'
              },
              { label: 'Allergies', key: 'allergies', type: 'text', placeholder: 'List any allergies' },
              { label: 'Last Checkup', key: 'last_checkup', type: 'text', placeholder: 'Date of last checkup' },
            ].map((field) => (
              <div key={field.key} style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>{field.label}:</label>
                <input
                  type={field.type}
                  value={healthData[field.key] || ''}
                  onChange={(e) => handleInputChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  pattern={field.pattern}
                  title={field.title}
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    borderRadius: '4px', 
                    border: `1px solid ${field.key === 'blood_pressure' && healthData.bpError ? '#ff4444' : '#ddd'}`,
                    boxSizing: 'border-box'
                  }}
                />
                {field.key === 'blood_pressure' && healthData.bpError && (
                  <div style={{ color: '#ff4444', fontSize: '12px', marginTop: '5px' }}>
                    {healthData.bpError}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Column */}
          <div>
            {/* Number Input Fields */}
            {[
              { label: 'Cholesterol Level (mg/dL)', key: 'cholesterol', type: 'number', min: 0, max: 500 },
              { label: 'Height (cm)', key: 'height', type: 'number', min: 0, max: 250 },
              { label: 'Weight (kg)', key: 'weight', type: 'number', min: 0, max: 300 },
            ].map((field) => (
              <div key={field.key} style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>{field.label}:</label>
                <input
                  type={field.type}
                  value={healthData[field.key] || ''}
                  onChange={(e) => handleInputChange(field.key, parseFloat(e.target.value))}
                  min={field.min}
                  max={field.max}
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    borderRadius: '4px', 
                    border: '1px solid #ddd',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            ))}

            {/* Date of Birth Input */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Date of Birth:</label>
              <input
                type="date"
                value={healthData.dob || ''}
                onChange={(e) => handleInputChange('dob', e.target.value)}
                max={new Date().toISOString().split('T')[0]} // Don't allow future dates
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  borderRadius: '4px', 
                  border: '1px solid #ddd',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Gender Select Input */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Gender:</label>
              <select
                value={healthData.gender || 'Male'}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  borderRadius: '4px', 
                  border: '1px solid #ddd',
                  backgroundColor: 'white'
                }}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            {/* Age Display */}
            <div style={{ 
              backgroundColor: '#e9f5ff', 
              padding: '15px', 
              borderRadius: '8px',
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              <h4 style={{ marginBottom: '5px', color: '#333' }}>Age</h4>
              <div style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: '#007bff'
              }}>
                {healthData.age || 'N/A'}
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: '#666', 
                marginTop: '5px'
              }}>
                years
              </div>
            </div>

            {/* BMI Display */}
            <div style={{ 
              backgroundColor: '#e9f5ff', 
              padding: '15px', 
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h4 style={{ marginBottom: '5px', color: '#333' }}>Body Mass Index (BMI)</h4>
              <div style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: '#007bff'
              }}>
                {healthData.bmi || 'N/A'}
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: '#666', 
                marginTop: '5px'
              }}>
                {healthData.bmi && healthData.bmi !== 'N/A' ? (
                  parseFloat(healthData.bmi) < 18.5 ? 'Underweight' :
                  parseFloat(healthData.bmi) < 25 ? 'Normal weight' :
                  parseFloat(healthData.bmi) < 30 ? 'Overweight' : 'Obese'
                ) : ''}
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={handleUpdate} 
          style={{ 
            marginTop: '20px', 
            padding: '10px 20px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: 'pointer',
            fontSize: '16px',
            width: '100%',
            transition: 'background-color 0.3s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
        >
          Update Health Data
        </button>
      </div>
    </div>
  );
};

export default PatientDetails;