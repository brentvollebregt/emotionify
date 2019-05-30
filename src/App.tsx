import React from 'react';
import Navigation from './Navigation';
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import SpotifyAuthorization from './pages/spotify-authorization/SpotifyAuthorization';
import Home from './pages/home/Home';
import About from './pages/about/About';
import Sort from './pages/sort/Sort';

interface IProps { }

interface IState {
  token: {
    value: string | null,
    expiry: Date
  },
  user: SpotifyApi.CurrentUsersProfileResponse | null
}

class App extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = {
      token: {
        value: null,
        expiry: new Date(0)
      },
      user: null
    }

    this.onUserChange = this.onUserChange.bind(this)
  }

  onUserChange(token: string, expiry: number, user: SpotifyApi.CurrentUsersProfileResponse) {
    let expiryDate = new Date();
    expiryDate.setSeconds(expiryDate.getSeconds() + expiry);

    this.setState({
      token: {
        value: token,
        expiry: expiryDate
      },
      user: user
    });
  }

  render() {
    const { token, user } = this.state;
    return (
      <BrowserRouter>
        <Navigation />
        <Switch>
          <Route exact path='/' render={() => <Home token={token} user={user} />} />
          <Route exact path='/sort' render={() => <Sort token={token} user={user} />} />
          <Route exact path='/about' component={About} />
          <Route exact path='/spotify-authorization' render={() => <SpotifyAuthorization token={token} onUserChange={this.onUserChange} redirectToOnCompletion={'/sort'} />} />
          <Route render={() => <Redirect to='/' />} />
        </Switch>
      </BrowserRouter>
    )
  }
}

export default App;
