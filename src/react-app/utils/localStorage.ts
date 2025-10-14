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

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);

    const clear = () => {
        localStorage.removeItem(key);
    }

    return [value, setValue, clear];
};

