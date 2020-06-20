import React from 'react';
import PropTypes from 'prop-types';
import { IntlProvider } from 'react-intl';
import { BrowserRouter } from 'react-router-dom';

import { RoutesProvider } from '../contexts/RoutesContext';
// import * as AppPropTypes from '../lib/PropTypes';

import App from './App';

const propTypes = {
    locale: PropTypes.string,
    messages: PropTypes.oneOfType([
        PropTypes.objectOf(PropTypes.objectOf(PropTypes.string)),
        PropTypes.objectOf(PropTypes.string),
    ]),
    routes: PropTypes.objectOf(PropTypes.string),
};

const defaultProps = {
    locale: 'fr',
    messages: {},
    routes: {},
};

const Root = ({ locale, messages, routes }) => {
    return (
        <IntlProvider locale={locale} messages={messages[locale] || messages}>
            <BrowserRouter>
                <RoutesProvider routes={routes}>
                    <App />
                </RoutesProvider>
            </BrowserRouter>
        </IntlProvider>
    );
};

Root.propTypes = propTypes;
Root.defaultProps = defaultProps;

export default Root;
