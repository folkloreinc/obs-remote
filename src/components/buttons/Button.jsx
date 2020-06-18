/* eslint-disable react/button-has-type */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link } from 'react-router-dom';

import * as AppPropTypes from '../../lib/PropTypes';
import Label from '../partials/Label';

import styles from '../../styles/buttons/button.scss';

const propTypes = {
    type: PropTypes.string,
    href: PropTypes.string,
    external: PropTypes.bool,
    direct: PropTypes.bool,
    target: PropTypes.string,
    label: AppPropTypes.label,
    children: AppPropTypes.label,
    icon: PropTypes.node,
    iconPosition: PropTypes.oneOf(['left', 'right', 'inline']),
    disabled: PropTypes.bool,
    loading: PropTypes.bool,
    disableOnLoading: PropTypes.bool,
    small: PropTypes.bool,
    big: PropTypes.bool,
    withShadow: PropTypes.bool,
    className: PropTypes.string,
    iconClassName: PropTypes.string,
    labelClassName: PropTypes.string,
    onClick: PropTypes.func,
};

const defaultProps = {
    type: 'button',
    href: null,
    external: false,
    direct: false,
    target: '_blank',
    label: null,
    children: null,
    icon: null,
    iconPosition: 'inline',
    disabled: false,
    loading: false,
    disableOnLoading: true,
    small: false,
    big: false,
    withShadow: false,
    className: null,
    iconClassName: null,
    labelClassName: null,
    onClick: null,
};

const Button = ({
    type,
    href,
    external,
    direct,
    target,
    label,
    children,
    icon,
    iconPosition,
    disabled,
    loading,
    disableOnLoading,
    small,
    big,
    withShadow,
    onClick,
    className,
    iconClassName,
    labelClassName,
}) => {
    const finalLabel = label || children;
    const text = <Label>{finalLabel}</Label>;
    const hasChildren = label !== null && children !== null;
    const hasIcon = icon !== null;
    const hasInlineIcon = hasIcon && (iconPosition === 'inline' || text === null);
    const hasIconColumns = hasIcon && !hasInlineIcon;
    const content = (
        <>
            {hasInlineIcon ? (
                <>
                    <span
                        className={classNames([
                            styles.icon,
                            {
                                [iconClassName]: iconClassName !== null,
                            },
                        ])}
                    >
                        {icon}
                    </span>
                    {text !== null ? (
                        <span
                            className={classNames([
                                styles.label,
                                {
                                    [labelClassName]: labelClassName !== null,
                                },
                            ])}
                        >
                            {text}
                        </span>
                    ) : null}
                </>
            ) : null}
            {hasIconColumns ? (
                <>
                    <span className={classNames([styles.left])}>
                        {iconPosition === 'left' ? icon : null}
                    </span>
                    <span className={classNames([styles.center])}>{text}</span>
                    <span className={classNames([styles.right])}>
                        {iconPosition === 'right' ? icon : null}
                    </span>
                    {hasChildren ? children : null}
                </>
            ) : null}
            {!hasIcon ? text : null}
            {hasChildren ? children : null}
        </>
    );

    const buttonClassNames = classNames([
        styles.container,
        {
            [styles.withIcon]: hasIcon,
            [styles.withIconColumns]: hasIconColumns,
            [styles.withText]: text !== null,
            [styles.withShadow]: withShadow,
            [styles.isSmall]: small,
            [styles.isBig]: big,
            [styles.isLink]: href !== null,
            [styles.isDisabled]: disabled,
            [styles.isLoading]: loading,
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
                {content}
            </a>
        ) : (
            <Link to={href} className={buttonClassNames} onClick={onClick}>
                {content}
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
            {content}
        </button>
    );
};

Button.propTypes = propTypes;
Button.defaultProps = defaultProps;

export default Button;
