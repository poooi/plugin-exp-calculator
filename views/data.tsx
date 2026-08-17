import { EditableText, HTMLTable, Switch } from '@blueprintjs/core'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'

import type { OverrideExpAction } from '../state'

import { EXP_BY_POI_DB } from '../constants'
import {
  enablePersonalStatSelector,
  mapDataSelector,
  overrideSelector,
  statsSelector,
} from '../selectors'
import { OVERRIDE_EXP, PLUGIN_KEY } from '../state'

const PluginContainer = styled.div`
  max-height: 80vh;
  overflow: scroll;

  ::-webkit-scrollbar {
    height: 16px;
    width: 16px;
  }

  ::-webkit-scrollbar-thumb {
    background: ${(props) => props.theme.BLUE1};
    height: 16px;
    width: 16px;
  }
`

const Table = styled(HTMLTable)`
  margin: 0 auto;
  white-space: nowrap;

  thead th {
    color: #fff;
    position: sticky;
    top: 0;

    :nth-child(1) {
      background: ${(props) => props.theme.BLUE5};
    }

    :nth-child(2) {
      background: ${(props) => props.theme.BLUE4};
    }

    :nth-child(3),
    :nth-child(4) {
      background: ${(props) => props.theme.BLUE3};
    }

    :nth-child(5) {
      background: ${(props) => props.theme.BLUE2};
    }
  }
`

interface CustomExpInputProps {
  mapId: string
  exp: string
}

/**
 * Uncontrolled on purpose: the committed value lives in the store, and the
 * `key` in the parent remounts this to pick up a value changed elsewhere.
 */
const CustomExpInput = ({ mapId, exp }: CustomExpInputProps) => {
  const dispatch = useDispatch()
  const { t } = useTranslation(PLUGIN_KEY)

  const onConfirm = useCallback(
    (value: string) => {
      const num = Number(value)

      if (value === '' || Number.isNaN(num) || num < 0) {
        return
      }
      dispatch({ type: OVERRIDE_EXP, mapId, value } satisfies OverrideExpAction)
    },
    [dispatch, mapId],
  )

  return (
    <EditableText
      selectAllOnFocus
      onConfirm={onConfirm}
      defaultValue={exp}
      placeholder={t('Click to edit')}
    />
  )
}

const ExpTable = () => {
  const maps = useSelector(mapDataSelector)
  const stats = useSelector(statsSelector)
  const override = useSelector(overrideSelector)
  const enablePersonalStat = useSelector(enablePersonalStatSelector)

  const { t } = useTranslation(PLUGIN_KEY)

  return (
    <div>
      <Switch
        checked={enablePersonalStat}
        onChange={() =>
          window.config.set(
            'plugin.expCalc.enablePersonalStat',
            !enablePersonalStat,
          )
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
          {Object.values(maps).map((world) => {
            const mapId = `${world.api_maparea_id}${world.api_no}`
            const customExp = String(override[mapId] ?? '')

            return (
              <tr key={world.api_id}>
                <td>
                  {world.api_maparea_id}-{world.api_no} {world.api_name}
                </td>
                <td>{EXP_BY_POI_DB[Number(mapId)]}</td>
                <td>{Math.floor(stats[mapId]?.average || 0)}</td>
                <td>{stats[mapId]?.count || 0}</td>
                <td>
                  <CustomExpInput
                    key={customExp}
                    mapId={mapId}
                    exp={customExp}
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </Table>
    </div>
  )
}

const Data = () => (
  <PluginContainer>
    <ExpTable />
  </PluginContainer>
)

export default Data
