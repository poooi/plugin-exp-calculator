import React, { Component, PureComponent } from 'react'
import propTypes from 'prop-types'
import { connect } from 'react-redux'
import { Dropdown, Label, FormGroup, InputGroup, FormControl, Button } from 'react-bootstrap'
import _ from 'lodash'
import { RootCloseWrapper } from 'react-overlays'
import FA from 'react-fontawesome'

import { mapDataSelctor } from './selectors'

const { i18n } = window
const __ = i18n['poi-plugin-exp-calc'].__.bind(i18n['poi-plugin-exp-calc'])

const Menu = connect(
  state => ({
    maps: mapDataSelctor(state),
  })
)(class Menu extends Component {
  static propTypes = {
    maps: propTypes.objectOf(propTypes.object).isRequired,
    open: propTypes.bool.isRequired,
    handleRootClose: propTypes.func.isRequired,
    onSelect: propTypes.func.isRequired,
  }

  state = {
    exp: 100,
  }

  shouldComponentUpdate = nextProps =>
    nextProps.open || this.props.open !== nextProps.open

  handleSelect = mapId => () => this.props.onSelect(mapId)

  handleCustomExpChange = (e) => this.setState({ exp: e.target.value })

  handleSetCustomExp = () => this.props.onSelect(0, this.state.exp)

  render() {
    const {
      open, handleRootClose, maps,
    } = this.props
    const { exp } = this.state
    return (
      <RootCloseWrapper
        disabled={!open}
        onRootClose={handleRootClose}
        event="click"
      >
        <ul className="dropdown-menu pull-right" id="exp-calc-map-menu" style={{ left: 'initial', right: 0 }}>
          <div>
            <FormGroup>
              <InputGroup>
                <FormControl
                  type="number"
                  value={exp}
                  placeholder={__('Custom Exp')}
                  onChange={this.handleCustomExpChange}
                />
                <InputGroup.Button>
                  <Button onClick={this.handleSetCustomExp} bsStyle="primary">{__('Confirm')}</Button>
                </InputGroup.Button>
              </InputGroup>
            </FormGroup>
            <div className="selection">
              {
                _(maps)
                .filter(world => world.api_id < 63)
                .map(
                  world => (
                    <div
                      className="select-item"
                      role="button"
                      tabIndex="0"
                      key={world.api_id}
                      onClick={this.handleSelect(world.api_id)}
                    >
                      {`${world.api_maparea_id}-${world.api_no}  ${world.api_name}`}
                      {
                        world.api_no > 4 &&
                          <Label>EO</Label>
                      }
                    </div>
                  )
                )
                .value()
              }
            </div>
          </div>
        </ul>
      </RootCloseWrapper>
    )
  }
})

class MapDropdown extends PureComponent {
  static propTypes = {
    onSelect: propTypes.func.isRequired,
  }

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
      onSelect,
    } = this.props
    return (
      <Dropdown id="exp-calc-map" open={open} onToggle={this.handleToggle} pullRight>
        <Dropdown.Toggle bsSize="small">
          <FA name="map" />
        </Dropdown.Toggle>
        <Menu bsRole="menu" open={open} onSelect={onSelect} handleRootClose={this.handleRootClose} />
      </Dropdown>
    )
  }
}

export default MapDropdown
