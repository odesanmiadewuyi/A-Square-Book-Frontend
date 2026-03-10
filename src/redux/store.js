import { configureStore } from '@reduxjs/toolkit';

import lang from '@/locale/translation/en_us';

import rootReducer from './rootReducer';
import storePersist from './storePersist';

// localStorageHealthCheck();

const AUTH_INITIAL_STATE = {
  current: {},
  isLoggedIn: false,
  isLoading: false,
  isSuccess: false,
};

const persistedAuth = storePersist.get('auth');
const hasToken = Boolean(persistedAuth?.current?.token);
const auth_state = hasToken
  ? {
      ...AUTH_INITIAL_STATE,
      ...persistedAuth,
      isLoggedIn: true,
    }
  : AUTH_INITIAL_STATE;

const initialState = { auth: auth_state };

const store = configureStore({
  reducer: rootReducer,
  preloadedState: initialState,
  devTools: import.meta.env.PROD === false, // Enable Redux DevTools in development mode
});

if (import.meta.env.DEV) {
  // Reduce noise in production; keep lightweight hint in dev
  console.debug('A Square Book loaded.');
}

export default store;

