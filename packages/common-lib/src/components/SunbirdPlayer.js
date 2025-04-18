import { VStack } from 'native-base'
import React from 'react'
import IconByName from './IconByName'
import { H2 } from './layout/HeaderTags'

const SunbirdPlayer = ({
  public_url,
  setTrackData,
  handleExitButton,
  width,
  height,
  telemetryData,
  ...props
}) => {
  console.log('props----', props)
  const { mimeType } = props
  let trackData = []
  const [url, setUrl] = React.useState()
  const questionListUrl =
    window.location.origin != 'http://localhost:3000'
      ? `${window.location.origin}/api/question/v1/list`
      : 'https://devnulp.niua.org/api/question/v1/list'
  React.useEffect(() => {
    if (mimeType === 'application/pdf') {
      setUrl(`/pdf`)
    } else if (['video/mp4', 'video/webm'].includes(mimeType)) {
      setUrl(`/video`)
    } else if (['application/vnd.sunbird.questionset'].includes(mimeType)) {
      setUrl(`/quml`)
    } else if (
      [
        'application/vnd.ekstep.ecml-archive',
        'application/vnd.ekstep.html-archive',
        'application/vnd.ekstep.content-collection',
        'application/vnd.ekstep.h5p-archive',
        'video/x-youtube',
        'application/epub'
      ].includes(mimeType)
    ) {
      setUrl(`/content-player`)
    }
  }, [mimeType])

  React.useEffect(() => {
    const fetchData = () => {
      console.log('url-------------------', url)
      if ([`/content-player`, `/quml`, `/pdf`, `/video`].includes(url)) {
        window.addEventListener(
          'message',
          (event) => {
            handleEvent(event)
            console.log('event-------------------', event)
          },
          false
        )
      }
    }
    fetchData()
    return () => {
      if ([`/content-player`, `/quml`, `/pdf`, `/video`].includes(url)) {
        window.removeEventListener('message', (val) => {})
      }
    }
  }, [url])

  const handleEvent = (event) => {
    const data = event?.data
    let telemetry = {}
    if (data && typeof data?.data === 'string') {
      telemetry = JSON.parse(data.data)
    } else if (data && typeof data === 'string') {
      telemetry = JSON.parse(data)
    } else if (data?.eid) {
      telemetry = data
    }
    telemetryData(telemetry)

    if (telemetry?.eid === 'EXDATA') {
      try {
        const edata = JSON.parse(telemetry.edata?.data)
        if (edata?.statement?.result) {
          trackData = [...trackData, edata?.statement]
        }
      } catch (e) {
        console.log('telemetry format h5p is wrong', e.message)
      }
    }
    if (telemetry?.eid === 'ASSESS') {
      const edata = telemetry?.edata
      if (trackData.find((e) => e?.item?.id === edata?.item?.id)) {
        const filterData = trackData.filter(
          (e) => e?.item?.id !== edata?.item?.id
        )
        trackData = [
          ...filterData,
          {
            ...edata,
            sectionName: props?.children?.find(
              (e) => e?.identifier === telemetry?.edata?.item?.sectionId
            )?.name
          }
        ]
      } else {
        trackData = [
          ...trackData,
          {
            ...edata,
            sectionName: props?.children?.find(
              (e) => e?.identifier === telemetry?.edata?.item?.sectionId
            )?.name
          }
        ]
      }
      // console.log(telemetry, trackData)
    } else if (
      telemetry?.eid === 'INTERACT' &&
      mimeType === 'video/x-youtube'
    ) {
      // const edata = telemetry?.edata
      // trackData = [...trackData, edata]
    } else if (telemetry?.eid === 'END') {
      const summaryData = telemetry?.edata
      if (summaryData?.summary && Array.isArray(summaryData?.summary)) {
        const score = summaryData.summary.find((e) => e['score'])
        if (score?.score) {
          setTrackData({ score: score?.score, trackData })
        } else {
          setTrackData(telemetry?.edata)
          console.log('end event---', event)
          // handleExitButton()
        }
      } else {
        setTrackData(telemetry?.edata)
      }
    } else if (
      telemetry?.eid === 'IMPRESSION' &&
      telemetry?.edata?.pageid === 'summary_stage_id'
    ) {
      setTrackData(trackData)
    } else if (['INTERACT', 'HEARTBEAT'].includes(telemetry?.eid)) {
      if (
        telemetry?.edata?.id === 'exit' ||
        telemetry?.edata?.type === 'EXIT'
      ) {
        console.log('interact event---', event)

        // handleExitButton()
      }
    }
  }

  if (url) {
    return (
      <VStack {...{ width, height }}>
        {/* <IconByName
          name='CloseCircleLineIcon'
          onPress={() => {
            if (mimeType === 'application/vnd.ekstep.h5p-archive') {
              handleEvent({
                data: {
                  eid: 'IMPRESSION',
                  edata: { pageid: 'summary_stage_id' }
                }
              })
            }
            handleExitButton()
          }}
          position='absolute'
          zIndex='10'
          right='15px'
          top='-50px'
          _icon={{ size: 40 }}
          bg='white'
          p='0'
          rounded='full'
        /> */}
        <iframe
          style={{ border: 'none' }}
          id='preview'
          height={'100%'}
          width='100%'
          name={JSON.stringify({
            ...props,
            questionListUrl: questionListUrl
            // questionListUrl: `${process.env.REACT_APP_API_URL}/course/questionset`
          })}
          src={`${public_url ? public_url : process.env.PUBLIC_URL}${url}`}
        />
      </VStack>
    )
  } else {
    return <H2>{`${mimeType} this mime type not compatible`}</H2>
  }
}

export default React.memo(SunbirdPlayer)
