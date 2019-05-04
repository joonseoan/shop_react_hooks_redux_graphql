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

          console.log('RRRRRRRRRRRRRRRRRRRRRRRRR')
          // have to get control the errors.
          // if(resData.errors[0] && !resData.errors[0].status == 422) {
          //   //errors
          //   console.log(resData.errors[0].data[0].message);
          //   // console.log('error graphql in Signup: ', resData)
          // }
          props.authManager({ isAuth: false, authLoading: false });

          props.history.push('/');
        })
        .catch(res => {
          
          console.log(res);
          props.authManager({
              isAuth: false,
              authLoading: false,
              error: ''
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