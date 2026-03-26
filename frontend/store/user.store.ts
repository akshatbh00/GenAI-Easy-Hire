/**
 * store/user.store.ts — Zustand global auth + user state
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi, UserOut } from "@/lib/api";
import { saveSession, clearSession } from "@/lib/auth";



//added this part- 11-29
// Add this helper at the top of user.store.ts
function setCookie(name: string, value: string, days = 30) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${value};path=/;max-age=${days * 86400};SameSite=Lax`;
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=;path=/;max-age=0`;
}

// In the login action, after saveSession(res):
setCookie("hf_token", res.access_token);

// In the logout action, after clearSession():
deleteCookie("hf_token");

//till here
interface UserState {
  user:       UserOut | null;
  token:      string | null;
  isLoading:  boolean;
  error:      string | null;

  // actions
  login:      (email: string, password: string) => Promise<void>;
  register:   (email: string, password: string, full_name: string, role?: string) => Promise<void>;
  logout:     () => void;
  fetchMe:    () => Promise<void>;
  clearError: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user:      null,
      token:     null,
      isLoading: false,
      error:     null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authApi.login(email, password);
          if (res.access_token) {
            saveSession(res);
            set({ token: res.access_token });
            await get().fetchMe();
          } else {
            throw new Error(res.detail ?? "Login failed");
          }
        } catch (e: any) {
          set({ error: e.message });
          throw e;
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (email, password, full_name, role = "jobseeker") => {
        set({ isLoading: true, error: null });
        try {
          const res = await authApi.register({ email, password, full_name, role });
          saveSession(res);
          set({ token: res.access_token });
          await get().fetchMe();
        } catch (e: any) {
          set({ error: e.message });
          throw e;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        clearSession();
        set({ user: null, token: null });
      },

      fetchMe: async () => {
        try {
          const user = await authApi.me();
          set({ user });
        } catch {
          set({ user: null, token: null });
          clearSession();
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name:    "hireflow-user",
      partialize: (s) => ({ token: s.token, user: s.user }),
    }
  )
);
