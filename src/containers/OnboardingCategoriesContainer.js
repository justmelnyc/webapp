import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import OnboardingCategories from '../components/onboarding/OnboardingCategories'
import { getCategories } from '../actions/discover'
import { selectCategories } from '../selectors'

const CATEGORIES_NEEDED = 3

function mapStateToProps(state, props) {
  const catLevels = selectCategories(state, props)
  return {
    categories: catLevels.primary.concat(catLevels.secondary, catLevels.tertiary),
  }
}

class OnboardingCategoriesContainer extends Component {

  static propTypes = {
    categories: PropTypes.array,
    dispatch: PropTypes.func.isRequired,
  }

  componentWillMount() {
    const { dispatch } = this.props
    dispatch(getCategories())
    this.categoryIds = []
    this.state = { categoryIds: [] }
  }

  onCategoryClick = (id) => {
    const index = this.categoryIds.indexOf(id)
    if (index === -1) {
      this.categoryIds.push(id)
    } else {
      this.categoryIds.splice(index, 1)
    }
    this.setState({ categoryIds: this.categoryIds })
  }

  onDoneClick = () => {
    const { dispatch } = this.props
    dispatch(push('/'))
  }

  onNextClick = () => {
    const { dispatch } = this.props
    // dispatch(followCategories(this.categoryIds))
    dispatch(push('/onboarding/settings'))
  }

  render() {
    const { categories } = this.props
    const { categoryIds } = this.state
    const selected = categoryIds.length < CATEGORIES_NEEDED ? categoryIds.length : CATEGORIES_NEEDED
    const counterText = `${selected} of ${CATEGORIES_NEEDED}`
    return (
      <OnboardingCategories
        categories={categories}
        counterText={counterText}
        isCounterSuccess={selected === CATEGORIES_NEEDED}
        nextLabel="Create Your Profile"
        onCategoryClick={this.onCategoryClick}
        onDoneClick={this.onDoneClick}
        onNextClick={this.onNextClick}
      />
    )
  }
}

export default connect(mapStateToProps)(OnboardingCategoriesContainer)

