/* @flow */
const API_URL = (process.env.REACT_APP_API_URL !== undefined) ? process.env.REACT_APP_API_URL : '';
export const API_ENDPOINT: string = API_URL + '/api';
export const VIEWS_ENDPOINT: string = API_ENDPOINT + '/views/';
export const FILE_ENDPOINT: string = API_ENDPOINT + '/file/';
export const USERS_ENDPOINT: string = API_ENDPOINT + '/users/';
export const LOGIN_ENDPOINT: string = USERS_ENDPOINT + 'login';
export const LOGOUT_ENDPOINT: string = USERS_ENDPOINT + 'logout';
export const AUTHENTICATE_ENDPOINT: string = USERS_ENDPOINT + 'authenticate';
export const VERIFY_ENDPOINT: string = USERS_ENDPOINT + 'verify/';
