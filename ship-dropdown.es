import React, { Component } from 'react'
import propTypes from 'prop-types'
import { Dropdown, Button, FormControl } from 'react-bootstrap'
import { connect } from 'react-redux'
import cls from 'classnames'
import { extensionSelectorFactory } from 'views/utils/selectors'
import _, { get } from 'lodash'
import RootCloseWrapper from 'react-overlays/lib/RootCloseWrapper'

import { shipCat } from './constants'

const { i18n } = window
const __ = i18n['poi-plugin-exp-calc'].__.bind(i18n['poi-plugin-exp-calc'])

const catMap = _(shipCat).map(({ name, id }) => ([name, id])).fromPairs().value()

const searchOptions = [
  {
    name: 'None',
    value: 'none',
  },
  {
    name: 'All',
    value: 'all',
  },
  ..._(shipCat).map(({ name }) => ({ name, value: name })).value(),
]

const RadioCheck = ({ options, value: currentValue, onChange }) => (
  <div className="radio-check">
    {
    options.map(({ name, value }) =>
      (
        <div
          key={name}
          role="button"
          tabIndex="0"
          onClick={onChange(value)}
          className={cls('filter-option', {
            checked: currentValue === value,
            dark: window.isDarkTheme,
            light: !window.isDarkTheme,
          })}
        >
          {__(name)}
        </div>
      )
    )
  }
  </div>
)

RadioCheck.propTypes = {
  label: propTypes.string,
  options: propTypes.arrayOf(propTypes.object),
  value: propTypes.string,
  onChange: propTypes.func,
}

class Menu extends Component {
  state = {
    query: '',
    type: 'all',
  }

  handleQueryChange = (e) => {
    this.setState({
      query: e.target.value,
    })
  }

  handleTypeChange = (value) => () => {
    this.setState({
      type: value,
    })
  }

  handleRootClose = () => {
    console.log(arguments)
  }

  render() {
    const {
      query, type,
    } = this.state
    const {
      open,
    } = this.props
    return (
      <RootCloseWrapper
        disabled={!open}
        onRootClose={this.handleRootClose}
        event="click"
      >
        <ul className="dropdown-menu pull-right">
          <div>
            <FormControl
              type="text"
              value={query}
              placeholder={__('search')}
              onChange={this.handleQueryChange}
            />
            <RadioCheck
              options={searchOptions}
              value={type}
              label={__('Ship Type')}
              onChange={this.handleTypeChange}
            />
          </div>
        </ul>
      </RootCloseWrapper>
    )
  }
}

const handleToggleAction = () => ({
  type: '@@poi-plugin-exp-calc@active-dropdown',
  active: 'ship',
})

const ShipDropdown = connect(
  state => ({
    active: get(extensionSelectorFactory('poi-plugin-exp-calc')(state), 'active', ''),
  }),
  { handleToggle: handleToggleAction },
)(({ ship = {}, active, handleToggle, onSelect }) => (
  <Dropdown id="exp-calc-ship" open={active === 'ship'} onToggle={handleToggle}>
    <Dropdown.Toggle style={{ width: '200px' }}>
      Lv.{ship.api_lv} - {window.i18n.resources.__(ship.api_name || '')}
    </Dropdown.Toggle>
    <Menu bsRole="menu" open={active === 'ship'} onSelect={onSelect} />
  </Dropdown>
))

export default ShipDropdown
