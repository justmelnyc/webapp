import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { scrollToPosition } from './../../lib/jello'
import { css, media, parent, select } from './../../styles/jss'
import * as s from './../../styles/jso'
import {
  ChevronIcon,
  XIcon,
} from '../assets/Icons'

const filterSelectorControlStyle = css(
  s.inlineBlock,
  s.relative,
  s.mr10,
  s.ml10,
  {
    width: 300,
  },
  media(s.maxBreak2,
    s.m0,
    s.fullWidth,
    { marginBottom: 10 },
  ),
  parent('.PostGrid .isPostReposting',
    s.m0,
    s.fullWidth,
    { marginBottom: 10 },
  ),
)

const selectorSelectedStyle = css(
  { cursor: 'pointer' },
  select('& input', s.resetInput),
  select('& .selector, & .selected',
    s.fullWidth,
    s.block,
    s.pr20,
    s.pl20,
    s.zIndex2,
    {
      cursor: 'pointer',
      paddingTop: 9,
      paddingBottom: 9,
      lineHeight: 20,
      border: '1px solid #aaa',
      borderRadius: 5,
    },
  ),
  select('&.open .selector, &.open .selected',
    {
      borderBottomRightRadius: 0,
      borderBottomLeftRadius: 0,
    },
  ),
  // selector
  select('& .selector',
    s.relative,
  ),
  select('&.open .selector',
    {
      cursor: 'text',
    },
  ),
  select('& .selector-label',
    s.absolute,
    s.colorA,
    s.zIndex1,
    {
      left: 20,
    },
  ),
  select('& svg.ChevronIcon',
    s.absolute,
    s.block,
    s.colorA,
    s.rotate90,
    s.zIndex1,
    {
      cursor: 'pointer',
      top: 10,
      right: 10,
    },
    // select('& polyline', { fill: '#aaa' }),
  ),
  select('&.open svg.ChevronIcon',
    s.zIndex3,
  ),
  // selected
  select('& .selected',
    {
      borderColor: '#979797',
    },
    select('& b',
      s.sansRegular,
      s.inlineBlock,
      s.fullWidth,
      s.truncate,
      {
        width: 'calc(100% - 24px)',
        lineHeight: 20,
        verticalAlign: 'middle',
      },
      select('& i',
        s.sansRegular,
        s.colorA,
      ),
    ),
    select('& button',
      s.absolute,
      {
        right: 15,
      },
      media(s.maxBreak2,
        { right: 18 },
      ),
    ),
    select('& button span.label', s.displayNone),
  ),
)

const selectorItemsStyle = css(
  s.absolute,
  s.fullWidth,
  s.p10,
  s.overflowHidden,
  s.overflowScrollWebY,
  s.bgcWhite,
  s.zTools,
  {
    top: 39,
    left: 0,
    maxHeight: 260,
    border: '1px solid #aaa',
    borderRadius: 0,
    borderBottomRightRadius: 5,
    borderBottomLeftRadius: 5,
  },
  select('& .divider',
    s.p0,
    s.m10,
    s.bgcA,
    {
      height: 1,
      border: 0,
    },
  ),
  // list items
  select('& b',
    s.block,
    s.m0,
    s.p5,
    s.pr10,
    s.pl10,
    s.colorA,
    s.sansRegular,
    {
      lineHeight: 20,
    },
  ),
  select('& ul',
    s.resetList,
    select('& li',
      s.m0,
      s.p0,
      select('& button',
        s.block,
        s.fullWidth,
        {
          marginTop: 1,
          marginBottom: 1,
          padding: 4,
          height: 'auto',
          textAlign: 'left',
          lineHeight: 20,
        },
        // have to be below `padding: 4`
        s.pr10,
        s.pl10,
      ),
      select('& button:active',
        s.colorBlack,
        s.bgcWhite,
      ),

      select('&.isSelected button, & button:hover',
        s.colorWhite,
        s.bgcBlack,
        { borderRadius: 3 },
      ),
    ),
  ),
  // mobile tweaks
  media(s.maxBreak2,
    s.relative,
    s.block,
    {
      WebkitOverflowScrolling: 'none',
      overflowX: 'hidden',
      overflowY: 'visible',
      top: 'auto',
      left: 'auto',
      maxHeight: '100%',
      borderTopWidth: 0,
    },
  ),
)

