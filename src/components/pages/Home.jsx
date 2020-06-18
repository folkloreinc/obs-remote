import React from 'react';
// import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';

// import * as AppPropTypes from '../../lib/PropTypes';
import PageMeta from '../partials/PageMeta';

import styles from '../../styles/pages/home.scss';

const messages = defineMessages({
    metaTitle: {
        id: 'meta.title',
        defaultMessage: 'Title',
    },
});

const propTypes = {
    // intl: AppPropTypes.intl.isRequired,
};

const HomePage = () => (
    <div className={styles.container}>
        <PageMeta title={messages.metaTitle} />
        <div className={styles.logo} />
    </div>
);

HomePage.propTypes = propTypes;

const WithIntlContainer = injectIntl(HomePage);

export default WithIntlContainer;
