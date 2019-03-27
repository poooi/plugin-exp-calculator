import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { range } from 'lodash'
import FA from 'react-fontawesome'

import MapSelect from '../select/map'
import { expLevel } from '../../constants'

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

const ResultSelection = ({ rank, text, onRankChange, onMapSelect }) => {
  return (
    <Selection>
      <MapSelect onSelect={onMapSelect} text={text} />
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
          onClick={onRankChange(idx)}
        >
          {expLevel[idx]}
        </SelectionItem>
      ))}
    </Selection>
  )
}

ResultSelection.propTypes = {
  rank: PropTypes.number.isRequired,
  onRankChange: PropTypes.func.isRequired,
  onMapSelect: PropTypes.func.isRequired,
  text: PropTypes.string.isRequired,
}

export default ResultSelection
