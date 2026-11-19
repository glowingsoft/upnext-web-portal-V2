import { configureStore, createAction } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { persistReducer, persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { authApi } from './Reducer/auth';
import userReducer from './slices/userSlice';
import { walletsApi } from './Reducer/wallets-api';
import { categoriesApi } from './Reducer/categories-api';
import { badgesApi } from './Reducer/badges-api';
import { servicesApi } from './Reducer/services-api';
import { businessesApi } from './Reducer/businesses-api';
import { bookingsApi } from './Reducer/bookings-api';
import { contactSupportApi } from './Reducer/contact-support-api';
import { settingsApi } from './Reducer/settings-api';
import { notificationsApi } from './Reducer/notifications-api';
import { helpCenterApi } from './Reducer/help-center-api';
import { customersApi } from './Reducer/customers-api';
import { ticketmasterApi } from './Reducer/ticketmaster-api';
import { cardsApi } from './Reducer/cards-api';
import { chatApi } from './Reducer/chat-api';
import { adminDashboardApi } from './Reducer/admin-dashboard-api';
import { tagsApi } from './Reducer/tags-api';
import { portfolioApi } from './Reducer/portfolio-api';
import { instantBookingsApi } from './Reducer/instant-bookings-api';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user'],
};

// Action to reset all API caches
export const resetApiState = createAction('api/resetApiState');

// Create a persisted reducer for the user slice
const persistedUserReducer = persistReducer(persistConfig, userReducer);

// Create the Redux store with the persisted reducer for the user slice
export const store = configureStore({
  reducer: {
    [categoriesApi.reducerPath]: categoriesApi.reducer,
    [walletsApi.reducerPath]: walletsApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [badgesApi.reducerPath]: badgesApi.reducer,
    [servicesApi.reducerPath]: servicesApi.reducer,
    [businessesApi.reducerPath]: businessesApi.reducer,
    [bookingsApi.reducerPath]: bookingsApi.reducer,
    [contactSupportApi.reducerPath]: contactSupportApi.reducer,
    [settingsApi.reducerPath]: settingsApi.reducer,
    [notificationsApi.reducerPath]: notificationsApi.reducer,
    [helpCenterApi.reducerPath]: helpCenterApi.reducer,
    [customersApi.reducerPath]: customersApi.reducer,
    [ticketmasterApi.reducerPath]: ticketmasterApi.reducer,
    [cardsApi.reducerPath]: cardsApi.reducer,
    [chatApi.reducerPath]: chatApi.reducer,
    [adminDashboardApi.reducerPath]: adminDashboardApi.reducer,
    [tagsApi.reducerPath]: tagsApi.reducer,
    [portfolioApi.reducerPath]: portfolioApi.reducer,
    [instantBookingsApi.reducerPath]: instantBookingsApi.reducer,
    user: persistedUserReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(
      authApi.middleware,
      walletsApi.middleware,
      categoriesApi.middleware,
      badgesApi.middleware,
      servicesApi.middleware,
      businessesApi.middleware,
      bookingsApi.middleware,
      contactSupportApi.middleware,
      settingsApi.middleware,
      notificationsApi.middleware,
      helpCenterApi.middleware,
      customersApi.middleware,
      ticketmasterApi.middleware,
      cardsApi.middleware,
      chatApi.middleware,
      adminDashboardApi.middleware,
      tagsApi.middleware,
      portfolioApi.middleware,
      instantBookingsApi.middleware
    ),
});

// Initialize Redux Persist
export const persistor = persistStore(store);

// Setup listeners
setupListeners(store.dispatch);

// import { configureStore, createAction } from '@reduxjs/toolkit';
// import { setupListeners } from '@reduxjs/toolkit/query';
// import { persistReducer, persistStore } from 'redux-persist';
// import storage from 'redux-persist/lib/storage';
// import { authApi } from './Reducer/auth';
// import userReducer from './slices/userSlice';
// import { walletsApi } from './Reducer/wallets-api';
// import { transactionsApi } from './Reducer/transactions-api';
// import { categoriesApi } from './Reducer/categories-api';

// const persistConfig = {
//   key: 'root',
//   storage,
//   // whitelist: ['user'],
// };

// export const resetStore = createAction('RESET_STORE');

// // Create a persisted reducer for the user slice
// const persistedUserReducer = persistReducer(persistConfig, userReducer);

// // Create the Redux store with the persisted reducer for the user slice
// export const store = configureStore({
//   reducer: {
//     [categoriesApi.reducerPath]: categoriesApi.reducer,
//     [transactionsApi.reducerPath]: transactionsApi.reducer,
//     [walletsApi.reducerPath]: walletsApi.reducer,
//     [authApi.reducerPath]: authApi.reducer,
//     user: persistedUserReducer,
//   },
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware({
//       serializableCheck: {
//         ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/REGISTER'],
//       },
//     }).concat(authApi.middleware,
//       walletsApi.middleware, transactionsApi.middleware, categoriesApi.middleware),
// });

// // Initialize Redux Persist
// export const persistor = persistStore(store);

// // Setup listeners
// setupListeners(store.dispatch);
