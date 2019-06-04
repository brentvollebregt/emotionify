const version = 1;

interface VersionedState<T> {
    version: number,
    state: T
}

export function putStoredState<T>(key: string, state: T): void {
    let versionedState: VersionedState<T> = {
        version: version,
        state: state
    }
    localStorage.setItem(key, JSON.stringify(versionedState));
}

export function getStoredState<T>(key: string, isValid: (state: T) => boolean): T | null {
    let stored_data = localStorage.getItem(key);
    if (stored_data === null) {
        return null;
    } else {
        let stored_versioned_state_parsed: VersionedState<T> = JSON.parse(stored_data);
        if (stored_versioned_state_parsed.version === version) {
            if (isValid(stored_versioned_state_parsed.state)) { // Only get a stored state if it is valid
                return stored_versioned_state_parsed.state;
            } else {
                return null;
            }
        } else {
            return null; // An old version of data storage
        }
    }
}

export function deleteStoredState(key: string): void {
    localStorage.removeItem(key);
}
