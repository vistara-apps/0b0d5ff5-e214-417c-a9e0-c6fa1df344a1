import { MiniKit } from '@coinbase/minikit-js';

export interface AuthState {
  isAuthenticated: boolean;
  walletAddress: string | null;
  username: string | null;
}

export class AuthManager {
  private static instance: AuthManager;
  private authState: AuthState = {
    isAuthenticated: false,
    walletAddress: null,
    username: null,
  };

  private constructor() {}

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  async login(): Promise<AuthState> {
    try {
      if (typeof window === 'undefined') {
        throw new Error('Auth can only be performed on client side');
      }

      const { MiniKit } = await import('@coinbase/minikit-js');

      if (!MiniKit.isInstalled()) {
        throw new Error('MiniKit is not installed. Please install Base Wallet.');
      }

      const result = await MiniKit.login();

      if (result.success) {
        this.authState = {
          isAuthenticated: true,
          walletAddress: result.address,
          username: result.username || `Player${result.address.slice(-4)}`,
        };

        // Store in localStorage for persistence
        localStorage.setItem('snakefi_auth', JSON.stringify(this.authState));

        return this.authState;
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    this.authState = {
      isAuthenticated: false,
      walletAddress: null,
      username: null,
    };

    localStorage.removeItem('snakefi_auth');
  }

  getAuthState(): AuthState {
    // Try to load from localStorage if not authenticated
    if (!this.authState.isAuthenticated && typeof window !== 'undefined') {
      const stored = localStorage.getItem('snakefi_auth');
      if (stored) {
        try {
          this.authState = JSON.parse(stored);
        } catch (error) {
          console.error('Error parsing stored auth state:', error);
          localStorage.removeItem('snakefi_auth');
        }
      }
    }

    return this.authState;
  }

  isAuthenticated(): boolean {
    return this.getAuthState().isAuthenticated;
  }

  getWalletAddress(): string | null {
    return this.getAuthState().walletAddress;
  }

  getUsername(): string | null {
    return this.getAuthState().username;
  }
}

export const authManager = AuthManager.getInstance();

