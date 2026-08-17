import { HTMLTable, Intent, Tag } from '@blueprintjs/core'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import styled from 'styled-components'

import { expClass } from '../../constants'
import {
  enablePersonalStatSelector,
  overrideSelector,
  statsSelector,
} from '../../selectors'
import { PLUGIN_KEY } from '../../state'

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
`

const emptyStat = { count: 0, average: 0 }

/** Exp multipliers of the four flagship / MVP combinations. */
const expClassScales = [1, 1.5, 2.0, 3.0]

interface ResultTableProps {
  /** Base exp of the selected map, or the hand-entered value when `mapId` is 0. */
  mapExp: number
  /** Battle rank multiplier. */
  mapPercent: number
  /** Exp still needed to reach the goal level. */
  totalExp: number
  mapId: number
}

const ResultTable = ({
  mapExp,
  mapPercent,
  totalExp,
  mapId,
}: ResultTableProps) => {
  const enablePersonalStat = useSelector(enablePersonalStatSelector)
  const override = useSelector(overrideSelector)
  const stats = useSelector(statsSelector)

  const { t } = useTranslation(PLUGIN_KEY)

  const mapKey = String(mapId)
  const personalStat = stats[mapKey] ?? emptyStat
  const mapOverride = Number(override[mapKey])

  // a hand-entered override wins, then a large enough personal sample, then the
  // poi DB figure that came in via `mapExp`
  let finalMapExp = mapExp
  let signal = 'Poi DB'

  if (!mapId) {
    signal = 'Fixed'
  } else if (mapOverride) {
    finalMapExp = mapOverride
    signal = 'Custom'
  } else if (enablePersonalStat && personalStat.count > 30) {
    finalMapExp = personalStat.average
    signal = 'Personal'
  }

  const baseExp = finalMapExp * mapPercent
  const baseCount = Math.max(totalExp / baseExp, 0)

  return (
    <Wrapper>
      <HTMLTable interactive>
        <thead>
          <tr>
            <th>
              <Tag intent={Intent.PRIMARY} minimal>
                {t(signal)}
              </Tag>
            </th>
            <th>{t('Per attack')}</th>
            <th>{t('Remainder')}</th>
          </tr>
        </thead>
        <tbody>
          {expClass.map((name, idx) => (
            <tr key={name}>
              <td>{t(name)}</td>
              <td>{Math.floor(baseExp * expClassScales[idx])}</td>
              <td>{Math.ceil(baseCount / expClassScales[idx])}</td>
            </tr>
          ))}
        </tbody>
      </HTMLTable>
    </Wrapper>
  )
}

export default ResultTable
