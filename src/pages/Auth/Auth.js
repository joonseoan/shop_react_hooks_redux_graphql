import React from 'react';

import './Auth.css';

const auth = props => { 
    return <section className="auth-form">{props.children}</section> ;
};

export default auth;
