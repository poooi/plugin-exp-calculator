import React, { Component } from 'react'
import propTypes from 'prop-types'
import { connect } from 'react-redux'
import _ from 'lodash'
import {
  Popover,
  Button,
  NumericInput,
  ControlGroup,
  Tag,
  ButtonGroup,
  Position,
  Intent,
  Classes,
} from '@blueprintjs/core'
import styled from 'styled-components'
import FA from 'react-fontawesome'
import cls from 'classnames'

import { mapDataSelctor } from '../../selectors'
import { frequentMaps } from '../../constants'

const { i18n } = window
const __ = i18n['poi-plugin-exp-calc'].__.bind(i18n['poi-plugin-exp-calc'])

const MapList = styled.ul`
  padding: 0;
  margin: 0;
  max-height: 20em;
  overflow: scroll;

  ::-webkit-scrollbar {
    width: 1em;
  }

  ::-webkit-scrollbar-thumb {
    background: ${props => props.theme.BLUE1};
    width: 1em;
  }

  span {
    cursor: pointer;
  }
`

const MapItem = styled.li`
  display: flex;
  padding: 0.5em 1em;
`

const MapId = styled.span`
  width: 3em;
`

const MapName = styled.span`
  flex: 1;
`

const MapDropdown = connect(state => ({
  maps: mapDataSelctor(state),
}))(
  class MapDropdown extends Component {
    static propTypes = {
      maps: propTypes.objectOf(propTypes.object).isRequired,
      onSelect: propTypes.func.isRequired,
      text: propTypes.string.isRequired,
    }

    state = {
      exp: 100,
    }

    handleSelect = mapId => () => this.props.onSelect(mapId)

    handleCustomExpChange = value => this.setState({ exp: value })

    handleSetCustomExp = () => this.props.onSelect(0, this.state.exp)

    render() {
      const { maps, text } = this.props
      const { exp } = this.state
      return (
        <Popover position={Position.BOTTOM} minimal>
          <Button>
            <FA name="map" /> {text}
          </Button>
          <div>
            <div>
              <ControlGroup fill>
                <NumericInput
                  value={exp}
                  placeholder={__('Custom Exp')}
                  onChange={this.handleCustomExpChange}
                />
                <Button
                  onClick={this.handleSetCustomExp}
                  intent={Intent.PRIMARY}
                  className={Classes.POPOVER_DISMISS}
                >
                  {__('Confirm')}
                </Button>
              </ControlGroup>
            </div>
            <ButtonGroup minimal>
              {_(frequentMaps)
                .map(mapId => (
                  <Button
                    intent={Intent.PRIMARY}
                    key={mapId}
                    onClick={this.handleSelect(mapId)}
                    className={Classes.POPOVER_DISMISS}
                  >
                    {Math.floor(mapId / 10)}-{mapId % 10}
                  </Button>
                ))
                .value()}
            </ButtonGroup>
            <MapList>
              {_(maps)
                .filter(world => world.api_id < 63)
                .map(world => (
                  <MapItem
                    role="button"
                    tabIndex="0"
                    key={world.api_id}
                    onClick={this.handleSelect(world.api_id)}
                    className={cls(Classes.POPOVER_DISMISS, Classes.MENU_ITEM)}
                  >
                    <MapId>
                      {world.api_maparea_id}-{world.api_no}
                    </MapId>
                    <MapName>{world.api_name}</MapName>
                    {world.api_no > 4 && <Tag intent={Intent.PRIMARY}>EO</Tag>}
                  </MapItem>
                ))
                .value()}
            </MapList>
          </div>
        </Popover>
      )
    }
  },
)

export default MapDropdown
