import { Button, Classes, Intent } from '@blueprintjs/core'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { observe } from 'redux-observers'
import styled from 'styled-components'
import { Dialog } from 'views/components/etc/overlay'
import { store } from 'views/create-store'

import { dataObserver } from '../reducer'
import { PLUGIN_KEY } from '../state'
import Data from './data'
import ShipExp from './exp'

const PluginContainer = styled.div`
  padding: 1ex 1em;
`

const DataDialog = styled(Dialog)`
  width: fit-content;
  height: fit-content;
  max-height: 90vh;
`

const ExpCalc = () => {
  const [isOpen, setIsOpen] = useState(false)

  // persist this plugin's slice of the store back to disk on every change
  useEffect(() => observe(store, [dataObserver]), [])

  const { t } = useTranslation(PLUGIN_KEY)

  return (
    <div>
      <PluginContainer>
        <ShipExp />
        <Button minimal intent={Intent.PRIMARY} onClick={() => setIsOpen(true)}>
          {t('View Data')}
        </Button>
        <DataDialog
          isOpen={isOpen}
          // Blueprint's own focus-trap prop, not the DOM `autofocus` attribute
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          canOutsideClickClose
          onClose={() => setIsOpen(false)}
          title={t('Data')}
        >
          <div className={Classes.DIALOG_BODY}>
            <Data />
          </div>
        </DataDialog>
      </PluginContainer>
    </div>
  )
}

export default ExpCalc
