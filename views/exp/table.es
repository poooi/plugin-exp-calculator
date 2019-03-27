import React from 'react'
import PropTypes from 'prop-types'
import { HTMLTable } from '@blueprintjs/core'
import { useTranslation } from 'react-i18next'
import { range } from 'lodash'
import styled from 'styled-components'

import { expClass } from '../../constants'

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
`

const ResultTable = ({ mapExp, mapPercent, totalExp }) => {
  const baseExp = mapExp * mapPercent
  const baseCount = Math.max(totalExp / baseExp, 0)
  const counts = [
    baseCount,
    baseCount / 1.5,
    baseCount / 2.0,
    baseCount / 3.0,
  ].map(Math.ceil)
  const perBattle = [baseExp, baseExp * 1.5, baseExp * 2.0, baseExp * 3.0].map(
    Math.floor,
  )

  const { t } = useTranslation('poi-plugin-exp-calc')

  return (
    <Wrapper>
      <HTMLTable interactive>
        <thead>
          <tr>
            <th />
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
}

ResultTable.propTypes = {
  mapExp: PropTypes.number.isRequired,
  mapPercent: PropTypes.number.isRequired,
  totalExp: PropTypes.number.isRequired,
}

export default ResultTable