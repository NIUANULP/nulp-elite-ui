import { post, get, update as coreUpdate } from '../RestClient'

//  Get all content
export const getAllLearners = async (url, filters = {}, header = {}) => {
  const result = await post(url, filters, header)
  if (result) {
    return result
  } else {
    return []
  }
}
// Get  one content

export const getOne = async (url, header = {}) => {
  const result = await get(url, {
    header
  })
  if (result) {
    return result
  } else {
    return []
  }
}

// Update content
export const update = async (data = {}, headers = {}) => {
  const result = await coreUpdate(url, data, {
    headers
  })
  if (result) {
    return result
  } else {
    return {}
  }
}
