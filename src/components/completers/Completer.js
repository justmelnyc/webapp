import React, { Component, PropTypes } from 'react'
import classNames from 'classnames'
import Avatar from '../assets/Avatar'
import Completion from './Completion'
import { getPositionFromSelection } from '../editor/SelectionUtil'
import { addKeyObject, removeKeyObject } from '../interface/KeyComponent'
import { addResizeObject, removeResizeObject } from '../interface/ResizeComponent'

export const emojiRegex = /\s?:{1}(\w+|\+|-):{0}$/
export const userRegex = /\s?@{1}\w+/

export default class Completer extends Component {

  static propTypes = {
    className: PropTypes.string,
    completions: PropTypes.object.isRequired,
    onCancel: PropTypes.func.isRequired,
    onCompletion: PropTypes.func.isRequired,
  };

  componentWillMount() {
    this.state = {
      selectedIndex: 0,
      viewportDeviceSize: null,
    }
  }

  componentDidMount() {
    addKeyObject(this)
    addResizeObject(this)
  }

  componentWillUnmount() {
    removeKeyObject(this)
    removeResizeObject(this)
  }

  onKeyDown(e) {
    if ((!e.shiftKey && e.which === 9) || e.which === 40) {
      e.preventDefault()
      this.nextSelection()
    } else if ((e.shiftKey && e.which === 9) || e.which === 38) {
      e.preventDefault()
      this.prevSelection()
    } else if (e.which === 13) {
      e.preventDefault()
      this.submit()
    } else if (e.which === 27) {
      e.preventDefault()
      this.props.onCancel()
    }
  }

  onResize({ viewportDeviceSize }) {
    this.setState({ viewportDeviceSize })
  }

  nextSelection() {
    const { completions } = this.props
    let { selectedIndex } = this.state
    selectedIndex++
    if (selectedIndex > completions.data.length - 1) selectedIndex = 0
    this.setState({ selectedIndex })
  }

  prevSelection() {
    const { completions } = this.props
    let { selectedIndex } = this.state
    selectedIndex--
    if (selectedIndex < 0) selectedIndex = completions.data.length - 1
    this.setState({ selectedIndex })
  }

  submit() {
    const { onCompletion } = this.props
    const { selectedIndex } = this.state
    onCompletion({ value: this.refs[`completion_${selectedIndex}`].getValue() })
  }

  renderUsers() {
    const { completions, onCompletion } = this.props
    const { selectedIndex } = this.state
    return (
      completions.data.map((completion, i) =>
        <Completion
          className={ i === selectedIndex ? 'active' : null }
          key={ `completion_${i}` }
          asset={ <Avatar classList="tiny" sources={{ tmp: { url: completion.imageUrl } }}/>}
          label={ `@${completion.name}` }
          ref={ `completion_${i}` }
          onClick={ onCompletion }
        />
      )
    )
  }

  renderEmoji() {
    return null
  }

  render() {
    const { className, completions } = this.props
    const { viewportDeviceSize } = this.state
    if (!completions || !completions.data.length) {
      return null
    }
    const pos = getPositionFromSelection()
    const coords = pos || { top: 0, left: 0 }
    const top = viewportDeviceSize === 'mobile' ? coords.top + 45 : coords.top + 20
    const left = viewportDeviceSize === 'mobile' ? 0 : coords.left
    const style = pos ? { top, left } : null
    return (
      <div style={ style } className={ classNames(className, 'Completer') }>
        { completions.type === 'user' ? this.renderUsers() : this.renderEmoji() }
      </div>
    )
  }
}
