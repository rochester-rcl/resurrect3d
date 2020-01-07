/* @flow */
import { BUILD_ENV, BUILD_ENV_OMEKA } from './application';
export const BASENAME = (BUILD_ENV === BUILD_ENV_OMEKA) ? window.publicUrl : process.env.PUBLIC_URL;
const API_URL = (process.env.REACT_APP_API_URL !== undefined) ? process.env.REACT_APP_API_URL : '';
export const OMEKA_API_ENDPOINT = window.rootUrl + 'api/threejs_viewers/';
export const API_ENDPOINT = API_URL + '/api';
export const VIEWS_ENDPOINT = API_ENDPOINT + '/views/';
export const ADMIN_CONTAINER_ENDPOINT = API_ENDPOINT + '/container/';
export const FILE_ENDPOINT = API_ENDPOINT + '/file/';
export const USERS_ENDPOINT = API_ENDPOINT + '/users/';
export const LOGIN_ENDPOINT = USERS_ENDPOINT + 'login';
export const LOGOUT_ENDPOINT = USERS_ENDPOINT + 'logout';
export const AUTHENTICATE_ENDPOINT = USERS_ENDPOINT + 'authenticate';
export const VERIFY_ENDPOINT = USERS_ENDPOINT + 'verify/';
export const ANNOTATIONS_ENDPOINT = API_ENDPOINT + "/annotations/";