import { useState, useEffect } from "react";

export function getStorageValue<T>(key: string, defaultValue: T): T {
    try {
        if (typeof window == "undefined") {
            return defaultValue;
        }

        const confJson = localStorage.getItem(key);
        if (confJson) {
            return JSON.parse(confJson) as T;
        }

        return defaultValue
    } catch {
        return defaultValue
    }

}


export const useLocalStorage = <T>(key: string, defaultValue: T): [T, (newValue: T) => void, () => void] => {
    const [value, setValue] = useState(() => {
        return getStorageValue(key, defaultValue);
    });

    const updateValue = (newValue: T) => {
        setValue(newValue);

        if (newValue === defaultValue) {
            localStorage.removeItem(key);
        } else {
            localStorage.setItem(key, JSON.stringify(newValue));
        }
    };

    const clear = () => {
        setValue(defaultValue);
    }

    return [value, updateValue, clear];
};

