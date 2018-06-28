import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Mousetrap from 'mousetrap'
import { setIsProfileRolesActive } from '../actions/gui'
import {
  searchAdministratedCategories,
  setAdministratedCategoryRole,
} from '../actions/profile'
import UserDetailRoles from '../components/users/UserRolesRenderables'
import { SHORTCUT_KEYS } from '../constants/application_types'
import { selectUserCategoryUsers } from '../selectors/user'
import { selectAdministeredCategories } from '../selectors/categories'

export function mapStateToProps(state, props) {
  return {
    classList: state.modal.get('classList'),
    categoryUsers: selectUserCategoryUsers(state, props),
    administeredCategories: selectAdministeredCategories(state, props),
  }
}

class UserDetailRolesContainer extends PureComponent {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
    categoryUsers: PropTypes.object.isRequired,
    administeredCategories: PropTypes.object.isRequired,
    categorySearchTerm: PropTypes.string,
    userId: PropTypes.string.isRequired,
  }

  static defaultProps = {
    categorySearchTerm: null,
  }

  constructor(props) {
    super(props)
    this.state = {
      categorySearchTerm: null,
    }
  }

  componentDidMount() {
    const { dispatch, categorySearchTerm } = this.props
    Mousetrap.bind(SHORTCUT_KEYS.ESC, () => { this.close() })
    dispatch(searchAdministratedCategories(categorySearchTerm))
  }

  componentDidUpdate(prevProps, prevState) {
    const { dispatch } = this.props
    const { categorySearchTerm } = this.state
    if (prevState.categorySearchTerm !== categorySearchTerm) {
      dispatch(searchAdministratedCategories(categorySearchTerm))
    }
  }

  componentWillUnmount() {
    this.close()
    Mousetrap.unbind(SHORTCUT_KEYS.ESC)
  }

  close() {
    this.props.dispatch(setIsProfileRolesActive({ isActive: false }))
  }

  handleMaskClick(e) {
    if (e.target.classList.contains('mask')) {
      return this.close()
    }
    return null
  }

  searchCategories(term) {
    this.setState({ categorySearchTerm: term })
  }

  handleRoleActions(roleActionParams) {
    const { userId } = this.props
    const actionType = roleActionParams.actionType

    console.log(`
      action: ${actionType}, userId: ${userId}, roleId: ${roleActionParams.roleId}, categoryId: ${roleActionParams.categoryId}
    `)
  }

  handleRolesSubmit(roleParams) {
    this.props.dispatch(setAdministratedCategoryRole(roleParams))
    return null
  }

  render() {
    const {
      isOpen,
      categoryUsers,
      administeredCategories,
      userId,
    } = this.props

    return (
      <UserDetailRoles
        administeredCategories={administeredCategories}
        categoryUsers={categoryUsers}
        close={() => this.close()}
        editRemoveRole={roleActionParams => this.handleRoleActions(roleActionParams)}
        handleMaskClick={e => this.handleMaskClick(e)}
        handleRolesSubmit={roleParams => this.handleRolesSubmit(roleParams)}
        isOpen={isOpen}
        searchCategories={term => this.searchCategories(term)}
        userId={userId}
      />
    )
  }
}

export default connect(mapStateToProps)(UserDetailRolesContainer)
