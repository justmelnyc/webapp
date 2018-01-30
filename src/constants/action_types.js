// TODO: move all of these into a STREAM object
export const ADD_NEW_IDS_TO_RESULT = 'ADD_NEW_IDS_TO_RESULT'
export const CLEAR_PAGE_RESULT = 'CLEAR_PAGE_RESULT'
export const HEAD = 'HEAD'
export const HEAD_REQUEST = 'HEAD_REQUEST'
export const HEAD_SUCCESS = 'HEAD_SUCCESS'
export const HEAD_FAILURE = 'HEAD_FAILURE'
export const LOAD_STREAM = 'LOAD_STREAM'
export const LOAD_STREAM_REQUEST = 'LOAD_STREAM_REQUEST'
export const LOAD_STREAM_SUCCESS = 'LOAD_STREAM_SUCCESS'
export const LOAD_STREAM_FAILURE = 'LOAD_STREAM_FAILURE'
export const LOAD_NEXT_CONTENT = 'LOAD_NEXT_CONTENT'
export const LOAD_NEXT_CONTENT_REQUEST = 'LOAD_NEXT_CONTENT_REQUEST'
export const LOAD_NEXT_CONTENT_SUCCESS = 'LOAD_NEXT_CONTENT_SUCCESS'
export const LOAD_NEXT_CONTENT_FAILURE = 'LOAD_NEXT_CONTENT_FAILURE'

// Should these be `POST.JSON, POST.FORM` instead?
export const POST_JSON = 'POST_JSON'
export const POST_FORM = 'POST_FORM'
export const SET_LAYOUT_MODE = 'SET_LAYOUT_MODE'
export const UPDATE_STATE_FROM_NATIVE = 'UPDATE_STATE_FROM_NATIVE'

export const V3 = {
  LOAD_STREAM: 'V3.LOAD_STREAM',
  LOAD_STREAM_REQUEST: 'V3.LOAD_STREAM_REQUEST',
  LOAD_STREAM_SUCCESS: 'V3.LOAD_STREAM_SUCCESS',
  LOAD_STREAM_FAILURE: 'V3.LOAD_STREAM_FAILURE',
}

export const REQUESTER = {
  PAUSE: 'REQUESTER.PAUSE',
  UNPAUSE: 'REQUESTER.UNPAUSE',
}

export const ALERT = {
  OPEN: 'ALERT.OPEN',
  CLOSE: 'ALERT.CLOSE',
}

export const AUTHENTICATION = {
  CLEAR_AUTH_TOKEN: 'AUTHENTICATION.CLEAR_AUTH_TOKEN',
  FORGOT_PASSWORD: 'AUTHENTICATION.FORGOT_PASSWORD',
  LOGOUT: 'AUTHENTICATION.LOGOUT',
  LOGOUT_SUCCESS: 'AUTHENTICATION.LOGOUT_SUCCESS',
  LOGOUT_FAILURE: 'AUTHENTICATION.LOGOUT_FAILURE',
  REFRESH: 'AUTHENTICATION.REFRESH',
  REFRESH_REQUEST: 'AUTHENTICATION.REFRESH_REQUEST',
  REFRESH_SUCCESS: 'AUTHENTICATION.REFRESH_SUCCESS',
  REFRESH_FAILURE: 'AUTHENTICATION.REFRESH_FAILURE',
  RESET_PASSWORD: 'AUTHENTICATION.RESET_PASSWORD',
  RESET_PASSWORD_REQUEST: 'AUTHENTICATION.RESET_PASSWORD_REQUEST',
  RESET_PASSWORD_SUCCESS: 'AUTHENTICATION.RESET_PASSWORD_SUCCESS',
  RESET_PASSWORD_FAILURE: 'AUTHENTICATION.RESET_PASSWORD_FAILURE',
  SIGN_IN: 'AUTHENTICATION.SIGN_IN',
  USER: 'AUTHENTICATION.USER',
  USER_REQUEST: 'AUTHENTICATION.USER_REQUEST',
  USER_SUCCESS: 'AUTHENTICATION.USER_SUCCESS',
  USER_FAILURE: 'AUTHENTICATION.USER_FAILURE',
}

