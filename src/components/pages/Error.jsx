/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { defineMessages } from 'react-intl';
import { useUrlGenerator } from '@folklore/react-container';

// import * as AppPropTypes from '../../lib/PropTypes';
import PageMeta from '../partials/PageMeta';
import Label from '../partials/Label';

import styles from '../../styles/pages/error.scss';

export const messages = defineMessages({
    metaTitle401: {
        id: 'meta.title_401',
        defaultMessage: 'Error 401',
    },
    title401: {
        id: 'errors.title_401',
        defaultMessage: 'Error 401',
    },
    description401: {
        id: 'errors.description_401',
        defaultMessage: 'You are not authorized to access this page.',
    },

    metaTitle403: {
        id: 'meta.title_403',
        defaultMessage: 'Error 403',
    },
    title403: {
        id: 'errors.title_403',
        defaultMessage: 'Error 403',
    },
    description403: {
        id: 'errors.description_403',
        defaultMessage: 'Access to this page is forbidden',
    },

    metaTitle404: {
        id: 'meta.title_404',
        defaultMessage: 'Error 404',
    },
    title404: {
        id: 'errors.title_404',
        defaultMessage: 'Error 404',
    },
    description404: {
        id: 'errors.description_404',
        defaultMessage: 'This page doesn’t exists',
    },

    metaTitle500: {
        id: 'meta.title_500',
        defaultMessage: 'Error 500',
    },
    title500: {
        id: 'errors.title_500',
        defaultMessage: 'Error 500',
    },
    description500: {
        id: 'errors.description_500',
        defaultMessage: 'There was an error',
    },

    gotoHome: {
        id: 'errors.goto_home',
        defaultMessage: 'Go to home',
    },
});

const propTypes = {
    statusCode: PropTypes.number,
};

const defaultProps = {
    statusCode: 404,
};

const ErrorPage = ({ statusCode }) => {
    const urlGenerator = useUrlGenerator();
    return (
        <div className={styles.container}>
            <PageMeta title={messages[`metaTitle${statusCode || 404}`]} />
            <div className={styles.inner}>
                <h1 className={styles.title}>
                    <Label>{messages[`title${statusCode || 404}`]}</Label>
                </h1>
                <p className={styles.description}>
                    <Label>{messages[`description${statusCode || 404}`]}</Label>
                </p>
                <div className={styles.actions}>
                    <Link to={urlGenerator.route('home')}>
                        <Label>{messages.gotoHome}</Label>
                    </Link>
                </div>
            </div>
        </div>
    );
};

ErrorPage.propTypes = propTypes;
ErrorPage.defaultProps = defaultProps;

export default connect(({ site: { statusCode } }) => ({
    statusCode,
}))(ErrorPage);
