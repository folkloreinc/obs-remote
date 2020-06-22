import React from 'react';
import ReactDOM from 'react-dom';
import domready from 'domready';
import defaultAppProps from './data/app.json';

import App from './components/App';

const getAppProps = () => defaultAppProps;

const renderApp = (props) => {
    const appEl = document.getElementById('app');
    const app = React.createElement(App, props);
    ReactDOM.render(app, appEl);
};

const boot = () => {
    const appProps = getAppProps();

    if (typeof window.Intl === 'undefined') {
        const { locale = 'fr' } = appProps;
        import(`./vendor/polyfills/intl-${locale}`).then(() => renderApp(appProps));
    } else {
        renderApp(appProps);
    }
};

const ready = (document.readyState || 'loading') !== 'loading';
if (ready) {
    boot();
} else {
    domready(boot);
}