export const COMMENT = {
  CREATE: 'COMMENT.CREATE',
  CREATE_REQUEST: 'COMMENT.CREATE_REQUEST',
  CREATE_SUCCESS: 'COMMENT.CREATE_SUCCESS',
  CREATE_FAILURE: 'COMMENT.CREATE_FAILURE',
  DELETE: 'COMMENT.DELETE',
  DELETE_REQUEST: 'COMMENT.DELETE_REQUEST',
  DELETE_SUCCESS: 'COMMENT.DELETE_SUCCESS',
  DELETE_FAILURE: 'COMMENT.DELETE_FAILURE',
  EDITABLE: 'COMMENT.EDITABLE',
  EDITABLE_REQUEST: 'COMMENT.EDITABLE_REQUEST',
  EDITABLE_SUCCESS: 'COMMENT.EDITABLE_SUCCESS',
  EDITABLE_FAILURE: 'COMMENT.EDITABLE_FAILURE',
  FLAG: 'COMMENT.FLAG',
  FLAG_REQUEST: 'COMMENT.FLAG_REQUEST',
  FLAG_SUCCESS: 'COMMENT.FLAG_SUCCESS',
  FLAG_FAILURE: 'COMMENT.FLAG_FAILURE',
  UPDATE: 'COMMENT.UPDATE',
  UPDATE_REQUEST: 'COMMENT.UPDATE_REQUEST',
  UPDATE_SUCCESS: 'COMMENT.UPDATE_SUCCESS',
  UPDATE_FAILURE: 'COMMENT.UPDATE_FAILURE',
  TOGGLE_EDITING: 'COMMENT.TOGGLE_EDITING',
}

export const EDITOR = {
  ADD_ARTIST_INVITE: 'EDITOR.ADD_ARTIST_INVITE',
  ADD_BLOCK: 'EDITOR.ADD_BLOCK',
  ADD_DRAG_BLOCK: 'EDITOR.ADD_DRAG_BLOCK',
  REMOVE_DRAG_BLOCK: 'EDITOR.REMOVE_DRAG_BLOCK',
  ADD_EMPTY_TEXT_BLOCK: 'EDITOR.ADD_EMPTY_TEXT_BLOCK',
  APPEND_TEXT: 'EDITOR.APPEND_TEXT',
  CLEAR_AUTO_COMPLETERS: 'EDITOR.CLEAR_AUTO_COMPLETERS',
  EMOJI_COMPLETER: 'EDITOR.EMOJI_COMPLETER',
  EMOJI_COMPLETER_REQUEST: 'EDITOR.EMOJI_COMPLETER_REQUEST',
  EMOJI_COMPLETER_SUCCESS: 'EDITOR.EMOJI_COMPLETER_SUCCESS',
  EMOJI_COMPLETER_FAILURE: 'EDITOR.EMOJI_COMPLETER_FAILURE',
  INITIALIZE: 'EDITOR.INITIALIZE',
  LOAD_REPLY_ALL: 'EDITOR.LOAD_REPLY_ALL',
  LOAD_REPLY_ALL_REQUEST: 'EDITOR.LOAD_REPLY_ALL_REQUEST',
  LOAD_REPLY_ALL_SUCCESS: 'EDITOR.LOAD_REPLY_ALL_SUCCESS',
  LOAD_REPLY_ALL_FAILURE: 'EDITOR.LOAD_REPLY_ALL_FAILURE',
  // used for previewing an embed
  POST_PREVIEW: 'EDITOR.POST_PREVIEW',
  POST_PREVIEW_REQUEST: 'EDITOR.POST_PREVIEW_REQUEST',
  POST_PREVIEW_SUCCESS: 'EDITOR.POST_PREVIEW_SUCCESS',
  POST_PREVIEW_FAILURE: 'EDITOR.POST_PREVIEW_FAILURE',
  REORDER_BLOCKS: 'EDITOR.REORDER_BLOCKS',
  REMOVE_BLOCK: 'EDITOR.REMOVE_BLOCK',
  REPLACE_TEXT: 'EDITOR.REPLACE_TEXT',
  RESET: 'EDITOR.RESET',
  SAVE_ASSET: 'EDITOR.SAVE_ASSET',
  SAVE_ASSET_REQUEST: 'EDITOR.SAVE_ASSET_REQUEST',
  SAVE_ASSET_SUCCESS: 'EDITOR.SAVE_ASSET_SUCCESS',
  SAVE_ASSET_FAILURE: 'EDITOR.SAVE_ASSET_FAILURE',
  // Editor tool states
  SET_IS_COMPLETER_ACTIVE: 'EDITOR.SET_IS_COMPLETER_ACTIVE',
  SET_IS_TEXT_TOOLS_ACTIVE: 'EDITOR.SET_IS_TEXT_TOOLS_ACTIVE',
  SET_TEXT_TOOLS_COORDINATES: 'EDITOR.SET_TEXT_TOOLS_COORDINATES',
  // fires after the objectURL is created
  TMP_IMAGE_CREATED: 'EDITOR.TMP_IMAGE_CREATED',
  UPDATE_BUY_LINK: 'EDITOR.UPDATE_BUY_LINK',
  UPDATE_BLOCK: 'EDITOR.UPDATE_BLOCK',
  USER_COMPLETER: 'EDITOR.USER_COMPLETER',
  USER_COMPLETER_REQUEST: 'EDITOR.USER_COMPLETER_REQUEST',
  USER_COMPLETER_SUCCESS: 'EDITOR.USER_COMPLETER_SUCCESS',
  USER_COMPLETER_FAILURE: 'EDITOR.USER_COMPLETER_FAILURE',
}

