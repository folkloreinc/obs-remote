import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Button from '../buttons/Button';

const propTypes = {
    host: PropTypes.string.isRequired,
    port: PropTypes.string.isRequired,
    connecting: PropTypes.bool,
    connected: PropTypes.bool,
    className: PropTypes.string,
    onHostChange: PropTypes.func,
    onPortChange: PropTypes.func,
    onClickConnect: PropTypes.func,
};

const defaultProps = {
    connecting: false,
    connected: false,
    className: null,
    onHostChange: null,
    onPortChange: null,
    onClickConnect: null,
};

const ConnectBar = ({
    host,
    port,
    connecting,
    connected,
    className,
    onHostChange,
    onPortChange,
    onClickConnect,
}) => {
    const onHostInputChange = useCallback(
        (e) => {
            onHostChange(e.target.value);
        },
        [onHostChange],
    );
    const onPortInputChange = useCallback(
        (e) => {
            onPortChange(e.target.value);
        },
        [onPortChange],
    );
    return (
        <nav
            className={classNames([
                'navbar',
                'navbar-light',
                'bg-light',
                {
                    [className]: className !== null,
                },
            ])}
        >
            <form className="form-inline flex-nowrap">
                <div className="input-group mr-2">
                    <input
                        className="form-control"
                        type="text"
                        placeholder="Host"
                        value={host}
                        onChange={onHostInputChange}
                        disabled={connecting || connected}
                    />
                    <input
                        className="form-control flex-grow-0 w-25"
                        type="number"
                        placeholder="Port"
                        style={{
                            minWidth: '5.5em',
                        }}
                        value={port}
                        onChange={onPortInputChange}
                        disabled={connecting || connected}
                    />
                </div>
                <Button theme="primary" outline onClick={onClickConnect}>
                    {connecting ? 'Connecting...' : null}
                    {connected ? 'Disconnect' : null}
                    {!connected && !connecting ? 'Connect' : null}
                </Button>
            </form>
        </nav>
    );
};

ConnectBar.propTypes = propTypes;
ConnectBar.defaultProps = defaultProps;

export default ConnectBar;
