import React from 'react';
import Navigation from './Navigation';
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import SpotifyAuthorization from './spotify-authorization/SpotifyAuthorization';

interface IProps { }

interface IState {
  token: {
    value: string | null,
    expiry: number
  }
}

class App extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = {
      token: {
        value: null,
        expiry: 0
      }
    }

    this.onTokenChaged = this.onTokenChaged.bind(this)
  }

  onTokenChaged(token: string, expiry: number) {
    console.log(token);
  }

  render() {
    return (
      <BrowserRouter>
        <Navigation />
        <Switch>
            <Route exact path='/' render={() => {return 'Home'}}/>
            <Route exact path='/sort' render={() => {return 'Sort'}}/>
            <Route exact path='/about' render={() => {return 'About'}}/>
            <Route exact path='/spotify-authorization' render={() => <SpotifyAuthorization currentToken={this.state.token.value} onTokenChanged={this.onTokenChaged}/>}/>
            <Route render={() => <Redirect to='/' />}/>
        </Switch>
      </BrowserRouter>
    )
  }
}

export default App;
