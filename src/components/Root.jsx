import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { UrlGeneratorProvider, createStore } from '@folklore/react-container';
import { TrackingContainer } from '@folklore/tracking';
import { IntlProvider } from 'react-intl';
import { BrowserRouter } from 'react-router-dom';
import { Provider as ReduxProvider } from 'react-redux';

import reducers from '../reducers/index';
import * as AppPropTypes from '../lib/PropTypes';
import { KeysProvider } from '../contexts/KeysContext';

import App from './App';

const propTypes = {
    locale: PropTypes.string,
    messages: PropTypes.oneOfType([
        PropTypes.objectOf(PropTypes.objectOf(PropTypes.string)),
        PropTypes.objectOf(PropTypes.string),
    ]),
    routes: PropTypes.objectOf(PropTypes.string),
    statusCode: AppPropTypes.statusCode,
    googleApiKey: PropTypes.string,
};

const defaultProps = {
    locale: 'fr',
    messages: {},
    routes: {},
    statusCode: null,
    googleApiKey: null,
};

const Root = ({ locale, messages, routes, statusCode, googleApiKey }) => {
    const store = useMemo(
        () =>
            createStore(reducers, {
                site: {
                    statusCode,
                },
            }),
        [statusCode],
    );
    const keys = useMemo(
        () => ({
            googleApiKey,
        }),
        [googleApiKey],
    );
    return (
        <ReduxProvider store={store}>
            <IntlProvider locale={locale} messages={messages[locale] || messages}>
                <BrowserRouter>
                    <UrlGeneratorProvider routes={routes}>
                        <KeysProvider keys={keys}>
                            <TrackingContainer>
                                <App />
                            </TrackingContainer>
                        </KeysProvider>
                    </UrlGeneratorProvider>
                </BrowserRouter>
            </IntlProvider>
        </ReduxProvider>
    );
};

Root.propTypes = propTypes;
Root.defaultProps = defaultProps;

export default Root;
