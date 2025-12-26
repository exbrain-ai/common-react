/**
 * AuthButton Component for common-react
 * 
 * Provides a login/logout button with user information display
 */

import React from 'react';
import { useAuth0 } from '../../services/auth0';
import type { Auth0User } from '../../types/auth0';
import './AuthButton.css';

/**
 * AuthButton component
 * Displays login button when not authenticated, or user info and logout button when authenticated
 * 
 * @example
 * ```tsx
 * <AuthButton />
 * ```
 */
export const AuthButton: React.FC = () => {
  const { isAuthenticated, user, loginWithRedirect, logout } = useAuth0();

  if (isAuthenticated && user) {
    const displayName = user.name || user.nickname || user.email || 'User';
    
    return (
      <div className="auth-button">
        <div className="auth-button__user-info">
          {user.picture && (
            <img 
              src={user.picture} 
              alt={displayName} 
              className="auth-button__avatar"
            />
          )}
          <div className="auth-button__user-details">
            <span className="auth-button__user-name">{displayName}</span>
            {user.email && (
              <span className="auth-button__user-email">{user.email}</span>
            )}
          </div>
        </div>
        <button
          className="auth-button__logout"
          onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
          aria-label="Logout"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <button
      className="auth-button__login"
      onClick={() => loginWithRedirect()}
      aria-label="Login"
    >
      Login
    </button>
  );
};

