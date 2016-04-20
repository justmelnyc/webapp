import React, { PropTypes } from 'react'
import classNames from 'classnames'
import { NavbarLabel } from './NavbarLabel'
import { NavbarLayoutTool } from './NavbarLayoutTool'
import { NavbarLink } from './NavbarLink'
import { NavbarMark } from './NavbarMark'
import { NavbarMorePostsButton } from './NavbarMorePostsButton'
import { NavbarOmniButton } from './NavbarOmniButton'
import { NavbarProfile } from './NavbarProfile'
import {
  BoltIcon, CircleIcon, GridIcon, ListIcon, SearchIcon, SparklesIcon, StarIcon,
} from './NavbarIcons'
// yuck..
import NotificationsContainer from '../../containers/notifications/NotificationsContainer'

export const NavbarLoggedOut = ({
  currentStream,
  hasLoadMoreButton,
  isLoggedIn,
  onClickLoadMorePosts,
  pathname,
}) =>
<nav className="Navbar" role="navigation" >
  <NavbarMark
    currentStream={ currentStream }
    isLoggedIn={ isLoggedIn }
  />
  <NavbarLabel />
  { hasLoadMoreButton ? <NavbarMorePostsButton onClick={ onClickLoadMorePosts } /> : null }
  <div className="NavbarLinks">
    <NavbarLink
      className="LabelOnly"
      icon={ <SparklesIcon /> }
      label="Discover"
      pathname={ pathname }
      to="/"
    />
    <NavbarLink
      className="IconOnly"
      icon={ <SearchIcon /> }
      label="Search"
      pathname={ pathname }
      to="/search"
    />
    <NavbarLink
      className="LabelOnly"
      label="Log in"
      pathname={ pathname }
      to="/enter"
    />
    <NavbarLink
      className="LabelOnly"
      label="Sign up"
      pathname={ pathname }
      to="/signup"
    />
  </div>
</nav>

NavbarLoggedOut.propTypes = {
  currentStream: PropTypes.string.isRequired,
  hasLoadMoreButton: PropTypes.bool.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  onClickLoadMorePosts: PropTypes.func.isRequired,
  pathname: PropTypes.string.isRequired,
}

export const NavbarLoggedIn = ({
  avatar,
  currentStream,
  hasLayoutTool,
  hasLoadMoreButton,
  hasNotifications,
  isGridMode,
  isLoggedIn,
  isNotificationsActive,
  isProfileMenuActive,
  notificationCategory,
  onClickAvatar,
  onClickLoadMorePosts,
  onClickNotification,
  onClickOmniButton,
  onClickToggleLayoutMode,
  onDragLeaveStreamLink,
  onDragOverOmniButton,
  onDragOverStreamLink,
  onDropStreamLink,
  onLogOut,
  pathname,
  username,
  viewportDeviceSize,
}) =>
<nav className="Navbar" role="navigation" >
  <NavbarMark
    currentStream={ currentStream }
    isLoggedIn={ isLoggedIn }
  />
  <NavbarOmniButton
    onClick={ onClickOmniButton }
    onDragOver={ onDragOverOmniButton }
  />
  { hasLoadMoreButton ? <NavbarMorePostsButton onClick={ onClickLoadMorePosts } /> : null }
  <div className="NavbarLinks">
    <NavbarLink
      className="LabelOnly"
      icon={ <SparklesIcon /> }
      label="Discover"
      pathname={ pathname }
      to="/discover"
    />
    <NavbarLink
      className="LabelOnly"
      icon={ <CircleIcon /> }
      label="Following"
      onDragLeave={ onDragLeaveStreamLink }
      onDragOver={ onDragOverStreamLink }
      onDrop={ onDropStreamLink }
      pathname={ pathname }
      to="/following"
    />
    <NavbarLink
      className=""
      icon={ <StarIcon /> }
      label="Starred"
      onDragLeave={ onDragLeaveStreamLink }
      onDragOver={ onDragOverStreamLink }
      onDrop={ onDropStreamLink }
      pathname={ pathname }
      to="/starred"
    />
    <NavbarLink
      className={ classNames('IconOnly', { hasNotifications }) }
      icon={ <BoltIcon /> }
      label="Notifications"
      onClick={ viewportDeviceSize !== 'mobile' ? onClickNotification : null }
      pathname={ pathname }
      to={ `/notifications${notificationCategory}` }
    />
    <NavbarLink
      className="IconOnly"
      icon={ <SearchIcon /> }
      label="Search"
      pathname={ pathname }
      to="/search"
    />
  </div>
  <NavbarProfile
    avatar={ avatar }
    isProfileMenuActive={ isProfileMenuActive }
    onClickAvatar={ onClickAvatar }
    onLogOut={ onLogOut }
    username={ username }
  />
  { viewportDeviceSize === 'mobile' && hasLayoutTool ?
    <NavbarLayoutTool
      icon={ isGridMode ? <ListIcon /> : <GridIcon /> }
      onClick={ onClickToggleLayoutMode }
    /> : null
  }
  { viewportDeviceSize !== 'mobile' && isNotificationsActive ?
    <NotificationsContainer /> : null
  }
</nav>

NavbarLoggedIn.propTypes = {
  avatar: PropTypes.shape({}),
  currentStream: PropTypes.string.isRequired,
  hasLayoutTool: PropTypes.bool.isRequired,
  hasLoadMoreButton: PropTypes.bool.isRequired,
  hasNotifications: PropTypes.bool.isRequired,
  isGridMode: PropTypes.bool,
  isLoggedIn: PropTypes.bool.isRequired,
  isNotificationsActive: PropTypes.bool.isRequired,
  isProfileMenuActive: PropTypes.bool.isRequired,
  notificationCategory: PropTypes.string.isRequired,
  onClickAvatar: PropTypes.func.isRequired,
  onClickLoadMorePosts: PropTypes.func.isRequired,
  onClickNotification: PropTypes.func.isRequired,
  onClickOmniButton: PropTypes.func.isRequired,
  onClickToggleLayoutMode: PropTypes.func.isRequired,
  onDragLeaveStreamLink: PropTypes.func.isRequired,
  onDragOverOmniButton: PropTypes.func.isRequired,
  onDragOverStreamLink: PropTypes.func.isRequired,
  onDropStreamLink: PropTypes.func.isRequired,
  onLogOut: PropTypes.func.isRequired,
  pathname: PropTypes.string.isRequired,
  username: PropTypes.string,
  viewportDeviceSize: PropTypes.string.isRequired,
}

