import { create } from 'zustand';
import { authApi } from "../api/authApi";

function getInitialAuth() {
  try {
    const stored = localStorage.getItem('auth_user');
    if (stored) {
      const { user, token } = JSON.parse(stored);
      if (user && token) {
        return { user, isAuthenticated: true, isInitialized: true };
      }
    }
  } catch {
    localStorage.removeItem('auth_user');
  }
  return { user: null, isAuthenticated: false, isInitialized: true };
}


export const authStore = create((set) => ({
    ...getInitialAuth(),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    await new Promise(r => setTimeout(r, 800));

    const res = await authApi.login(email, password);
    if(!res.data.success)
    {
      set({ error: res.message, isLoading: false });
      return false;
    }

    const { token, user } = res.data.data;
    const authData = { user, token };
    set({ user: authData.user, isAuthenticated: true, isLoading: false });
    localStorage.setItem("auth_user", JSON.stringify(authData));
    return true;
  },

  logout: () => {
    localStorage.removeItem('auth_user');
    set({ user: null, isAuthenticated: false });
  },


   initAuth: () => {},

  clearError: () => set({ error: null }),
}));