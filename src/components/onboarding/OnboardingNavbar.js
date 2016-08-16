import React, { PropTypes } from 'react'
import { ElloMark } from '../svg/ElloIcons'

const OnboardingNavbar = ({ isNextDisabled, nextLabel = 'Continue', onDoneClick, onNextClick }) =>
  <header className="OnboardingNavbar">
    <ElloMark />
    <button
      className="OnboardingNextButton RoundedButton"
      disabled={isNextDisabled}
      onClick={onNextClick}
    >
      {nextLabel}
    </button>
    {onDoneClick ?
      <button className="OnboardingDoneButton" onClick={onDoneClick} >
        I'm Done
      </button>
      : null
    }
  </header>

OnboardingNavbar.propTypes = {
  isNextDisabled: PropTypes.bool,
  nextLabel: PropTypes.string,
  onDoneClick: PropTypes.func,
  onNextClick: PropTypes.func.isRequired,
}

export default OnboardingNavbar

