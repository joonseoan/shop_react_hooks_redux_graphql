import React from 'react';
import { connect } from 'react-redux';
import { Route } from 'react-router-dom';

import FeedPage from '../pages/Feed/Feed';
import SinglePostPage from '../pages/Feed/SinglePost/SinglePost';
import Login from './Login';
import Signup from './Signup';

const Tokens = props => {
    console.log(props)

    const { userId, token } = props.authData
    const expiry = new Date(
        // current time + 1 hour
        new Date().getTime() + (60 * 60 * 1000)
    );

    localStorage.setItem('userId', userId);
    localStorage.setItem('token', token);
    localStorage.setItem('expiry', expiry);

    // must CONSTORL IN LOGOUT
    // this.setAutoLogout(remainingMilliseconds);

    return (
         <React.Fragment>
         {!props.authData.isAuth ? (
                <React.Fragment>
                    <Route path="/"
                        exact
                        render={ props => (<Login 
                            { ...props }
                        />)} 
                    />
                    <Route path="/signup"
                        exact
                        render={ props => (<Signup 
                            { ...props }
                        />)} 
                    /> 
                </React.Fragment>
            ) : (
                <React.Fragment>
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
                            { ...props }
                            userId={ userId }
                            token={ token }
                            />
                        )}
                    />
                </React.Fragment>
            )}
        </React.Fragment>
    );
}

const maptStateToProps = ({ authData }) => {
    const { error, ...noA } = authData;
    return { authData : noA }
};

export default connect(maptStateToProps)(Tokens);

// export default withRouter(connect(maptStateToProps)(Tokens));
// export default connect(maptStateToProps)(withRouter(Tokens));

