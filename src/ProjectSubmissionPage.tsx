import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { signOut as amplifySignOut } from 'aws-amplify/auth';
import { getOrCreateUserProfile } from './utils/userProfile';
import type { Schema } from '../amplify/data/resource';

const client = generateClient<Schema>();

const ProjectSubmissionPage: React.FC = () => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    address: '',
    city: '',
    state: 'Virginia',
    startDate: '',
    endDate: '',
    duration: '',
    maxVolunteers: '',
    difficulty: 'Easy',
    requirements: '',
    whatToBring: '',
    whatToExpect: '',
    impact: '',
    skills: [] as string[],
    ageRequirement: '13+',
    contactInfo: '',
    images: ['']
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
      } else {
        window.location.href = '/app';
      }
    } catch (error) {
      console.error('Error loading user:', error);
      window.location.href = '/app';
    } finally {
      setLoading(false);
    }
  };

  const handleSignOutClick = async () => {
    try {
      await amplifySignOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.maxVolunteers || parseInt(formData.maxVolunteers) <= 0) {
      newErrors.maxVolunteers = 'Max volunteers must be greater than 0';
    }
    if (!formData.duration || parseFloat(formData.duration) <= 0) {
      newErrors.duration = 'Duration must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !userProfile) {
      return;
    }

    setSubmitting(true);

    try {
      const maxVol = parseInt(formData.maxVolunteers);
      
      // Convert date to ISO datetime format (required by AWSDateTime)
      const startDateTime = new Date(formData.startDate + 'T00:00:00').toISOString();
      const endDateTime = formData.endDate ? new Date(formData.endDate + 'T23:59:59').toISOString() : undefined;
      
      // Build project data, only including non-empty optional fields
      const projectData: any = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        city: formData.city,
        state: formData.state,
        startDate: startDateTime,
        duration: parseFloat(formData.duration),
        maxVolunteers: maxVol,
        currentVolunteers: 0,
        spotsAvailable: maxVol,
        status: 'Pending',  // Needs admin approval
        isApproved: false,
        createdById: userProfile.id
      };

      // Add optional fields only if they have values
      if (formData.address?.trim()) projectData.address = formData.address.trim();
      if (endDateTime) projectData.endDate = endDateTime;
      if (formData.difficulty) projectData.difficulty = formData.difficulty;
      if (formData.requirements?.trim()) projectData.requirements = formData.requirements.trim();
      if (formData.whatToBring?.trim()) projectData.whatToBring = formData.whatToBring.trim();
      if (formData.whatToExpect?.trim()) projectData.whatToExpect = formData.whatToExpect.trim();
      if (formData.impact?.trim()) projectData.impact = formData.impact.trim();
      if (formData.skills.length > 0) projectData.skills = formData.skills;
      if (formData.ageRequirement) projectData.ageRequirement = formData.ageRequirement;
      if (formData.contactInfo?.trim()) projectData.contactInfo = formData.contactInfo.trim();
      
      const imageUrl = formData.images[0]?.trim();
      if (imageUrl) projectData.images = [imageUrl];

      console.log('Creating project with data:', projectData);
      
      // Create project with Pending status
      const { errors: createErrors } = await client.models.Project.create(projectData);

      if (createErrors) {
        console.error('Error creating project:', createErrors);
        console.error('Error details:', JSON.stringify(createErrors, null, 2));
        setNotification({
          type: 'error',
          message: `Failed to submit project: ${createErrors[0]?.message || 'Unknown error'}. Please try again.`
        });
        return;
      }

      setNotification({
        type: 'success',
        message: 'Project submitted successfully! It will be visible after admin approval.'
      });
      
      // Redirect after showing success message
      setTimeout(() => {
        window.location.href = '/projects';
      }, 2000);
    } catch (error) {
      console.error('Error submitting project:', error);
      setNotification({
        type: 'error',
        message: 'Failed to submit project. Please try again.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{ fontSize: '1.5rem', color: '#666' }}>Loading...</div>
      </div>
    );
  }

  const categories = [
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

  const skillOptions = [
    'Teaching', 'Tutoring', 'Mentoring', 'Organizing', 'Communication',
    'Teamwork', 'Leadership', 'Problem Solving', 'Technology', 'Arts & Crafts',
    'Physical Activity', 'Event Planning', 'Customer Service'
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      {/* Notification Toast */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '2rem',
          right: '2rem',
          zIndex: 9999,
          background: notification.type === 'success' ? 'linear-gradient(135deg, #4CAF50, #45a049)' : 'linear-gradient(135deg, #f44336, #d32f2f)',
          color: 'white',
          padding: '1rem 2rem',
          borderRadius: '10px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          minWidth: '300px',
          maxWidth: '500px',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <span style={{ fontSize: '1.5rem' }}>
            {notification.type === 'success' ? '✅' : '❌'}
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
              {notification.type === 'success' ? 'Success!' : 'Error'}
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.95 }}>
              {notification.message}
            </div>
          </div>
          <button
            onClick={() => setNotification(null)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              cursor: 'pointer',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Add animation keyframes */}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>

      {/* Navigation */}
      <nav style={{
        background: 'linear-gradient(135deg, #4CAF50, #2196F3)',
        color: 'white',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🤝</span>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Little Project</span>
        </div>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <a href="/" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '20px' }}>Home</a>
          <a href="/projects" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '20px' }}>Projects</a>
          <a href="/my-projects" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '20px' }}>My Projects</a>
          <a href="/profile" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '20px' }}>My Achievement</a>
          <a href="/leaderboard" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '20px' }}>Leaderboard</a>
          <button
            onClick={handleSignOutClick}
            style={{
              background: '#ef4444',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '3rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}>
          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2.5rem', color: '#2E7D32', marginBottom: '0.5rem' }}>
              Submit a Project
            </h1>
            <p style={{ color: '#666', fontSize: '1.1rem' }}>
              Create a new volunteer opportunity for students in your community
            </p>
            <div style={{
              background: '#FFF3CD',
              border: '1px solid #FFECB5',
              borderRadius: '8px',
              padding: '1rem',
              marginTop: '1rem'
            }}>
              <strong>📋 Note:</strong> Your project will be reviewed by administrators before being published.
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Basic Information */}
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{
                fontSize: '1.5rem',
                color: '#333',
                marginBottom: '1rem',
                borderBottom: '2px solid #4CAF50',
                paddingBottom: '0.5rem'
              }}>
                Basic Information
              </h2>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '500' }}>
                  Project Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors.title ? '2px solid #f44336' : '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                  placeholder="e.g., Community Garden Cleanup"
                />
                {errors.title && <span style={{ color: '#f44336', fontSize: '0.875rem' }}>{errors.title}</span>}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '500' }}>
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors.description ? '2px solid #f44336' : '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    minHeight: '120px',
                    resize: 'vertical'
                  }}
                  placeholder="Describe the project, its goals, and what volunteers will do..."
                />
                {errors.description && <span style={{ color: '#f44336', fontSize: '0.875rem' }}>{errors.description}</span>}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '500' }}>
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors.category ? '2px solid #f44336' : '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    background: 'white'
                  }}
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && <span style={{ color: '#f44336', fontSize: '0.875rem' }}>{errors.category}</span>}
              </div>
            </div>

            {/* Location Details */}
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{
                fontSize: '1.5rem',
                color: '#333',
                marginBottom: '1rem',
                borderBottom: '2px solid #4CAF50',
                paddingBottom: '0.5rem'
              }}>
                Location
              </h2>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '500' }}>
                  Location Name *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: errors.location ? '2px solid #f44336' : '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                  placeholder="e.g., Community Center, Park, School"
                />
                {errors.location && <span style={{ color: '#f44336', fontSize: '0.875rem' }}>{errors.location}</span>}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '500' }}>
                  Address (optional)
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                  placeholder="123 Main St"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '500' }}>
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: errors.city ? '2px solid #f44336' : '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                    placeholder="Blacksburg"
                  />
                  {errors.city && <span style={{ color: '#f44336', fontSize: '0.875rem' }}>{errors.city}</span>}
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '500' }}>
                    State *
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Schedule & Capacity */}
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{
                fontSize: '1.5rem',
                color: '#333',
                marginBottom: '1rem',
                borderBottom: '2px solid #4CAF50',
                paddingBottom: '0.5rem'
              }}>
                Schedule & Capacity
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '500' }}>
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: errors.startDate ? '2px solid #f44336' : '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  />
                  {errors.startDate && <span style={{ color: '#f44336', fontSize: '0.875rem' }}>{errors.startDate}</span>}
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '500' }}>
                    End Date (optional)
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '500' }}>
                    Duration (hours) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: errors.duration ? '2px solid #f44336' : '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                    placeholder="3.5"
                  />
                  {errors.duration && <span style={{ color: '#f44336', fontSize: '0.875rem' }}>{errors.duration}</span>}
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '500' }}>
                    Max Volunteers *
                  </label>
                  <input
                    type="number"
                    value={formData.maxVolunteers}
                    onChange={(e) => handleInputChange('maxVolunteers', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: errors.maxVolunteers ? '2px solid #f44336' : '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                    placeholder="10"
                  />
                  {errors.maxVolunteers && <span style={{ color: '#f44336', fontSize: '0.875rem' }}>{errors.maxVolunteers}</span>}
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '500' }}>
                    Difficulty
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => handleInputChange('difficulty', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      background: 'white'
                    }}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{
                fontSize: '1.5rem',
                color: '#333',
                marginBottom: '1rem',
                borderBottom: '2px solid #4CAF50',
                paddingBottom: '0.5rem'
              }}>
                Additional Details
              </h2>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '500' }}>
                  Requirements (optional)
                </label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) => handleInputChange('requirements', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    minHeight: '80px',
                    resize: 'vertical'
                  }}
                  placeholder="Any special requirements or qualifications needed..."
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '500' }}>
                  What to Bring (optional)
                </label>
                <textarea
                  value={formData.whatToBring}
                  onChange={(e) => handleInputChange('whatToBring', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    minHeight: '80px',
                    resize: 'vertical'
                  }}
                  placeholder="Items volunteers should bring (gloves, water bottle, etc.)..."
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '500' }}>
                  What to Expect (optional)
                </label>
                <textarea
                  value={formData.whatToExpect}
                  onChange={(e) => handleInputChange('whatToExpect', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    minHeight: '80px',
                    resize: 'vertical'
                  }}
                  placeholder="What volunteers can expect during the project..."
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '500' }}>
                  Impact (optional)
                </label>
                <textarea
                  value={formData.impact}
                  onChange={(e) => handleInputChange('impact', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    minHeight: '80px',
                    resize: 'vertical'
                  }}
                  placeholder="The impact this project will have on the community..."
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '500' }}>
                  Skills Gained (select all that apply)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {skillOptions.map(skill => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      style={{
                        padding: '0.5rem',
                        border: '2px solid',
                        borderColor: formData.skills.includes(skill) ? '#4CAF50' : '#ddd',
                        borderRadius: '8px',
                        background: formData.skills.includes(skill) ? '#E8F5E9' : 'white',
                        color: formData.skills.includes(skill) ? '#2E7D32' : '#666',
                        fontWeight: formData.skills.includes(skill) ? '600' : '400',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        transition: 'all 0.2s'
                      }}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '500' }}>
                    Age Requirement
                  </label>
                  <select
                    value={formData.ageRequirement}
                    onChange={(e) => handleInputChange('ageRequirement', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      background: 'white'
                    }}
                  >
                    <option value="13+">13+</option>
                    <option value="14+">14+</option>
                    <option value="15+">15+</option>
                    <option value="16+">16+</option>
                    <option value="18+">18+</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '500' }}>
                    Contact Info (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.contactInfo}
                    onChange={(e) => handleInputChange('contactInfo', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                    placeholder="Contact email or phone"
                  />
                </div>
              </div>
            </div>

            {/* Image URL */}
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{
                fontSize: '1.5rem',
                color: '#333',
                marginBottom: '1rem',
                borderBottom: '2px solid #4CAF50',
                paddingBottom: '0.5rem'
              }}>
                Images
              </h2>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '500' }}>
                  Image URL (optional)
                </label>
                <input
                  type="url"
                  value={formData.images[0]}
                  onChange={(e) => handleInputChange('images', [e.target.value])}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                  placeholder="https://example.com/image.jpg"
                />
                <small style={{ color: '#666', fontSize: '0.875rem' }}>
                  Paste a direct link to an image (jpg, png, etc.)
                </small>
              </div>
            </div>

            {/* Submit Buttons */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  flex: 1,
                  padding: '1rem',
                  background: submitting ? '#ccc' : 'linear-gradient(135deg, #4CAF50, #45a049)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                {submitting ? 'Submitting...' : '📤 Submit Project for Review'}
              </button>
              <button
                type="button"
                onClick={() => window.location.href = '/projects'}
                style={{
                  padding: '1rem 2rem',
                  background: 'white',
                  color: '#4CAF50',
                  border: '2px solid #4CAF50',
                  borderRadius: '10px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ProjectSubmissionPage;