export const GUI = {
  BIND_DISCOVER_KEY: 'DISCOVER.BIND_DISCOVER_KEY',
  NOTIFICATIONS_TAB: 'GUI.NOTIFICATIONS_TAB',
  SET_ACTIVE_USER_FOLLOWING_TYPE: 'GUI.SET_ACTIVE_USER_FOLLOWING_TYPE',
  SET_IS_NAVBAR_HIDDEN: 'GUI.SET_IS_NAVBAR_HIDDEN',
  SET_IS_PROFILE_MENU_ACTIVE: 'GUI.SET_IS_PROFILE_MENU_ACTIVE',
  SET_LAST_ANNOUNCEMENT_SEEN: 'GUI.SET_LAST_ANNOUNCEMENT_SEEN',
  SET_LAST_DISCOVER_BEACON_VERSION: 'GUI.SET_LAST_DISCOVER_BEACON_VERSION',
  SET_LAST_FOLLOWING_BEACON_VERSION: 'GUI.SET_LAST_FOLLOWING_BEACON_VERSION',
  SET_LAST_STARRED_BEACON_VERSION: 'GUI.SET_LAST_STARRED_BEACON_VERSION',
  SET_NOTIFICATION_SCROLL_Y: 'GUI.SET_NOTIFICATION_SCROLL_Y',
  SET_SCROLL: 'GUI.SET_SCROLL',
  SET_SIGNUP_MODAL_LAUNCHED: 'GUI.SET_SIGNUP_MODAL_LAUNCHED',
  SET_VIEWPORT_SIZE_ATTRIBUTES: 'GUI.SET_VIEWPORT_SIZE_ATTRIBUTES',
  TOGGLE_NOTIFICATIONS: 'GUI.TOGGLE_NOTIFICATIONS',
  START_ONBOARD_TO_ARTIST_INVITE: 'GUI.START_ONBOARD_TO_ARTIST_INVITE',
  COMPLETE_ONBOARD_TO_ARTIST_INVITE: 'GUI.COMPLETE_ONBOARD_TO_ARTIST_INVITE',
  RESET_ONBOARD_TO_ARTIST_INVITE: 'GUI.RESET_ONBOARD_TO_ARTIST_INVITE',
}

export const INVITATIONS = {
  GET_EMAIL: 'INVITATIONS.GET_EMAIL',
  GET_EMAIL_REQUEST: 'INVITATIONS.GET_EMAIL_REQUEST',
  GET_EMAIL_SUCCESS: 'INVITATIONS.GET_EMAIL_SUCCESS',
  GET_EMAIL_FAILURE: 'INVITATIONS.GET_EMAIL_FAILURE',
  INVITE: 'INVITATIONS.INVITE',
  INVITE_REQUEST: 'INVITATIONS.INVITE_REQUEST',
  INVITE_SUCCESS: 'INVITATIONS.INVITE_SUCCESS',
  INVITE_FAILURE: 'INVITATIONS.INVITE_FAILURE',
}

