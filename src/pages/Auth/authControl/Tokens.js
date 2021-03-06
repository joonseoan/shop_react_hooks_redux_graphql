import React from 'react';
import { connect } from 'react-redux';
import { Route } from 'react-router-dom';

import FeedPage from '../../Feed/Feed';
import SinglePostPage from '../../Feed/SinglePost/SinglePost';
import Login from './Login';
import Signup from './Signup';

const Tokens = props => {
    
    const { authData: { userId, token}, setAutoLogout } = props;

    return (
         <React.Fragment>
            {!props.authData.isAuth ? (
                <React.Fragment>
                    <Route path="/"
                        exact
                        render={ props => (<Login 
                            { ...props }
                            setAutoLogout={ setAutoLogout }
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

