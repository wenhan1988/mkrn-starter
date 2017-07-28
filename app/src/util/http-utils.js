import axios from 'axios';
import { getApiUrl, getEnvironment } from './environment-utils';
import { getCookie } from './cookie-utils';
import { PENDING, SUCCESS, ERROR, POST, PUT, GET, DELETE } from './redux-constants';

const API_URL = getApiUrl();

/**
 * handleError  - Error handler intended to be used in a catch block
 * @param {Function} dispatch React-redux's dispatch function
 * @param {Object} error      Error object caught in catch block
 * @param {String} type       Action type that caused error
 *
 * @returns {Promise}
 */
export const handleError = (dispatch, error, type) => {
  // Console.error the error if in a development environment
  if (getEnvironment() === 'development') {
    console.error(`Error type: ${type}.`);
    console.error(error);
  }

  const errorMessage = error && error.response
    ? error.response.data
    : error;

  dispatch({
    type,
    payload: errorMessage,
    status: ERROR,
  });

  return Promise.reject(errorMessage);
};

/**
 * httpRequest - Generic action to make an http request with axios
 * @param {Function} dispatch     React-redux's dispatch function
 * @param {String} requestType    Type of http request to make
 * @param {String} actionType     Action type to be dispatched
 * @param {Object} opts           Object of options
 *                  endpoint        Api endpoint to hit (e.g., '/auth/login')
 *                  data            Data to be posted to the api
 *                  requiresAuth    Whether or not request needs to be authenticated
 *
 * @returns {Promise}
 */
const httpRequest = async (dispatch, requestType = GET, actionType = '', opts = {}) => {
  try {
    dispatch({
      type: actionType,
      meta: { status: PENDING },
    });

    const reqArgs = [`${API_URL}/${opts.endpoint || ''}`];

    // Add a data payload to the request if it's a POST or PUT
    if (requestType === POST || requestType === PUT) {
      reqArgs.push(opts.data || {});
    }

    // Add Authorization header if the request needs to be authenticated with
    // a JSON Web Token, else add an empty object
    reqArgs.push(
      opts.requiresAuth
        ? { headers: { Authorization: getCookie('token') } }
        : {},
    );

    const response = await axios[requestType](...reqArgs);

    dispatch({
      type: actionType,
      meta: { status: SUCCESS },
      payload: response.data,
    });

    return Promise.resolve(response.data);
  } catch (err) {
    return Promise.reject(err);
  }
};

/**
 * post - Generic action to make a POST request with axios
 * @param {Function} dispatch     React-redux's dispatch function
 * @param {String} type           Action type to be dispatched
 * @param {String} endpoint       Api endpoint to hit (e.g., '/auth/login')
 * @param {Object} data           Data to be posted to the api
 * @param {Boolean} requiresAuth  Whether or not request needs to be authenticated
 *
 * @returns {Promise}
 */
export const post = async (dispatch, type, endpoint, data, requiresAuth) => {
  try {
    const results = await httpRequest(dispatch, POST, type, { endpoint, data, requiresAuth });
    return Promise.resolve(results);
  } catch (err) {
    return handleError(dispatch, err, type);
  }
};

/**
 * put - Generic action to make a PUT request with axios
 * @param {Function} dispatch     React-redux's dispatch function
 * @param {String} type           Action type to be dispatched
 * @param {String} endpoint       Api endpoint to hit (e.g., '/user/:id')
 * @param {Object} data           Data to be posted to the api
 * @param {Boolean} requiresAuth  Whether or not request needs to be authenticated
 *
 * @returns {Promise}
 */
export const put = async (dispatch, type, endpoint, data, requiresAuth) => {
  try {
    await httpRequest(dispatch, PUT, type, { endpoint, data, requiresAuth });
  } catch (err) {
    return handleError(dispatch, err, type);
  }
};

/**
 * get - Generic action to make a GET request with axios
 * @param {Function} dispatch     React-redux's dispatch function
 * @param {String} type           Action type to be dispatched
 * @param {String} endpoint       Api endpoint to hit (e.g., '/user')
 * @param {Boolean} requiresAuth  Whether or not request needs to be authenticated
 *
 * @returns {Promise}
 */
export const get = async (dispatch, type, endpoint, requiresAuth) => {
  try {
    await httpRequest(dispatch, GET, type, { endpoint, requiresAuth });
  } catch (err) {
    return handleError(dispatch, err, type);
  }
};

/**
 * del - Generic action to make a DELETE request with axios
 * @param {Function} dispatch     React-redux's dispatch function
 * @param {String} type           Action type to be dispatched
 * @param {String} endpoint       Api endpoint to hit (e.g., '/user/:id')
 * @param {Boolean} requiresAuth  Whether or not request needs to be authenticated
 *
 * @returns {Promise}
 */
export const del = async (dispatch, type, endpoint, requiresAuth) => {
  try {
    await httpRequest(dispatch, DELETE, type, { endpoint, requiresAuth });
  } catch (err) {
    return handleError(dispatch, err, type);
  }
};
