/* eslint-disable react/button-has-type */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import * as AppPropTypes from '../../lib/PropTypes';

const propTypes = {
    type: PropTypes.string,
    href: PropTypes.string,
    external: PropTypes.bool,
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
        {
            [`btn${outline ? '-outline' : ''}-${theme}`]: theme !== null,
            [`btn-${size}`]: size !== null,
            [className]: className !== null,
        },
    ]);
    if (href !== null) {
        return (
            <a
                href={href}
                className={buttonClassNames}
                onClick={onClick}
                target={external ? target : null}
            >
                {children}
            </a>
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
