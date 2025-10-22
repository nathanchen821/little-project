import React, { useState, useEffect } from 'react';
import { getOrCreateUserProfile, updateUserProfile, type UserProfile } from './utils/userProfile';

const CompleteProfilePage: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    school: '',
    grade: '',
    phone: '',
    bio: '',
    interests: [] as string[],
    availability: [] as string[],
    locationPreferences: [] as string[]
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await getOrCreateUserProfile();
      if (profile) {
        setUserProfile(profile);
        setFormData({
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          school: profile.school || '',
          grade: profile.grade || '',
          phone: profile.phone || '',
          bio: profile.bio || '',
          interests: profile.interests || [],
          availability: profile.availability || [],
          locationPreferences: profile.locationPreferences || []
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      window.location.href = '/app';
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const toggleAvailability = (day: string) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.includes(day)
        ? prev.availability.filter(d => d !== day)
        : [...prev.availability, day]
    }));
  };

  const toggleLocation = (location: string) => {
    setFormData(prev => ({
      ...prev,
      locationPreferences: prev.locationPreferences.includes(location)
        ? prev.locationPreferences.filter(l => l !== location)
        : [...prev.locationPreferences, location]
    }));
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.school.trim()) {
      newErrors.school = 'School name is required';
    }
    if (!formData.grade) {
      newErrors.grade = 'Grade is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!userProfile) {
      return;
    }

    setSaving(true);

    try {
      await updateUserProfile({
        id: userProfile.id,
        ...formData
      });

      // Redirect to profile page
      window.location.href = '/profile';
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ fontSize: '1.5rem', color: 'white' }}>Loading...</div>
      </div>
    );
  }

  const interestOptions = [
    '🎓 Education',
    '🏥 Healthcare',
    '🌳 Environment',
    '🤝 Community Service',
    '💻 Technology',
    '🎨 Arts & Culture',
    '🐾 Animal Welfare',
    '👴 Senior Care',
    '🏃 Sports & Recreation',
    '🍽️ Food Security'
  ];

  const availabilityOptions = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ];

  const locationOptions = [
    'Blacksburg',
    'Christiansburg',
    'Radford',
    'Salem',
    'Roanoke'
  ];

  const gradeOptions = ['9th Grade', '10th Grade', '11th Grade', '12th Grade'];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '20px',
        padding: '3rem',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '2.5rem',
            color: '#667eea',
            marginBottom: '0.5rem'
          }}>
            Complete Your Profile
          </h1>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>
            Tell us about yourself to get started with volunteering!
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              color: '#333', 
              marginBottom: '1rem',
              borderBottom: '2px solid #667eea',
              paddingBottom: '0.5rem'
            }}>
              Basic Information
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '500' }}>
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors.firstName ? '2px solid #f44336' : '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                  placeholder="John"
                />
                {errors.firstName && (
                  <span style={{ color: '#f44336', fontSize: '0.875rem' }}>{errors.firstName}</span>
                )}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '500' }}>
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors.lastName ? '2px solid #f44336' : '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <span style={{ color: '#f44336', fontSize: '0.875rem' }}>{errors.lastName}</span>
                )}
              </div>
            </div>

            <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '500' }}>
                  School *
                </label>
                <input
                  type="text"
                  value={formData.school}
                  onChange={(e) => handleInputChange('school', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors.school ? '2px solid #f44336' : '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                  placeholder="Blacksburg High School"
                />
                {errors.school && (
                  <span style={{ color: '#f44336', fontSize: '0.875rem' }}>{errors.school}</span>
                )}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '500' }}>
                  Grade *
                </label>
                <select
                  value={formData.grade}
                  onChange={(e) => handleInputChange('grade', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors.grade ? '2px solid #f44336' : '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    background: 'white'
                  }}
                >
                  <option value="">Select</option>
                  {gradeOptions.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
                {errors.grade && (
                  <span style={{ color: '#f44336', fontSize: '0.875rem' }}>{errors.grade}</span>
                )}
              </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '500' }}>
                Phone (optional)
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
                placeholder="(540) 555-1234"
              />
            </div>

            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '500' }}>
                Bio (optional)
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  minHeight: '100px',
                  resize: 'vertical'
                }}
                placeholder="Tell us about yourself, your interests, and why you want to volunteer..."
              />
            </div>
          </div>

          {/* Interests */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              color: '#333', 
              marginBottom: '1rem',
              borderBottom: '2px solid #667eea',
              paddingBottom: '0.5rem'
            }}>
              Interests
            </h2>
            <p style={{ color: '#666', marginBottom: '1rem', fontSize: '0.9rem' }}>
              Select the types of volunteer work you're interested in
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
              {interestOptions.map(interest => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  style={{
                    padding: '0.75rem',
                    border: '2px solid',
                    borderColor: formData.interests.includes(interest) ? '#667eea' : '#ddd',
                    borderRadius: '8px',
                    background: formData.interests.includes(interest) ? '#f0f4ff' : 'white',
                    color: formData.interests.includes(interest) ? '#667eea' : '#666',
                    fontWeight: formData.interests.includes(interest) ? '600' : '400',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'left'
                  }}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              color: '#333', 
              marginBottom: '1rem',
              borderBottom: '2px solid #667eea',
              paddingBottom: '0.5rem'
            }}>
              Availability
            </h2>
            <p style={{ color: '#666', marginBottom: '1rem', fontSize: '0.9rem' }}>
              Select the days you're typically available to volunteer
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {availabilityOptions.map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleAvailability(day)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: '2px solid',
                    borderColor: formData.availability.includes(day) ? '#667eea' : '#ddd',
                    borderRadius: '25px',
                    background: formData.availability.includes(day) ? '#667eea' : 'white',
                    color: formData.availability.includes(day) ? 'white' : '#666',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Location Preferences */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              color: '#333', 
              marginBottom: '1rem',
              borderBottom: '2px solid #667eea',
              paddingBottom: '0.5rem'
            }}>
              Location Preferences
            </h2>
            <p style={{ color: '#666', marginBottom: '1rem', fontSize: '0.9rem' }}>
              Where would you like to volunteer?
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {locationOptions.map(location => (
                <button
                  key={location}
                  type="button"
                  onClick={() => toggleLocation(location)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: '2px solid',
                    borderColor: formData.locationPreferences.includes(location) ? '#667eea' : '#ddd',
                    borderRadius: '25px',
                    background: formData.locationPreferences.includes(location) ? '#667eea' : 'white',
                    color: formData.locationPreferences.includes(location) ? 'white' : '#666',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  📍 {location}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                flex: 1,
                padding: '1rem',
                background: saving ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: saving ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s'
              }}
            >
              {saving ? 'Saving...' : 'Complete Profile'}
            </button>
            <button
              type="button"
              onClick={() => window.location.href = '/'}
              style={{
                padding: '1rem 2rem',
                background: 'white',
                color: '#667eea',
                border: '2px solid #667eea',
                borderRadius: '10px',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              Skip for Now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfilePage;

