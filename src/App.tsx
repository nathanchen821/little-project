import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from "aws-amplify/data";
import { updateUserAttributes, fetchUserAttributes } from 'aws-amplify/auth';

const client = generateClient<Schema>();

function App() {
  const { user, signOut } = useAuthenticator();

  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const [displayNameInput, setDisplayNameInput] = useState("");
  const [updatingDisplayName, setUpdatingDisplayName] = useState(false);
  const [error, setError] = useState("");
  const [userAttributes, setUserAttributes] = useState<any>({});

  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }, []);

  // Fetch user attributes on mount and after update
  useEffect(() => {
    async function fetchAttrs() {
      try {
        const attrs = await fetchUserAttributes();
        setUserAttributes(attrs);
        // Set input to current display name if available
        if (attrs?.preferred_username) {
          setDisplayNameInput(attrs.preferred_username);
        } else {
          setDisplayNameInput("");
        }
      } catch (err) {
        setUserAttributes({});
      }
    }
    fetchAttrs();
  }, [user]);

  async function handleDisplayNameUpdate(e: React.FormEvent) {
    e.preventDefault();
    setUpdatingDisplayName(true);
    setError("");
    try {
      await updateUserAttributes({ userAttributes: { preferred_username: displayNameInput } });
      // Refetch user attributes after update
      const attrs = await fetchUserAttributes();
      setUserAttributes(attrs);
      if (attrs?.preferred_username) {
        setDisplayNameInput(attrs.preferred_username);
      }
    } catch (err: any) {
      setError(err.message || "Failed to update display name");
    } finally {
      setUpdatingDisplayName(false);
    }
  }

  function createTodo() {
    client.models.Todo.create({ content: window.prompt("Todo content") });
  }

  // Helper to get preferredUsername from fetched user attributes
  const getDisplayName = () => {
    if (userAttributes?.preferred_username) {
      return userAttributes.preferred_username;
    }
    // Fallback to loginId (email prefix)
    if (user?.signInDetails?.loginId) {
      return user.signInDetails.loginId.split('@')[0];
    }
    return 'User';
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header with Sign Out Button */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid #e2e8f0',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ 
          margin: 0, 
          color: '#1e293b', 
          fontSize: '1.5rem',
          fontWeight: '600'
        }}>
          {getDisplayName()}'s Todos
        </h1>
        <button 
          onClick={signOut}
          style={{
            background: '#ef4444',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500',
            transition: 'background-color 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#dc2626';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = '#ef4444';
          }}
        >
          Sign Out
        </button>
      </header>

      <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        {/* Display Name Update Form */}
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <form onSubmit={handleDisplayNameUpdate} style={{ display: 'flex', gap: '1rem', alignItems: 'end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: '500',
                color: '#374151'
              }}>
                Display Name
              </label>
              <input
                type="text"
                value={displayNameInput}
                onChange={e => setDisplayNameInput(e.target.value)}
                disabled={updatingDisplayName}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              />
            </div>
            <button 
              type="submit" 
              disabled={updatingDisplayName}
              style={{
                background: updatingDisplayName ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                cursor: updatingDisplayName ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}
            >
              {updatingDisplayName ? 'Updating...' : 'Update'}
            </button>
          </form>
          {error && <div style={{ color: '#ef4444', marginTop: '0.5rem', fontSize: '0.9rem' }}>{error}</div>}
        </div>

        {/* Todo Section */}
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.25rem' }}>Your Todos</h2>
            <button 
              onClick={createTodo}
              style={{
                background: '#10b981',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}
            >
              + Add Todo
            </button>
          </div>
          
          {todos.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              color: '#6b7280', 
              padding: '2rem',
              background: '#f9fafb',
              borderRadius: '6px',
              border: '1px dashed #d1d5db'
            }}>
              <p style={{ margin: 0, fontSize: '1rem' }}>No todos yet. Click "Add Todo" to get started!</p>
            </div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {todos.map((todo) => (
                <li key={todo.id} style={{
                  padding: '1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  marginBottom: '0.5rem',
                  background: '#fafafa'
                }}>
                  {todo.content}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Success Message */}
        <div style={{
          background: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: '8px',
          padding: '1rem',
          marginTop: '2rem',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, color: '#0369a1' }}>
            🥳 App successfully hosted! Try creating a new todo.
          </p>
          <a 
            href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates"
            style={{ 
              color: '#0369a1', 
              textDecoration: 'underline',
              fontSize: '0.9rem'
            }}
          >
            Review next step of this tutorial.
          </a>
        </div>
      </main>
    </div>
  );
}

export default App;
