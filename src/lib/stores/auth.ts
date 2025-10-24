import { writable } from 'svelte/store';
import type { User } from '../auth.js';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true
};

export const authStore = writable<AuthState>(initialState);

export function setAuth(user: User, token: string) {
  authStore.update(state => ({
    ...state,
    user,
    token,
    isLoading: false
  }));
}

export function clearAuth() {
  authStore.update(state => ({
    ...state,
    user: null,
    token: null,
    isLoading: false
  }));
}

export function setLoading(loading: boolean) {
  authStore.update(state => ({
    ...state,
    isLoading: loading
  }));
}
