import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useFonts } from '@folklore/fonts';

import styles from '../../styles/layouts/main.scss';

const propTypes = {
    children: PropTypes.node.isRequired,
    isPrerender: PropTypes.bool,
    fonts: PropTypes.shape({
        google: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)),
        custom: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)),
    }),
};

const defaultProps = {
    isPrerender: false,
    fonts: {
        google: {
            families: ['Open Sans:400,600,700'],
        },
        custom: {
            families: ['Garage Gothic', 'Brandon Grotesque', 'Sina Nova:400,700,400i,700i'],
        },
    },
};

const MainLayout = ({ fonts, children, isPrerender }) => {
    const { loaded: fontsLoaded } = useFonts(fonts);

    const innerStyle = {
        opacity: fontsLoaded || isPrerender ? 1 : 0,
    };

    return (
        <div className={styles.container}>
            <div className={styles.inner} style={innerStyle}>
                <div className={styles.content}>{children}</div>
            </div>
        </div>
    );
};

MainLayout.propTypes = propTypes;
MainLayout.defaultProps = defaultProps;

const WithStateContainer = connect(({ site }) => ({
    isPrerender: site.isPrerender || false,
}))(MainLayout);

export default WithStateContainer;
