import { schoolRegisteryService, userRegistryService } from '..'
import mapInterfaceData from './mapInterfaceData'
import { post } from './RestClient'

const apiRoutes = {
  getAll: '/mentortracking/search'
}

const interfaceData = {
  mentorTrackingId: 'mentorTrackingId',
  mentorId: 'mentorId',
  teacherId: 'teacherId',
  schoolId: 'schoolId',
  scheduleVisitDate: 'scheduleVisitDate',
  visitDate: 'visitDate',
  feedback: 'feedback',
  status: 'status',
  lastVisited: 'lastVisited'
}

let only = Object.keys(interfaceData)

export const getAllAllocatedSchools = async (
  { limit, ...params } = {},
  header = {}
) => {
  let headers = {
    ...header,
    headers: {
      ...header.header,
      Authorization: 'Bearer ' + sessionStorage.getItem('token')
    }
  }
  const result = await post(
    process.env.REACT_APP_API_URL + apiRoutes.getAll,
    null,
    {
      headers,
      params
    }
  )

  if (result?.data?.data) {
    return await getData(result?.data?.data)
  } else {
    return []
  }
}

const getData = async (data) => {
  return await Promise.all(data.map(async (item) => await getDataOne(item)))
}

const getDataOne = async (object) => {
  let data = {},
    teacherData = {},
    mentorData = {}
  const item = mapInterfaceData(object, interfaceData)
  data = await schoolRegisteryService.getSchoolById({
    id: item.schoolId
  })
  teacherData = await userRegistryService.getAll({
    userId: { eq: item.teacherId }
  })
  mentorData = await userRegistryService.getAll({
    userId: { eq: item.mentorId }
  })

  return {
    ...item,
    schoolData: data,
    teacherData: teacherData[0],
    mentorData: mentorData[0]
  }
}
