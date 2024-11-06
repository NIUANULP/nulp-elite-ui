import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Footer from "components/Footer";
import Header from "components/header";
import Container from "@mui/material/Container";
import FloatingChatIcon from "../../components/FloatingChatIcon";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import { useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { getAllContents } from "services/contentService";
import TodayOutlinedIcon from "@mui/icons-material/TodayOutlined";
import AccessAlarmsOutlinedIcon from "@mui/icons-material/AccessAlarmsOutlined";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import AdjustOutlinedIcon from "@mui/icons-material/AdjustOutlined";
import * as util from "../../services/utilService";
const EventDetailResponse = require("./detail.json");
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import ToasterCommon from "../ToasterCommon";
import Modal from "@mui/material/Modal";
import axios from "axios";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";

import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
const consenttext = require("../../configs/consent.json");
const urlConfig = require("../../configs/urlConfig.json");
const designations = require("../../configs/designations.json");
// const recording = require("../../assets/eventRecording.json");

import {
  FacebookShareButton,
  WhatsappShareButton,
  LinkedinShareButton,
  TwitterShareButton,
  FacebookIcon,
  WhatsappIcon,
  LinkedinIcon,
  TwitterIcon,
} from "react-share";
import AddConnections from "pages/connections/AddConnections";
// import { Button } from "native-base";
import { maxWidth } from "@shiksha/common-lib";
const EventDetails = () => {
  // const { eventId } = useParams();
  const location = useLocation();
  const queryString = location.search;
  let eventId = queryString.startsWith("?do_") ? queryString.slice(1) : null;
  // Check if eventId ends with '=' and remove it
  if (eventId && eventId.endsWith("=")) {
    eventId = eventId.slice(0, -1);
  }
  const _userId = util.userId();

  const shareUrl = window.location.href; // Current page URL
  const [toasterMessage, setToasterMessage] = useState("");
  const [toasterOpen, setToasterOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);
  const [detailData, setDetailDate] = useState();
  const [userCourseData, setUserCourseData] = useState({});
  const [userInfo, setUserInfo] = useState();
  const [creatorInfo, setCreatorInfo] = useState();
  const [batchData, setBatchData] = useState();
  const [canEnroll, setCanEnroll] = useState(false);
  const [canJoin, setCanJoin] = useState();
  const [eventVisibility, setEventVisibility] = useState();

  const [isRecorded, setIsRecorded] = useState();
  const [eventEnded, setEventEnded] = useState();
  const [userData, setUserData] = useState(null);

  const [isEnrolled, setIsEnrolled] = useState();
  const [showEnrollmentSnackbar, setShowEnrollmentSnackbar] = useState(false);
  const [showUnEnrollmentSnackbar, setUnShowEnrollmentSnackbar] =
    useState(false);

  const [isRegStart, setIsRegStart] = useState();
  const [regEnd, setRegEnd] = useState();
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    designation: "",
    organisation: "",
  });
  const [consent, setConsent] = useState(consenttext);
  const [emailError, setEmailError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [designationsList, setDesignationsList] = useState([]);
  const [isChecked, setIsChecked] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [recording, setRecording] = useState();
  const [isAllreadyFilledRegistation,setIsAlreadyFilledRegistration] = useState(true)
  const [isExpired , setIsExpired] = useState(false)
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const handleCheckboxChange = (event) => {
    setIsChecked(event.target.checked);
  };
  const { t } = useTranslation();
  const showErrorMessage = (msg) => {
    setToasterMessage(msg);
    setTimeout(() => {
      setToasterMessage("");
    }, 2000);
    setToasterOpen(true);
  };

  useEffect(() => {
    setDesignationsList(designations);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 767);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const unixTimestampToHumanDate = (unixTimestamp) => {
    const dateObject = new Date(unixTimestamp);
    const options = { day: "2-digit", month: "long", year: "numeric" };
    return dateObject.toLocaleDateString("en-GB", options);
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = () => {
    if (!validateEmail(formData.email)) {
      setEmailError(true);
      return;
    }

    if (eventVisibility && eventVisibility === "Public") {
      enrollEvent();
      handleCloseConsentModal();
    } else if (eventVisibility && eventVisibility === "Private") {
      updateRegisterEvent(formData);
      handleCloseConsentModal();
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (name === "email") {
      setEmailError(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const uservData = await util.userData();
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    "& .MuiDialogContent-root": {
      padding: theme.spacing(2),
    },
    "& .MuiDialogActions-root": {
      padding: theme.spacing(1),
    },
  }));

  useEffect(() => {
    fetchUserData();
    const fetchData = async () => {
      try {
        const url = `${urlConfig.URLS.CUSTOM_EVENT.READ_BY_ID}?eventId=${eventId}`;
        const response = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          showErrorMessage(t("FAILED_TO_FETCH_DATA"));
          throw new Error(t("FAILED_TO_FETCH_DATA"));
        }
        const data = await response.json();
       
        setEventVisibility(data.result.event.eventVisibility);
        setDetailDate(data.result.event);
        getUserData(data.result.event.owner, "creator");
        fetchBatchData(data.result.event);
        handleEnrollUnenrollBtn(
          data.result.event.registrationStartDate,
          data.result.event.registrationEndDate
        );
        handleJoinEventBtn(
          data.result.event.startDate,
          data.result.event.startTime,
          data.result.event.endDate,
          data.result.event.endTime
        );

    const isExpired = checkIfExpired(data.result.event.registrationEndDate,data.result.event.endTime);
    setIsExpired(isExpired);

      } catch (error) {
        console.error("Error fetching course data:", error);
        showErrorMessage(t("FAILED_TO_FETCH_DATA"));
      }
    };

    fetchData();
    // fetchBatchData();
  }, [eventId]);

const checkIfExpired = (registrationEndDate, endTime) => {
  const regEndDateTime = new Date(registrationEndDate);
  const regEndDate = new Date(registrationEndDate);
  regEndDate.setHours(0, 0, 0, 0); 

  const currentDateTime = new Date();
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0); 

  console.log(regEndDate.toDateString(), "regEndDate");
  console.log(currentDate.toDateString(), "currentDate");

  if (currentDate > regEndDate) {
    return true; 
  }

  if (currentDateTime.toDateString() === regEndDateTime.toDateString()) {
     if (formatTimeWithTimezone(currentDateTime) > endTime) {
      return true;
    }

    console.log(regEndDate, "endDateTime with time");

  }

  return false; 
};

const formatTimeWithTimezone = (date) => {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  const timezoneOffset = date.getTimezoneOffset(); // in minutes
  const absOffset = Math.abs(timezoneOffset);
  const offsetHours = String(Math.floor(absOffset / 60)).padStart(2, "0");
  const offsetMinutes = String(absOffset % 60).padStart(2, "0");
  const sign = timezoneOffset <= 0 ? "+" : "-"; // If negative, it's ahead of UTC, so use "+"

  return `${hours}:${minutes}:${seconds}${sign}${offsetHours}:${offsetMinutes}`;
};




  useEffect(() => {
    getUserData(_userId, "loggedIn");
    fetchMyEvents();
    getEventRecording();
    // checkEnrolledCourse();
  }, [_userId, eventId]);

  const fetchBatchData = async (data) => {
    let enrollmentType = data.eventVisibility === "Public" ? "open" : "invite-only";

    try {
      const url = `${urlConfig.URLS.LEARNER_PREFIX}${urlConfig.URLS.BATCH.GET_BATCHS}`;
      const response = await axios.post(url, {
        request: {
          filters: {
            courseId: eventId,
            enrollmentType,
          },
          sort_by: {
            createdDate: "desc",
          },
        },
      });

      const { result } = response.data;
      const { response: batchResponse } = result;

      if (batchResponse && batchResponse.count === 0) {
        showErrorMessage(t("This course has no active Batches"));
      } else if (batchResponse?.content?.length > 0) {
        const [batchDetails] = batchResponse.content;
        setBatchData({
          startDate: batchDetails.startDate,
          endDate: batchDetails.endDate,
          enrollmentEndDate: batchDetails.enrollmentEndDate,
          batchId: batchDetails.batchId,
        });
      } else {
        console.error("Batch data not found in response");
      }
    } catch (error) {
      console.error("Error fetching batch data:", error);
      showErrorMessage(t("FAILED_TO_FETCH_DATA"));
    }
  };

  const fetchMyEvents = async () => {
    setIsLoading(true);
    setError(null);
    const _userId = util.userId();
    let data = JSON.stringify({
      request: {
        filters: { user_id: _userId },
        limit: 10,
        sort_by: { created_at: "desc" },
        offset: 0,
      },
    });
    const headers = {
      "Content-Type": "application/json",
    };
    try {
  const url = `${urlConfig.URLS.CUSTOM_EVENT.CUSTOM_ENROLL_LIST}`;
  const response = await getAllContents(url, data, headers);
  
  const userRegistrationData = response.data.result.userRegistration;

  setUserCourseData(userRegistrationData);

  if (userRegistrationData.length > 0) {
    userRegistrationData.forEach((event) => {
      if (event.event_id === eventId) {
        
        setIsEnrolled(true);
        
        if (event.designation === null || event.organisation === null || event.user_consent === null) {
          setIsAlreadyFilledRegistration(false);
        }
      }
    });
  }
} 
 catch (error) {
      showErrorMessage(t("FAILED_TO_FETCH_DATA"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1); // Navigate back in history
  };

  const formatTimeToIST = (timeString) => {
    // Check if the timeString is a full date-time string
    let dateObject = new Date(timeString);

    // If it is not a valid date, assume it is just a time string (e.g., "14:30")
    if (isNaN(dateObject.getTime())) {
      const [hours, minutes] = timeString.split(":");
      dateObject = new Date();
      dateObject.setHours(hours);
      dateObject.setMinutes(minutes);
      dateObject.setSeconds(0);
    }

    // Convert the date to IST
    const options = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    };
    return dateObject.toLocaleTimeString("en-GB", options);
  };
  const getUserData = async (userId, userType) => {
    try {
      const url = `${urlConfig.URLS.LEARNER_PREFIX}${urlConfig.URLS.USER.GET_PROFILE}${userId}?fields=${urlConfig.params.userReadParam.fields}`;

      const response = await fetch(url);
      const data = await response.json();
      if (userType == "loggedIn") {
        setUserInfo(data.result.response);
      } else if (userType == "creator") {
        setCreatorInfo(data.result.response);
      }
    } catch (error) {
      console.error("Error while getting user data:", error);
      showErrorMessage(t("FAILED_TO_FETCH_DATA"));
    }
  };

  const enrollEvent = async () => {
    try {
      const url = `${urlConfig.URLS.LEARNER_PREFIX}${urlConfig.URLS.COURSE.ENROLL_USER_COURSE}`;
      const requestBody = {
        request: {
          courseId: detailData.identifier,
          userId: _userId,
          batchId: batchData?.batchId,
        },
      };
      const response = await axios.post(url, requestBody);
      if (response.status === 200) {
        setIsEnrolled(true);

        setShowEnrollmentSnackbar(true);
        registerEvent(formData, detailData);
      } else {
      }
    } catch (error) {
      console.error("Error enrolling in the course:", error);
      showErrorMessage(t("FAILED_TO_ENROLL_INTO_COURSE"));
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setShowEnrollmentSnackbar(false);
    setUnShowEnrollmentSnackbar(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const managePublicPrivateEvent = (button) => {
    if (eventVisibility && eventVisibility === "Public" && button === "reg") {
      handleOpenConsentModal();
    } else if (
      eventVisibility &&
      eventVisibility === "Private" &&
      button === "join" && !isAllreadyFilledRegistation 
    ) {
      handleOpenConsentModal();
    } else if (
      eventVisibility &&
      eventVisibility === "Private" &&
      button === "join" && isEnrolled && isAllreadyFilledRegistation
    ) {
      attendWebinar();
    } else if (
      eventVisibility &&
      eventVisibility === "Public" &&
      button === "join"
    ) {
      attendWebinar();
    } else if (
      eventVisibility &&
      eventVisibility === "Private" &&
      button === "reg"
    ) {
      showErrorMessage("Can not Register to this event as it is private");
    }
  };

  const handleEnrollUnenrollBtn = (enrollmentStart, enrollmentEnd) => {
    const todayDate = new Date();
    const stripTime = (date) => {
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    };
    const strippedTodayDate = stripTime(todayDate);
    const strippedEnrollmentStartDate = stripTime(new Date(enrollmentStart));
    const strippedEnrollmentEndDate = stripTime(new Date(enrollmentEnd));
    if (
      strippedEnrollmentStartDate <= strippedTodayDate &&
      strippedEnrollmentEndDate >= strippedTodayDate
    ) {
      setCanEnroll(true);
    } else {
      setCanEnroll(false);
      if (strippedEnrollmentStartDate > strippedTodayDate) {
        setIsRegStart(false);
      }
      if (strippedEnrollmentEndDate < strippedTodayDate) {
        setRegEnd(true);
      }
    }
  };
  const handleJoinEventBtn = async (startDate, startTime, endDate, endTime) => {
    // Helper function to combine date and time into a full Date object
    const combineDateTime = (date, time) => {
      return new Date(`${date}T${time}`);
    };

    // Current date and time
    const todayDate = new Date();

    // Combined start and end Date objects
    const startDateTime = combineDateTime(startDate, startTime);
    const endDateTime = combineDateTime(endDate, endTime);


    // Check if the current date and time is within the event period
    // if (startDateTime <= todayDate && endDateTime >= todayDate) {
    //   console.log("can Join");
    //   setCanJoin(true);
    // } else {
    //   console.log("can not Join");
    //   setCanJoin(false);
    // }

    const startDateTimeNew = startDateTime.getTime();
    const endDateTimeNew = endDateTime.getTime(); // Assuming you have endDateTime
    const todayDateNew = new Date().getTime();

    const tenMinutesBeforeStart = startDateTimeNew - 10 * 60 * 1000;
  

    if (
      todayDateNew >= tenMinutesBeforeStart &&
      todayDateNew <= endDateTimeNew
    ) {
      setCanJoin(true);
    } else {
      setCanJoin(false);
    }

    // Check if the event has ended
    if (endDateTime <= todayDate) {
      setEventEnded(true);
      setIsRecorded(true);
    }
  };

  const attendWebinar = async () => {
    const url = detailData.onlineProviderData.meetingLink; // Replace with your URL
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleOpenConsentModal = async () => {
    try {
      // Wait for the user to join the course
      setIsConsentModalOpen(true); // Open the consent form after joining the course
    } catch (error) {
      console.error("Error:------------", error);
    }
  };
  // useEffect(() => {
  //   if (detailData) {
  //     handleEnrollUnenrollBtn(
  //       detailData.registrationStartDate,
  //       detailData.registrationEndDate
  //     );
  //   }
  // }, [detailData]);

  // Function to close the consent form modal
  const handleCloseConsentModal = () => {
    setIsConsentModalOpen(false);
  };

  const registerEvent = async (formData) => {
    const url = `${urlConfig.URLS.CUSTOM_EVENT.REGISTER}`;

    const RequestBody = {
      event_id: detailData?.identifier,
      name: formData?.name,
      user_id: _userId,
      email: formData?.email,
      designation: formData?.designation,
      organisation: formData?.organisation,
      // certificate: formData.certificate,
      user_consent: "true",
      consentForm: consent?.consent,
    };

    try {
      const response = await axios.post(url, RequestBody);
      // Handle the response if needed
    } catch (error) {
      // Handle the error if needed
    }
  };

  const updateRegisterEvent = async (formData) => {
    const url = `${urlConfig.URLS.CUSTOM_EVENT.UPDATE_REGISTER}?event_id=${detailData.identifier}&user_id=${_userId}`;

    const RequestBody = {
      name: formData?.name,
      email: formData?.email,
      designation: formData?.designation,
      organisation: formData?.organisation,
      // certificate: formData.certificate,
      user_consent: "true",
      consent_form: consent?.consent,
    };

    try {
      const response = await axios.put(url, RequestBody);
    
    if (response?.data?.responseCode === "OK") {

      setIsAlreadyFilledRegistration(true);
    } else {
      console.error("Failed to update registration", response.data);
    }
  } catch (error) {
    console.error("Error updating registration", error);
  }
};

  const unEnroll = async (formData) => {
    try {
      const url = `${urlConfig.URLS.LEARNER_PREFIX}${urlConfig.URLS.COURSE.UNENROLL_USER_COURSE}`;
      const requestBody = {
        request: {
          courseId: detailData.identifier,
          userId: _userId,
          batchId: batchData?.batchId,
        },
      };
      const response = await axios.post(url, requestBody);
      if (response.status === 200) {
        setIsEnrolled(false);
        setIsAlreadyFilledRegistration(true)

        try {
          const response = await axios.delete(
            `${urlConfig.URLS.CUSTOM_EVENT.UNREGISTER}?event_id=${detailData.identifier}&user_id=${_userId}`
          );
          if (response.status === 200) {
            setToasterMessage("Unregisterd successfully");
            fetchPolls();
            setPoll((prevPolls) => {
              const updatedPolls = prevPolls.filter(
                (poll) => poll.poll_id !== pollId
              );
              return updatedPolls;
            });
          }
        } catch (error) {
          console.error("Error deleting poll", error);
        }

        setUnShowEnrollmentSnackbar(true);
        // registerEvent(formData, detailData);
      } else {
      }
    } catch (error) {
      console.error("Error enrolling in the course:", error);
      showErrorMessage(t("FAILED_TO_ENROLL_INTO_COURSE"));
    }
  };

  const getEventRecording = async () => {
    try {
      const url= `${urlConfig.URLS.CUSTOM_EVENT_FETCH_RECORDINGS}` + eventId;
      const response = await axios.get(url);
      setRecording(response.data);
    } catch (error) {
      console.error("Error fetching recording:", error);
    }
  };

  return (
    <div>
      <Header />
      {toasterMessage && <ToasterCommon response={toasterMessage} />}
      <Box>
      <Snackbar
        open={showEnrollmentSnackbar}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={handleSnackbarClose}
          severity="success"
          sx={{ mt: 2 }}
        >
          {t("ENROLLMENT_SUCCESS_MESSAGE")}
        </MuiAlert>
      </Snackbar>
      <Snackbar
        open={showUnEnrollmentSnackbar}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={handleSnackbarClose}
          severity="success"
          sx={{ mt: 2 }}
        >
          {t("UNENROLLMENT_SUCCESS_MESSAGE")}
        </MuiAlert>
      </Snackbar>
      {detailData && (
        <Container
          className=" xs-pb-20 mt-12 mb-38"
          style={{
            maxWidth: "100%",
          }}
        >
          <Breadcrumbs
            aria-label="breadcrumb"
            className="h6-title mt-15 pl-28 xss-pb-0"
            style={{ padding: "0 0 10px 0px" }}
          >
            <Link
              underline="hover"
              style={{ maxHeight: "inherit" }}
              onClick={handleGoBack}
              color="#004367"
              href="/webapp/allevents"
            >
              {t("ALL_WEBINARS")}
            </Link>
            <Link
              underline="hover"
              href=""
              aria-current="page"
              className="h6-title oneLineEllipsis"
            >
              {detailData.name}
            </Link>
          </Breadcrumbs>
          <Grid
            container
            spacing={2}
            className="bg-whitee custom-event-container mb-20 custom-container mb-38"
          >
            <Grid item xs={12} md={6} lg={2}>
              <img
                src={
                  detailData.appIcon
                    ? detailData.appIcon
                    : require("assets/default.png")
                }
                className="eventCardImg"
                alt="App Icon"
              />
            </Grid>
            <Grid item xs={12} md={6} lg={6} className="lg-pl-60">
              <Typography
                gutterBottom
                className="mt-10  h1-title mb-20"
              >
                {detailData.name}
              </Typography>
              <Box
                className="h5-title mb-20 xs-hide"
                style={{ fontWeight: "400" }}
              >
                National Urban Learning Platform{" "}
              </Box>
              <Box className="d-flex mb-20 alignItems-center xs-hide">
                {creatorInfo &&
                  (creatorInfo.firstName || creatorInfo.lastName) && (
                    <Box className="d-flex mb-20 alignItems-center">
                      <Box className="h5-title">Organised By:</Box>
                      <Box className="d-flex alignItems-center pl-20">
                        <Box className="event-text-circle"></Box>
                        <Box className="h5-title">
                          {detailData.eventOrganisedBy || detailData.eventOrganisedby}
                        </Box>
                      </Box>
                    </Box>
                  )}
              </Box>

              <Box className="d-flex mb-20 h3-custom-title xs-hide">
                <Box className="d-flex alignItems-center pr-5">
                  <TodayOutlinedIcon className="h3-custom-title pr-5" />
                  {formatDate(detailData.startDate)}
                </Box>
                <Box className="d-flex alignItems-center pl-10 pr-5">
                  <AccessAlarmsOutlinedIcon className="h3-custom-title pr-5" />
                  {formatTimeToIST(detailData.startTime)}
                </Box>
                <Box className="mx-10">To</Box>
                <Box className="d-flex alignItems-center pl-5 pr-5">
                  <TodayOutlinedIcon className="h3-custom-title pr-5" />
                  {formatDate(detailData.endDate)}
                </Box>
                <Box className="d-flex alignItems-center pl-10 pr-5">
                  <AccessAlarmsOutlinedIcon className="h3-custom-title pr-5" />
                  {formatTimeToIST(detailData.endTime)}
                </Box>
              </Box>
              {!isExpired && eventVisibility &&
                canEnroll &&
                !isEnrolled &&
                eventVisibility == "Public" && (
                  <div>
                    <Box
                      className="h5-title mb-20 xs-hide "
                      style={{ fontWeight: "400" }}
                    >
                      Registration will be ending on:{" "}
                      {formatDate(detailData.registrationEndDate)}
                    </Box>{" "}
                    <Box className="xs-hide">
                      <Button
                        type="button"
                        className="custom-btn-success"
                        style={{
                          borderRadius: "10px",
                          color: "#fff",
                          padding: "10px 35px",
                          fontWeight: "500",
                          fontSize: "12px",
                          border: "solid 1px #0e7a9c",
                          background: "#0e7a9c",
                          marginTop: "10px",
                        }}
                        onClick={() => managePublicPrivateEvent("reg")}
                      >
                        {t("REGISTER_WEBINAR")}
                      </Button>
                    </Box>
                  </div>
                )}
              {eventVisibility &&
                eventVisibility == "Private" &&
                !isEnrolled && (
                  <Box
                    className="h5-title mb-20 xs-hide"
                    style={{ fontWeight: "400" }}
                  >
                    <Alert severity="error">
                      Can not Register to this event as it is private
                    </Alert>
                  </Box>
                )}
              {!isExpired && isEnrolled && (
                <Box className="d-flex xs-hide">
                  <Button
                    type="button"
                    onClick={() => {
                      managePublicPrivateEvent("join");
                    }}
                    // onClick={attendWebinar}
                    style={{
                      borderRadius: "10px",
                      color: "#fff",
                      padding: "10px 35px",
                      fontWeight: "500",
                      fontSize: "12px",
                      border: "solid 1px #1976d2",
                      background: "#1976d2",
                      marginTop: "10px",
                      marginRight: "10px",
                    }}
                    className="custom-btn-primary mr-20"
                    disabled={!canJoin} // Disable the button when canEnroll is true
                  >
                    {t("ATTEND_WEBINAR")}
                  </Button>
                  {!isExpired && canEnroll && (
                    <Button
                      type="button"
                      onClick={() => {
                        unEnroll();
                      }}
                      style={{
                        borderRadius: "10px",
                        color: "#fff",
                        padding: "10px 35px",
                        fontWeight: "500",
                        fontSize: "12px",
                        border: "solid 1px #e02f1d ",
                        background: "#e02f1d",
                        marginTop: "10px",
                      }}
                      className="custom-btn-danger"
                    >
                      {t("UN_REGISTER_WEBINAR")}
                    </Button>
                  )}
                </Box>
              )}
              {isRegStart === false && (
                <Box
                  className="h5-title mb-20 xs-hide"
                  style={{ fontWeight: "400" }}
                >
                 {t("REGISTRATION_START_MESSAGE")}
                  {formatDate(detailData.registrationStartDate)}
                </Box>
              )}
              {/* <Box className="xs-hide">
                {
                  detailData.recording == undefined &&
                  <Box
                    className="h5-title mb-20 xs-hide"
                    style={{ fontWeight: "400" }}
                  >
                    Recording will be available soon
                  </Box>
                }
              </Box> */}
              {isExpired && (
                <Box
                  className="h5-title mb-20 xs-hide"
                  style={{ fontWeight: "400" }}
                >
                  <Alert severity="error">
                   {t("END_REGISTRATION_MESSAGE")}
                  </Alert>
                </Box>
              )}
              {isEnrolled && !canJoin && isRecorded && (
                <Box className="xs-hide">
                  <Button
                    type="button"
                    className="custom-btn-success"
                    style={{
                      borderRadius: "10px",
                      color: "#fff",
                      padding: "10px 35px",
                      fontWeight: "500",
                      fontSize: "12px",
                      border: "solid 1px #0e7a9c",
                      background: "#0e7a9c",
                      marginTop: "10px",
                    }}
                    startIcon={<AdjustOutlinedIcon />}
                    disabled={true}
                    onClick={handleClickOpen}
                  >
                    {t("VIEW_WEBINAR_RECORDING")}
                  </Button>
                  {detailData.recording == undefined && (
                    <Box
                      className="h5-title mb-20 xs-hide"
                      style={{ fontWeight: "400" }}
                    >
                      Recording will be available soon
                    </Box>
                  )}
                </Box>
              )}
              {/* {eventEnded && regEnd && (
                <Box
                  className="h5-title mb-20 xs-hide"
                  style={{ fontWeight: "400" }}
                >
                  The event has ended. registration is no longer available
                </Box>
              )} */}
            </Grid>
            <Grid item xs={6} md={6} lg={4} className="text-right xs-hide">
              <Box className="xs-hide">
                <FacebookShareButton url={shareUrl} className="pr-5">
                  <FacebookIcon size={32} round={true} />
                </FacebookShareButton>
                <WhatsappShareButton url={shareUrl} className="pr-5">
                  <WhatsappIcon size={32} round={true} />
                </WhatsappShareButton>
                <LinkedinShareButton url={shareUrl} className="pr-5">
                  <LinkedinIcon size={32} round={true} />
                </LinkedinShareButton>
                <TwitterShareButton url={shareUrl} className="pr-5">
                  <img
                    src={require("../../assets/twitter.png")}
                    alt="Twitter"
                    style={{ width: 32, height: 32 }}
                  />
                </TwitterShareButton>
              </Box>
            </Grid>

            <Grid item xs={12} md={6} lg={6} className="lg-pl-60 lg-hide">
              <Box className="h5-title mb-20" style={{ fontWeight: "400" }}>
                National Urban Learning Platform{" "}
              </Box>
              {creatorInfo &&
                (creatorInfo.firstName || creatorInfo.lastName) && (
                  <Box className="d-flex alignItems-center mb-20">
                    <Box className="h5-title">Organised By:</Box>
                    <Box className="d-flex alignItems-center pl-20">
                      <Box className="event-text-circle"></Box>
                      <Box className="h5-title">
                        {creatorInfo.firstName
                          ? creatorInfo.firstName
                          : "" + " " + creatorInfo.lastName
                          ? creatorInfo.lastName
                          : ""}
                      </Box>
                    </Box>
                  </Box>
                )}

              <Box className="d-flex mb-20 h3-custom-title">
                <Box className="d-flex jc-bw alignItems-center pr-5">Date:</Box>
                <Box className="d-flex jc-bw alignItems-center pr-5">
                  <TodayOutlinedIcon className="h3-custom-title pr-5" />
                  {formatDate(detailData.startDate)}
                </Box>
                <Box className="d-flex jc-bw alignItems-center pl-5 pr-5">
                  <AccessAlarmsOutlinedIcon className="h3-custom-title pr-5" />
                  {formatTimeToIST(detailData.startTime)}
                </Box>
              </Box>
              <Box className="d-flex mb-20 h3-custom-title">
                <Box className="mr-5">To</Box>
                <Box className="d-flex jc-bw alignItems-center">
                  <TodayOutlinedIcon className="h3-custom-title pr-5" />
                  {formatDate(detailData.endDate)}
                </Box>
                <Box className="d-flex jc-bw alignItems-center pl-5 pr-5">
                  <AccessAlarmsOutlinedIcon className="h3-custom-title pr-5" />

                  {formatTimeToIST(detailData.endTime)}
                </Box>
              </Box>
              {!isExpired && canEnroll && !isEnrolled && (
                <div>
                  {" "}
                  <Box
                    className="h5-title mb-20 "
                    style={{ fontWeight: "400" }}
                  >
                    Registration will be ending on:{" "}
                    {formatDate(detailData.registrationEndDate)}
                  </Box>
                  <Box className="lg-hide">
                    <Button
                      // onClick={handleOpenConsentModal}
                      type="button"
                      className="custom-btn-success mb-20"
                      style={{
                        borderRadius: "10px",
                        color: "#fff",
                        padding: "10px 35px",
                        fontWeight: "500",
                        fontSize: "12px",
                        border: "solid 1px #0e7a9c",
                        background: "#0e7a9c",
                        marginTop: "10px",
                      }}
                      onClick={handleOpenConsentModal}
                      // onClick={handleOpenConsentModal}
                    >
                      {t("REGISTER_WEBINAR")}
                    </Button>
                  </Box>
                </div>
              )}
              {!isExpired && isEnrolled && (
                <Box className="d-flex lg-hide">
                  <Button
                    type="button"
                    onClick={() => {
                      attendWebinar();
                    }}
                    // onClick={attendWebinar}
                    style={{
                      borderRadius: "10px",
                      color: "#fff",
                      padding: "10px 35px",
                      fontWeight: "500",
                      fontSize: "12px",
                      border: "solid 1px #1976d2",
                      background: "#1976d2",
                      marginTop: "10px",
                      marginRight: "10px",
                    }}
                    className="custom-btn-primary mr-20"
                    disabled={!canJoin} // Disable the button when canEnroll is true
                  >
                    {t("ATTEND_WEBINAR")}
                  </Button>
                  {!isExpired && canEnroll && (
                    <Button
                      type="button"
                      onClick={() => {
                        unEnroll();
                      }}
                      style={{
                        borderRadius: "10px",
                        color: "#fff",
                        padding: "10px 35px",
                        fontWeight: "500",
                        fontSize: "12px",
                        border: "solid 1px #e02f1d ",
                        background: "#e02f1d",
                        marginTop: "10px",
                      }}
                      className="custom-btn-danger"
                    >
                      {t("UN_REGISTER_WEBINAR")}
                    </Button>
                  )}
                </Box>
              )}
              {isRegStart === false && (
                <Box className="h5-title mb-20" style={{ fontWeight: "400" }}>
                  {t("REGISTRATION_START_MESSAGE")}
                  {formatDate(detailData.registrationStartDate)}
                </Box>
              )}
              {isExpired && (
                <Box
                  className="h5-title mb-20 lg-hide"
                  style={{ fontWeight: "400" }}
                >
                  <Alert severity="error">
                  {t("END_REGISTRATION_MESSAGE")}
                  </Alert>
                </Box>
              )}
              {isEnrolled && !canJoin && isRecorded && (
                <Box>
                  <Button
                    type="button"
                    className="custom-btn-success"
                    style={{
                      borderRadius: "10px",
                      color: "#fff",
                      padding: "10px 35px",
                      fontWeight: "500",
                      fontSize: "12px",
                      border: "solid 1px #0e7a9c",
                      background: "#0e7a9c",
                      marginTop: "10px",
                    }}
                    disabled={true}
                    startIcon={<AdjustOutlinedIcon />}
                    onClick={handleClickOpen}
                  >
                    {t("VIEW_WEBINAR_RECORDING")}
                  </Button>
                  {detailData.recording == undefined && (
                    <Box
                      className="h5-title mb-20 xs-hide"
                      style={{ fontWeight: "400" }}
                    >
                      Recording will be available soon
                    </Box>
                  )}
                </Box>
              )}
            </Grid>

            {/* <Box
              className="h2-title lg-event-margin"
              style={{ fontWeight: "600", width: "100%" }}
            >
              {t("SPEAKER_DETAILS")}
            </Box>
            <Grid container spacing={2} className="pl-20 mb-20">
              <Grid item xs={6} md={6} lg={3}>
                <Box className="d-flex">
                  <img
                    src={require("../../assets/speakerOne.png")}
                    className="eventImg"
                  />
                  <Box className="xs-pl-9 lg-pl-18">
                    <Box className="h5-title">Name Surname</Box>
                    <Box className="h5-title">Designation</Box>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={6} md={6} lg={3}>
                <Box className="d-flex">
                  <img
                    src={require("../../assets/speakertwo.png")}
                    className="eventImg"
                  />
                  <Box className="xs-pl-9 lg-pl-18">
                    <Box className="h5-title">Name Surname</Box>
                    <Box className="h5-title">Designation</Box>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={6} md={6} lg={3} className="mt-10">
                <Box className="d-flex">
                  <img
                    src={require("../../assets/speakerthree.png")}
                    className="eventImg"
                  />
                  <Box className="xs-pl-9 lg-pl-18">
                    <Box className="h5-title">Name Surname</Box>
                    <Box className="h5-title">Designation</Box>
                  </Box>
                </Box>
              </Grid>
            </Grid> */}
            <Box
              className="h2-title pl-20 mb-20 mt-20"
              style={{ fontWeight: "600" }}
            >
              {t("WEBINAR_DETAILS")}
            </Box>
            <Box
              className="event-h2-title  pl-20 mb-20"
              style={{ fontWeight: "400" }}
            >
              {detailData.description}
            </Box>
            <Box className="lg-hide ml-20">
              <FacebookShareButton url={shareUrl} className="pr-5">
                <FacebookIcon size={32} round={true} />
              </FacebookShareButton>
              <WhatsappShareButton url={shareUrl} className="pr-5">
                <WhatsappIcon size={32} round={true} />
              </WhatsappShareButton>
              <LinkedinShareButton url={shareUrl} className="pr-5">
                <LinkedinIcon size={32} round={true} />
              </LinkedinShareButton>
              <TwitterShareButton url={shareUrl} className="pr-5">
                <img
                  src={require("../../assets/twitter.png")}
                  alt="Twitter"
                  style={{ width: 32, height: 32 }}
                />
              </TwitterShareButton>
            </Box>
          </Grid>
        </Container>
      )}
      <FloatingChatIcon />
      <Modal open={isConsentModalOpen} onClose={handleCloseConsentModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
            height:"80%",
            overflowX:"scroll"
          }}
        >
          <Typography variant="h6" component="h2">
            {t("REGISTRATION_FORM")}
          </Typography>

          {detailData && (
            <Typography gutterBottom className="mt-10 h1-title mb-20 xs-pl-15">
              {detailData.name}
            </Typography>
          )}

          <TextField
            fullWidth
            label="Name"
            variant="outlined"
            margin="normal"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="Email"
            variant="outlined"
            margin="normal"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={emailError}
            helperText={emailError ? "Invalid email format" : ""}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Designation</InputLabel>
            <Select
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              label="Designation"
            >
              {designationsList?.map((desig, index) => (
                <MenuItem key={index} value={desig}>
                  {desig}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Organisation"
            variant="outlined"
            margin="normal"
            name="organisation"
            value={formData.organisation}
            onChange={handleChange}
          />

          <Typography variant="body1" sx={{ mt: 2 }}>
            We value your privacy and are committed to protecting your personal
            data. Please read the following information carefully and provide
            your consent.
            <strong>Purpose of Collection:</strong> We are collecting your email
            ID for the following purposes: Sending details about the event. Your
            email ID will be used solely for the purposes stated above and will
            not be shared with third parties without your explicit consent. You
            have the right to withdraw your consent at any time. To withdraw
            your consent, please contact us at nulp@nulp.niua.org. The process
            for withdrawing consent is as simple as providing it. Your email ID
            will be retained for as long as necessary to fulfill the purposes
            for which it was collected or as required by law. By providing your
            email ID and ticking the box below, you consent to the collection
            and use of your email ID for the purposes stated above.
          </Typography>
          <FormControlLabel
            control={
              <Checkbox checked={isChecked} onChange={handleCheckboxChange} />
            }
            label="I consent to the collection and use of my email ID for the purposes stated above."
          />
          <Box sx={{ mt: 2 }} style={{ textAlign: "right" }}>
            <Button
              className="custom-btn-primary xs-mb-10"
              onClick={handleSubmit}
              disabled={!isChecked}
            >
              {t("SUBMIT")}
            </Button>
            <Button
              className="custom-btn-default "
              onClick={handleCloseConsentModal}
              sx={{ ml: 2 }}
            >
              {t("CANCEL")}
            </Button>
          </Box>
        </Box>
      </Modal>

      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
        className="recording"
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          Recording List
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent dividers>
          {recording?.result?.map((item, index) => (
            <Box key={item.id} className="my-20">
              <Link
                href={item.recording_url}
                target="_blank"
                className="ml-10 h4-title"
                underline="none"
              >
                Recording {index + 1}
                <PlayCircleIcon
                  style={{ verticalAlign: "middle", paddingLeft: "15px" }}
                />
              </Link>
            </Box>
          ))}
        </DialogContent>
        {/* <DialogActions>
          <Button autoFocus onClick={handleClose}>
            Save changes
          </Button>
        </DialogActions> */}
      </BootstrapDialog>
      </Box>
      <Footer />
    </div>
  );
};

export default EventDetails;
