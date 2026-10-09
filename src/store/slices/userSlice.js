import { createSlice } from '@reduxjs/toolkit';

import { extractLocationFromUser, setMyLocation } from 'src/utils/my-location-storage';

const userSlice = createSlice({
  name: 'user',
  initialState: { user: null },

  reducers: {
    setUser: (state, action) => {
      const user = { ...action.payload };
      user.displayName = user?.basicInfo?.name ?? '';
      const profileIcon = user?.basicInfo?.profileIcon ?? '';
      const isPlaceholder = /noimg|noimage/i.test(profileIcon);
      user.photoURL = profileIcon && !isPlaceholder ? profileIcon : '';
      state.user = user;

      // Every login-type flow (sign-in, OTP verify, sign-up complete, admin login) dispatches
      // setUser — cache the account's saved location here once, in one place, as `myLocation`,
      // so the services/packages filter can show it without a separate profile fetch.
      setMyLocation(extractLocationFromUser(user));
    },

    logout: (state) => {
      state.user = null;
      setMyLocation(null);
    },
  },
});

// Exporting actions
export const { setUser, logout } = userSlice.actions;
export const selectUser = (state) => state.user.user;

// Exporting the reducer
export default userSlice.reducer;

// // redux/userSlice.js
// import { createSlice } from '@reduxjs/toolkit';

// const userSlice = createSlice({
//   name: 'user', // The name of the slice
//   initialState: { user: null }, // The initial state of the slice

//   reducers: {
//     setUser: (state, action) => {
//       const user = { ...action.payload };
//       console.log('userSlice', user);
//       user.displayName = `${user?.basicInfo?.name}`
//       state.user = user;
//     },

//     // Action to set the user in the state
//     logout: (state) => {
//       localStorage.clear();
//       state.user = null
//     },
//     // Action to clear the user from the state
//   },
// });

// // Exporting actions
// export const { setUser, logout } = userSlice.actions;
// export const selectUser = (state) => state.user.user;
// // Exporting the reducer
// export default userSlice.reducer;
