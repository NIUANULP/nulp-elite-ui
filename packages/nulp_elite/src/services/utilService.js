import axios from "axios";
import { useState } from "react";
const urlConfig = require("../configs/urlConfig.json");


export const userId = () => {
  const userIdElement = document.getElementById("userId");
  const userId = userIdElement ? userIdElement.value : "";
  return userId;
};

export const userSid = () => {
  const userSidElement = document.getElementById("userSid");
  const userSid = userSidElement ? userSidElement.value : "";
  return userSid;
};

export const sessionId = () => {
  const sessionIdElement = document.getElementById("sessionId");
  const sessionId = sessionIdElement ? sessionIdElement.value : "";
  return sessionId;
};

export const setCourseOrigin = () => {
  sessionStorage.setItem("courseOrigin", location.pathname + location.search);
};

export const userData=()=>{
  const userIdElement = document.getElementById("userId");
  const userId = userIdElement ? userIdElement.value : "";
    const url = `${urlConfig.URLS.LEARNER_PREFIX}${urlConfig.URLS.USER.GET_PROFILE}${userId}?fields=${urlConfig.params.userReadParam.fields}s`;

  const resopnse=axios.get(url);
  return resopnse;
}
