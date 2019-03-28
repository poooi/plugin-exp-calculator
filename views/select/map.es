import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { map } from 'lodash'
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
  FormGroup,
} from '@blueprintjs/core'
import styled from 'styled-components'
import FA from 'react-fontawesome'
import cls from 'classnames'
import { withTranslation } from 'react-i18next'
import { compose } from 'redux'

import { mapDataSelctor } from '../../selectors'
import { frequentMaps } from '../../constants'

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

const MapDropdown = compose(
  withTranslation('poi-plugin-exp-calc'),
  connect(state => ({
    maps: mapDataSelctor(state),
  })),
)(
  class MapDropdown extends Component {
    static propTypes = {
      maps: PropTypes.objectOf(PropTypes.object).isRequired,
      onSelect: PropTypes.func.isRequired,
      t: PropTypes.func.isRequired,
      mapId: PropTypes.number.isRequired,
      mapExp: PropTypes.number.isRequired,
    }

    state = {
      exp: 100,
    }

    handleSelect = mapId => () => this.props.onSelect(mapId)

    handleCustomExpChange = value => this.setState({ exp: value })

    handleSetCustomExp = () => this.props.onSelect(0, this.state.exp)

    render() {
      const { maps, t, mapId, mapExp } = this.props
      const { exp } = this.state

      const current = maps[mapId] || {}

      const text =
        mapId > 0
          ? `${current.api_maparea_id}-${current.api_no} ${current.api_name}`
          : `${t('Custom')}: ${mapExp}`

      return (
        <Popover position={Position.BOTTOM} minimal>
          <Button minimal>
            <FA name="map" /> {text}
          </Button>
          <div>
            <FormGroup inline label={t('Custom Exp')}>
              <ControlGroup fill>
                <NumericInput
                  value={exp}
                  onValueChange={this.handleCustomExpChange}
                />
                <Button
                  onClick={this.handleSetCustomExp}
                  intent={Intent.PRIMARY}
                  className={Classes.POPOVER_DISMISS}
                >
                  {t('Confirm')}
                </Button>
              </ControlGroup>
            </FormGroup>
            <ButtonGroup minimal>
              {map(frequentMaps, id => (
                <Button
                  intent={Intent.PRIMARY}
                  key={id}
                  onClick={this.handleSelect(id)}
                  className={Classes.POPOVER_DISMISS}
                >
                  {Math.floor(id / 10)}-{id % 10}
                </Button>
              ))}
            </ButtonGroup>
            <MapList>
              {map(maps, world => (
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
              ))}
            </MapList>
          </div>
        </Popover>
      )
    }
  },
)

export default MapDropdown
