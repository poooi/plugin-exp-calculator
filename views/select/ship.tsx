import type { ReactNode } from 'react'

import {
  Button,
  Classes,
  FormGroup,
  InputGroup,
  Intent,
  NumericInput,
  Popover,
  Position,
  Tab,
  Tabs,
  Tag,
} from '@blueprintjs/core'
import cls from 'classnames'
import Fuse from 'fuse.js'
import { padEnd, sortBy } from 'lodash'
import { useMemo, useState } from 'react'
import FA from 'react-fontawesome'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import styled from 'styled-components'

import type { ShipExpData } from '../../poi-types'

import { exp, shipCat } from '../../constants'
import { shipExpDataSelector, shipFleetMapSelector } from '../../selectors'
import { PLUGIN_KEY } from '../../state'
import { bpClass } from '../../styles'

const catMap: Record<string, number[] | undefined> = Object.fromEntries(
  shipCat.map(({ name, id }) => [name, id]),
)

const searchOptions = [
  {
    name: 'Fleet',
    value: 'fleet',
  },
  {
    name: 'All',
    value: 'all',
  },
  ...shipCat.map(({ name }) => ({ name, value: name })),
]

const Wrapper = styled.div`
  ${bpClass('-tab-panel')} {
    margin-top: 0;
  }
`

const CustomShip = styled.div`
  width: 20em;
  height: 30em;
  padding: 0.5em 1em;
`

const ShipList = styled.ul`
  padding: 0;
  margin: 0;
  height: 30em;
  overflow: scroll;
  width: 20em;

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

const ShipItem = styled.li`
  display: flex;
  padding: 0.5em 1em;
`

const ShipLv = styled.span`
  width: 3em;
`

const ShipName = styled.span`
  flex: 1;
`

interface ShipDropdownProps {
  text: ReactNode
  /**
   * Called with a ship's api_id, or with `0` plus a hand-entered level and
   * to-next-level exp for the custom ship.
   */
  onSelect: (id: number, startLevel?: number, nextExp?: number) => void
}

const Menu = ({ onSelect }: Pick<ShipDropdownProps, 'onSelect'>) => {
  const ships = useSelector(shipExpDataSelector)
  const fleetMap = useSelector(shipFleetMapSelector)
  const { t } = useTranslation(PLUGIN_KEY)

  const [query, setQuery] = useState('')
  const [startLevel, setStartLevel] = useState(1)
  const [nextExp, setNextExp] = useState(exp[2] - exp[1])

  const shipList = useMemo(
    () => Object.values(ships).filter((ship): ship is ShipExpData => !!ship),
    [ships],
  )

  const fuse = useMemo(
    () =>
      new Fuse(shipList, {
        keys: ['api_name', 'api_yomi', 'romaji'],
        shouldSort: true,
      }),
    [shipList],
  )

  /** api_ids matching the query, best match first, or null when not searching. */
  const matchedIds = useMemo(
    () => (query ? fuse.search(query).map(({ item }) => item.api_id) : null),
    [fuse, query],
  )

  const handleStartLevelChange = (level: number) => {
    setStartLevel(level)
    setNextExp((exp[level + 1] || 0) - exp[level])
  }

  return (
    <Wrapper>
      <InputGroup
        value={query}
        placeholder={t('Search')}
        onChange={(e) => setQuery(e.target.value)}
        rightElement={
          <Button minimal onClick={() => setQuery('')} intent={Intent.WARNING}>
            <FA name="times" />
          </Button>
        }
      />

      <Tabs vertical id="ship-selection" renderActiveTabPanelOnly>
        <Tab
          id="custom"
          title={t('Custom')}
          panel={
            <CustomShip>
              <FormGroup label={t('Starting Level')}>
                <NumericInput
                  value={startLevel}
                  onValueChange={handleStartLevelChange}
                />
              </FormGroup>
              <FormGroup label={t('To next')}>
                <NumericInput value={nextExp} onValueChange={setNextExp} />
              </FormGroup>
              <Button
                intent={Intent.PRIMARY}
                onClick={() => onSelect(0, startLevel, nextExp)}
                className={Classes.POPOVER_DISMISS}
              >
                {t('Confirm')}
              </Button>
            </CustomShip>
          }
        />
        {searchOptions.map(({ name, value: type }) => (
          <Tab
            key={type}
            id={type}
            title={t(name)}
            panel={
              <ShipList>
                {sortBy(
                  shipList
                    .filter(
                      (ship) => type !== 'fleet' || ship.api_id in fleetMap,
                    )
                    .filter(
                      (ship) =>
                        !catMap[type] || catMap[type]!.includes(ship.api_stype),
                    )
                    .filter(
                      (ship) => !matchedIds || matchedIds.includes(ship.api_id),
                    ),
                  [
                    (ship) => matchedIds?.indexOf(ship.api_id) ?? 0,
                    // the fleet tab lists ships in fleet order, flagship first
                    (ship) =>
                      type === 'fleet' ? fleetMap[ship.api_id].fleetId : 0,
                    (ship) =>
                      type === 'fleet' ? fleetMap[ship.api_id].index : 0,
                    (ship) => -ship.api_lv,
                    (ship) => -(ship.api_exp?.[0] ?? 0),
                  ],
                ).map((ship) => (
                  <ShipItem
                    key={ship.api_id}
                    onClick={() => onSelect(ship.api_id)}
                    className={cls(Classes.POPOVER_DISMISS, Classes.MENU_ITEM)}
                  >
                    <ShipLv>Lv.{padEnd(String(ship.api_lv), 4)}</ShipLv>
                    <ShipName>
                      {t(ship.api_name || '', { ns: 'resources' })}
                    </ShipName>
                    {ship.api_id in fleetMap && (
                      <Tag intent={Intent.PRIMARY}>
                        {fleetMap[ship.api_id].fleetId}
                      </Tag>
                    )}
                  </ShipItem>
                ))}
              </ShipList>
            }
          />
        ))}
      </Tabs>
    </Wrapper>
  )
}

// separate menu from popover component to prevent unnecessary updates
const ShipDropdown = ({ text, onSelect }: ShipDropdownProps) => (
  <Popover
    position={Position.BOTTOM}
    minimal
    content={<Menu onSelect={onSelect} />}
  >
    <Button minimal intent={Intent.PRIMARY}>
      <FA name="list" /> {text}
    </Button>
  </Popover>
)

export default ShipDropdown
