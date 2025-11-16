import { configureStore } from '@reduxjs/toolkit';

export const store = configureStore({
  reducer: {
    // Dummy reducer to avoid empty reducer error
    dummy: (state = null) => state,
  },
});

export default store;