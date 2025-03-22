import { useState, useEffect } from "react";

export function useLocalStorageState(initialState, key) {
  const [value, setValue] = useState(() => {
    return initialState ? JSON.parse(localStorage.getItem(key)) : initialState;
    // setting the initial value of the value (watched) state to the watched list exisited in the local storage
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
    // when the value (watched) state is changed/updated, that local storage will get updated with the new value
  }, [value, key]);

  return [value, setValue];
}
