import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import { HTMLTable, EditableText } from '@blueprintjs/core'
import { connect } from 'react-redux'
import { map, get } from 'lodash'
import { useTranslation } from 'react-i18next'
import { extensionSelectorFactory } from 'views/utils/selectors'

import { mapDataSelctor } from '../selectors'
import { EXP_BY_POI_DB } from '../constants'

const PluginContainer = styled.div`
  padding: 1ex 1em;
`

const CustomExpInput = connect((state, { mapId }) => ({
  exp: get(
    extensionSelectorFactory('poi-plugin-exp-calc')(state),
    ['override', mapId],
    '',
  ),
}))(({ exp, dispatch, mapId }) => {
  const [expValue, setValue] = useState(exp)

  const { t } = useTranslation('poi-plugin-exp-calc')

  const onConfirm = useCallback(
    value => {
      const num = +value

      if (Number.isNaN(num) || num < 0) {
        setValue(exp)
        return
      }
      dispatch({ type: '@@poi-plugin-exp-calc@override-exp', mapId, value })
    },
    [dispatch, setValue, mapId, exp],
  )

  return (
    <EditableText
      selectAllOnFocus
      onConfirm={onConfirm}
      onChange={value => setValue(value)}
      value={expValue}
      placeholder={t('Click to edit')}
    />
  )
})

const ExpTable = connect(state => ({
  maps: mapDataSelctor(state),
  stats: get(extensionSelectorFactory('poi-plugin-exp-calc')(state), 'stats'),
}))(({ maps, stats }) => {
  const { t } = useTranslation('poi-plugin-exp-calc')

  return (
    <HTMLTable interactive>
      <thead>
        <tr>
          <th>{t('Map')}</th>
          <th>{t('Poi DB')}</th>
          <th>{t('Stat')}</th>
          <th>{t('Samples')}</th>
          <th>{t('Custom')}</th>
        </tr>
      </thead>
      <tbody>
        {map(maps, world => {
          const mapId = `${world.api_maparea_id}${world.api_no}`

          return (
            <tr key={world.api_id}>
              <td>
                {world.api_maparea_id}-{world.api_no} {world.api_name}
              </td>
              <td>{EXP_BY_POI_DB[mapId]}</td>
              <td>{Math.floor(stats[mapId]?.average || 0)}</td>
              <td>{stats[mapId]?.count || 0}</td>
              <td>
                <CustomExpInput mapId={mapId} />
              </td>
            </tr>
          )
        })}
      </tbody>
    </HTMLTable>
  )
})

const Data = () => {
  return (
    <PluginContainer>
      <ExpTable />
    </PluginContainer>
  )
}

export default Data
