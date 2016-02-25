import React, { Component, PropTypes } from 'react'
import classNames from 'classnames'
import { sampleSize } from 'lodash'
import Emoji from '../assets/Emoji'
import { SVGIcon } from '../interface/SVGComponents'

// Usage:

// onInsertEmoji = ({ value }) => {
//   console.log('insert the value', value)
// };

// <QuickEmoji onAddEmoji={ this.onInsertEmoji }/>

const options = [
  '+1', 'sparkles', 'metal', 'ok_hand', 'v', 'snowman', 'heart', 'panda_face',
  'clap', 'boom', 'star', 'wave', 'raised_hands', 'dizzy', 'sparkling_heart',
  'muscle', 'fire', 'fist', 'ello', 'bread',
]

const MiniElloEmoji = () =>
  <SVGIcon className="MiniElloEmoji">
    <g fill="none">
      <circle cx="9" cy="9" r="6"/>
      <path d="M12.5 9c0 1.9-1.6 3.5-3.5 3.5s-3.5-1.6-3.5-3.5"/>
    </g>
  </SVGIcon>


const QuickEmojiChoiceButton = ({ name, onClick }) =>
  <button className="QuickEmojiChoiceButton" name={ name } onClick={ onClick }>
    <Emoji name={ name } />
  </button>


class QuickEmoji extends Component {

  static propTypes = {
    onAddEmoji: PropTypes.func.isRequired,
  };

  componentWillMount() {
    this.state = { isActive: false }
  }

  buttonWasClicked = () => {
    this.setState({ isActive: !this.state.isActive })
  };

  emojiWasClicked = (e) => {
    const { onAddEmoji } = this.props
    onAddEmoji({ value: `:${e.target.name}:` })
    this.setState({ isActive: false })
  };

  renderEmojis() {
    const samples = sampleSize(options, 4)
    return samples.map((sample) =>
      <QuickEmojiChoiceButton key={ sample } name={ sample } onClick={ this.emojiWasClicked }/>
    )
  }

  render() {
    const { isActive } = this.state
    return (
      <div className={ classNames('QuickEmoji', { isActive })}>
        <button className="QuickEmojiButton" onClick={ this.buttonWasClicked }>
          <MiniElloEmoji/>
        </button>
        <div className="QuickEmojiList">
          { isActive ? this.renderEmojis() : null }
        </div>
      </div>
    )
  }
}

export default QuickEmoji
