/* eslint-disable max-len */
import { LOCATION_CHANGE } from 'react-router-redux'
import { expect } from '../spec_helper'
import * as subject from '../../src/reducers/gui'

describe('gui reducer', () => {
  describe('initial state', () => {
    it('sets up a default initialState', () => {
      expect(
        subject.gui(undefined, {})
      ).to.have.keys(
      'activeNotificationsType',
      'activeUserFollowingType',
      'columnCount',
      'columnWidth',
      'contentWidth',
      'coverImageSize',
      'coverOffset',
      'currentStream',
      'deviceSize',
      'hasLayoutTool',
      'history',
      'innerHeight',
      'innerWidth',
      'isCoverHidden',
      'isGridMode',
      'isNavbarFixed',
      'isNavbarHidden',
      'isNavbarSkippingTransition',
      'isNotificationsUnread',
      'isOffsetLayout',
      'lastNotificationCheck',
      'modes',
      )
    })
  })
  describe('LOCATION_CHANGE', () => {
    it('stores relevant streams to currentStream', () => {
      const action = {
        type: LOCATION_CHANGE,
        payload: {
          pathname: '/discover/trending',
        },
      }

      expect(
        subject.gui(undefined, action)
      ).to.have.property('currentStream', '/discover/trending')
    })
  })
})