export const MODAL = {
  OPEN: 'MODAL.OPEN',
  CLOSE: 'MODAL.CLOSE',
}

export const NOTIFICATIONS = {
  MARK_ANNOUNCEMENT_READ: 'NOTIFICATIONS.MARK_ANNOUNCEMENT_READ',
  MARK_ANNOUNCEMENT_READ_REQUEST: 'NOTIFICATIONS.MARK_ANNOUNCEMENT_READ_REQUEST',
  MARK_ANNOUNCEMENT_READ_SUCCESS: 'NOTIFICATIONS.MARK_ANNOUNCEMENT_READ_SUCCESS',
  MARK_ANNOUNCEMENT_READ_FAILURE: 'NOTIFICATIONS.MARK_ANNOUNCEMENT_READ_FAILURE',
}

export const OMNIBAR = {
  OPEN: 'OMNIBAR.OPEN',
  CLOSE: 'OMNIBAR.CLOSE',
}

export const POST = {
  COMMENT: 'POST.COMMENT',
  COMMENT_REQUEST: 'POST.COMMENT_REQUEST',
  COMMENT_SUCCESS: 'POST.COMMENT_SUCCESS',
  COMMENT_FAILURE: 'POST.COMMENT_FAILURE',
  CREATE: 'POST.CREATE',
  CREATE_REQUEST: 'POST.CREATE_REQUEST',
  CREATE_SUCCESS: 'POST.CREATE_SUCCESS',
  CREATE_FAILURE: 'POST.CREATE_FAILURE',
  DELETE: 'POST.DELETE',
  DELETE_REQUEST: 'POST.DELETE_REQUEST',
  DELETE_SUCCESS: 'POST.DELETE_SUCCESS',
  DELETE_FAILURE: 'POST.DELETE_FAILURE',
  DETAIL: 'POST.DETAIL',
  DETAIL_REQUEST: 'POST.DETAIL_REQUEST',
  DETAIL_SUCCESS: 'POST.DETAIL_SUCCESS',
  DETAIL_FAILURE: 'POST.DETAIL_FAILURE',
  EDITABLE: 'POST.EDITABLE',
  EDITABLE_REQUEST: 'POST.EDITABLE_REQUEST',
  EDITABLE_SUCCESS: 'POST.EDITABLE_SUCCESS',
  EDITABLE_FAILURE: 'POST.EDITABLE_FAILURE',
  FLAG: 'POST.FLAG',
  FLAG_REQUEST: 'POST.FLAG_REQUEST',
  FLAG_SUCCESS: 'POST.FLAG_SUCCESS',
  FLAG_FAILURE: 'POST.FLAG_FAILURE',
  LOVE: 'POST.LOVE',
  LOVE_REQUEST: 'POST.LOVE_REQUEST',
  LOVE_SUCCESS: 'POST.LOVE_SUCCESS',
  LOVE_FAILURE: 'POST.LOVE_FAILURE',
  PERSIST: 'POST.PERSIST',
  UPDATE: 'POST.UPDATE',
  UPDATE_REQUEST: 'POST.UPDATE_REQUEST',
  UPDATE_SUCCESS: 'POST.UPDATE_SUCCESS',
  UPDATE_FAILURE: 'POST.UPDATE_FAILURE',
  TOGGLE_COMMENTS: 'POST.TOGGLE_COMMENTS',
  TOGGLE_EDITING: 'POST.TOGGLE_EDITING',
  TOGGLE_REPOSTING: 'POST.TOGGLE_REPOSTING',
  TRACK_VIEWS: 'POST.TRACK_VIEWS',
  TRACK_VIEWS_REQUEST: 'POST.TRACK_VIEWS_REQUEST',
  TRACK_VIEWS_SUCCESS: 'POST.TRACK_VIEWS_SUCCESS',
  TRACK_VIEWS_FAILURE: 'POST.TRACK_VIEWS_FAILURE',
  WATCH: 'POST.WATCH',
  WATCH_REQUEST: 'POST.WATCH_REQUEST',
  WATCH_SUCCESS: 'POST.WATCH_SUCCESS',
  WATCH_FAILURE: 'POST.WATCH_FAILURE',
}

