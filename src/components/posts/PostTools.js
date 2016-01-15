import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { pushPath, replacePath } from 'redux-simple-router'
import classNames from 'classnames'
import { openModal, closeModal } from '../../actions/modals'
import * as postActions from '../../actions/posts'
import { trackEvent } from '../../actions/tracking'
import ConfirmDialog from '../dialogs/ConfirmDialog'
import FlagDialog from '../dialogs/FlagDialog'
import RegistrationRequestDialog from '../dialogs/RegistrationRequestDialog'
import ShareDialog from '../dialogs/ShareDialog'
import Hint from '../hints/Hint'
import {
  BubbleIcon,
  ChevronIcon,
  EyeIcon,
  FlagIcon,
  HeartIcon,
  PencilIcon,
  RepostIcon,
  ShareIcon,
  XBoxIcon,
} from '../posts/PostIcons'

class PostTools extends Component {

  constructor(props, context) {
    super(props, context)
    this.state = {
      isMoreToolActive: false,
    }
  }

  getToolCells() {
    const { author, currentUser, isLoggedIn, post } = this.props
    const isOwnPost = currentUser && author.id === currentUser.id
    const cells = []
    cells.push(
      <span
        className={classNames('PostTool', 'ViewsTool', { asPill: isLoggedIn })}
        key={`ViewsTool_${post.id}`}
      >
        <Link to={`/${author.username}/post/${post.token}`}>
          <EyeIcon />
          <span className="PostToolValue">{post.viewsCount}</span>
          <Hint>Views</Hint>
        </Link>
      </span>
    )
    if (author.hasCommentingEnabled) {
      cells.push(
        <span className="PostTool CommentTool" key={`CommentTool_${post.id}`}>
          <button onClick={ ::this.toggleComments }>
            <BubbleIcon />
            <span
              className="PostToolValue"
              data-count={post.commentsCount}
            >
              {post.commentsCount}
            </span>
            <Hint>Comment</Hint>
          </button>
        </span>
      )
    }
    if (author.hasLovesEnabled) {
      cells.push(
        <span className="PostTool LoveTool" key={`LoveTool_${post.id}`}>
          <button className={classNames({ active: post.loved })} onClick={ ::this.lovePost }>
            <HeartIcon />
            <span className="PostToolValue" data-count={post.lovesCount}>{post.lovesCount}</span>
            <Hint>Love</Hint>
          </button>
        </span>
      )
    }
    if (author.hasRepostingEnabled) {
      cells.push(
        <span className="PostTool RepostTool" key={`RepostTool_${post.id}`}>
          <button onClick={ ::this.signUp }>
            <RepostIcon />
            <span
              className="PostToolValue"
              data-count={post.repostsCount}
            >
              {post.repostsCount}
            </span>
            <Hint>Repost</Hint>
          </button>
        </span>
      )
    }
    if (author.hasSharingEnabled) {
      cells.push(
        <span
          className={classNames('PostTool', 'ShareTool', { asPill: !isLoggedIn })}
          key={`ShareTool_${post.id}`}
        >
          <button onClick={ ::this.sharePost }>
            <ShareIcon />
            <Hint>Share</Hint>
          </button>
        </span>
      )
    }
    cells.push(
      <span className="PostTool TimeAgoTool ShyTool" key={`TimeAgoTool_${post.id}`}>
        <Link to={`/${author.username}/post/${post.token}`}>
          <span className="PostToolValue">{new Date(post.createdAt).timeAgoInWords()}</span>
          <Hint>Visit</Hint>
        </Link>
      </span>
    )
    if (isLoggedIn) {
      if (isOwnPost) {
        cells.push(
          <span className="PostTool EditTool ShyTool" key={`EditTool_${post.id}`}>
            <button>
              <PencilIcon />
              <Hint>Edit</Hint>
            </button>
          </span>
        )
        cells.push(
          <span className="PostTool DeleteTool ShyTool" key={`DeleteTool_${post.id}`}>
            <button onClick={ ::this.deletePost }>
              <XBoxIcon />
              <Hint>Delete</Hint>
            </button>
          </span>
        )
      } else {
        cells.push(
          <span className="PostTool FlagTool ShyTool" key={`FlagTool_${post.id}`}>
            <button onClick={ ::this.flagPost }>
              <FlagIcon />
              <Hint>Flag</Hint>
            </button>
          </span>
        )
      }
    }
    cells.push(
      <span className={"PostTool MoreTool"} key={`MoreTool_${post.id}`}>
        <button onClick={ ::this.toggleActiveMoreTool }>
          <ChevronIcon />
          <Hint>More</Hint>
        </button>
      </span>
    )
    return cells
  }

  closeModal() {
    const { dispatch } = this.props
    dispatch(closeModal())
  }

  toggleActiveMoreTool() {
    this.setState({ isMoreToolActive: !this.state.isMoreToolActive })
  }

  toggleComments() {
    const { author, dispatch, isLoggedIn, post } = this.props
    if (!isLoggedIn) {
      dispatch(pushPath(`/${author.username}/post/${post.token}`, window.history.state))
    }
  }

  lovePost() {
    const { dispatch, isLoggedIn, post } = this.props
    if (!isLoggedIn) {
      return this.signUp()
    }
    if (post.loved) {
      dispatch(postActions.unlovePost(post))
    } else {
      dispatch(postActions.lovePost(post))
    }
  }

  sharePost() {
    const { author, dispatch, post } = this.props
    const action = bindActionCreators(trackEvent, dispatch)
    dispatch(openModal(<ShareDialog author={author} post={post} trackEvent={action} />))
    return dispatch(trackEvent('open-share-dialog'))
  }

  signUp() {
    const { dispatch } = this.props
    dispatch(openModal(<RegistrationRequestDialog />, 'asDecapitated'))
    return dispatch(trackEvent('open-registration-request-post-tools'))
  }

  flagPost() {
    const { dispatch } = this.props
    dispatch(openModal(
      <FlagDialog
        onResponse={ ::this.postWasFlagged }
        onConfirm={ ::this.closeModal }
      />))
  }

  postWasFlagged({ flag }) {
    const { dispatch, post } = this.props
    dispatch(postActions.flagPost(post, flag))
  }

  deletePost() {
    const { dispatch } = this.props
    dispatch(openModal(
      <ConfirmDialog
        title="Delete Post?"
        onConfirm={ ::this.deletePostConfirmed }
        onRejected={ ::this.closeModal }
      />))
  }

  deletePostConfirmed() {
    const { dispatch, path, post } = this.props
    this.closeModal()
    dispatch(postActions.deletePost(post))
    if (path.match(post.token)) {
      // TODO: will have to make the router smarter about
      // where the root redirects to
      dispatch(replacePath(`/`, window.history.state))
    }
  }

  render() {
    const { post } = this.props
    if (!post) { return null }
    const classes = classNames(
      'PostTools',
      { isMoreToolActive: this.state.isMoreToolActive },
    )
    return (
      <footer className={classes}>
        {this.getToolCells()}
      </footer>
    )
  }
}


function mapStateToProps(state) {
  return {
    isLoggedIn: state.authentication.isLoggedIn,
    path: state.router.path,
  }
}

PostTools.propTypes = {
  author: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  path: PropTypes.string.isRequired,
  post: PropTypes.object.isRequired,
}

export default connect(mapStateToProps)(PostTools)

