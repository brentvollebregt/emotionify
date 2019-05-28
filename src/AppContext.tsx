import React from "react";

export interface AppContextInterface {
    token: {
        value: string | undefined,
        expiry: number
    },
    user: {
        name: string | undefined,
        playlists: Array<any>
    }
  }

export const AppContext = React.createContext<AppContextInterface>({
    token: {
        value: undefined,
        expiry: 0
    },
    user: {
        name: undefined,
        playlists: []
    }
});

export default AppContext;