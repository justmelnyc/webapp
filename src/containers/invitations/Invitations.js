import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { FORM_CONTROL_STATUS as STATUS } from '../../constants/gui_types'
import { loadInvitedUsers } from '../../actions/invitations'
import { inviteUsers } from '../../actions/invitations'
import StreamComponent from '../../components/streams/StreamComponent'
import BatchEmailControl from '../../components/forms/BatchEmailControl'
import { getBatchEmailState } from '../../components/forms/Validators'
import FormButton from '../../components/forms/FormButton'

class Invitations extends Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      formStatus: STATUS.INDETERMINATE,
      batchEmailState: { status: STATUS.INDETERMINATE, message: '' },
    }
    this.batchEmailValue = ''
    this.handleSubmit = ::this.handleSubmit
    this.handleControlChange = ::this.handleControlChange
  }

  handleControlChange({ emails }) {
    this.batchEmailValue = emails
    const { batchEmailState } = this.state
    const currentStatus = batchEmailState.status
    const newState = getBatchEmailState({ value: emails, currentStatus })
    if (newState.status !== currentStatus) {
      this.setState({ batchEmailState: newState })
    }
  }

  handleSubmit(e) {
    e.preventDefault()
    const { batchEmailState } = this.state
    if (batchEmailState.status !== STATUS.SUCCESS) {
      return this.setState({ formStatus: STATUS.FAILURE })
    }
    const { dispatch } = this.props
    this.setState({ formStatus: STATUS.SUBMITTED })
    dispatch(inviteUsers(this.batchEmailValue))
  }

  renderMessage() {
    const { formStatus } = this.state
    switch (formStatus) {
      case STATUS.SUBMITTED:
        return 'Your invitations have been sent.'
      case STATUS.FAILURE:
        return 'There was an error submitting that form. Please contact support.'
      case STATUS.SUCCESS:
      case STATUS.INDETERMINATE:
      default:
        return (
          'You can invite multiple friends at once, just separate their email adresses with commas.'
        )
    }
  }

  render() {
    const { batchEmailState } = this.state
    const isValid = batchEmailState.status === STATUS.SUCCESS
    return (
      <section className="Invitations Panel">
        <header className="InvitationsHeader">
          <h1 className="InvitationsHeading">Invite your friends</h1>
          <p>
            Help Ello grow organically by inviting the people you love, and who
            you know will love Ello too.
          </p>
        </header>
        <div className="InvitationsForm">

          <form
            className="InvitationForm"
            noValidate="novalidate"
            onSubmit={ this.handleSubmit }
            role="form"
          >
            <BatchEmailControl
              classList="asBoxControl onWhite"
              label={ `Emails ${batchEmailState.message}` }
              onChange={ this.handleControlChange }
              tabIndex="1"
            />
            <FormButton tabIndex="2" disabled={ !isValid }>Invite</FormButton>
            <p className="BatchEmailControlSuggestions" style={{ color: '#aaa' }}>
              { this.renderMessage() }
            </p>
          </form>

        </div>
        <h2 className="InvitationsStreamHeading">Friends you've invited</h2>
        <StreamComponent action={loadInvitedUsers()} />
      </section>
    )
  }
}

Invitations.preRender = (store) => {
  return store.dispatch(loadInvitedUsers())
}

Invitations.propTypes = {
  dispatch: PropTypes.func.isRequired,
}

export default connect()(Invitations)
