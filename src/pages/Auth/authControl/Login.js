import React from 'react';
import { graphql, compose } from 'react-apollo';
import { connect } from 'react-redux';

import UserLogin from '../../../mutations/UserLogin';
import LoginPage from '../Login';
import { authManager } from '../../../actions'

const Login = props => {
    
    const loginHandler = (event, inputData) => {
        event.preventDefault();

        props.authManager({ authLoading: true})

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

            // should be set at the event component
            //  otherwise it will reset again when the browser refreshes.
            localStorage.setItem('userId', resData.data.login.userId);
            localStorage.setItem('token', resData.data.login.token);
            const remainingMilliseconds = 60 * 60 * 1000;
            const expiryDate = new Date(
                new Date().getTime() + remainingMilliseconds
            );

            localStorage.setItem('expiryDate', expiryDate.toISOString());
            props.setAutoLogout(remainingMilliseconds);
                    
        })
        .catch(error => {
    
            // Gotta control errorHandler component
            props.authManager({
                isAuth: false,
                authLoading: false,
                error: error
            });
            
        }); 
    };
    
    // const loading = props.authLoading;
    const { authLoading, authManager, mutate, ...noA } = props;

    return (
        <div>
            <LoginPage
                { ...noA }
                loading={ props.authLoading }
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
