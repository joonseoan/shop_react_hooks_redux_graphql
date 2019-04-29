import React, { useState } from 'react';
import { graphql, compose } from 'react-apollo';
import { connect } from 'react-redux';
import { Route } from 'react-router-dom';

import UserLogin from '../mutations/UserLogin';
import LoginPage from '../pages/Auth/Login';
import { authManager } from '../actions'

const Login = props => {

    console.log('props in ====-> login: ', props)
    
    const loginHandler = (event, inputData) => {
        event.preventDefault();

        props.authManager({ authLoading: true})
        // props.setAuthLoading(true);

        const { email, password } = inputData;
        props.mutate({ 
            variables: { email, password }
        })
        .then(resData => {

            // graphql error control
            if(resData.error || resData.data.error){
                console.log('error graphql in Login: ', resData)
            }

            const { token, userId } = resData.data.login;
            props.authManager({
                isAuth: true,
                authLoading: false,
                token,
                userId
            });
            
            // props.setIsAuth(true);
            // props.setAuthLoading(false);
            // props.setAuthData(token, userId);
        })
        .catch(error => {
    
            // Gotta control errorHandler component
            props.authManager({
                isAuth: false,
                authLoading: false,
                error: error
            });
            
            // props.setIsAuth(false);
            // props.setAuthLoading(false);
            // props.setError(error);
        }); 
    };
    
    const loading = props.authLoading;
    const { authLoading, authManager, mutate, ...noA } = props;
    // const { location, history, match } = props;

    return (
        <div>
            <LoginPage
                { ...noA }
                loading={ loading }
                onLogin={ loginHandler }
            />
        </div>
    );
    
};

const mapStateToProps = ({ authData }) => {
    return { authLoading: authData.authLoading };
}

export default compose(
    graphql(UserLogin),
    connect(mapStateToProps, { authManager }),
)(Login);
