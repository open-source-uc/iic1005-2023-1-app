import { useEffect, useState } from "react";

const isInBrowser = typeof window != "undefined";

type JSONValue = string | number | boolean | null | undefined | JSONValue[] | { [key: string]: JSONValue };
type StoredValue<T extends JSONValue> = { at: number; data: T };
type StoredMeta = { storedAt: number; isSetter: boolean };
type State<T extends JSONValue> = StoredValue<T> & { isSetter: boolean };
type UseLocalStorage<T extends JSONValue> = [T, (value: T, shouldChangeSetter?: boolean) => void, StoredMeta];

/** Use local storage hook */
export default function useLocalStorage<T extends JSONValue>(key: string, initialValue: T): UseLocalStorage<T> {
  const [value, setValue] = useState<State<T>>({ at: 0, isSetter: true, data: initialValue });
  console.log("useLocalStorage", key);

  // Load inicial state with local-storage
  useEffect(() => {
    const storageValue = window.localStorage.getItem(key);
    if (storageValue) setValue(JSON.parse(storageValue));
  }, [key]);

  // Wrap the setter to set the value to local storage
  const setValueWrapper = (data: T, shouldChangeSetter = true) => {
    console.log("setValueWrapper", key, shouldChangeSetter);
    const toStore: StoredValue<T> = { data, at: Date.now() };
    setValue({ ...toStore, isSetter: shouldChangeSetter ? true : value.isSetter });
    window.localStorage.setItem(key, JSON.stringify(toStore));
  };

  // Add event listeners to update the value when it changes in another window
  useEffect(() => {
    if (!isInBrowser) return;
    const handleStorageEvent = ({ key: eventKey, oldValue, newValue }: StorageEvent) => {
      if (key !== eventKey || oldValue === newValue || !newValue) return;
      const toStore: StoredValue<T> = JSON.parse(newValue);
      if (toStore.data === value.data) return;
      setValue({ ...toStore, isSetter: false });
    };
    window.addEventListener("storage", handleStorageEvent);
    return () => window.removeEventListener("storage", handleStorageEvent);
  }, [key, value]);

  // Return hook
  return [value.data, setValueWrapper, { isSetter: value.isSetter, storedAt: value.at }];
}
