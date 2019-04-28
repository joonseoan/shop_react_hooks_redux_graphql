import React from 'react';
import { graphql, compose } from 'react-apollo';
import { connect } from 'react-redux';

import LoginPage from '../pages/Auth/Login';
import UserLogin from '../mutations/UserLogin';
import { authManager } from '../actions'

const Login = props => {

    const loginHandler = (event, authData) => {
        event.preventDefault();

        props.authManager({ authLoading: true})
        // props.setAuthLoading(true);

        const { email, password } = authData;
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

    return (
        <React.Fragment>
            <LoginPage
                onLogin={ loginHandler }
                loading={ props.authData.authLoading }
            />
        </React.Fragment>    
    ); 

}

const mapStateToProps = ({ authData }) => {
    console.log('authData: ', authData)
    return { authData };
}

export default compose(
    graphql(UserLogin),
    connect(mapStateToProps, { authManager }),
)(Login);
