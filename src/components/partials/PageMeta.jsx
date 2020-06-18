/* eslint-disable react/no-array-index-key */
import React from 'react';
import { Helmet } from 'react-helmet';
import { defineMessages, injectIntl } from 'react-intl';

import * as AppPropTypes from '../../lib/PropTypes';
import { isMessage } from '../../lib/utils';

const messages = defineMessages({
    title: {
        id: 'meta.title',
        defaultMessage: 'Title',
    },
});

const propTypes = {
    intl: AppPropTypes.intl.isRequired,
    title: AppPropTypes.message,
};

const defaultProps = {
    title: messages.title,
};

const PageMeta = ({
    intl, title,
}) => (
    <Helmet>
        <title>{isMessage(title) ? intl.formatMessage(title) : title}</title>
    </Helmet>
);

PageMeta.propTypes = propTypes;
PageMeta.defaultProps = defaultProps;

export default React.memo(injectIntl(PageMeta));
