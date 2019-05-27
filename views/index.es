import React, { useState, useEffect } from 'react'
import { Dialog } from 'views/components/etc/overlay'
import styled from 'styled-components'
import { observe } from 'redux-observers'
import { store } from 'views/create-store'
import { Button, Classes, Intent } from '@blueprintjs/core'
import { useTranslation } from 'react-i18next'

import { dataObserver } from '../reducer'
import ShipExp from './exp'
import Data from './data'

const PluginContainer = styled.div`
  padding: 1ex 1em;
`

const DataDialog = styled(Dialog)`
  width: fit-content;
  height: fit-content;
  max-height: 90vh;
`

let unsubscribe

const ExpCalc = () => {
  const [isOpen, setIsOpen] = useState(false)
  useEffect(() => {
    unsubscribe = observe(store, [dataObserver])

    return () => unsubscribe()
  }, [])

  const { t } = useTranslation('poi-plugin-exp-calc')

  return (
    <div>
      <PluginContainer>
        <ShipExp />
        <Button minimal intent={Intent.PRIMARY} onClick={() => setIsOpen(true)}>
          {t('View Data')}
        </Button>
        <DataDialog
          isOpen={isOpen}
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
