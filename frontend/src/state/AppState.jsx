import { createContext, useContext, useReducer } from "react";

const AppStateContext = createContext();
const AppDispatchContext = createContext();

const initialState = {
  token: null,
  user: null,
  role: null,
  aiResult: null,
  photoUrl: null,
  inventoryItems: [],
  workOrderDraft: null,
  bookingService: null,
  bookingFirearm: null,
  bookingDateTime: null

};

function reducer(state, action) {
  switch (action.type) {
    case "SET_TOKEN":
      return { ...state, token: action.payload };

    case "SET_USER":
      return { ...state, user: action.payload };

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


    default:
      return state;
  }
}

export function AppStateProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <AppStateContext.Provider value={state}>
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
