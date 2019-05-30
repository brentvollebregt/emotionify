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
  }
}

class App extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = {
      token: {
        value: null,
        expiry: new Date(0)
      }
    }

    this.onTokenChaged = this.onTokenChaged.bind(this)
  }

  onTokenChaged(token: string, expiry: number) {
    let expiryDate = new Date();
    expiryDate.setSeconds(expiryDate.getSeconds() + expiry);

    this.setState({
      token: {
        value: token,
        expiry: expiryDate
      }
    });
  }

  render() {
    return (
      <BrowserRouter>
        <Navigation />
        <Switch>
          <Route exact path='/' render={() => <Home token={this.state.token} />} />
          <Route exact path='/sort' render={() => <Sort token={this.state.token} />} />
          <Route exact path='/about' component={About} />
          <Route exact path='/spotify-authorization' render={() => <SpotifyAuthorization currentToken={this.state.token.value} onTokenChanged={this.onTokenChaged} />} />
          <Route render={() => <Redirect to='/' />} />
        </Switch>
      </BrowserRouter>
    )
  }
}

export default App;
