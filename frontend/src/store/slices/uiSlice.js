import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarOpen: false,
    darkMode: localStorage.getItem('darkMode') === 'true',
    period: 'daily',
  },
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem('darkMode', state.darkMode);
      document.documentElement.classList.toggle('dark', state.darkMode);
    },
    setPeriod: (state, action) => {
      state.period = action.payload;
    },
  },
});

export const { toggleSidebar, setSidebarOpen, toggleDarkMode, setPeriod } = uiSlice.actions;
export default uiSlice.reducer;
