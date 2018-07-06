import React, { Component, PureComponent } from 'react'
import propTypes from 'prop-types'
import { Dropdown } from 'react-bootstrap'
import _ from 'lodash'
import { RootCloseWrapper } from 'react-overlays'
import FA from 'react-fontawesome'

class Menu extends Component {
  static propTypes = {
    open: propTypes.bool.isRequired,
    onSelect: propTypes.func.isRequired,
    handleRootClose: propTypes.func.isRequired,
    levels: propTypes.arrayOf(propTypes.number).isRequired,
  }

  shouldComponentUpdate = nextProps =>
    nextProps.open || this.props.open !== nextProps.open

  handleSelect = lv => () => this.props.onSelect(lv)

  render() {
    const { open, handleRootClose, levels } = this.props
    return (
      <RootCloseWrapper
        disabled={!open}
        onRootClose={handleRootClose}
        event="click"
      >
        <ul
          className="dropdown-menu pull-right"
          style={{ left: 'initial', right: 0 }}
        >
          <div className="selection">
            {_(levels)
              .map(level => (
                <div
                  className="select-item"
                  role="button"
                  tabIndex="0"
                  key={level}
                  onClick={this.handleSelect(level)}
                >
                  {level}
                </div>
              ))
              .value()}
          </div>
        </ul>
      </RootCloseWrapper>
    )
  }
}

class LevelDropdown extends PureComponent {
  static propTypes = {
    onSelect: propTypes.func.isRequired,
    levels: propTypes.arrayOf(propTypes.number).isRequired,
  }

  constructor(props) {
    super(props)
    this.handleRootClose = this._handleRootClose.bind(this)
  }

  state = {
    open: false,
  }

  handleToggle = isOpen => {
    if (isOpen !== this.state.open) {
      this.setState({ open: isOpen })
    }
  }

  _handleRootClose = () => {
    this.setState({ open: false })
  }

  render() {
    const { open } = this.state
    const { onSelect, levels } = this.props
    return (
      <Dropdown
        id="exp-calc-level"
        open={open}
        onToggle={this.handleToggle}
        pullRight
      >
        <Dropdown.Toggle bsSize="small">
          <FA name="star" />
        </Dropdown.Toggle>
        <Menu
          bsRole="menu"
          open={open}
          onSelect={onSelect}
          handleRootClose={this.handleRootClose}
          levels={levels}
        />
      </Dropdown>
    )
  }
}

export default LevelDropdown
