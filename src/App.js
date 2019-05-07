import React, {useState, useEffect } from 'react';
import { BrowserRouter, Switch, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

import Backdrop from './components/Backdrop/Backdrop';
import ErrorHandler from './components/ErrorHandler/ErrorHandler';
import Tokens from './pages/Auth/authControl/Tokens'
import Logout from './pages/Auth/authControl/Logout';
import cleanLocalStorage from './util/cleanLocalStorage';
import { authManager } from './actions';

import './App.css';

const App = props => {

  // can controll this sone
  const [ showBackdrop, setshowBackdrop ] = useState(false);
  const [ showMobileNav, setShowMobileNav ] = useState(false);
  const [ error, setError ] = useState(null);

  useEffect(() => {    
    // token
    const token = localStorage.getItem('token');
    // expiry data defined in the server
    const expiryDate = localStorage.getItem('expiryDate');

    if (!token || !expiryDate) {
      return;
    }

    if (new Date(expiryDate) <= new Date()) {

      // automatically logout
      props.authManager({ isAuth: false, token: '' });
      cleanLocalStorage();
      return;
    }
    const userId = localStorage.getItem('userId');
    const remainingMilliseconds = new Date(expiryDate).getTime() - new Date().getTime();
    props.authManager({
      isAuth: true,
      token,
      userId
    });
    
    // set automatically logout with remaining time
    setAutoLogout(remainingMilliseconds);

  }, []);

  const setAutoLogout = milliseconds => {
    setTimeout(() => {
      props.authManager({ isAuth: false, token: '' });
      cleanLocalStorage();
    }, milliseconds);
  };

  // close backdrop for small screen
  const backdropClickHandler = () => {
    setshowBackdrop(false);
    setShowMobileNav(false);
    setError(null);
  };

  const errorHandler = () => {
    setError(null);
    // this.setState({ error: null });
  };

    return(
      <BrowserRouter>
        <div>
          {showBackdrop && (
            <Backdrop onClick={ backdropClickHandler } />
          )}
          <ErrorHandler error={ error } onHandle={ errorHandler } />
          <Logout />
          <Switch>
            <Tokens setAutoLogout={ (seconds) => { setAutoLogout(seconds) } } />
            <Redirect to="/" />
          </Switch>
        </div>
      </BrowserRouter>
    );
}

const mapStateToProps = ({ authData }) => {
  return { isAuth: authData.isAuth };
}

export default connect(mapStateToProps, { authManager })(App);
