import Router from "next/router";
import { destroyCookie, parseCookies, setCookie } from "nookies";
import { createContext, ReactNode, useEffect, useState } from "react";
import { api } from "../services/apiClient";

type User = {
  email: string;
  permissions: string[];
  roles: string[];
}

type Credentials = {
  email: string;
  password: string;
}

type AuthContextData = {
  signIn: (credentials:Credentials) => Promise<void>;
  signOut: () => void;
  user: User;
  isAuthenticated: boolean;
}

let authChannel: BroadcastChannel;

type AuthProviderProps = {
  children: ReactNode;
}

export const AuthContext = createContext({} as AuthContextData);

export function signOut() {
  destroyCookie(undefined, 'nextAuth.token')
  destroyCookie(undefined, 'nextAuth.refreshToken')

  authChannel.postMessage('signOut')

  Router.push('/');
}

export function AuthProvider({children}: AuthProviderProps) {
  const [user, setUser] = useState<User>();
  const isAuthenticated = !!user;

  useEffect(() => {
    authChannel = new BroadcastChannel('auth');

    authChannel.onmessage = (message) => {
      switch (message.data) {
        case 'signOut':
          signOut();
          break;
        default:
          break;
      }
    }
  }, [])

  useEffect(() => {
    const { 'nextAuth.token': token } = parseCookies();

    if(token) {
      api.get('/me').then(response => {
        const {email, permissions, roles} = response.data;

        setUser({email, permissions, roles});
      }).catch(() => {
        signOut();
      })
    }
  }, [])

  async function signIn({email, password}:Credentials) {
    try {
      const {data} = await api.post('sessions', {
        email, password
      });

      const { token, refreshToken, permissions, roles } = data;

      setCookie(undefined, 'nextAuth.token', token, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
      })
      setCookie(undefined, 'nextAuth.refreshToken', refreshToken, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
      })

      setUser({
        email,
        permissions,
        roles
      });

      api.defaults.headers['Authorization'] = `Bearer ${token}`

      Router.push('/dashboard');
    } catch (error) {
      alert(error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}
