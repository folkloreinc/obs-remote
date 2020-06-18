/* eslint-disable react/no-array-index-key */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link } from 'react-router-dom';

import * as AppPropTypes from '../../lib/PropTypes';
import Label from '../partials/Label';

import styles from '../../styles/menus/menu.scss';

const propTypes = {
    items: AppPropTypes.menuItems,
    className: PropTypes.string,
};

const defaultProps = {
    items: [],
    className: null,
};

const Menu = ({ items, className }) => (
    <nav
        className={classNames([
            styles.container,
            {
                [className]: className !== null,
            },
        ])}
    >
        <ul className={styles.items}>
            {items.map(({ label, url, active = false, external = false }, index) => (
                <li
                    className={classNames([
                        styles.item,
                        {
                            [styles.active]: active,
                        },
                    ])}
                    key={`item-${index}`}
                >
                    {external ? (
                        <a href={url} className={styles.link}>
                            <Label>{label}</Label>
                        </a>
                    ) : (
                        <Link to={url} className={styles.link}>
                            <Label>{label}</Label>
                        </Link>
                    )}
                </li>
            ))}
        </ul>
    </nav>
);

Menu.propTypes = propTypes;
Menu.defaultProps = defaultProps;

export default Menu;
