import { Button, EditableText, Intent } from '@blueprintjs/core'
import { find } from 'lodash'
import { useCallback, useState } from 'react'
import FA from 'react-fontawesome'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'

import type { SelectShipAction } from '../../state'

import { MAX_LEVEL, exp } from '../../constants'
import {
  expInfoSelectorFactory,
  remodelLvSelector,
  selectedShipIdSelector,
} from '../../selectors'
import { PLUGIN_KEY, SELECT_SHIP } from '../../state'
import LevelSelect from '../select/level'
import ShipSelect from '../select/ship'
import Result from './result'

const LevelSection = styled.div`
  font-size: 200%;
  display: flex;
  align-items: center;

  div:nth-child(2) {
    flex: 1;
    text-align: center;
  }

  div:last-child {
    text-align: right;
  }
`

const ExpProgress = styled.div<{ $percentage: number }>`
  display: flex;
  margin: 1ex 1em;
  padding: 0 4px;
  border: 1px solid ${(props) => props.theme.BLUE5};
  transform: skewX(-15deg);
  background: linear-gradient(
    90deg,
    ${(props) => props.theme.BLUE5} ${(props) => props.$percentage}%,
    rgba(0, 0, 0, 0) 0%
  );

  span {
    flex: 1;
  }

  span:last-child {
    text-align: right;
  }
`

const ExpCalc = () => {
  const { t } = useTranslation(PLUGIN_KEY)
  const dispatch = useDispatch()

  const id = useSelector(selectedShipIdSelector)
  const ship = useSelector(expInfoSelectorFactory(id))
  const remodelLvs = useSelector(remodelLvSelector)

  // the hand-entered ship, used whenever `id` is 0
  const [custom, setCustom] = useState({
    startLevel: 1,
    nextExp: exp[2] - exp[1],
  })
  const [endLevel, setEndLevel] = useState(MAX_LEVEL)
  const [lockGoal, setLockGoal] = useState(false)

  // Picking a different ship retargets the goal at its next remodel level,
  // unless the goal is locked. Adjusted during render rather than in an effect
  // so the new goal lands in the same paint as the new ship. Seeded with the
  // custom ship's 0 so mounting with a ship already selected targets it too.
  const [previousId, setPreviousId] = useState(0)
  if (previousId !== id) {
    setPreviousId(id)
    if (!lockGoal) {
      const level = ship?.api_lv ?? 0
      const shipId = ship?.api_ship_id ?? 0
      setEndLevel(find(remodelLvs[shipId], (lv) => lv > level) ?? MAX_LEVEL)
    }
  }

  const handleShipSelect = useCallback(
    (nextId: number, startLevel?: number, nextExp?: number) => {
      dispatch({ type: SELECT_SHIP, id: nextId } satisfies SelectShipAction)
      if (nextId === 0 && startLevel !== undefined && nextExp !== undefined) {
        setCustom({ startLevel, nextExp })
      }
    },
    [dispatch],
  )

  const handleEndLevelConfirm = useCallback((value: string) => {
    const level = Number(value)
    if (Number.isInteger(level) && level > 0 && level <= MAX_LEVEL) {
      setEndLevel(level)
    }
  }, [])

  const startLevel = id > 0 && ship ? ship.api_lv : custom.startLevel
  const nextExp = id > 0 && ship ? (ship.api_exp?.[1] ?? 0) : custom.nextExp
  const totalExp =
    id > 0 && ship
      ? exp[endLevel] - (ship.api_exp?.[0] ?? 0)
      : exp[endLevel] - exp[startLevel + 1] + nextExp

  const percentage = Math.round(
    ((exp[endLevel] - totalExp) / exp[endLevel]) * 100,
  )

  const levels =
    id > 0 && ship
      ? (remodelLvs[ship.api_ship_id] ?? []).filter((lv) => lv > ship.api_lv)
      : [99, MAX_LEVEL]

  return (
    <div>
      <div>
        <div>
          <ShipSelect
            onSelect={handleShipSelect}
            text={
              id > 0 && ship
                ? t(ship.api_name || 'Unknown', { ns: 'resources' })
                : t('Custom')
            }
          />
        </div>
        <LevelSection>
          <div>Lv.{startLevel || 1}</div>
          <div>
            <FA name="arrow-right" />
          </div>

          <div>
            Lv.
            {/* remounted on `endLevel` change so a goal set elsewhere shows up */}
            <EditableText
              key={endLevel}
              defaultValue={String(endLevel)}
              selectAllOnFocus
              onConfirm={handleEndLevelConfirm}
            />
            <LevelSelect onSelect={setEndLevel} levels={levels} />
            <Button
              intent={lockGoal ? Intent.SUCCESS : Intent.PRIMARY}
              onClick={() => setLockGoal((locked) => !locked)}
              minimal
            >
              <FA name={lockGoal ? 'lock' : 'unlock'} />
            </Button>
          </div>
        </LevelSection>
        <ExpProgress $percentage={percentage}>
          <span>
            {t('Next')} {nextExp}
          </span>
          <span>
            {t('Remaining')} {totalExp}
          </span>
        </ExpProgress>
      </div>
      <div>
        <Result totalExp={totalExp} />
      </div>
    </div>
  )
}

export default ExpCalc
