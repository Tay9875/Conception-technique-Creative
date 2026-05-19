import { env } from '../config/env';
import { HttpError } from '../lib/http';

export type GoogleProfile = {
  providerAccountId: string;
  email: string;
  emailVerified: boolean;
  firstname: string;
  lastname: string;
  avatarUrl: string | null;
};

type GoogleTokenResponse = {
  access_token?: string;
  id_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
  error?: string;
};

type GoogleUserInfoResponse = {
  sub?: string;
  email?: string;
  email_verified?: boolean;
  given_name?: string;
  family_name?: string;
  name?: string;
  picture?: string;
};

export const isGoogleOAuthConfigured = () =>
  Boolean(env.google.clientId && env.google.clientSecret && env.google.callbackUrl);

export const buildGoogleAuthorizationUrl = (state: string) => {
  if (!isGoogleOAuthConfigured()) {
    throw new HttpError(503, 'GOOGLE_OAUTH_NOT_CONFIGURED', 'Google OAuth n est pas configure.');
  }

  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', env.google.clientId);
  url.searchParams.set('redirect_uri', env.google.callbackUrl);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'openid email profile');
  url.searchParams.set('state', state);
  url.searchParams.set('access_type', 'online');
  url.searchParams.set('prompt', 'select_account');
  return url.toString();
};

const parseGoogleName = (profile: GoogleUserInfoResponse) => {
  if (profile.given_name || profile.family_name) {
    return {
      firstname: profile.given_name || 'Membre',
      lastname: profile.family_name || 'Oncarya'
    };
  }

  const parts = (profile.name || 'Membre Oncarya').trim().split(/\s+/);
  return {
    firstname: parts[0] || 'Membre',
    lastname: parts.slice(1).join(' ') || 'Oncarya'
  };
};

export const fetchGoogleProfile = async (code: string): Promise<GoogleProfile> => {
  if (!isGoogleOAuthConfigured()) {
    throw new HttpError(503, 'GOOGLE_OAUTH_NOT_CONFIGURED', 'Google OAuth n est pas configure.');
  }

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: env.google.clientId,
      client_secret: env.google.clientSecret,
      redirect_uri: env.google.callbackUrl,
      grant_type: 'authorization_code'
    })
  });

  const tokens = (await tokenResponse.json().catch(() => ({}))) as GoogleTokenResponse;
  if (!tokenResponse.ok || !tokens.access_token) {
    throw new HttpError(401, 'GOOGLE_TOKEN_EXCHANGE_FAILED', 'Connexion Google impossible.');
  }

  const userInfoResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` }
  });
  const userInfo = (await userInfoResponse.json().catch(() => ({}))) as GoogleUserInfoResponse;

  if (!userInfoResponse.ok || !userInfo.sub || !userInfo.email || userInfo.email_verified !== true) {
    throw new HttpError(401, 'GOOGLE_PROFILE_UNVERIFIED', 'Le compte Google doit avoir un email verifie.');
  }

  const { firstname, lastname } = parseGoogleName(userInfo);
  return {
    providerAccountId: userInfo.sub,
    email: userInfo.email.toLowerCase(),
    emailVerified: true,
    firstname: firstname.slice(0, 100),
    lastname: lastname.slice(0, 100),
    avatarUrl: userInfo.picture || null
  };
};
