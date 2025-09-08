/**
 * Client-side authentication utilities
 */
export const clientAuth = {
  /**
   * Login function for client-side
   * @param {string} username 
   * @param {string} password 
   * @returns {Promise<boolean>}
   */
  async login(username, password) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      return response.ok;
    } catch (error) {
      // console.error('Login error:', error);
      console.log('Login error:', error.message);
      return false;
    }
  },
  
  /**
   * Logout function for client-side
   * @returns {Promise<boolean>}
   */
  async logout() {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      return response.ok;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  },
  
  /**
   * Check if user is authenticated (client-side)
   * @returns {Promise<boolean>}
   */
  async checkAuth() {
    try {
      const response = await fetch('/api/auth/check');
      return response.ok;
    } catch (error) {
      console.log('Auth check error:', error.message);
      return false;
    }
  },
};

/**
 * Verify session token (client-side compatible)
 * @param {string} token 
 * @returns {object|null}
 */
export function verifySessionClient(token) {
  try {
    if (!token) return null;
    
    const sessionData = JSON.parse(atob(token));
    
    // Check if session has expired
    if (Date.now() > sessionData.expiresAt) {
      return null;
    }
    
    return sessionData;
  } catch (error) {
    console.log('Error verifying session token:', error.message);
    return null;
  }
}
