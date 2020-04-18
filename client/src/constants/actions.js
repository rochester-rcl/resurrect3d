/* @flow */

// REST
export const GET_THREE_ASSET: string = 'GET_THREE_ASSET';
export const THREE_ASSET_LOADED: string = 'THREE_ASSET_LOADED';
export const THREE_METADATA_LOADED: string = 'THREE_METADATA_LOADED';

// Meshes
export const LOAD_MESH: string = 'LOAD_MESH';
export const UPDATE_MESH_LOAD_PROGRESS: string = 'UPDATE_MESH_LOAD_PROGRESS';
export const MESH_LOAD_ERROR: string = 'MESH_LOAD_ERROR';
export const MESH_LOADED: string = 'MESH_LOADED';
export const LOAD_LOCAL_TEXTURE_ASSET = "LOAD_LOCAL_TEXTURE_ASSET";
export const LOCAL_TEXTURE_ASSET_LOADED = "LOCAL_TEXTURE_ASSET_LOADED";

// Textures
export const UPDATE_TEXTURE_LOAD_PROGRESS: string = 'UPDATE_TEXTURE_LOAD_PROGRESS';
export const TEXTURE_LOAD_ERROR: string = 'TEXTURE_LOAD_ERROR';
export const TEXTURE_LOADED: string = 'TEXTURE_LOADED';
export const LOAD_TEXTURE: string = 'LOAD_TEXTURE';

// Admin
export const AUTHENTICATE: string = 'AUTHENTICATE';
export const AUTHENTICATE_ATTEMPTED: string = 'AUTHENTICATE_ATTEMPTED';
export const LOGIN_USER: string = 'LOGIN_USER';
export const LOGOUT_USER: string = 'LOGOUT_USER';
export const USER_LOGGED_IN: string = 'USER_LOGGED_IN';
export const USER_LOGGED_OUT: string = 'USER_LOGGED_OUT';

export const ADD_USER: string = 'ADD_USER';
export const USER_ADDED: string = 'USER_ADDED';
export const VERIFY_USER: string = 'VERIFY_USER';
export const USER_VERIFIED: string = 'USER_VERIFIED';
export const DELETE_USER: string = 'DELETE_USER';
export const USER_DELETED: string = 'USER_DELETED';
export const UPDATE_USER: string = 'UPDATE_USER';
export const USER_UPDATED: string = 'USER_UPDATED';

export const LOGIN_ERROR: string = 'LOGIN_ERROR';
export const REMOVE_LOGIN_ERROR: string = 'REMOVE_LOGIN_ERROR';
export const USER_AUTHENTICATED: string = 'USER_AUTHENTICATED';

export const GET_VIEWS: string = 'GET_VIEWS';
export const GET_VIEW: string = 'GET_VIEW';
export const GET_THREEFILE: string = 'GET_THREEFILE';
export const ADD_VIEW: string = 'ADD_VIEW';
export const DELETE_VIEW: string = 'DELETE_VIEW';
export const UPDATE_VIEW: string  = 'UPDATE_VIEW';

export const VIEW_ADDED: string = 'VIEW_ADDED';
export const VIEWS_LOADED: string = 'VIEWS_LOADED';
export const VIEW_LOADED: string = 'VIEW_LOADED';

// Settings
export const SAVE_VIEWER_SETTINGS: string = 'SAVE_VIEWER_SETTINGS';
export const LOAD_VIEWER_SETTINGS: string = 'LOAD_VIEWER_SETTINGS';
export const VIEWER_SETTINGS_SAVED: string = 'VIEWER_SETTINGS_SAVED';
export const VIEWER_SETTINGS_ERROR: string = 'VIEWER_SETTINGS_ERROR';
export const RESET_SAVE_STATUS: string = 'RESET_SAVE_STATUS';

// Converter
export const START_CONVERSION: string = 'START_CONVERSION';
export const CONVERSION_STARTED: string = 'CONVERSION_STARTED';
export const UPDATE_CONVERSION_PROGRESS: string = 'UPDATE_CONVERSION_PROGRESS';
export const CONVERSION_COMPLETE: string = 'CONVERSION_COMPLETE';
export const CONVERSION_ERROR: string = 'CONVERSION_ERROR';
export const RESTART_CONVERTER: string = 'RESTART_CONVERTER';

// Annotations
export const SAVE_ANNOTATION = "SAVE_ANNOTATION";
export const ANNOTATION_SAVED = "ANNOTATION_SAVED";
export const DELETE_ANNOTATION = "DELETE_ANNOTATION";
export const ANNOTATION_DELETED = "ANNOTATION_DELETED";
export const UPDATE_ANNOTATION = "UPDATE_ANNOTATION";
export const UPDATE_ANNOTATIONS_ORDER = "UPDATE_ANNOTATIONS_ORDER";
export const LOAD_ANNOTATIONS = "LOAD_ANNOTATIONS";
export const ANNOTATIONS_LOADED = "ANNOTATIONS_LOADED";
export const ANNOTATIONS_MERGED = "ANNOTATIONS_MERGED";
export const RESET_ANNOTATIONS_UPDATE_STATUS = "RESET_ANNOTATIONS_UPDATE_STATUS";
export const ANNOTATION_FOCUS_CHANGED = "ANNOTATION_FOCUS_CHANGED";