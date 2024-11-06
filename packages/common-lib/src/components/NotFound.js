import React from 'react'
import IconByName from './IconByName'
import Loading from './Loading'
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <Loading
      icon={
        <IconByName
          name={'SearchEyeLineIcon'}
          color={'primary'}
          _icon={{ size: '50' }}
        />
      }
      message={t("NO_RESULT_FOUND")}
    />
  )
}
