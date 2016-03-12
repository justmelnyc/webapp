import React, { Component, PropTypes } from 'react'
import RegionTools from './RegionTools'
import classNames from 'classnames'

class Block extends Component {

  static propTypes = {
    children: PropTypes.element,
    className: PropTypes.string,
    data: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object,
    ]).isRequired,
    editorId: PropTypes.string.isRequired,
    kind: PropTypes.oneOf([
      'block',
      'embed',
      'image',
      'text',
    ]).isRequired,
    onRemoveBlock: PropTypes.func.isRequired,
    uid: PropTypes.number.isRequired,
  }

  static defaultProps = {
    data: '',
    ref: 'editable',
  }

  removeBlock = () => {
    const { onRemoveBlock, uid } = this.props
    onRemoveBlock(uid)
  }

  render() {
    const { children, className, data, kind, editorId, uid } = this.props
    const { width, height } = data
    return (
      <div
        className="editor-block"
        data-collection-id={ uid }
        data-editor-id={ editorId }
        ref="editorBlock"
      >
        <div
          { ...this.props }
          className={classNames('editable', kind, className)}
          style={{ width, height }}
          ref={ kind }
        >
          { children }
        </div>
        <RegionTools editorId={ editorId } onRemoveBlock={ this.removeBlock } />
      </div>
    )
  }

}

export default Block

