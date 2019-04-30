import React from 'react';

import Layout from '../components/Layout/Layout';
import Toolbar from '../components/Toolbar/Toolbar';
import MainNavigation from '../components/Navigation/MainNavigation/MainNavigation';

const Logout = () => {

    // just delivers the logout button
    //  logout event will happen in the NavigationItem component by using redux
    return(
        <React.Fragment>
            <Layout
                header={
                <Toolbar>
                    <MainNavigation
                    />
                </Toolbar>
                }
            />
        </React.Fragment>
    );
}

export default Logout;