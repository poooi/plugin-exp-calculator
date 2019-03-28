import React, { useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { range } from 'lodash'
import FA from 'react-fontawesome'

import MapSelect from '../select/map'
import ResultTable from './table'
import { expLevel, EXP_BY_POI_DB, expPercent } from '../../constants'

const Selection = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`

const SelectionItem = styled.div`
  font-size: 150%;
  width: 30px;
  height: 30px;
  text-align: center;
  line-height: 30px;
  transition: 0.3s;
  font-weight: ${props => props.checked && 500};
  background: ${props => props.checked && props.theme.BLUE5};
`

const Divider = styled.div`
  margin: 0 1em;
`

const ResultSelection = ({ totalExp }) => {
  const [mapId, setMapId] = useState(0)
  const [mapExp, setMapExp] = useState(100)
  const [rank, setRank] = useState(0) // S victory

  const mapPercent = expPercent[rank]

  return (
    <>
      <Selection>
        <MapSelect
          onSelect={(id, exp = 100) => {
            setMapId(id)
            if (!id) {
              setMapExp(exp)
            }
          }}
          mapId={mapId}
          mapExp={mapExp}
        />
        <Divider>
          <FA name="times" />
        </Divider>
        {range(expLevel.length).map(idx => (
          <SelectionItem
            checked={rank === idx}
            role="button"
            tabIndex="0"
            value={idx}
            key={idx}
            onClick={() => setRank(idx)}
          >
            {expLevel[idx]}
          </SelectionItem>
        ))}
      </Selection>
      <ResultTable
        mapExp={mapId > 0 ? EXP_BY_POI_DB[mapId] || 100 : mapExp}
        mapPercent={mapPercent}
        totalExp={totalExp}
      />
    </>
  )
}

ResultSelection.propTypes = {
  totalExp: PropTypes.number.isRequired,
}

export default ResultSelection
