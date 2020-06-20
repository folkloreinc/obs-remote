/* eslint-disable react/button-has-type */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link } from 'react-router-dom';

import * as AppPropTypes from '../../lib/PropTypes';

import styles from '../../styles/buttons/button.module.scss';

const propTypes = {
    type: PropTypes.string,
    href: PropTypes.string,
    external: PropTypes.bool,
    direct: PropTypes.bool,
    target: PropTypes.string,
    children: AppPropTypes.label,
    disabled: PropTypes.bool,
    loading: PropTypes.bool,
    theme: PropTypes.string,
    outline: PropTypes.bool,
    size: PropTypes.string,
    disableOnLoading: PropTypes.bool,
    className: PropTypes.string,
    onClick: PropTypes.func,
};

const defaultProps = {
    type: 'button',
    href: null,
    external: false,
    direct: false,
    target: '_blank',
    children: null,
    disabled: false,
    loading: false,
    theme: 'default',
    outline: false,
    size: null,
    disableOnLoading: true,
    className: null,
    onClick: null,
};

const Button = ({
    type,
    href,
    external,
    direct,
    target,
    children,
    disabled,
    theme,
    outline,
    size,
    loading,
    disableOnLoading,
    onClick,
    className,
}) => {
    const buttonClassNames = classNames([
        'btn',
        styles.container,
        {
            [`btn${outline ? '-outline' : ''}-${theme}`]: theme !== null,
            [`btn-${size}`]: size !== null,
            [className]: className !== null,
        },
    ]);
    if (href !== null) {
        return external || direct ? (
            <a
                href={href}
                className={buttonClassNames}
                onClick={onClick}
                target={external ? target : null}
            >
                {children}
            </a>
        ) : (
            <Link to={href} className={buttonClassNames} onClick={onClick}>
                {children}
            </Link>
        );
    }
    return (
        <button
            type={type}
            className={buttonClassNames}
            onClick={onClick}
            disabled={disabled || (disableOnLoading && loading)}
        >
            {children}
        </button>
    );
};

Button.propTypes = propTypes;
Button.defaultProps = defaultProps;

export default Button;
