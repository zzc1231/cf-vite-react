import { useState, useEffect } from "react";

function getStorageValue<T>(key: string, defaultValue: T): T {
    if (typeof window == "undefined") {
        return defaultValue;
    }

    const confJson = localStorage.getItem(key);
    if (confJson) {
        return JSON.parse(confJson) as T;
    }

    return defaultValue

}


export const useLocalStorage = <T>(key: string, defaultValue: T): [T, (newValue: T) => void] => {
    const [value, setValue] = useState(() => {
        return getStorageValue(key, defaultValue);
    });

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);

    return [value, setValue];
};

