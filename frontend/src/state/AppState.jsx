import { createContext, useContext, useReducer, useEffect } from "react";
import axios from "axios";

export const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` }
});

const AppStateContext = createContext();
const AppDispatchContext = createContext();

const getStoredUser = () => {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
};

const initialState = {
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  user: getStoredUser(),
  role: getStoredUser()?.role || null,
  aiResult: null,
  photoUrl: null,
  inventoryItems: [],
  workOrderDraft: null,
  bookingService: null,
  bookingFirearm: null,
  bookingDateTime: null,
  loading: false,
  error: null
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_TOKEN":
      return { ...state, token: action.payload };

    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        role: action.payload?.role || state.role
      };

    case "SET_ROLE":
      return { ...state, role: action.payload };

    case "SET_AI_RESULT":
      return { ...state, aiResult: action.payload };

    case "SET_PHOTO_URL":
      return { ...state, photoUrl: action.payload };

    case "SET_INVENTORY_ITEMS":
      return { ...state, inventoryItems: action.payload };

    case "SET_WORKORDER_DRAFT":
      return { ...state, workOrderDraft: action.payload };

    case "SET_BOOKING_SERVICE":
      return { ...state, bookingService: action.payload };

    case "SET_BOOKING_FIREARM":
      return { ...state, bookingFirearm: action.payload };

    case "SET_BOOKING_DATETIME":
      return { ...state, bookingDateTime: action.payload };

    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    default:
      return state;
  }
}

export function AppStateProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  function loginUser(data) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    dispatch({ type: "SET_TOKEN", payload: data.token });
    dispatch({ type: "SET_USER", payload: data.user });
    dispatch({ type: "SET_ROLE", payload: data.user?.role || null });
  }

  function logoutUser() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    dispatch({ type: "SET_TOKEN", payload: null });
    dispatch({ type: "SET_USER", payload: null });
    dispatch({ type: "SET_ROLE", payload: null });
  }

  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        if (state.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
        dispatch({ type: "SET_LOADING", payload: true });
        return config;
      },
      (error) => {
        dispatch({ type: "SET_LOADING", payload: false });
        return Promise.reject(error);
      }
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => {
        dispatch({ type: "SET_LOADING", payload: false });
        return response;
      },
      (error) => {
        dispatch({ type: "SET_LOADING", payload: false });
        dispatch({
          type: "SET_ERROR",
          payload: error.response?.data?.message || "An unexpected error occurred"
        });

        if (error.response?.status === 401) {
          logoutUser();
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [state.token]);

  return (
    <AppStateContext.Provider value={{ ...state, loginUser, logoutUser }}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  return useContext(AppStateContext);
}

export function useAppDispatch() {
  return useContext(AppDispatchContext);
}
