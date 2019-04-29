import React from 'react';
import { graphql, compose } from 'react-apollo';
import { connect } from 'react-redux';

import { authManager } from '../actions';
import SignupPage from '../pages/Auth/Signup';
import UserSignup from '../mutations/UserSignup';

const Signup = props => {
    console.log('props in Signup: ', props);

    const signupHandler = (event, authData) => {
        event.preventDefault();
        const { email, password, name } = authData.signupForm;
        props.authManager({ authLoading: true });
        props.mutate({
            variables: { 
                email: email.value,
                password: password.value,
                name: name.value
            }
        })
        .then(resData => {

          if(resData.error || resData.data.error) {
            console.log('error graphql in Signup: ', resData)
          }
          props.authManager({ isAuth: false, authLoading: false });
        })
        .catch(error => {
          console.log(error);
          props.authManager({
              isAuth: false,
              authLoading: false,
              error: error
          });
        });
    }

    const loading = props.authLoading;
    const { authLoading, authManager, mutate, ...noA } = props;

    return (
      <div>
        <SignupPage
          { ...noA }
          onSignup={ signupHandler }
          loading={ loading }
        />
      </div>
    );
}

const mapStateToProps = ({ authData }) => {
  return { authLoading: authData.authLoading };
}

export default compose(
  graphql(UserSignup),
  connect(mapStateToProps, { authManager })
)(Signup);