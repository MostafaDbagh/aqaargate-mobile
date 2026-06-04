import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { Listing } from '@/lib/api';

/** Mirrors the web's CompareContext: max 3 properties, side-by-side. */
export const MAX_COMPARE = 3;

export type CompareState = {
  /** Lightweight listing snapshots; the compare screen enriches these on demand. */
  items: Listing[];
};

const initialState: CompareState = {
  items: [],
};

const compareSlice = createSlice({
  name: 'compare',
  initialState,
  reducers: {
    // Replace the whole list (used on hydrate from storage).
    setCompareItems: (state, action: PayloadAction<Listing[]>) => {
      state.items = action.payload.slice(0, MAX_COMPARE);
    },
    addToCompare: (state, action: PayloadAction<Listing>) => {
      const id = action.payload._id;
      if (!id) return;
      if (state.items.some((i) => i._id === id)) return; // de-dupe
      if (state.items.length >= MAX_COMPARE) return; // honor the cap
      state.items.push(action.payload);
    },
    removeFromCompare: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((i) => i._id !== action.payload);
    },
    clearCompare: (state) => {
      state.items = [];
    },
  },
});

export const { setCompareItems, addToCompare, removeFromCompare, clearCompare } =
  compareSlice.actions;
export default compareSlice.reducer;
