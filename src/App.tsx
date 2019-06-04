import React from 'react';
import Navigation from './components/Navigation';
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import SpotifyAuthorization from './pages/SpotifyAuthorization';
import Home from './pages/Home';
import About from './pages/About';
import Sort from './pages/Sort';
import { Token } from './Models';
import { SpotifyUser } from './Models';
import { putStoredState, getStoredState, deleteStoredState } from './logic/StateStore';

const local_storage_key = 'emotionify-app';

interface IProps { }

interface IState {
  token: Token | null
  user: SpotifyUser | null
}

interface IStorage {
  token: {
    value: string,
    expiry: number
  } | null
  user: SpotifyUser | null
}

let blank_state: IState = {
  token: null,
  user: null
};

class App extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    let stored_state = this.getStoredState();
    if (stored_state === null) {
      this.state = blank_state;
    } else {
      this.state = stored_state;
    }

    this.onUserChange = this.onUserChange.bind(this)
    this.onLogout = this.onLogout.bind(this)
  }

  onUserChange(token: Token | null, user: SpotifyUser | null) {
    this.setState({
      token: token,
      user: user
    }, this.storeState);
  }

  onLogout(): void {
    this.onUserChange(null, null);
  }

  storeState(): void {
    if (this.state.token !== null) { // Only store something if we have a token
      let serializable_state: IStorage = {
        ...this.state,
        token: {
          value: this.state.token.value,
          expiry: this.state.token.expiry.getTime() // Date to seconds
        },
      }
      putStoredState(local_storage_key, serializable_state);
    } else {
      this.deleteStoredState(); // Delete whatever is currently stored if we have no token
    }
  }

  getStoredState(): IState | null {
    let storage = getStoredState(local_storage_key, (state: IStorage): boolean => {
      return state.token !== null && new Date(state.token.expiry) > new Date(); // Only get a stored state if the token within is not expired
    });
    if (storage !== null && storage.token !== null) {
      let state: IState = {
        ...storage,
        token : {
          value: storage.token.value,
          expiry: new Date(storage.token.value)
        }
      }
      return state;
    } else {
      return null
    }
  }

  deleteStoredState(): void {
    deleteStoredState(local_storage_key);
  }

  render() {
    const { token, user } = this.state;
    return (
      <BrowserRouter>
        <Navigation />
        <Switch>
          <Route exact path='/' component={Home} />
          <Route exact path='/sort' render={() => <Sort token={token} user={user} onLogout={this.onLogout} />} />
          <Route exact path='/about' component={About} />
          <Route exact path='/spotify-authorization' render={() => <SpotifyAuthorization token={token} onUserChange={this.onUserChange} redirectToOnCompletion={'/sort'} />} />
          <Route render={() => <Redirect to='/' />} />
        </Switch>
      </BrowserRouter>
    )
  }
}

export default App;
