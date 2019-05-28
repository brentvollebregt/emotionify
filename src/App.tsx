import React from 'react';
import Navigation from './Navigation'
import {AppContext, AppContextInterface} from './AppContext'

const context: AppContextInterface = {
  token: {
    value: undefined,
    expiry: 0
  },
  user: {
    name: 'No One',
    playlists: []
  }
}

const App: React.FC = () => {
  return (
    <>
      <AppContext.Provider value={context}>
        <Navigation />
        <div>
          <AppContext.Consumer>
            {value => value.user.name}
          </AppContext.Consumer>
        </div>
      </AppContext.Provider>
    </>
  );
}

export default App;