export function filterSearch(listItems, searchText) {
  if (searchText === '') { return listItems }
  return listItems.filter(c => c.get('name').toLowerCase().includes(searchText.toLowerCase()))
}

export function FilterSelectorControlWrapper({ children, className, handleClick }) {
  return (
    /* eslint-disable jsx-a11y/interactive-supports-focus */
    <aside
      className={classNames({ className }, `${filterSelectorControlStyle}`)}
      role="searchbox"
      onClick={handleClick}
    >
      {children}
    </aside>
  )
}
FilterSelectorControlWrapper.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  className: PropTypes.string,
  handleClick: PropTypes.func.isRequired,
}
FilterSelectorControlWrapper.defaultProps = {
  children: null,
  className: undefined,
}

export function FilterSelectorListWrapper({ children, id }) {
  return (
    <span
      id={id}
      className={selectorItemsStyle}
    >
      {children}
    </span>
  )
}
FilterSelectorListWrapper.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  id: PropTypes.string.isRequired,
}
FilterSelectorListWrapper.defaultProps = {
  children: null,
}

export function FilterSelectorInputWrapper({ children, open }) {
  return (
    <span className={classNames({ open }, `${selectorSelectedStyle}`)}>
      {children}
    </span>
  )
}
FilterSelectorInputWrapper.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  open: PropTypes.bool,
}
FilterSelectorInputWrapper.defaultProps = {
  children: null,
  open: false,
}

export function ListItem({ item, index, selectedIndexCurrent, type, onSelect }) {
  const isSelected = selectedIndexCurrent === index
  return (
    <li
      id={`${type}Select_${item.get('id')}`}
      className={classNames({ isSelected })}
    >
      <button
        role="option"
        aria-selected={isSelected}
        onClick={() => onSelect(item)}
      >
        {item.get('name')}
      </button>
    </li>
  )
}
ListItem.propTypes = {
  item: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  onSelect: PropTypes.func.isRequired,
  selectedIndexCurrent: PropTypes.number,
  type: PropTypes.string,
}
ListItem.defaultProps = {
  selectedIndexCurrent: null,
  type: 'item',
}

export default class FilterSelectorControl extends PureComponent {
  static propTypes = {
    isEditing: PropTypes.bool,
    labelText: PropTypes.string,
    onSelect: PropTypes.func.isRequired,
    onClear: PropTypes.func.isRequired,
    assignedItems: PropTypes.object,
    resetSelection: PropTypes.bool.isRequired,
    searchPromptText: PropTypes.string,
    selectedItems: PropTypes.array.isRequired,
    listItems: PropTypes.array.isRequired,
    trackEvent: PropTypes.func.isRequired,
    type: PropTypes.string.isRequired,
  }
  static defaultProps = {
    isEditing: false,
    labelText: 'Choose',
    assignedItems: null,
    searchPromptText: 'Type something…',
  }

  constructor(props) {
    super(props)
    const { listItems } = props
    this.state = {
      listItems,
      focused: false,
      open: false,
      searchText: '',
      selectedItem: null,
      selectedIndex: null,
    }

    this.setWrapperRef = this.setWrapperRef.bind(this)
    this.handleClickOutside = this.handleClickOutside.bind(this)
  }

  componentDidMount() {
    const {
      assignedItems,
      selectedItems,
    } = this.props
    if (selectedItems || assignedItems) {
      this.setItemSelection()
    }
  }

  componentWillReceiveProps(nextProps) {
    const { listItems } = nextProps
    const { searchText } = this.state
    this.setState({
      listItems: filterSearch(listItems, searchText),
    })
  }

