export function putStoredState<T>(key: string, state: T): void {
    localStorage.setItem(key, JSON.stringify(state));
}

export function getStoredState<T>(key: string, isValid: (state: T) => boolean): T | null {
    let stored_data = localStorage.getItem(key);
    if (stored_data === null) {
        return null;
    } else {
        let stored_data_parsed: T = JSON.parse(stored_data);
        if (isValid(stored_data_parsed)) { // Only get a stored state if it is valid
            return stored_data_parsed;
        } else {
            return null;
        }
    }
}

export function deleteStoredState(key: string): void {
    localStorage.removeItem(key);
}
