import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Switch, Route, Redirect } from 'react-router-dom';

import FeedPage from '../pages/Feed/Feed';
import SinglePostPage from '../pages/Feed/SinglePost/SinglePost';
import Login from './Login';
import Signup from './Signup';

const Tokens = props => {
    console.log('props in Token', props)

    const [ userId, storeUserId ] = useState('');
    const [ token, storeToken ] = useState('');
    const [ expiry, storeExpiry ] = useState('');
    
    useEffect(() => {
        const { userId, token } = props.authData;
        const expiryTime = new Date(
            // current time + 1 hour
            new Date().getTime() + (60 * 60 * 1000)
        );
        storeUserId(userId);
        storeToken(token);
        storeExpiry(expiryTime);
    }, [ userId, token ]);

    localStorage.setItem('userId',  userId);
    localStorage.setItem('token', token);
    localStorage.setItem('expiry', expiry);

    // must CONSTORL IN LOGOUT
    // this.setAutoLogout(remainingMilliseconds);

    return (
         <React.Fragment>
         {!props.authData.isAuth ? (
             <Switch>
                <Route path="/"
                    exact
                    render={ props => (<Login { ...props } />)}
                />
                <Route path="/signup"
                    exact
                    render={ props => (<Signup { ...props } />)}
                />            
             </Switch>) : (<Switch>
                <Route
                    path="/"
                    exact
                    render={props => (
                        <FeedPage userId={ userId } token={ token } />
                    )}
                />
                <Route
                    path="/:postId"
                    render={props => (
                        <SinglePostPage
                        {...props}
                        userId={ userId }
                        token={ token }
                        />
                    )}
                />
                <Redirect to="/" />
            </Switch>) }
        </React.Fragment>
    );
}

const maptStateToProps = ({ authData }) => {
    const { authLoading, error, ...noA } = authData;
    return { authData : noA }
};

export default connect(maptStateToProps)(Tokens);


