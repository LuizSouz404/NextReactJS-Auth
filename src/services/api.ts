import axios, { AxiosError } from 'axios';
import { parseCookies, setCookie } from 'nookies';
import { setTimeout } from 'timers/promises';
import { signOut } from '../contexts/AuthContext';

let cookies = parseCookies();
let isRefreshing = false;
let failedRequestsQueue = [];

export const api = axios.create({
  baseURL: 'http://localhost:3333',
  headers: {
    Authorization: `Bearer ${cookies['nextAuth.token']}`
  }
});

api.interceptors.response.use(response => {
  return response;
}, (error: AxiosError) => {
  if(error.response.status === 401) {
    if(error.response.data?.code === 'token.expired') {
      cookies = parseCookies();

      const {'nextAuth.refreshToken': refreshToken} = cookies;
      const originalConfig = error.config;

      if(!isRefreshing) {
        isRefreshing = true;

        api.post('/refresh', {
          refreshToken
        }).then(response => {
          const { token, refreshToken: newRefreshToken } = response.data;
          
          setCookie(undefined, 'nextAuth.token', token, {
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: '/'
          })
          setCookie(undefined, 'nextAuth.refreshToken', newRefreshToken, {
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: '/'
          });
  
          api.defaults.headers['Authorization'] = `Bearer ${token}`;

          failedRequestsQueue.forEach(request => request.onSucess(token));
          failedRequestsQueue = [];
        }).then(error => {
          failedRequestsQueue.forEach(request => request.onFailure(error));
          failedRequestsQueue = [];
        }).finally(() => {
          isRefreshing = false;
        });
      }

      return new Promise((resolve, reject) => {
        failedRequestsQueue.push({
          onSucess: (token: string) => {
            originalConfig.headers['Authorization'] = `Bearer ${token}`;

            resolve(api(originalConfig));
          },
          onFailure: (error: AxiosError) => {
            reject(error);
          }
        })
      });
      
    } else {
      signOut();
    }
  }
  return Promise.reject(error);
})