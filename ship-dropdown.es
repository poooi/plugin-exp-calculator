import React, { Component, PureComponent } from 'react'
import propTypes from 'prop-types'
import { Dropdown, Button, FormGroup, InputGroup, FormControl, Label, ControlLabel } from 'react-bootstrap'
import { connect } from 'react-redux'
import cls from 'classnames'
import { extensionSelectorFactory } from 'views/utils/selectors'
import _, { get, values } from 'lodash'
import Fuse from 'fuse.js'
import { RootCloseWrapper } from 'react-overlays'
import FA from 'react-fontawesome'

import { shipCat, exp } from './constants'
import { shipExpDataSelector, shipFleetMapSelector, expInfoSelectorFactory } from './selectors'

const { i18n } = window
const __ = i18n['poi-plugin-exp-calc'].__.bind(i18n['poi-plugin-exp-calc'])

const catMap = _(shipCat).map(({ name, id }) => ([name, id])).fromPairs().value()

const searchOptions = [
  {
    name: 'Custom',
    value: 'custom',
  },
  {
    name: 'Fleet',
    value: 'fleet',
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

const Menu = connect(
  state => ({
    ships: shipExpDataSelector(state),
    fleetMap: shipFleetMapSelector(state),
  })
)(class Menu extends Component {
  constructor(props) {
    super(props)

    const options = {
      keys: ['api_name', 'api_yomi', 'romaji'],
      id: 'api_id',
      shouldSort: true,
    }
    this.fuse = new Fuse(values(props.ships), options)
  }

  state = {
    query: '',
    type: 'all',
    startLevel: 1,
    nextExp: exp[2] - exp[1],
  }

  componentWillReceiveProps = (nextProps) => {
    this.fuse.setCollection(values(nextProps.ships))
  }

  shouldComponentUpdate = nextProps =>
    nextProps.open || this.props.open !== nextProps.open

  handleQueryChange = (e) => {
    this.setState({
      query: e.target.value,
    })
  }

  handleTypeChange = value => async () => {
    await this.setState({
      type: value,
    })
    if (this.selection) {
      this.selection.scrollTop = 0
    }
  }

  handleClear = () => {
    this.setState({
      query: '',
    })
  }

  handleSelect = id => async () => {
    this.props.handleRootClose()
    this.props.onSelect(id)
  }

  handleStartLevelChange = (e) => {
    const startLevel = +e.target.value
    this.setState({
      startLevel,
      nextExp: (exp[startLevel + 1] || 0) - exp[startLevel],
    })
  }

  handleNextExpChange = (e) => {
    this.setState({
      nextExp: +e.target.value,
    })
  }

  handleConfirmCustom = () => {
    const { startLevel, nextExp } = this.state
    this.props.handleRootClose()
    this.props.onSelect(0, startLevel, nextExp)
  }

  render() {
    const {
      query, type, startLevel, nextExp,
    } = this.state
    const {
      open, handleRootClose, ships, fleetMap,
    } = this.props

    const filtered = this.fuse.search(query)
    return (
      <RootCloseWrapper
        disabled={!open}
        onRootClose={handleRootClose}
        event="click"
      >
        <ul className="dropdown-menu pull-right">
          <div>
            <FormGroup>
              <InputGroup>
                <FormControl
                  type="text"
                  value={query}
                  placeholder={__('Search')}
                  onChange={this.handleQueryChange}
                />
                <InputGroup.Button>
                  <Button onClick={this.handleClear} bsStyle="danger">{__('Clear')}</Button>
                </InputGroup.Button>
              </InputGroup>
            </FormGroup>

            <div className="ship-select">
              <RadioCheck
                options={searchOptions}
                value={type}
                label={__('Ship Type')}
                onChange={this.handleTypeChange}
              />
              {
                type === 'custom' &&
                <div className="selection">
                  <div style={{ paddingLeft: '8px', paddingRight: '8px' }}>
                    <FormGroup>
                      <ControlLabel>{__('Starting level')}</ControlLabel>
                      <FormControl
                        type="number"
                        value={startLevel}
                        onChange={this.handleStartLevelChange}
                      />
                    </FormGroup>
                    <FormGroup>
                      <ControlLabel>{__('To next')}</ControlLabel>
                      <FormControl
                        type="number"
                        value={nextExp}
                        onChange={this.handleNextExpChange}
                      />
                    </FormGroup>
                    <Button bsStyle="primary" onClick={this.handleConfirmCustom}>{__('Confirm')}</Button>
                  </div>
                </div>
              }
              {
                type !== 'custom' &&
                <div className="selection" ref={(ref) => { this.selection = ref }}>
                  {
                    _(ships)
                    .filter(
                      ship => type !== 'fleet' || ship.api_id in fleetMap
                    )
                    .filter(
                      ship => !catMap[type] || (catMap[type] || []).includes(ship.api_stype)
                    )
                    .filter(
                      ship => !query || (filtered || []).includes(String(ship.api_id))
                    )
                    .sortBy([
                      ship => (filtered || []).indexOf(String(ship.api_id)),
                      ship => type !== 'fleet' || fleetMap[ship.api_id] || 0,
                      ship => -ship.api_lv,
                      ship => -get(ship, ['api_exp', 0], 0),
                    ])
                    .map(
                      ship => (
                        <div
                          className="select-item"
                          role="button"
                          tabIndex="0"
                          key={ship.api_id}
                          onClick={this.handleSelect(ship.api_id)}
                        >
                          {
                            ship.api_id in fleetMap &&
                            <Label>{fleetMap[ship.api_id]}</Label>
                          }
                          Lv.{ship.api_lv} {window.i18n.resources.__(ship.api_name || '')}
                        </div>
                      )
                    )
                    .value()
                  }
                </div>
              }
            </div>
          </div>
        </ul>
      </RootCloseWrapper>
    )
  }
})

const ShipDropdown = connect(
  state => ({
    active: get(extensionSelectorFactory('poi-plugin-exp-calc')(state), 'active', ''),
  }),
)(class ShipDropdown extends PureComponent {
  constructor(props) {
    super(props)
    this.handleRootClose = this._handleRootClose.bind(this)
  }

  state = {
    open: false,
  }

  handleToggle = (isOpen) => {
    if (isOpen !== this.state.open) {
      this.setState({ open: isOpen })
    }
  }

  _handleRootClose = () => {
    this.setState({ open: false })
  }

  render() {
    const {
      open,
    } = this.state
    const {
      ship = {}, onSelect,
    } = this.props
    return (
      <Dropdown id="exp-calc-ship" open={open} onToggle={this.handleToggle}>
        <Dropdown.Toggle>
          <FA name="list" />
        </Dropdown.Toggle>
        <Menu bsRole="menu" open={open} onSelect={onSelect} handleRootClose={this.handleRootClose} />
      </Dropdown>
    )
  }
})

export default ShipDropdown
