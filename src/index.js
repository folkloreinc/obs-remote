import React from 'react';
import ReactDOM from 'react-dom';
import domready from 'domready';
import defaultRootProps from './data/root';

import Root from './components/Root';

const getRootProps = () => defaultRootProps;

const renderRoot = (props) => {
    const rootEl = document.getElementById('root');
    const root = React.createElement(Root, props);
    ReactDOM.render(root, rootEl);
};

const boot = () => {
    const rootProps = getRootProps();

    if (typeof window.Intl === 'undefined') {
        const { locale = 'fr' } = rootProps;
        import(`./vendor/polyfills/intl-${locale}`).then(() => renderRoot(rootProps));
    } else {
        renderRoot(rootProps);
    }
};

const ready = (document.readyState || 'loading') !== 'loading';
if (ready) {
    boot();
} else {
    domready(boot);
}
