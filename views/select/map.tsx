import {
  Button,
  ButtonGroup,
  Classes,
  ControlGroup,
  FormGroup,
  Intent,
  NumericInput,
  Popover,
  Position,
  Tag,
} from '@blueprintjs/core'
import cls from 'classnames'
import { useState } from 'react'
import FA from 'react-fontawesome'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import styled from 'styled-components'

import { frequentMaps } from '../../constants'
import { mapDataSelector } from '../../selectors'
import { PLUGIN_KEY } from '../../state'

const MapList = styled.ul`
  padding: 0;
  margin: 0;
  max-height: 20em;
  overflow: scroll;

  ::-webkit-scrollbar {
    width: 1em;
  }

  ::-webkit-scrollbar-thumb {
    background: ${(props) => props.theme.BLUE1};
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

interface MapDropdownProps {
  mapId: number
  mapExp: number
  /** `mapId` of 0 means the custom exp in `exp` is used instead of a real map. */
  onSelect: (mapId: number, exp?: number) => void
}

const MapDropdown = ({ mapId, mapExp, onSelect }: MapDropdownProps) => {
  const maps = useSelector(mapDataSelector)
  const { t } = useTranslation(PLUGIN_KEY)

  const [exp, setExp] = useState(100)

  const current = maps[mapId]

  const text =
    mapId > 0 && current
      ? `${current.api_maparea_id}-${current.api_no} ${current.api_name}`
      : `${t('Custom')}: ${mapExp}`

  return (
    <Popover
      position={Position.BOTTOM}
      minimal
      content={
        <div>
          <FormGroup inline label={t('Custom Exp')}>
            <ControlGroup fill>
              <NumericInput value={exp} onValueChange={setExp} />
              <Button
                onClick={() => onSelect(0, exp)}
                intent={Intent.PRIMARY}
                className={Classes.POPOVER_DISMISS}
              >
                {t('Confirm')}
              </Button>
            </ControlGroup>
          </FormGroup>
          <ButtonGroup minimal>
            {frequentMaps.map((id) => (
              <Button
                intent={Intent.PRIMARY}
                key={id}
                onClick={() => onSelect(id)}
                className={Classes.POPOVER_DISMISS}
              >
                {Math.floor(id / 10)}-{id % 10}
              </Button>
            ))}
          </ButtonGroup>
          <MapList>
            {Object.values(maps).map((world) => (
              <MapItem
                role="button"
                tabIndex={0}
                key={world.api_id}
                onClick={() => onSelect(world.api_id)}
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
      }
    >
      <Button minimal intent={Intent.PRIMARY}>
        <FA name="map" /> {text}
      </Button>
    </Popover>
  )
}

export default MapDropdown
