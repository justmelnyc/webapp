// @flow
import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { ChevronIcon, ListIcon, GridIcon, RSSIcon } from '../assets/Icons'
import { FooterForm, FooterLink, FooterTool } from '../footer/FooterParts'
import { before, css, media, modifier, parent, select } from '../../styles/jss'
import * as s from '../../styles/jso'

const baseStyle = css(
  s.fixed,
  { right: 0, bottom: -54, left: 0, height: 69 },
  s.zFooter,
  s.colorA,
  modifier('isPaginatoring', select('.footer-content', { transform: 'translate3d(0, -100%, 0)' })),
  select('.isNavbarHidden ~ &:hover .footer-content',
    {
      transitionDelay: '350ms',
      transform: 'translate3d(0, -100%, 0)',
    }),
  select('.isAuthenticationView ~ &', s.displayNone),
  select('.isOnboardingView ~ &', s.displayNone),
  media('(max-width: 23.375em)', s.hv40, s.lh40), // 374 and below
  media(s.maxBreak2,
    parent('.isEditorFocused', s.displayNone),
    parent('.isOmnibarActive', s.displayNone),
    select('.isProfileMenuActive ~ &', s.displayNone),
  ),
  media(s.minBreak2,
    select('.isOmnibarActive .Omnibar.isFullScreen ~ &', s.displayNone),
  ),
  media(s.minBreak4),
)

const grabberStyle = css(
  s.relative,
  s.block,
  s.fullWidth,
  { height: 0, margin: 0, padding: 0, overflow: 'hidden' },
  select(
    '&:hover',
    { cursor: 'pointer' },
  ),
  select(
    '.no-touch .isNavbarHidden ~ .Footer &',
    { height: 15, marginTop: 0 },
  ),
)

const wrapperStyle = css(
  s.relative,
  s.flex,
  s.px10,
  s.itemsCenter,
  s.maxSiteWidth,
  s.fullWidth,
  s.bgcE5,
  { transition: 'transform 150ms ease', transform: 'translate3d(0, calc(-100% + 15px), 0)' },
  { height: 54, margin: 0 },
  select('.isNavbarHidden ~ .Footer &', { transform: 'translate3d(0, 0, 0)' }),
  media(s.minBreak2,
    s.px20,
  ),
  media(s.minBreak4, s.px40),
)

const linksStyle = css(
  s.relative,
  s.nowrap,
  { WebkitOverflowScrolling: 'touch', overflowX: 'auto', overflowY: 'hidden' },
)

const toolsStyle = css(
  s.absolute,
  { right: 10 },
  before(
    s.absolute,
    s.zIndex2,
    { top: 0, bottom: 0, left: -20, width: 20, content: '""' },
    { background: 'linear-gradient(to right, rgba(229, 229, 229, 0) 0%, rgba(229, 229, 229, 1) 90%)' },
  ),
  media(s.minBreak2,
    { right: 20 },
  ),
  media(s.minBreak4, { right: 40 }, before(s.displayNone)),
)

const rssStyle = css(
  s.displayNone,
  s.mx20,
  s.px5,
  media(s.minBreak2, s.inlineBlock),
  select('.no-touch &:hover rect', { fill: '#000' }),
)

type LinkType = {
  label: string,
  to: string,
}

type FooterPropTypes = {
  formActionPath: string,
  formMessage: string,
  formStatus: string,
  isEditorial: boolean,
  isFormDisabled: boolean,
  isGridMode: boolean,
  isLayoutToolHidden: boolean,
  isLoggedIn: boolean,
  isMobile: boolean,
  isPaginatoring: boolean,
  links: Array<LinkType>,
}

type FooterContextTypes = {
  onClickScrollToTop: () => void,
  onClickToggleLayoutMode: () => void,
}

export const Footer = ({
  formActionPath,
  formMessage,
  formStatus,
  isEditorial,
  isGridMode,
  isLayoutToolHidden,
  isLoggedIn,
  isMobile,
  isFormDisabled,
  isPaginatoring,
  links,
}: FooterPropTypes, {
  onClickScrollToTop,
  onClickToggleLayoutMode,
}: FooterContextTypes) =>
  (<footer
    className={classNames(`Footer ${baseStyle}`, { isPaginatoring })}
    role="contentinfo"
  >
    <div className={`grabber ${grabberStyle}`}></div>
    <div className={`footer-content ${wrapperStyle}`}>
      <div className={linksStyle}>
        { links.map(link =>
          (<FooterLink
            href={link.to}
            label={link.label}
            key={`FooterLink_${link.label}`}
          />),
        )}
      </div>
      <div className={`FooterTools ${toolsStyle}`}>
        { !isLoggedIn &&
          <FooterForm
            {...{
              formActionPath,
              formMessage,
              formStatus,
              isDisabled: isFormDisabled,
              isMobile,
            }}
          />
        }
        { isEditorial &&
          <a className={rssStyle} href="/feeds/editorials">
            <RSSIcon />
          </a>
        }
        { (isLoggedIn || (!isLoggedIn && !isMobile)) && // TODO: move to FooterContainer
          <FooterTool
            className="TopTool"
            icon={<ChevronIcon />}
            label="Top"
            onClick={onClickScrollToTop}
          />
        }
        {!isLayoutToolHidden && (isLoggedIn || (!isLoggedIn && !isMobile)) &&
          <FooterTool
            className="LayoutTool"
            icon={isGridMode ? <ListIcon /> : <GridIcon />}
            label={isGridMode ? 'List View' : 'Grid View'}
            onClick={onClickToggleLayoutMode}
          />
        }
      </div>
    </div>
  </footer>)

Footer.contextTypes = {
  onClickScrollToTop: PropTypes.func.isRequired,
  onClickToggleLayoutMode: PropTypes.func.isRequired,
}

export default Footer

