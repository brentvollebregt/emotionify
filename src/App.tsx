import React from 'react';
import Navigation from './components/Navigation';
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import SpotifyAuthorization from './pages/SpotifyAuthorization';
import Home from './pages/Home';
import About from './pages/About';
import Sort from './pages/Sort';
import { Token } from './Models';
import { SpotifyUser } from './Models';

const local_storage_token_key = 'spotify-token';

interface IProps { }

interface IState {
  token: Token | null
  user: SpotifyUser | null
}

let blank_state: IState = {
  token: null,
  user: null
};

class App extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    let stored_state = this.readStoredState();
    if (stored_state === null) {
      this.state = blank_state;
    } else {
      this.state = stored_state;
    }

    this.onUserChange = this.onUserChange.bind(this)
    this.onLogout = this.onLogout.bind(this)
  }

  onUserChange(token: Token, user: SpotifyUser) {
    this.setState({
      token: token,
      user: user
    }, this.storeState);
  }

  onLogout(): void {
    this.deleteStoredState();
    this.setState(blank_state);
  }

  storeState(): void {
    if (this.state.token !== null) { // Only store something if we have a token
      let serializable_state = {
        token: {
          value: this.state.token.value,
          expiry: this.state.token.expiry.getTime() // Date to seconds
        },
        user: this.state.user
      }
      localStorage.setItem(local_storage_token_key, JSON.stringify(serializable_state));
    }
  }

  readStoredState(): IState | null {
    let stored_data = localStorage.getItem(local_storage_token_key);

    if (stored_data === null) {
      return null;
    } else {
      let serialized_state = JSON.parse(stored_data);
      serialized_state.token.expiry = new Date(serialized_state.token.expiry); // Seconds to date

      if (serialized_state.token.expiry > new Date()) {
        return serialized_state;
      } else {
        return null; // Don't return the token if it's expired
      }
    }
  }

  deleteStoredState(): void {
    localStorage.removeItem(local_storage_token_key);
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