export const PROFILE = {
  AVAILABILITY: 'PROFILE.AVAILABILITY',
  AVAILABILITY_REQUEST: 'PROFILE.AVAILABILITY_REQUEST',
  AVAILABILITY_SUCCESS: 'PROFILE.AVAILABILITY_SUCCESS',
  AVAILABILITY_FAILURE: 'PROFILE.AVAILABILITY_FAILURE',
  AVAILABILITY_RESET: 'PROFILE.AVAILABILITY_RESET',
  DELETE: 'PROFILE.DELETE',
  DELETE_REQUEST: 'PROFILE.DELETE_REQUEST',
  DELETE_SUCCESS: 'PROFILE.DELETE_SUCCESS',
  DELETE_FAILURE: 'PROFILE.DELETE_FAILURE',
  EXPORT: 'PROFILE.EXPORT',
  EXPORT_REQUEST: 'PROFILE.EXPORT_REQUEST',
  EXPORT_SUCCESS: 'PROFILE.EXPORT_SUCCESS',
  EXPORT_FAILURE: 'PROFILE.EXPORT_FAILURE',
  FOLLOW_CATEGORIES: 'PROFILE.FOLLOW_CATEGORIES',
  FOLLOW_CATEGORIES_REQUEST: 'PROFILE.FOLLOW_CATEGORIES_REQUEST',
  FOLLOW_CATEGORIES_SUCCESS: 'PROFILE.FOLLOW_CATEGORIES_SUCCESS',
  FOLLOW_CATEGORIES_FAILURE: 'PROFILE.FOLLOW_CATEGORIES_FAILURE',
  LOAD: 'PROFILE.LOAD',
  LOAD_REQUEST: 'PROFILE.LOAD_REQUEST',
  LOAD_SUCCESS: 'PROFILE.LOAD_SUCCESS',
  LOAD_FAILURE: 'PROFILE.LOAD_FAILURE',
  LOCATION_AUTOCOMPLETE: 'PROFILE.LOCATION_AUTOCOMPLETE',
  LOCATION_AUTOCOMPLETE_REQUEST: 'PROFILE.LOCATION_AUTOCOMPLETE_REQUEST',
  LOCATION_AUTOCOMPLETE_SUCCESS: 'PROFILE.LOCATION_AUTOCOMPLETE_SUCCESS',
  LOCATION_AUTOCOMPLETE_FAILURE: 'PROFILE.LOCATION_AUTOCOMPLETE_FAILURE',
  REGISTER_FOR_GCM: 'PROFILE.REGISTER_FOR_GCM',
  REGISTER_FOR_GCM_REQUEST: 'PROFILE.REGISTER_FOR_GCM_REQUEST',
  REGISTER_FOR_GCM_SUCCESS: 'PROFILE.REGISTER_FOR_GCM_SUCCESS',
  REGISTER_FOR_GCM_FAILURE: 'PROFILE.REGISTER_FOR_GCM_FAILURE',
  REQUEST_INVITE: 'PROFILE.REQUEST_INVITE',
  REQUEST_INVITE_REQUEST: 'PROFILE.REQUEST_INVITE_REQUEST',
  REQUEST_INVITE_SUCCESS: 'PROFILE.REQUEST_INVITE_SUCCESS',
  REQUEST_INVITE_FAILURE: 'PROFILE.REQUEST_INVITE_FAILURE',
  REQUEST_PUSH_SUBSCRIPTION: 'REQUEST_PUSH_SUBSCRIPTION',
  SAVE: 'PROFILE.SAVE',
  SAVE_REQUEST: 'PROFILE.SAVE_REQUEST',
  SAVE_SUCCESS: 'PROFILE.SAVE_SUCCESS',
  SAVE_FAILURE: 'PROFILE.SAVE_FAILURE',
  SAVE_AVATAR: 'PROFILE.SAVE_AVATAR',
  SAVE_AVATAR_REQUEST: 'PROFILE.SAVE_AVATAR_REQUEST',
  SAVE_AVATAR_SUCCESS: 'PROFILE.SAVE_AVATAR_SUCCESS',
  SAVE_AVATAR_FAILURE: 'PROFILE.SAVE_AVATAR_FAILURE',
  SAVE_COVER: 'PROFILE.SAVE_COVER',
  SAVE_COVER_REQUEST: 'PROFILE.SAVE_COVER_REQUEST',
  SAVE_COVER_SUCCESS: 'PROFILE.SAVE_COVER_SUCCESS',
  SAVE_COVER_FAILURE: 'PROFILE.SAVE_COVER_FAILURE',
  SIGNUP: 'PROFILE.SIGNUP',
  SIGNUP_REQUEST: 'PROFILE.SIGNUP_REQUEST',
  SIGNUP_SUCCESS: 'PROFILE.SIGNUP_SUCCESS',
  SIGNUP_FAILURE: 'PROFILE.SIGNUP_FAILURE',
  SPLIT: 'PROFILE.SPLIT',
  SPLIT_REQUEST: 'PROFILE.SPLIT_REQUEST',
  SPLIT_SUCCESS: 'PROFILE.SPLIT_SUCCESS',
  SPLIT_FAILURE: 'PROFILE.SPLIT_FAILURE',
  TMP_AVATAR_CREATED: 'PROFILE.TMP_AVATAR_CREATED',
  TMP_COVER_CREATED: 'PROFILE.TMP_COVER_CREATED',
  UNREGISTER_FOR_GCM: 'PROFILE.UNREGISTER_FOR_GCM',
  UNREGISTER_FOR_GCM_REQUEST: 'PROFILE.UNREGISTER_FOR_GCM_REQUEST',
  UNREGISTER_FOR_GCM_SUCCESS: 'PROFILE.UNREGISTER_FOR_GCM_SUCCESS',
  UNREGISTER_FOR_GCM_FAILURE: 'PROFILE.UNREGISTER_FOR_GCM_FAILURE',
}

