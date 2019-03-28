import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import { HTMLTable, EditableText, Switch } from '@blueprintjs/core'
import { connect } from 'react-redux'
import { map, get } from 'lodash'
import { useTranslation } from 'react-i18next'
import { extensionSelectorFactory } from 'views/utils/selectors'

import { mapDataSelctor } from '../selectors'
import { EXP_BY_POI_DB } from '../constants'

const PluginContainer = styled.div`
  padding: 1ex 1em;
`

const Table = styled(HTMLTable)`
  margin: 0 auto;

  thead th {
    color: #fff;
    position: sticky;
    top: -4px;

    :nth-child(1) {
      background: ${props => props.theme.BLUE5};
    }

    :nth-child(2) {
      background: ${props => props.theme.BLUE4};
    }

    :nth-child(3),
    :nth-child(4) {
      background: ${props => props.theme.BLUE3};
    }

    :nth-child(5) {
      background: ${props => props.theme.BLUE2};
    }
  }
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
  enablePernsonalStat: get(
    state.config,
    'plugin.expCalc.enablePersonalStat',
    true,
  ),
}))(({ maps, stats, enablePernsonalStat }) => {
  const { t } = useTranslation('poi-plugin-exp-calc')

  return (
    <div>
      <Switch
        checked={enablePernsonalStat}
        onChange={() =>
          config.set('plugin.expCalc.enablePersonalStat', !enablePernsonalStat)
        }
      >
        {t('Use personal statistics data (if samples are more than 30)')}
      </Switch>
      <Table interactive>
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
      </Table>
    </div>
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
