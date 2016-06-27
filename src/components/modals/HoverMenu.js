import React, { PropTypes } from 'react'
import classNames from 'classnames'
import { Link } from 'react-router'
import { ExIcon } from '../navbar/NavbarIcons'
import { DotsIcon } from '../relationships/RelationshipIcons'

export const HoverMenu = ({ categories, isHoverMenuActive, onClickDots }) =>
  <span className="HoverMenu">
    <DotsIcon onClick={onClickDots} />
    <nav className={classNames('HoverMenuLinks', { isActive: isHoverMenuActive })} >
      <Link className="HoverMenuLink" to="/discover/trending">Trending</Link>
      <hr className="HoverMenuLinkDivider" />
      <Link className="HoverMenuLink" to="/discover/recent">Recent</Link>
      <hr className="HoverMenuLinkDivider" />
      {categories.map(cat =>
        <div key={`discover/${cat.slug}`}>
          <Link
            className="HoverMenuLink"
            to={`/discover/${cat.slug}`}
          >
            {cat.name}
          </Link>
          <hr className="HoverMenuLinkDivider" />
        </div>
      )}
      <Link className="HoverMenuLink" to="/discover/all">See All</Link>
      <button className="HoverMenuCloseButton">
        <ExIcon />
      </button>
    </nav>
  </span>

HoverMenu.propTypes = {
  categories: PropTypes.array,
  isHoverMenuActive: PropTypes.bool,
  onClickDots: PropTypes.func,
}

HoverMenu.defaultValues = {
  categories: [],
}