export const PROMOTIONS = {
  AUTHENTICATION: 'PROMOTIONS.AUTHENTICATION',
  AUTHENTICATION_REQUEST: 'PROMOTIONS.AUTHENTICATION_REQUEST',
  AUTHENTICATION_FAILURE: 'PROMOTIONS.AUTHENTICATION_FAILURE',
  AUTHENTICATION_SUCCESS: 'PROMOTIONS.AUTHENTICATION_SUCCESS',
}

export const RELATIONSHIPS = {
  BATCH_UPDATE_INTERNAL: 'RELATIONSHIPS.BATCH_UPDATE_INTERNAL',
  UPDATE_INTERNAL: 'RELATIONSHIPS.UPDATE_INTERNAL',
  UPDATE: 'RELATIONSHIPS.UPDATE',
  UPDATE_REQUEST: 'RELATIONSHIPS.UPDATE_REQUEST',
  UPDATE_SUCCESS: 'RELATIONSHIPS.UPDATE_SUCCESS',
  UPDATE_FAILURE: 'RELATIONSHIPS.UPDATE_FAILURE',
}

export const TRACK = {
  EVENT: 'TRACK.EVENT',
  INITIAL_PAGE: 'TRACK.INITIAL_PAGE',
}

export const USER = {
  COLLAB_WITH: 'USER.COLLAB_WITH',
  COLLAB_WITH_REQUEST: 'USER.COLLAB_WITH_REQUEST',
  COLLAB_WITH_SUCCESS: 'USER.COLLAB_WITH_SUCCESS',
  COLLAB_WITH_FAILURE: 'USER.COLLAB_WITH_FAILURE',

  DETAIL: 'USER.DETAIL',
  DETAIL_REQUEST: 'USER.DETAIL_REQUEST',
  DETAIL_SUCCESS: 'USER.DETAIL_SUCCESS',
  DETAIL_FAILURE: 'USER.DETAIL_FAILURE',

  FLAG: 'USER.FLAG',
  FLAG_REQUEST: 'USER.FLAG_REQUEST',
  FLAG_SUCCESS: 'USER.FLAG_SUCCESS',
  FLAG_FAILURE: 'USER.FLAG_FAILURE',

  HIRE_ME: 'USER.HIRE_ME',
  HIRE_ME_REQUEST: 'USER.HIRE_ME_REQUEST',
  HIRE_ME_SUCCESS: 'USER.HIRE_ME_SUCCESS',
  HIRE_ME_FAILURE: 'USER.HIRE_ME_FAILURE',
}

export const ZEROS = {
  SAY_HELLO: 'ZEROS.SAY_HELLO',
}
