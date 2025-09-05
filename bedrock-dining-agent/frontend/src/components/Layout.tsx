import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: 'white', 
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '64px'
        }}>
          <Link to="/" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            textDecoration: 'none',
            color: '#111827'
          }}>
            <span style={{ fontSize: '2rem' }}>🍽️</span>
            <span style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#2563eb' }}>
              Bedrock Dining Agent
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ 
        flex: 1,
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '1rem',
        width: '100%'
      }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{ 
        backgroundColor: 'white', 
        borderTop: '1px solid #e5e7eb',
        marginTop: 'auto'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '1rem',
          textAlign: 'center'
        }}>
          <p style={{ 
            margin: 0, 
            fontSize: '0.875rem', 
            color: '#6b7280' 
          }}>
            © 2025 Bedrock Dining Agent. Powered by AWS Bedrock AgentCore & Nova Premier.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;