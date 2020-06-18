import PropTypes from 'prop-types';

/**
 * Core
 */
export const urlGenerator = PropTypes.shape({
    route: PropTypes.func.isRequired,
});

export const history = PropTypes.shape({
    listen: PropTypes.func.isRequired,
});

export const intl = PropTypes.shape({
    locale: PropTypes.string.isRequired,
    formatMessage: PropTypes.func.isRequired,
});

export const message = PropTypes.shape({
    id: PropTypes.string.isRequired,
    defaultMessage: PropTypes.string,
});

export const text = PropTypes.oneOfType([message, PropTypes.string]);

export const label = PropTypes.oneOfType([message, PropTypes.node]);

export const statusCode = PropTypes.oneOf([401, 403, 404, 500]);

/**
 * Site
 */
export const user = PropTypes.shape({
    id: PropTypes.number,
    firstname: PropTypes.string,
    lastname: PropTypes.string,
    email: PropTypes.string,
    gender: PropTypes.string,
    birthdate: PropTypes.string,
});

export const menuItem = PropTypes.shape({
    label,
    url: PropTypes.string,
    external: PropTypes.bool,
    active: PropTypes.bool,
});
export const menuItems = PropTypes.arrayOf(menuItem);

/**
 * Forms
 */
export const errors = PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]);
export const formErrors = PropTypes.objectOf(errors);

export const selectOption = PropTypes.shape({
    value: PropTypes.string,
    label: PropTypes.string,
});
export const selectOptions = PropTypes.arrayOf(selectOption);

export const formField = PropTypes.shape({
    value: PropTypes.any,
    name: PropTypes.string,
});
export const formFields = PropTypes.objectOf(formField);
