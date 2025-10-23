import React, { useEffect, useState } from 'react';
import { getCurrentUser, signOut as amplifySignOut } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import { getOrCreateUserProfile } from './utils/userProfile';

const client = generateClient<Schema>();

interface Project {
  id: string;
  title: string;
  description: string;
  category?: string;
  location?: string;
  address?: string;
  city?: string;
  state?: string;
  startDate: string;
  endDate?: string;
  duration?: number;
  currentVolunteers?: number;
  maxVolunteers?: number;
  spotsAvailable?: number;
  difficulty?: string;
  requirements?: string;
  whatToBring?: string;
  whatToExpect?: string;
  impact?: string;
  skills?: string[];
  ageRequirement?: string;
  contactInfo?: string;
  images?: string[];
  status?: string;
  isApproved?: boolean;
  createdAt: string;
  createdById?: string;
}

const AdminDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pendingProjects, setPendingProjects] = useState<Project[]>([]);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    pendingProjects: 0,
    totalUsers: 0
  });
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const toggleProjectDetails = (projectId: string) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      await getCurrentUser();
      setIsAuthenticated(true);
      
      const userProfile = await getOrCreateUserProfile();
      if (!userProfile) {
        window.location.href = '/app';
        return;
      }

      setCurrentUserId(userProfile.id);

      if (!userProfile.isAdmin) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setIsAdmin(true);
      await loadAdminData();
    } catch (error) {
      console.error('Error checking admin access:', error);
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  const loadAdminData = async () => {
    try {
      setLoading(true);

      // Fetch all projects
      const { data: allProjects, errors: projectErrors } = await client.models.Project.list();
      
      if (projectErrors) {
        console.error('Error fetching projects:', projectErrors);
      }

      // Fetch all users
      const { data: allUsers, errors: userErrors } = await client.models.User.list();
      
      if (userErrors) {
        console.error('Error fetching users:', userErrors);
      }

      // Filter pending projects
      const pending = allProjects?.filter(p => 
        p.status === 'Pending' || !p.isApproved
      ) || [];

      const active = allProjects?.filter(p => 
        p.status === 'Active' && p.isApproved
      ) || [];

      // Sort pending projects by creation date (newest first)
      const sortedPending = pending.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      setPendingProjects(sortedPending as Project[]);
      setStats({
        totalProjects: allProjects?.length || 0,
        activeProjects: active.length,
        pendingProjects: pending.length,
        totalUsers: allUsers?.length || 0
      });

      setLoading(false);
    } catch (error) {
      console.error('Error loading admin data:', error);
      setLoading(false);
    }
  };

  const handleApproveProject = async (projectId: string, projectTitle: string) => {
    if (!window.confirm(`Approve "${projectTitle}"? This will make it visible to all users.`)) {
      return;
    }

    try {
      const now = new Date().toISOString();
      
      const { errors } = await client.models.Project.update({
        id: projectId,
        status: 'Active',
        isApproved: true,
        approvedById: currentUserId || undefined,
        approvedAt: now
      });

      if (errors) {
        console.error('Error approving project:', errors);
        setNotification({
          type: 'error',
          message: 'Failed to approve project. Please try again.'
        });
        return;
      }

      setNotification({
        type: 'success',
        message: `"${projectTitle}" has been approved and is now live!`
      });

      // Reload admin data
      await loadAdminData();

      // Auto-hide notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Error approving project:', error);
      setNotification({
        type: 'error',
        message: 'Failed to approve project. Please try again.'
      });
    }
  };

  const handleRejectProject = async (projectId: string, projectTitle: string) => {
    const reason = window.prompt(`Reject "${projectTitle}"?\n\nOptionally provide a reason:`);
    
    if (reason === null) {
      return; // User cancelled
    }

    try {
      const { errors } = await client.models.Project.update({
        id: projectId,
        status: 'Rejected',
        isApproved: false,
        rejectionReason: reason || 'No reason provided'
      });

      if (errors) {
        console.error('Error rejecting project:', errors);
        setNotification({
          type: 'error',
          message: 'Failed to reject project. Please try again.'
        });
        return;
      }

      setNotification({
        type: 'success',
        message: `"${projectTitle}" has been rejected.`
      });

      // Reload admin data
      await loadAdminData();

      // Auto-hide notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Error rejecting project:', error);
      setNotification({
        type: 'error',
        message: 'Failed to reject project. Please try again.'
      });
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

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getCategoryIcon = (category: string | undefined) => {
    if (!category) return '📋';
    if (category.includes('Education')) return '📚';
    if (category.includes('Environment')) return '🌳';
    if (category.includes('Community')) return '🤝';
    if (category.includes('Technology')) return '💻';
    if (category.includes('Health')) return '❤️';
    if (category.includes('Animals')) return '🐾';
    if (category.includes('Arts')) return '🎨';
    return '📋';
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8f9fa'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <p style={{ color: '#718096', fontSize: '1.1rem' }}>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8f9fa',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔒</div>
          <h1 style={{ fontSize: '2rem', color: '#2d3748', marginBottom: '1rem' }}>
            Admin Access Required
          </h1>
          <p style={{ color: '#718096', marginBottom: '2rem', lineHeight: '1.6' }}>
            This page is restricted to administrators only. If you believe you should have access, please contact your system administrator.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              background: 'linear-gradient(135deg, #4CAF50, #45a049)',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f8f9fa',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      lineHeight: '1.6',
      color: '#333',
      margin: 0,
      padding: 0
    }}>
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
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        color: 'white',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.5rem' }}>⚙️</span>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Admin Dashboard</span>
        </div>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <a href="/" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '20px' }}>Home</a>
          <a href="/projects" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '20px' }}>Projects</a>
          <a href="/my-projects" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '20px' }}>My Projects</a>
          <a href="/admin" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.2)' }}>Admin</a>
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
      <main style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem',
        paddingTop: '3rem'
      }}>
        {/* Header */}
        <div style={{
          marginBottom: '2rem'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#2d3748',
            marginBottom: '0.5rem'
          }}>
            Admin Dashboard
          </h1>
          <p style={{
            fontSize: '1.1rem',
            color: '#718096'
          }}>
            Review and manage pending project submissions
          </p>
        </div>

        {/* Statistics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📊</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
              {stats.totalProjects}
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Total Projects</div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✅</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
              {stats.activeProjects}
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Active Projects</div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            color: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>⏳</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
              {stats.pendingProjects}
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Pending Approval</div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            color: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>👥</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
              {stats.totalUsers}
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Total Users</div>
          </div>
        </div>

        {/* Pending Projects Section */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
        }}>
          <h2 style={{
            fontSize: '1.75rem',
            fontWeight: '600',
            color: '#2d3748',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span>📋</span>
            Pending Project Approvals
            {stats.pendingProjects > 0 && (
              <span style={{
                background: '#f59e0b',
                color: 'white',
                fontSize: '0.9rem',
                padding: '0.25rem 0.75rem',
                borderRadius: '20px',
                fontWeight: '600'
              }}>
                {stats.pendingProjects}
              </span>
            )}
          </h2>

          {pendingProjects.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#718096'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✨</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#2d3748', marginBottom: '0.5rem' }}>
                All Caught Up!
              </h3>
              <p>There are no pending projects to review at the moment.</p>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem'
            }}>
              {pendingProjects.map((project) => (
                <div key={project.id} style={{
                  background: '#f8f9fa',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  border: '2px solid #e2e8f0',
                  transition: 'all 0.2s ease'
                }}>
                  {/* Project Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1 }}>
                      <span style={{ fontSize: '2.5rem' }}>{getCategoryIcon(project.category)}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                          <h3 style={{
                            fontSize: '1.35rem',
                            fontWeight: '600',
                            color: '#2d3748',
                            margin: 0
                          }}>
                            {project.title}
                          </h3>
                          <button
                            onClick={() => toggleProjectDetails(project.id)}
                            style={{
                              background: expandedProjects.has(project.id) ? '#e0e7ff' : '#f3f4f6',
                              color: expandedProjects.has(project.id) ? '#4338ca' : '#6b7280',
                              border: 'none',
                              padding: '0.4rem 0.75rem',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                              fontWeight: '600',
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem'
                            }}
                          >
                            {expandedProjects.has(project.id) ? '🔼 Hide Details' : '🔽 View Details'}
                          </button>
                        </div>
                        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                          <p style={{
                            fontSize: '0.9rem',
                            color: '#718096',
                            margin: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}>
                            📍 {project.city && project.state ? `${project.city}, ${project.state}` : project.location || 'Location TBD'}
                          </p>
                          <p style={{
                            fontSize: '0.9rem',
                            color: '#718096',
                            margin: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}>
                            📅 {formatDate(project.startDate)}
                          </p>
                          <p style={{
                            fontSize: '0.9rem',
                            color: '#718096',
                            margin: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}>
                            ⏱️ {project.duration ? `${project.duration} hours` : 'TBD'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      backgroundColor: '#fef3c7',
                      color: '#92400e',
                      whiteSpace: 'nowrap'
                    }}>
                      <span>🟡</span>
                      Pending
                    </div>
                  </div>

                  {/* Description */}
                  <p style={{
                    color: '#4a5568',
                    marginBottom: '1rem',
                    lineHeight: '1.6',
                    fontSize: '0.95rem'
                  }}>
                    {project.description}
                  </p>

                  {/* Project Details */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '1rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid #e2e8f0',
                    marginBottom: '1rem'
                  }}>
                    <div>
                      <span style={{
                        fontSize: '0.8rem',
                        color: '#718096',
                        fontWeight: '500',
                        display: 'block',
                        marginBottom: '0.25rem'
                      }}>
                        Category
                      </span>
                      <p style={{
                        margin: 0,
                        fontSize: '0.95rem',
                        color: '#2d3748',
                        fontWeight: '600'
                      }}>
                        {project.category || 'Not specified'}
                      </p>
                    </div>
                    
                    <div>
                      <span style={{
                        fontSize: '0.8rem',
                        color: '#718096',
                        fontWeight: '500',
                        display: 'block',
                        marginBottom: '0.25rem'
                      }}>
                        Max Volunteers
                      </span>
                      <p style={{
                        margin: 0,
                        fontSize: '0.95rem',
                        color: '#2d3748',
                        fontWeight: '600'
                      }}>
                        {project.maxVolunteers || 0} volunteers
                      </p>
                    </div>
                    
                    <div>
                      <span style={{
                        fontSize: '0.8rem',
                        color: '#718096',
                        fontWeight: '500',
                        display: 'block',
                        marginBottom: '0.25rem'
                      }}>
                        Submitted
                      </span>
                      <p style={{
                        margin: 0,
                        fontSize: '0.95rem',
                        color: '#2d3748',
                        fontWeight: '600'
                      }}>
                        {formatDate(project.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Expandable Details Section */}
                  {expandedProjects.has(project.id) && (
                    <div style={{
                      background: 'white',
                      borderRadius: '10px',
                      padding: '1.5rem',
                      marginTop: '1rem',
                      marginBottom: '1rem',
                      border: '2px solid #e0e7ff',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}>
                      <h4 style={{
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        color: '#4338ca',
                        marginBottom: '1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        📋 Complete Project Details
                      </h4>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1.25rem'
                      }}>
                        {/* Address */}
                        {project.address && (
                          <div>
                            <span style={{ fontSize: '0.8rem', color: '#718096', fontWeight: '500', display: 'block', marginBottom: '0.35rem' }}>
                              📍 Full Address
                            </span>
                            <p style={{ margin: 0, fontSize: '0.95rem', color: '#2d3748', fontWeight: '500' }}>
                              {project.address}
                            </p>
                          </div>
                        )}

                        {/* End Date */}
                        {project.endDate && (
                          <div>
                            <span style={{ fontSize: '0.8rem', color: '#718096', fontWeight: '500', display: 'block', marginBottom: '0.35rem' }}>
                              📅 End Date
                            </span>
                            <p style={{ margin: 0, fontSize: '0.95rem', color: '#2d3748', fontWeight: '500' }}>
                              {formatDate(project.endDate)}
                            </p>
                          </div>
                        )}

                        {/* Difficulty */}
                        {project.difficulty && (
                          <div>
                            <span style={{ fontSize: '0.8rem', color: '#718096', fontWeight: '500', display: 'block', marginBottom: '0.35rem' }}>
                              💪 Difficulty Level
                            </span>
                            <p style={{ margin: 0, fontSize: '0.95rem', color: '#2d3748', fontWeight: '500' }}>
                              {project.difficulty}
                            </p>
                          </div>
                        )}

                        {/* Age Requirement */}
                        {project.ageRequirement && (
                          <div>
                            <span style={{ fontSize: '0.8rem', color: '#718096', fontWeight: '500', display: 'block', marginBottom: '0.35rem' }}>
                              👥 Age Requirement
                            </span>
                            <p style={{ margin: 0, fontSize: '0.95rem', color: '#2d3748', fontWeight: '500' }}>
                              {project.ageRequirement}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Requirements */}
                      {project.requirements && (
                        <div style={{ marginTop: '1.25rem' }}>
                          <span style={{ fontSize: '0.85rem', color: '#718096', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
                            ✅ Requirements
                          </span>
                          <p style={{ margin: 0, fontSize: '0.95rem', color: '#4a5568', lineHeight: '1.6', background: '#f9fafb', padding: '0.75rem', borderRadius: '6px' }}>
                            {project.requirements}
                          </p>
                        </div>
                      )}

                      {/* What to Bring */}
                      {project.whatToBring && (
                        <div style={{ marginTop: '1.25rem' }}>
                          <span style={{ fontSize: '0.85rem', color: '#718096', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
                            🎒 What to Bring
                          </span>
                          <p style={{ margin: 0, fontSize: '0.95rem', color: '#4a5568', lineHeight: '1.6', background: '#f9fafb', padding: '0.75rem', borderRadius: '6px' }}>
                            {project.whatToBring}
                          </p>
                        </div>
                      )}

                      {/* What to Expect */}
                      {project.whatToExpect && (
                        <div style={{ marginTop: '1.25rem' }}>
                          <span style={{ fontSize: '0.85rem', color: '#718096', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
                            💭 What to Expect
                          </span>
                          <p style={{ margin: 0, fontSize: '0.95rem', color: '#4a5568', lineHeight: '1.6', background: '#f9fafb', padding: '0.75rem', borderRadius: '6px' }}>
                            {project.whatToExpect}
                          </p>
                        </div>
                      )}

                      {/* Impact */}
                      {project.impact && (
                        <div style={{ marginTop: '1.25rem' }}>
                          <span style={{ fontSize: '0.85rem', color: '#718096', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
                            💚 Expected Impact
                          </span>
                          <p style={{ margin: 0, fontSize: '0.95rem', color: '#4a5568', lineHeight: '1.6', background: '#f9fafb', padding: '0.75rem', borderRadius: '6px' }}>
                            {project.impact}
                          </p>
                        </div>
                      )}

                      {/* Skills */}
                      {project.skills && project.skills.length > 0 && (
                        <div style={{ marginTop: '1.25rem' }}>
                          <span style={{ fontSize: '0.85rem', color: '#718096', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
                            🎯 Skills Needed
                          </span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {project.skills.filter(s => s).map((skill, idx) => (
                              <span key={idx} style={{
                                background: '#e0e7ff',
                                color: '#4338ca',
                                padding: '0.35rem 0.75rem',
                                borderRadius: '20px',
                                fontSize: '0.85rem',
                                fontWeight: '500'
                              }}>
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Contact Info */}
                      {project.contactInfo && (
                        <div style={{ marginTop: '1.25rem' }}>
                          <span style={{ fontSize: '0.85rem', color: '#718096', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
                            📞 Contact Information
                          </span>
                          <p style={{ margin: 0, fontSize: '0.95rem', color: '#4a5568', lineHeight: '1.6', background: '#f9fafb', padding: '0.75rem', borderRadius: '6px' }}>
                            {project.contactInfo}
                          </p>
                        </div>
                      )}

                      {/* Images */}
                      {project.images && project.images.length > 0 && project.images[0] && (
                        <div style={{ marginTop: '1.25rem' }}>
                          <span style={{ fontSize: '0.85rem', color: '#718096', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
                            🖼️ Project Image
                          </span>
                          <img 
                            src={project.images[0]} 
                            alt={project.title}
                            style={{
                              width: '100%',
                              maxWidth: '400px',
                              height: 'auto',
                              borderRadius: '8px',
                              border: '2px solid #e2e8f0',
                              objectFit: 'cover'
                            }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={{
                    display: 'flex',
                    gap: '0.75rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid #e2e8f0'
                  }}>
                    <button
                      onClick={() => handleApproveProject(project.id, project.title)}
                      style={{
                        flex: 1,
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        color: 'white',
                        border: 'none',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <span>✅</span>
                      Approve Project
                    </button>
                    <button
                      onClick={() => handleRejectProject(project.id, project.title)}
                      style={{
                        flex: 1,
                        background: '#fee2e2',
                        color: '#991b1b',
                        border: '2px solid #fecaca',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = '#fecaca';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = '#fee2e2';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <span>❌</span>
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

