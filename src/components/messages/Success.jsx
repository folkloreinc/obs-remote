/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import * as AppPropTypes from '../../lib/PropTypes';
import Label from '../partials/Label';

import styles from '../../styles/messages/success.scss';

const propTypes = {
    children: AppPropTypes.text.isRequired,
    className: PropTypes.string,
};

const defaultProps = {
    className: null,
};

const SuccessMessage = ({ children, className }) => (
    <div
        className={classNames([
            styles.container,
            {
                [className]: className !== null,
            },
        ])}
    >
        <Label>{children}</Label>
    </div>
);

SuccessMessage.propTypes = propTypes;
SuccessMessage.defaultProps = defaultProps;

export default SuccessMessage;
