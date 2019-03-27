import React from 'react'
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
        {map(maps, world => (
          <tr key={world.api_id}>
            <td>
              {world.api_maparea_id}-{world.api_no} {world.api_name}
            </td>
            <td>{EXP_BY_POI_DB[`${world.api_maparea_id}${world.api_no}`]}</td>
            <td>
              {Math.floor(
                stats[`${world.api_maparea_id}${world.api_no}`]?.average || 0,
              )}
            </td>
            <td>
              {stats[`${world.api_maparea_id}${world.api_no}`]?.count || 0}
            </td>
            <td>
              <EditableText placeholder={t('Click to edit')} />
            </td>
          </tr>
        ))}
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
