import axios from "axios";

interface User {
  id: string;
  email: string;
  name?: string;
  picture_url?: string;
}

class AuthService {
  private readonly baseUrl: string;
  private tokenKey = "auth_tokens";

  constructor() {
    this.baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api/v1";
  }

  // Redirect to Google login page
  initiateGoogleLogin() {
    window.location.href = `${this.baseUrl}/v1/auth/google`;
  }

  // Handle the Google OAuth callback
  async handleGoogleCallback(code: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/auth/google/callback?code=${code}`
      );
      const { user, accessToken, refreshToken } = response.data;

      // Store tokens in local storage or in secure HTTP-only cookies
      this.saveTokens(accessToken, refreshToken);

      return user;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Authentication error: ${
            error.response?.data?.error || error.message
          }`
        );
      }
      throw error;
    }
  }

  // Get the current user profile
  async getCurrentUser(): Promise<User | null> {
    try {
      const token = this.getAccessToken();
      if (!token) return null;

      const response = await axios.get(`${this.baseUrl}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  }

  // Refresh the access token
  async refreshToken() {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) throw new Error("No refresh token available");

      const response = await axios.post(`${this.baseUrl}/auth/refresh`, {
        refreshToken,
      });
      const { accessToken, refreshToken: newRefreshToken } = response.data;

      this.saveTokens(accessToken, newRefreshToken);
      return accessToken;
    } catch (error) {
      this.logout(); // Clear tokens if refresh fails
      throw error;
    }
  }

  // Logout the user
  async logout() {
    try {
      const token = this.getAccessToken();
      if (token) {
        await axios.post(
          `${this.baseUrl}/auth/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      this.clearTokens();
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  // Get access token from storage
  getAccessToken(): string | null {
    const tokens = this.getTokens();
    return tokens ? tokens.accessToken : null;
  }

  // Get refresh token from storage
  private getRefreshToken(): string | null {
    const tokens = this.getTokens();
    return tokens ? tokens.refreshToken : null;
  }

  // Save tokens to storage
  saveTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem(
      this.tokenKey,
      JSON.stringify({ accessToken, refreshToken })
    );
  }

  // Get tokens from storage
  private getTokens(): { accessToken: string; refreshToken: string } | null {
    const tokensJson = localStorage.getItem(this.tokenKey);
    return tokensJson ? JSON.parse(tokensJson) : null;
  }

  // Clear tokens from storage
  private clearTokens() {
    localStorage.removeItem(this.tokenKey);
  }
}

export const authService = new AuthService();
