import React from 'react';
// import PropTypes from 'prop-types';
import { Route, Switch } from 'react-router';

// import * as AppPropTypes from '../lib/PropTypes';
import { useUrlGenerator } from '../contexts/RoutesContext';
import MainLayout from './layouts/Main';
import HomePage from './pages/Home';
import ErrorPage from './pages/Error';

import '../styles/vendor.scss';
import '../styles/main.scss';

const propTypes = {};

const defaultProps = {};

const App = () => {
    const generateUrl = useUrlGenerator();

    return (
        <MainLayout>
            <Switch>
                <Route exact path={generateUrl('home')} component={HomePage} />
                <Route path="*" component={ErrorPage} />
            </Switch>
        </MainLayout>
    );
};

App.propTypes = propTypes;
App.defaultProps = defaultProps;

export default App;
