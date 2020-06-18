import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Route, Switch, useHistory } from 'react-router';
import { useUrlGenerator } from '@folklore/react-container';

// import * as AppPropTypes from '../lib/PropTypes';
import { resetRequest as resetRequestAction } from '../actions/SiteActions';
import MainLayout from './layouts/Main';
import HomePage from './pages/Home';
import ErrorPage from './pages/Error';

import '../styles/main.global.scss';

const propTypes = {
    resetRequest: PropTypes.func.isRequired,
};

const defaultProps = {};

const App = ({ resetRequest }) => {
    const history = useHistory();
    const urlGenerator = useUrlGenerator();

    // Reset request on history change
    useEffect(() => {
        const unlisten = history.listen(() => resetRequest());
        return () => {
            unlisten();
        };
    }, [history]);

    return (
        <MainLayout>
            <Switch>
                <Route exact path={urlGenerator.route('home')} component={HomePage} />
                <Route path="*" component={ErrorPage} />
            </Switch>
        </MainLayout>
    );
};

App.propTypes = propTypes;
App.defaultProps = defaultProps;

const WithStateContainer = connect(
    null,
    dispatch => ({
        resetRequest: () => dispatch(resetRequestAction()),
    }),
)(App);
export default WithStateContainer;
