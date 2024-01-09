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
  Intent,
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
      <Popover
        minimal
        position={Position.BOTTOM}
        content={
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
        }
      >
        <Button minimal intent={Intent.PRIMARY}>
          <FA name="star" />
        </Button>
      </Popover>
    )
  }
}

export default LevelDropdown