  componentDidUpdate(prevProps, prevState) {
    if ((!prevState.open && this.state.open) ||
      (!this.state.open && !prevState.focused && this.state.focused)) {
      document.addEventListener('mousedown', this.handleClickOutside)
    }

    // close & reset selection
    if (!prevProps.resetSelection && this.props.resetSelection) {
      this.close(false)
    }

    if (this.state.open &&
      (prevState.selectedIndex !== this.state.selectedIndex)) {
      this.scrollToHighlightedItem()
    }

    if (this.props.selectedItems &&
      prevProps.selectedItems !== this.props.selectedItems) {
      this.setItemSelection()
    }

    if (this.state.open && !this.props.selectedItems.length > 0) {
      this.itemSelectorRef.focus()
    }
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside)
  }

  onSelectLocal = (item) => {
    const { onSelect, trackEvent, type } = this.props

    let trackEventName = null
    switch (type) {
      case ('postCategorySelect'):
        trackEventName = 'category-post-selector-selected'
        break
      default:
        return null
    }

    if (trackEventName) {
      return trackEvent(trackEventName, {
        id: item.get('id'),
        slug: item.get('slug'),
      })
    }

    return onSelect(item)
  }

  setItemSelection() {
    const {
      isEditing,
      assignedItems,
      selectedItems,
    } = this.props
    const {
      listItems,
    } = this.state

    if ((selectedItems.length > 0) || (assignedItems)) {
      // assume we only have one selection at a time for now
      let selectedItem = null
      let selectedIndex = null

      // grab the selected item (if not editing)
      if (!isEditing && (selectedItems.length > 0)) {
        selectedItem = selectedItems[0]

        listItems.map((item, index) => {
          if (selectedItem.get('id') === item.get('id')) {
            selectedIndex = index
          }
          return selectedIndex
        })
      }

      // grab the selected item from the post (if editing)
      if (isEditing && assignedItems) {
        listItems.map((item, index) => {
          assignedItems.map((assignedItemId) => {
            if (assignedItemId === item.get('id')) {
              selectedItem = item
              selectedIndex = index
            }
            return selectedIndex
          })
          return selectedIndex
        })
      }

      return this.setState({
        selectedItem,
        selectedIndex,
      })
    }

    return this.setState({
      selectedItem: null,
      selectedIndex: null,
    })
  }

  setWrapperRef(node) {
    this.wrapperRef = node
  }

  handleSearch = (event) => {
    const searchText = event.target.value
    const { listItems } = this.props
    const { selectedIndex } = this.state

    let newSelectedIndex = selectedIndex
    if (!selectedIndex) {
      newSelectedIndex = searchText === '' ? null : 0
      // newSelectedIndex = 0
    }
    this.setState({
      selectedIndex: newSelectedIndex,
      searchText,
      listItems: filterSearch(listItems, searchText),
    })
  }

  handleKeyDown = (event) => {
    const { onSelect, trackEvent, type } = this.props
    const {
      listItems,
      selectedIndex,
    } = this.state
    const max = listItems.length
    const selectedIsNull = (selectedIndex === null)

    if (event.key === 'ArrowDown' && selectedIsNull) {
      this.setState({ selectedIndex: 0 })
    } else if (event.key === 'ArrowDown' && selectedIndex === (max - 1)) {
      this.setState({ selectedIndex: 0 })
    } else if (event.key === 'ArrowDown' && selectedIndex < max) {
      this.setState({ selectedIndex: selectedIndex + 1 })
    } else if (event.key === 'ArrowUp' && !selectedIsNull && selectedIndex > 0) {
      event.preventDefault()
      this.setState({ selectedIndex: selectedIndex - 1 })
    } else if (event.key === 'ArrowUp' && !selectedIsNull && selectedIndex === 0) {
      event.preventDefault()
      this.setState({ selectedIndex: max - 1 })
    } else if (event.key === 'Enter' && !selectedIsNull) {
      const selected = listItems[selectedIndex]

      let trackEventName = null
      switch (type) {
        case ('postCategorySelect'):
          trackEventName = 'category-post-selector-selected'
          break
        default:
          return null
      }

      if (trackEventName) {
        return trackEvent(trackEventName, {
          id: selected.get('id'),
          slug: selected.get('slug'),
        })
      }

      onSelect(listItems[selectedIndex])
    } else if (event.key === 'Escape') {
      this.itemSelectorRef.blur()
      this.close()
    }
    return null
  }

  handleBlur(isFocused) {
    this.setState({
      focused: isFocused,
    })

    if (isFocused) {
      this.open()
    }
  }

  handleSelectorClick(e) {
    if (e.target.nodeName === 'polyline' ||
      e.target.nodeName === 'g' ||
      e.target.nodeName === 'svg') {
      return this.close()
    }
    if (e.target.nodeName !== 'BUTTON') {
      return this.open()
    }
    return null
  }

  handleClickOutside(event) {
    if (this.state.open) {
      if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
        this.close()
      }
    }
  }

  scrollToHighlightedItem() {
    const { type } = this.props
    const {
      listItems,
      selectedIndex,
    } = this.state
    const selectedItem = listItems[selectedIndex]
    let selectedItemDomId = null
    if (selectedItem) {
      selectedItemDomId = `${type}Select_${selectedItem.get('id')}`
    }

    // grab elements from the dom
    const itemListInDom = document.getElementById(`${type}List`)
    const selectedListItemInDom = document.getElementById(selectedItemDomId)

    // determine scroll offset of item in dom
    let selectedListItemInDomTopOffset = null
    let itemListInDomTopOffset = null
    let itemInDomHeight = null
    let itemListInDomHeight = null
    if (selectedItemDomId) {
      selectedListItemInDomTopOffset = selectedListItemInDom.getBoundingClientRect().top
      itemListInDomTopOffset = itemListInDom.getBoundingClientRect().top
      itemInDomHeight = selectedListItemInDom.clientHeight
      itemListInDomHeight = itemListInDom.clientHeight
    }

    if (selectedListItemInDomTopOffset) {
      // adjust scroll offset for window height / nav bar
      const scrollElement = itemListInDom
      const scrollTo = (selectedListItemInDomTopOffset - itemListInDomTopOffset)
      const scrollCheckOffset = itemInDomHeight

      if (
        ((scrollTo + scrollCheckOffset) > itemListInDomHeight) ||
        (scrollTo < 0)
      ) {
        // scroll to new position
        scrollToPosition(0, scrollTo, { el: scrollElement, duration: 150 })
      }
    }
  }

  open() {
    if (!this.state.open) {
      this.props.trackEvent('category-post-selector-opened')
      this.setState({
        open: true,
      })
    }
  }

  close(track = true) {
    if (this.state.open) {
      if (track) { this.props.trackEvent('category-post-selector-closed') }
      this.resetSelection(false)
    }
  }

  clearLocal() {
    const { onClear, trackEvent } = this.props
    trackEvent('category-post-selector-cleared')
    onClear()
  }

  resetSelection(track = true) {
    const { listItems } = this.props
    if (track) { this.props.trackEvent('category-post-selector-reset') }
    this.setState({
      listItems,
      searchText: '',
      focused: false,
      open: false,
    })
  }

  render() {
    const {
      labelText,
      searchPromptText,
      type,
    } = this.props
    const {
      open,
      searchText,
      selectedItem,
      selectedIndex,
      listItems,
    } = this.state
    // Everything except this component could support multiple item selections, but for now
    // we can assume there is only one selected item at a time.
    return (
      <FilterSelectorControlWrapper
        ref={this.setWrapperRef}
        handleClick={e => this.handleSelectorClick(e)}
      >
        <FilterSelectorInputWrapper open={open}>
          {!selectedItem &&
            <span className="input-with-label">
              {!searchText &&
                <label
                  className="selector-label"
                  htmlFor={type}
                >
                  {open ? searchPromptText : labelText}
                </label>
              }
              <ChevronIcon />
              <input
                ref={(node) => { this.itemSelectorRef = node }}
                className="selector"
                name={type}
                type="search"
                value={searchText}
                onChange={this.handleSearch}
                onKeyDown={this.handleKeyDown}
                onBlur={() => this.handleBlur(false)}
                onFocus={() => this.handleBlur(true)}
              />
            </span>
          }
          {selectedItem &&
            <span className="selected">
              <b>
                <i>Post into:</i>
                &nbsp;
                {selectedItem.get('name')}
              </b>
              <button onClick={() => this.clearLocal()}>
                <span className="label">Remove</span>
                <span className="icon">
                  <XIcon />
                </span>
              </button>
            </span>
          }
        </FilterSelectorInputWrapper>
        {open &&
          <FilterSelectorListWrapper id={`${type}List`}>
            <ul>
              {listItems.map((item, index) =>
                (<ListItem
                  key={`${type}Select:${item.get('id')}`}
                  item={item}
                  index={index}
                  selectedIndexCurrent={selectedIndex}
                  type={type}
                  onSelect={this.onSelectLocal}
                />),
              )}
            </ul>
          </FilterSelectorListWrapper>
        }
      </FilterSelectorControlWrapper>
    )
  }
}
