import React from 'react';
import Navigation from './Navigation'
import {AppContext, AppContextInterface} from './AppContext'
import {BrowserRouter, Switch, Route, Redirect} from "react-router-dom";

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
    <BrowserRouter>
      <AppContext.Provider value={context}>
        <Navigation />
        <Switch>
            <Route exact path='/' render={() => {return 'Home'}}/> {/* component={COMP} */}
            <Route exact path='/sort' render={() => {return 'Sort'}}/>
            <Route exact path='/about' render={() => {return 'About'}}/>
            <Route render={() => <Redirect to='/' />}/>
        </Switch>
        <AppContext.Consumer>
          {value => value.user.name}
        </AppContext.Consumer>
      </AppContext.Provider>
    </BrowserRouter>
  );
}

export default App;
