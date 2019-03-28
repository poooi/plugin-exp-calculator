import React from 'react'
import { HTMLTable, Tag, Intent } from '@blueprintjs/core'
import { useTranslation } from 'react-i18next'
import { range, get } from 'lodash'
import styled from 'styled-components'
import { connect } from 'react-redux'
import { extensionSelectorFactory } from 'views/utils/selectors'

import { expClass } from '../../constants'

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
`

const emptyStat = { count: 0, average: 0 }

const ResultTable = connect((state, { mapId }) => ({
  enablePernsonalStat: get(
    state.config,
    'plugin.expCalc.enablePersonalStat',
    true,
  ),
  override: get(
    extensionSelectorFactory('poi-plugin-exp-calc')(state),
    ['override', mapId],
    '',
  ),
  personalStat: get(
    extensionSelectorFactory('poi-plugin-exp-calc')(state),
    ['stats', mapId],
    emptyStat,
  ),
}))(
  ({
    mapExp,
    mapPercent,
    totalExp,
    enablePernsonalStat,
    override,
    personalStat,
    mapId,
  }) => {
    let finalMapExp = mapExp
    let signal = 'Poi DB'

    if (mapId) {
      if (override && +override) {
        finalMapExp = +override
        signal = 'Custom'
      } else if (enablePernsonalStat && personalStat.count > 30) {
        finalMapExp = personalStat.average
        signal = 'Personal'
      }
    }

    const baseExp = finalMapExp * mapPercent
    const baseCount = Math.max(totalExp / baseExp, 0)
    const counts = [
      baseCount,
      baseCount / 1.5,
      baseCount / 2.0,
      baseCount / 3.0,
    ].map(Math.ceil)
    const perBattle = [
      baseExp,
      baseExp * 1.5,
      baseExp * 2.0,
      baseExp * 3.0,
    ].map(Math.floor)

    const { t } = useTranslation('poi-plugin-exp-calc')

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
            {range(expClass.length).map(idx => (
              <tr key={idx}>
                <td>{t(expClass[idx])}</td>
                <td>{perBattle[idx]}</td>
                <td>{counts[idx]}</td>
              </tr>
            ))}
          </tbody>
        </HTMLTable>
      </Wrapper>
    )
  },
)

export default ResultTable
