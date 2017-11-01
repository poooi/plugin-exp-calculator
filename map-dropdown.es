import React, { Component, PureComponent } from 'react'
import propTypes from 'prop-types'
import { connect } from 'react-redux'
import { Dropdown, Label } from 'react-bootstrap'
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
  shouldComponentUpdate = nextProps =>
    nextProps.open || this.props.open !== nextProps.open

  handleSelect = mapId => () => this.props.onSelect(mapId)

  render() {
    const {
      open, handleRootClose, maps,
    } = this.props
    return (
      <RootCloseWrapper
        disabled={!open}
        onRootClose={handleRootClose}
        event="click"
      >
        <ul className="dropdown-menu pull-right" id="exp-calc-map-menu" style={{ left: 'initial', right: 0 }}>
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
                    {
                      world.api_no > 4 &&
                        <Label>EO</Label>
                    }
                    {`${world.api_maparea_id}-${world.api_no} ${world.api_name}`}
                  </div>
                )
              )
              .value()
            }
          </div>
        </ul>
      </RootCloseWrapper>
    )
  }
})

class MapDropdown extends PureComponent {
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
