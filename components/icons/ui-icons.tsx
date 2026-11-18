import { CheckShape, SVGIcon } from './svg-parts'

export const BoltIcon = () => (
  <SVGIcon className="BoltIcon">
    <g className="svg-stroke-bevel">
      <polygon points="14,7.4 9,7.4 9,1 4,11.6 9,11.6 9,18" />
    </g>
  </SVGIcon>
)

export const BrowseIcon = () => (
  <SVGIcon className="BrowseIcon">
    <g transform="translate(1, 1)">
      <rect x="0" y="0" width="18" height="18" rx="2" />
      <polyline points="2.9 18 11.6 7.2 18 13.7" />
      <circle cx="5.4" cy="5.4" r="1.8" />
    </g>
  </SVGIcon>
)

export const BubbleIcon = () => (
  <SVGIcon className="BubbleIcon">
    <g className="svg-stroke-round">
      <path d="M6.6,12.6l-3.1,3.1 l0-10.3c0-0.7,0.5-1.2,1.2-1.2h10.6c0.7,0,1.2,0.5,1.2,1.2v6c0,0.7-0.5,1.2-1.2,1.2H6.6z" />
    </g>
    <g className="svg-stroke-round">
      <path d="M3.5,11.4v-6c0-0.7,0.5-1.2,1.2-1.2 h10.6c0.7,0,1.2,0.5,1.2,1.2v6c0,0.7-0.5,1.2-1.2,1.2H4.7C4,12.6,3.5,12.1,3.5,11.4z" />
      <polygon points=" 6.6,12.6 3.5,15.8 3.5,11.6 " />
    </g>
  </SVGIcon>
)

export const CheckCircleIcon = () => (
  <SVGIcon className="CheckCircleIcon">
    <g>
      <circle cx="10.5" cy="10.5" r="7" />
    </g>
    <g className="svg-stroke-bevel">
      <polyline points="7.5,10 10,13 13.5,7" />
    </g>
  </SVGIcon>
)

export const CheckIcon = () => (
  <SVGIcon className="CheckIcon">
    <CheckShape />
  </SVGIcon>
)

export const CheckIconLG = () => (
  <SVGIcon className="CheckIconLG CheckMark">
    <g className="svg-stroke-bevel">
      <polyline points="4.8,10.8 9.9,17 17.2,5" />
    </g>
  </SVGIcon>
)

export const CheckIconSM = () => (
  <SVGIcon className="CheckIconSM">
    <g className="svg-stroke-bevel">
      <polyline points="7,10.4 9.5,13.5 13,7.5" />
    </g>
  </SVGIcon>
)

export const ChevronCircleIcon = () => (
  <SVGIcon className="ChevronCircleIcon">
    <g>
      <circle cx="10" cy="10" r="7" />
    </g>
    <g>
      <polyline points="8.2,6.5 11.8,10 8.2,13.5" />
    </g>
  </SVGIcon>
)

export const CircleIcon = () => (
  <SVGIcon className="CircleIcon">
    <g>
      <circle cx="11" cy="11" r="5" />
    </g>
  </SVGIcon>
)

export const CircleIconLG = () => (
  <SVGIcon className="CircleIconLG">
    <g>
      <circle cx="12" cy="12" r="6" />
    </g>
  </SVGIcon>
)

export const CircleAddRemove = () => (
  <SVGIcon className="CircleAddRemove">
    <g>
      <circle cx="10" cy="10" r="9" />
      <line x1="15.318" y1="10.223" x2="4.682" y2="10.223" />
      <line x1="10" y1="15.541" x2="10" y2="4.904" />
    </g>
  </SVGIcon>
)

export const DotsIcon = () => (
  <SVGIcon className="DotsIcon">
    <g>
      <circle cx="3" cy="10" r="2.5" />
    </g>
    <g>
      <circle cx="10" cy="10" r="2.5" />
    </g>
    <g>
      <circle cx="17" cy="10" r="2.5" />
    </g>
  </SVGIcon>
)

export const DragIcon = () => (
  <SVGIcon className="DragIcon">
    <g>
      <line x1="15" x2="5" y1="10" y2="10" />
    </g>
    <g>
      <polyline points="7.4,13 5,10 7.4,7" />
      <polyline points="12.6,7 15,10 12.6,13" />
    </g>
  </SVGIcon>
)

export const EyeIcon = () => (
  <SVGIcon className="EyeIcon">
    <g>
      <path d="M19,9.9c0,0-4,4.9-9,4.9S1,9.9,1,9.9S5,5,10,5 S19,9.9,19,9.9z" />
      <circle cx="10" cy="10" r="5" />
    </g>
    <circle cx="10" cy="10" r="2" />
  </SVGIcon>
)

export const FlagIcon = () => (
  <SVGIcon className="FlagIcon">
    <g className="svg-stroke-round">
      <line x1="5" y1="3.7" x2="5" y2="16.8" />
    </g>
    <g className="svg-stroke-round">
      <path d="M15,10.2 c0,0-2.9,1.1-5,0s-5,0-5,0V3.7c0,0,2.9-1.1,5,0s5,0,5,0V10.2z" />
    </g>
  </SVGIcon>
)

export const GridIcon = () => (
  <SVGIcon className="GridIcon">
    <g>
      <circle cx="6.2" cy="6.2" r="2.5" />
      <circle cx="13.8" cy="6.2" r="2.5" />
      <circle cx="6.2" cy="13.8" r="2.5" />
      <circle cx="13.8" cy="13.8" r="2.5" />
    </g>
  </SVGIcon>
)

export const ArrowIcon = ({ isAnimated = false }: { isAnimated?: boolean }) => (
  <SVGIcon className="ArrowIcon">
    <g>
      <line x1="14.5" x2="4.5" y1="10" y2="10" />
    </g>
    {isAnimated && <rect className="ArrowIconAnimatedRect" height="4" width="4" x="0" y="8" />}
    <g>
      <polyline points="10,5.5 14.5,10 10,14.5" />
    </g>
  </SVGIcon>
)

export const ChevronIcon = () => (
  <SVGIcon className="ChevronIcon">
    <g>
      <polyline points="6,16 12,10 6,4" />
    </g>
  </SVGIcon>
)
