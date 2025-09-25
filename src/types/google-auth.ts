// Google Identity Services类型定义
export interface GoogleCredentialResponse {
  credential: string; // JWT ID Token
  select_by?: string;
}

export interface GoogleUser {
  sub: string; // Google用户唯一ID
  email: string;
  email_verified: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale?: string;
  iat: number;
  exp: number;
  aud: string;
  iss: string;
}

export interface GoogleAuthConfig {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  auto_prompt?: boolean;
  cancel_on_tap_outside?: boolean;
}

// 扩展window对象以包含Google Identity Services
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: GoogleAuthConfig) => void;
          prompt: (notification?: (notification: any) => void) => void;
          renderButton: (
            element: HTMLElement,
            config: {
              type?: 'standard' | 'icon';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              logo_alignment?: 'left' | 'center';
              width?: string;
              locale?: string;
            }
          ) => void;
          disableAutoSelect: () => void;
          storeCredential: (credential: { id: string; password: string }) => void;
          cancel: () => void;
          onGoogleLibraryLoad: () => void;
          revoke: (email: string, callback: () => void) => void;
        };
      };
    };
  }
}
