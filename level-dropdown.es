import React, { PureComponent } from 'react'
import propTypes from 'prop-types'
import _ from 'lodash'
import FA from 'react-fontawesome'
import {
  Popover,
  Position,
  Button,
  ButtonGroup,
  Classes,
} from '@blueprintjs/core'

class LevelDropdown extends PureComponent {
  static propTypes = {
    onSelect: propTypes.func.isRequired,
    levels: propTypes.arrayOf(propTypes.number).isRequired,
  }

  handleSelect = lv => () => this.props.onSelect(lv)

  render() {
    const { levels } = this.props
    return (
      <Popover minimal position={Position.BOTTOM}>
        <Button>
          <FA name="star" />
        </Button>
        <div>
          <ButtonGroup minimal />
          {_(levels)
            .map(level => (
              <Button
                minimal
                key={level}
                onClick={this.handleSelect(level)}
                className={Classes.POPOVER_DISMISS}
              >
                {level}
              </Button>
            ))
            .value()}
        </div>
      </Popover>
    )
  }
}

export default LevelDropdown
