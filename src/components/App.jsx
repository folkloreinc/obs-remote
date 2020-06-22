import React from 'react';
import PropTypes from 'prop-types';
import { IntlProvider } from 'react-intl';
import Cookies from 'js-cookie';

import Remote from './Remote';

import '../styles/vendor.scss';
import '../styles/main.scss';

const propTypes = {
    locale: PropTypes.string,
    messages: PropTypes.oneOfType([
        PropTypes.objectOf(PropTypes.objectOf(PropTypes.string)),
        PropTypes.objectOf(PropTypes.string),
    ]),
};

const defaultProps = {
    locale: 'fr',
    messages: {},
};

const App = ({ locale, messages }) => (
    <IntlProvider locale={locale} messages={messages[locale] || messages}>
        <Remote
            host={Cookies.get('obs_host')}
            port={Cookies.get('obs_port')}
            onConnect={({ host, port }) => {
                Cookies.set('obs_host', host);
                Cookies.set('obs_port', port);
            }}
        />
    </IntlProvider>
);

App.propTypes = propTypes;
App.defaultProps = defaultProps;

export default App;
