import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Footer from "components/Footer";
import Header from "components/header";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import Grid from "@mui/material/Grid";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import FloatingChatIcon from "../../components/FloatingChatIcon";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import * as util from "../../services/utilService";
import { useNavigate } from "react-router-dom";
import ContinueLearning from "./continueLearning";
import SelectPreference from "pages/SelectPreference";
import { Alert } from "@mui/material";
import _ from "lodash";
import Modal from "@mui/material/Modal";
const designations = require("../../configs/designations.json");
const urlConfig = require("../../configs/urlConfig.json");
import ToasterCommon from "../ToasterCommon";
import Tab from "@mui/material/Tab";
import TabContext from "@material-ui/lab/TabContext";
import TabList from "@material-ui/lab/TabList";
import TabPanel from "@material-ui/lab/TabPanel";
import WatchLaterOutlinedIcon from "@mui/icons-material/WatchLaterOutlined";
import DomainVerificationOutlinedIcon from "@mui/icons-material/DomainVerificationOutlined";
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import styled from "styled-components";
import LearningHistory from "./learningHistory";
import Certificate from "./certificate";
import { BarChart } from "@mui/x-charts/BarChart";

const routeConfig = require("../../configs/routeConfig.json");

const DELAY = 1500;
const MAX_CHARS = 500;
const CssTextField = styled(TextField)({
  "& label.Mui-focused": {
    color: "#A0AAB4",
  },
  "& .MuiInput-underline:after": {
    borderBottomColor: "#B2BAC2",
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderRadius: "4px",
    },
    "&:hover fieldset": {
      borderColor: "#B2BAC2",
    },

    "&.Mui-focused fieldset": {
      borderColor: "#6F7E8C",
    },
  },
});

const modalstyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  width: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  height: "80%",
  overflowX: "scroll",
};
const MAX_FILE_SIZE_MB = 1;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024; // 1 MB in bytes
const SUPPORTED_FILE_TYPES = ["image/jpeg", "image/png"];

const Profile = () => {
  const [value, setValue] = useState("1");
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const { t } = useTranslation();
  const [userData, setUserData] = useState(null);
  const [certData, setCertificateCountData] = useState({});
  const [courseData, setCourseCountData] = useState({});
  const navigate = useNavigate();
  const _userId = util.userId();
  const [openModal, setOpenModal] = useState(false);
  const [isEmptyPreference, setIsEmptyPreference] = useState(false);
  const [userInfo, setUserInfo] = useState();
  const axios = require("axios");
  const [isEditing, setIsEditing] = useState(false);
  const [editedUserInfo, setEditedUserInfo] = useState({
    firstName: userData?.result?.response?.firstName || "",
    lastName: userData?.result?.response?.lastName || "",
    bio: "",
    designation: "",
    otherDesignation: "",
    userType: "",
    otherUserType: "",
    organisation: "",
    state: "",
    state_id: "",
    district: "",
    district_id: "",
  });
  const [originalUserInfo, setOriginalUserInfo] = useState({});
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [designationsList, setDesignationsList] = useState([]);
  const [load, setLoad] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toasterOpen, setToasterOpen] = useState(false);
  const [toasterMessage, setToasterMessage] = useState("");
  const [rootOrgId, setRootOrgId] = useState();
  const [domain, setDomain] = useState("");
  const [subDomain, setSubDomain] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);
  const [showCertificate, setShowCertificate] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [orgId, setOrgId] = useState();
  const userTypesList = [
    "State Governments / Parastatal Bodies",
    "Urban Local Bodies / Special Purpose Vehicles",
    "Academia and Research Organisations",
    "Multilateral / Bilateral Agencies",
    "Industries",
    "Any Other Government Entities",
    "Others",
  ];

  const [statesList, setStatesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);

  // for bar charts
  const defaultCertData = {
    certificatesReceived: 0,
    courseWithCertificate: 0,
  };

  const defaultCourseData = {
    enrolledLastMonth: 0,
    enrolledThisMonth: 0,
  };

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [fileError, setFileError] = useState("");
  const [fileUploadMessage, setFileUploadMessage] = useState("");
  const dummyData = [1, 1];

  const showErrorMessage = (msg) => {
    setToasterMessage(msg);
    setTimeout(() => {
      setToasterMessage("");
    }, 2000);
    setToasterOpen(true);
  };

  useEffect(() => {
    setTimeout(() => {
      setLoad(true);
    }, DELAY);
    setDesignationsList(designations);
  }, []);

  useEffect(() => {
    if (userData?.result?.response && userInfo) {
      setEditedUserInfo({
        firstName: userData?.result?.response.firstName,
        lastName: userData?.result?.response.lastName,
        bio: userInfo[0]?.bio,
        designation: userInfo[0]?.designation,
        otherDesignation: "",
        userType: userInfo[0]?.user_type,
        otherUserType: "",
        organisation: userInfo[0]?.organisation,
        state: userInfo[0]?.state,
        state_id: userInfo[0]?.state_id,
        district: userInfo[0]?.state_id,
        district_id: userInfo[0]?.district_id,
      });
      setOriginalUserInfo({
        firstName: userData?.result?.response.firstName,
        lastName: userData?.result?.response.lastName,
        bio: userInfo[0]?.bio,
        designation: userInfo[0]?.designation,
        otherDesignation: "",
        userType: userInfo[0]?.user_type,
        otherUserType: "",
        organisation: userInfo[0]?.organisation,
        state: userInfo[0]?.state,
        state_id: userInfo[0]?.state_id,
        district: userInfo[0]?.state_id,
        district_id: userInfo[0]?.district_id,
      });
    }
    setDomain(userData?.result?.response.framework.board);
    setSubDomain(userData?.result?.response.framework.gradeLevel);
  }, [userData, userInfo]);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 767);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  useEffect(() => {
    setDesignationsList(designations);
    const fetchCertificateCount = async () => {
      try {
        const url = `${urlConfig.URLS.POFILE_PAGE.CERTIFICATE_COUNT}?user_id=${_userId}`;

        const response = await fetch(url);
        const data = await response.json();
        setCertificateCountData({
          courseWithCertificate: data.result.courseWithCertificate,
          certificatesReceived: data.result.certificateReceived,
        });
      } catch (error) {
        console.error("Error fetching certificate count:", error);
        showErrorMessage(t("FAILED_TO_FETCH_CERT_COUNT"));
      }
    };

    const fetchCourseCount = async () => {
      try {
        const url = `${urlConfig.URLS.POFILE_PAGE.COURSE_COUNT}?user_id=${_userId}`;

        const response = await fetch(url);
        const data = await response.json();
        setCourseCountData({
          enrolledThisMonth: data.result.enrolledThisMonth,
          enrolledLastMonth: data.result.enrolledLastMonth,
        });
      } catch (error) {
        console.error(error);
        showErrorMessage(t("FAILED_TO_FETCH_COURSE_COUNT"));
      }
    };
    const fetchUserInfo = async () => {
      try {
        const url = `${urlConfig.URLS.POFILE_PAGE.USER_READ}`;
        console.log("url", url);
        const response = await axios.post(
          url,
          { user_ids: [_userId] },
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        console.log("response?.data?.result", response?.data?.result);
        setUserInfo(response?.data?.result);
      } catch (error) {
        console.error(error);
        showErrorMessage(t("FAILED_TO_FETCH_DATA"));
      }
    };
    fetchUserData();
    fetchData();
    fetchCertificateCount();
    fetchCourseCount();
    fetchUserInfo();
  }, []);
  useEffect(() => {
    if (orgId) {
      fetchUserDataAndSetCustodianOrgData();
    }
  }, [orgId]);

  //statelist api

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const res = await axios.post(
          `${urlConfig.URLS.USER.LOCATION_SEARCH_API}`,
          {
            request: {
              filters: { type: "state" },
            },
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        setStatesList(res?.data?.result?.response || []);
      } catch (err) {
        console.error("Error fetching states", err);
      }
    };

    fetchStates();
  }, []);

  //districtlist api
  useEffect(() => {
    const fetchDistricts = async () => {
      if (!editedUserInfo?.state_id) return;

      try {
        const res = await axios.post(
          `${urlConfig.URLS.USER.LOCATION_SEARCH_API}`,
          {
            request: {
              filters: {
                type: "district",
                parentId: editedUserInfo.state_id,
              },
            },
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        setDistrictsList(res?.data?.result?.response || []);
      } catch (err) {
        console.error("Error fetching districts", err);
      }
    };

    fetchDistricts();
  }, [editedUserInfo?.state_id]);

  const fetchUserDataAndSetCustodianOrgData = async () => {
    try {
      const url = `${urlConfig.URLS.LEARNER_PREFIX}${urlConfig.URLS.SYSTEM_SETTING.CUSTODIAN_ORG}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch custodian organization ID");
      }
      const data = await response.json();
      const custodianOrgId = data?.result?.response?.value;
      const rootOrgId = sessionStorage.getItem("rootOrgId");

      if (custodianOrgId === orgId) {
        const url = `${urlConfig.URLS.PUBLIC_PREFIX}${urlConfig.URLS.CHANNEL.READ}/${custodianOrgId}`;
        const response = await fetch(url);
        const data = await response.json();
        const defaultFramework = data?.result?.channel?.defaultFramework;
        localStorage.setItem("defaultFramework", defaultFramework);
      } else {
        const url = `${urlConfig.URLS.PUBLIC_PREFIX}${urlConfig.URLS.CHANNEL.READ}/${orgId}`;
        const response = await fetch(url);
        const data = await response.json();
        const defaultFramework = data?.result?.channel?.defaultFramework;
        localStorage.setItem("defaultFramework", defaultFramework);
      }
    } catch (error) {
      showErrorMessage(t("FAILED_TO_FETCH_DATA"));
      console.error("Error fetching user data:", error);
    }
  };

  const handleOpenEditDialog = () => {
    setIsEditing(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditing(false);
  };
  const updateUserData = async () => {
    setIsLoading(true);
    setError(null);
    const requestBody = {
      params: {},
      request: {
        firstName: editedUserInfo.firstName,
        lastName: editedUserInfo.lastName,
        userId: _userId,
      },
    };

    try {
      const url = `${urlConfig.URLS.LEARNER_PREFIX}${urlConfig.URLS.USER.UPDATE_USER_PROFILE}`;
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        showErrorMessage(t("FAILED_TO_FETCH_DATA"));
        throw new Error(t("FAILED_TO_FETCH_DATA"));
      }

      const responseData = await response.json();
      await updateUserInfoInCustomDB();
      console.log("responseData", responseData);
    } catch (error) {
      showErrorMessage(t("FAILED_TO_FETCH_DATA"));
    } finally {
      setIsLoading(false);
    }
  };
  const updateUserInfoInCustomDB = async () => {
    const requestBody = {
      designation:
        editedUserInfo.designation === "Other"
          ? editedUserInfo.otherDesignation
          : editedUserInfo.designation,
      bio: editedUserInfo.bio,
      created_by: _userId,
      user_type:
        editedUserInfo.userType === "Other"
          ? editedUserInfo.otherUserType
          : editedUserInfo.userType,
      organisation: editedUserInfo.organisation,
      state: editedUserInfo.state,
      state_id: editedUserInfo.state_id,
      district: editedUserInfo.district,
      district_id: editedUserInfo.district_id,
    };
    try {
      const url = `${urlConfig.URLS.POFILE_PAGE.USER_UPDATE}?user_id=${_userId}`;
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        showErrorMessage(t("SOMETHING_WENT_WRONG"));
        throw new Error(t("SOMETHING_WENT_WRONG"));
      }

      const data = await response.json();
    } catch (error) {
      showErrorMessage(t("SOMETHING_WENT_WRONG"));
    } finally {
      setIsLoading(false);
    }
  };
  // Handle form submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    await updateUserData();
    // Close the edit dialog
    setIsEditing(false);
    window.location.reload();
    setIsFormDirty(false);
  };
  const fetchUserData = async () => {
    try {
      const uservData = await util.userData();
      const org = uservData.data?.result?.response?.rootOrgId;
      setOrgId(org);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchData = async () => {
    try {
      const url = `${urlConfig.URLS.LEARNER_PREFIX}${urlConfig.URLS.USER.GET_PROFILE}${_userId}?fields=${urlConfig.params.userReadParam.fields}`;

      const header = "application/json";
      const response = await fetch(url, {
        // headers: {
        //   "Content-Type": "application/json",
        // },
      });
      const data = await response.json();
      setUserData(data);
      const rootOrgId = data.result.response.rootOrgId;
      sessionStorage.setItem("rootOrgId", rootOrgId);
      setRootOrgId(rootOrgId);
      console.log("rootOrgId", rootOrgId);
      if (_.isEmpty(data?.result?.response.framework)) {
        setOpenModal(true);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      showErrorMessage(t("FAILED_TO_FETCH_DATA"));
    }
  };

  const handleLearningHistoryClick = () => {
    navigate(routeConfig.ROUTES.CONTINUE_LEARNING_PAGE.CONTINUE_LEARNING);
  };

  const handleContinueLearningClick = () => {
    navigate(routeConfig.ROUTES.CONTINUE_LEARNING_PAGE.CONTINUE_LEARNIN);
  };

  const handleCertificateButtonClick = () => {
    if (isMobile) {
      navigate(routeConfig.ROUTES.CERTIFICATE_PAGE.CERTIFICATE);
    } else {
      setIsButtonDisabled(true);
      setShowCertificate(true);
    }
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    fetchData();
    window.location.reload();
  };

  const validateFile = (file) => {
    if (file.size > MAX_FILE_SIZE) {
      setFileError(`File size cannot be more than ${MAX_FILE_SIZE_MB} MB`);
      return false;
    }
    if (!SUPPORTED_FILE_TYPES.includes(file.type)) {
      setFileError("Only JPEG and PNG files are supported");
      return false;
    }
    setFileError("");
    return true;
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Use default data if certData or courseData is undefined or empty
  const finalCertData =
    certData &&
      certData.certificatesReceived !== undefined &&
      certData.courseWithCertificate !== undefined
      ? certData
      : defaultCertData;
  const finalCourseData =
    courseData &&
      courseData.enrolledLastMonth !== undefined &&
      courseData.enrolledThisMonth !== undefined
      ? courseData
      : defaultCourseData;
  // Check if data is empty or zero
  const isCertDataEmpty =
    !finalCertData.certificatesReceived && !finalCertData.courseWithCertificate;
  const isCourseDataEmpty =
    !finalCourseData.enrolledThisMonth && !finalCourseData.enrolledLastMonth;
  // Create a lookup object for role ID to name mapping
  const roleList = userData?.result?.response?.roleList || [];
  const roleLookup = roleList.reduce((acc, role) => {
    acc[role.id] = role.name;
    return acc;
  }, {});

  // Map role IDs to names, and filter out the role named "Public"
  const roles = userData?.result?.response?.roles || [];
  const roleNames = roles
    .map((role) => roleLookup[role.role]) // Convert role ID to role name
    .filter((name) => name && name !== "Public"); // Remove undefined names and "Public"

  return (
    <div>
      <Header />
      {toasterMessage && <ToasterCommon response={toasterMessage} />}

      <Container maxWidth="xl" role="main" className="xs-pb-75 pt-1">
        {error && (
          <Alert severity="error" className="my-10">
            {error}
          </Alert>
        )}

        <Grid container spacing={2} className="pt-8">
          <Grid
            item
            xs={12}
            md={4}
            lg={4}
            className="sm-p-25 left-container profile my-20 lg-mt-12 bx-none b-none"
            style={{ background: "transparent", boxShadow: "none" }}
          >
            <Box
              style={{
                background: "#fff",
                padding: "20px",
                borderRadius: "10px",
              }}
            >
              <Box sx={{ fontSize: "18px", color: "#484848" }}>
                {t("MY_PROFILE")}
              </Box>

              <Box
                textAlign="center"
                padding="10"
                sx={{ marginTop: "22px" }}
                className="mb-10"
              >
                <Box className="grey-bx">
                  <Box>
                    <CardContent>
                      <Grid container>
                        <Grid item xs={11} md={11}>
                          <Box className="d-flex">
                            <Box>
                              {userData && (
                                <>
                                  <div className="img-text-circle">
                                    {userData?.result?.response?.firstName[0]}
                                  </div>
                                </>
                              )}
                            </Box>
                            <Box>
                              {userData && (
                                <>
                                  <Box className="ml-20">
                                    <Typography className="h4-title">
                                      {userData?.result?.response?.firstName}{" "}
                                      {userData?.result?.response?.lastName}
                                    </Typography>
                                    <Typography className="h6-title">
                                      {userInfo?.length &&
                                        userInfo[0]?.designation ? (
                                        <>{userInfo[0].designation}</>
                                      ) : (
                                        "Designation: NA"
                                      )}
                                      <Box className="cardLabelEllips1">
                                        {userInfo?.length &&
                                          userInfo[0]?.designation
                                          ? " "
                                          : " "}
                                        {t("ID")}:{" "}
                                        {userData?.result?.response?.userName ||
                                          "NA"}
                                      </Box>
                                    </Typography>
                                    {userInfo?.length ? (
                                      <Typography className="h6-title d-flex">
                                        <Box className="h6-title d-flex">
                                          {t("ORGANIZATION_NAME")}:{" "}
                                          {userInfo[0]?.organisation || "NA"}
                                        </Box>
                                      </Typography>
                                    ) : null}

                                    {roleNames && roleNames.length > 0 && (
                                      <Typography className="h6-title">
                                        <Box className="h6-title mt-10">
                                          {t("ROLE")}:{" "}
                                          {roleNames?.map((roleName, index) => (
                                            <Button
                                              key={index}
                                              size="small"
                                              style={{
                                                color: "#424242",
                                                fontSize: "10px",
                                                margin: "0 10px 3px 6px",
                                                background: "#e3f5ff",
                                                cursor: "auto",
                                              }}
                                            >
                                              {roleName}
                                            </Button>
                                          ))}
                                        </Box>
                                      </Typography>
                                    )}
                                  </Box>
                                </>
                              )}
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={1} md={1}>
                          <ModeEditIcon
                            className="cursor-pointer"
                            onClick={handleOpenEditDialog}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Box>
                  {userData && userInfo?.length > 0 && (
                    <Typography
                      variant="subtitle1"
                      color="text.secondary"
                      component="div"
                      style={{ fontSize: "12px", padding: "0 20px" }}
                    >
                      {userInfo?.length ? userInfo[0]?.bio : ""}
                    </Typography>
                  )}

                  <Box className="mb-15 mt-20">
                    <Box
                      className="d-flex jc-bw"
                      sx={{
                        flexDirection: "row",
                        padding: "0 0 12px 15px",
                      }}
                    >
                      <Box
                        style={{
                          alignItems: "center",
                        }}
                        className="h4-title d-flex fw-400 my-15"
                      >
                        <EmojiEventsOutlinedIcon
                          style={{ paddingRight: "10px" }}
                        />{" "}
                        {t("PERFORMANCE")}
                      </Box>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={12} lg={12} className="chartOne">
                        {!isCertDataEmpty ? (
                          <>
                            <Box className="h6-title pl-20">
                              {t("CERTIFICATIONS RECEIVED")}
                            </Box>
                            <BarChart
                              yAxis={[
                                {
                                  scaleType: "band",
                                  data: ["Current Month", "Prev Month"],
                                },
                              ]}
                              series={[
                                {
                                  name: "Previous Month",
                                  data: isCertDataEmpty
                                    ? dummyData
                                    : [finalCertData.certificatesReceived],
                                  stack: "A",
                                  layout: "horizontal",
                                  label: isCertDataEmpty
                                    ? "Dummy data"
                                    : "Certificate received",
                                  color: "#0097b2",
                                },
                                {
                                  name: "Current Month",
                                  data: isCertDataEmpty
                                    ? dummyData
                                    : [finalCertData.courseWithCertificate],
                                  stack: "B",
                                  layout: "horizontal",
                                  label: isCertDataEmpty
                                    ? "Dummy data"
                                    : "No. of courses with certificate",
                                  color: "#ffce6d",
                                },
                              ]}
                              width={261}
                              height={200}
                              options={{
                                xAxis: {
                                  label: {
                                    text: "Courses",
                                    position: "middle",
                                  },
                                  type: "category",
                                },
                                yAxis: {
                                  label: {
                                    text: "Months",
                                    position: "middle",
                                  },
                                  type: "category",
                                  data: ["Previous Month", "Current Month"],
                                },
                              }}
                            />
                          </>
                        ) : (
                          <>
                            <Box className="h6-title pl-20">
                              {t("CERTIFICATIONS RECEIVED")}
                            </Box>
                            <Alert
                              severity="info"
                              style={{
                                backgroundColor: "transparent",
                                color: "#0e7a9c",
                              }}
                            >
                              {t("NO_CERTIFICATES_FOUND")}
                            </Alert>
                          </>
                        )}
                      </Grid>

                      <Grid item xs={12} md={12} lg={12} className="chartTwo">
                        {!isCourseDataEmpty ? (
                          <>
                            <Box className="h6-title  pl-20">
                              {t("COURSES MORE THAN LAST MONTH")}
                            </Box>
                            <BarChart
                              yAxis={[
                                {
                                  scaleType: "band",
                                  data: ["Current Month", "Prev Month"],
                                },
                              ]}
                              series={[
                                {
                                  data: [finalCourseData.enrolledThisMonth],
                                  stack: "B",
                                  label: "Enrolled courses current month",
                                  color: "#0097b2",
                                  layout: "horizontal",
                                },
                                {
                                  data: [finalCourseData.enrolledLastMonth],
                                  stack: "A",
                                  label: "Enrolled courses prev month",
                                  color: "#ffce6d",
                                  layout: "horizontal",
                                },
                              ]}
                              width={261}
                              height={200}
                              options={{}}
                            />
                          </>
                        ) : (
                          <>
                            <Box className="h6-title  pl-20">
                              {t("COURSES MORE THAN LAST MONTH")}
                            </Box>

                            <Alert
                              severity="info"
                              style={{
                                backgroundColor: "transparent",
                                color: "#0e7a9c",
                                paddingRight: "20px",
                              }}
                            >
                              {t("NOT_ENROLL_MESSAGE")}
                            </Alert>
                          </>
                        )}
                      </Grid>
                    </Grid>
                  </Box>

                  {isEditing && (
                    <Modal
                      aria-labelledby="modal-modal-title"
                      aria-describedby="modal-modal-description"
                      className="xs-w-300"
                      open={isEditing}
                      onClose={handleCloseEditDialog}
                    >
                      <Box sx={modalstyle}>
                        <Typography
                          id="modal-modal-title"
                          className="h3-title"
                          style={{ marginBottom: "20px" }}
                        >
                          {t("EDIT_PROFILE")}
                        </Typography>
                        <form onSubmit={handleFormSubmit}>
                          <Box py={1}>
                            <CssTextField
                              id="firstName"
                              name="firstName"
                              label={<span>{t("FIRST_NAME")}</span>}
                              variant="outlined"
                              size="small"
                              value={editedUserInfo.firstName}
                              onChange={(e) =>
                                setEditedUserInfo({
                                  ...editedUserInfo,
                                  firstName: e.target.value,
                                })
                              }
                            />
                          </Box>
                          <Box py={1}>
                            <CssTextField
                              id="lastName"
                              name="lastName"
                              label={<span>{t("LAST_NAME")}</span>}
                              variant="outlined"
                              size="small"
                              value={editedUserInfo.lastName}
                              onChange={(e) =>
                                setEditedUserInfo({
                                  ...editedUserInfo,
                                  lastName: e.target.value,
                                })
                              }
                            />
                          </Box>

                          <Box py={1}>
                            <FormControl
                              fullWidth
                              style={{ marginTop: "10px" }}
                            >
                              <InputLabel
                                id="designation-label"
                                className="year-select"
                              >
                                {" "}
                                {t("DESIGNATION")}{" "}
                              </InputLabel>
                              <Select
                                labelId="designation-label"
                                id="designation"
                                value={editedUserInfo.designation}
                                onChange={(e) =>
                                  setEditedUserInfo({
                                    ...editedUserInfo,
                                    designation: e.target.value,
                                  })
                                }
                              >
                                {designationsList.map((desig, index) => (
                                  <MenuItem key={index} value={desig}>
                                    {desig}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Box>
                          {editedUserInfo.designation === "Others" && (
                            <Box py={1}>
                              <CssTextField
                                id="otherDesignation"
                                name="otherDesignation"
                                label={
                                  <span>
                                    {t("OTHER_DESIGNATION")}{" "}
                                    <span className="required">*</span>
                                  </span>
                                }
                                variant="outlined"
                                size="small"
                                value={editedUserInfo.otherDesignation}
                                onChange={(e) =>
                                  setEditedUserInfo({
                                    ...editedUserInfo,
                                    otherDesignation: e.target.value,
                                  })
                                }
                              />
                            </Box>
                          )}
                          <Box py={1}>
                            <FormControl
                              fullWidth
                              style={{ marginTop: "10px" }}
                            >
                              <InputLabel
                                id="designation-label"
                                className="year-select"
                              >
                                {" "}
                                {t("userType")}{" "}
                              </InputLabel>
                              <Select
                                labelId="designation-label"
                                id="designation"
                                value={editedUserInfo.userType}
                                onChange={(e) =>
                                  setEditedUserInfo({
                                    ...editedUserInfo,
                                    userType: e.target.value,
                                  })
                                }
                              >
                                {userTypesList.map((desig, index) => (
                                  <MenuItem key={index} value={desig}>
                                    {desig}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Box>
                          {editedUserInfo.userType === "Others" && (
                            <Box py={1}>
                              <CssTextField
                                id="otherDesignation"
                                name="otherDesignation"
                                label={
                                  <span>
                                    {t("UserType")}{" "}
                                    <span className="required">*</span>
                                  </span>
                                }
                                variant="outlined"
                                size="small"
                                value={editedUserInfo.otherUserType}
                                onChange={(e) =>
                                  setEditedUserInfo({
                                    ...editedUserInfo,
                                    otherUserType: e.target.value,
                                  })
                                }
                              />
                            </Box>
                          )}
                          <Box py={2}>
                            <TextField
                              id="bio"
                              name="bio"
                              label={<span>{t("Organisation")}</span>}
                              multiline
                              rows={3}
                              variant="outlined"
                              fullWidth
                              value={editedUserInfo.organisation}
                              onChange={(e) =>
                                setEditedUserInfo({
                                  ...editedUserInfo,
                                  organisation: e.target.value,
                                })
                              }
                              inputProps={{ maxLength: MAX_CHARS }}
                            />
                          </Box>

                          <Box py={2}>
                            <TextField
                              id="bio"
                              name="bio"
                              label={<span>{t("BIO")}</span>}
                              multiline
                              rows={3}
                              variant="outlined"
                              fullWidth
                              value={editedUserInfo.bio}
                              onChange={(e) =>
                                setEditedUserInfo({
                                  ...editedUserInfo,
                                  bio: e.target.value,
                                })
                              }
                              inputProps={{ maxLength: MAX_CHARS }}
                            />
                            <Typography
                              variant="caption"
                              color={
                                editedUserInfo.bio?.length > MAX_CHARS
                                  ? "error"
                                  : "textSecondary"
                              }
                            >
                              {editedUserInfo.bio
                                ? editedUserInfo.bio.length
                                : 0}
                              /{MAX_CHARS}
                            </Typography>
                          </Box>

                          <Box py={1}>
                            <FormControl
                              fullWidth
                              style={{ marginTop: "10px" }}
                            >
                              <InputLabel
                                id="state-label"
                                className="year-select"
                              >
                                {t("STATE")}
                              </InputLabel>
                              <Select
                                labelId="state-label"
                                id="state"
                                value={editedUserInfo.state_id}
                                onChange={(e) => {
                                  const selectedState = statesList.find(
                                    (s) => s.id === e.target.value
                                  );
                                  setEditedUserInfo({
                                    ...editedUserInfo,
                                    state: selectedState?.name || "",
                                    state_id: selectedState?.id || "",
                                    district: "",
                                    district_id: "",
                                  });
                                }}
                              >
                                {statesList.map((state) => (
                                  <MenuItem key={state.id} value={state.id}>
                                    {state.name}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Box>

                          <Box py={1}>
                            <FormControl
                              fullWidth
                              style={{ marginTop: "10px" }}
                            >
                              <InputLabel
                                id="district-label"
                                className="year-select"
                              >
                                {t("DISTRICT")}
                              </InputLabel>
                              <Select
                                labelId="district-label"
                                id="district"
                                value={editedUserInfo.district_id}
                                onChange={(e) => {
                                  const selectedDistrict = districtsList.find(
                                    (d) => d.id === e.target.value
                                  );
                                  setEditedUserInfo({
                                    ...editedUserInfo,
                                    district: selectedDistrict?.name || "",
                                    district_id: selectedDistrict?.id || "",
                                  });
                                }}
                                disabled={!editedUserInfo.state_id}
                              >
                                {districtsList.map((district) => (
                                  <MenuItem
                                    key={district.id}
                                    value={district.id}
                                  >
                                    {district.name}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Box>

                          <Box pt={4} className="d-flex jc-en">
                            <Button
                              className="custom-btn-default mr-5"
                              onClick={handleCloseEditDialog}
                            >
                              {t("CANCEL")}
                            </Button>
                            <Button
                              className="custom-btn-primary "
                              type="submit"
                            >
                              {t("SAVE")}
                            </Button>
                          </Box>
                        </form>
                      </Box>
                    </Modal>
                  )}
                </Box>
                <Button
                  type="button"
                  className="my-30"
                  onClick={handleCertificateButtonClick}
                  disabled={isButtonDisabled}
                  style={{
                    backgroundColor: isButtonDisabled ? "gray" : "#0E7A9C",
                    borderRadius: "10px",
                    color: "#fff",
                    padding: "10px 25px",
                    fontWeight: " 500",
                    fontSize: "12px",
                  }}
                >
                  <ReceiptLongIcon className="pr-5" />
                  {t("DOWNLOAD CERTIFICATES")}
                </Button>
                <SelectPreference
                  onClose={handleCloseModal}
                  isOpen={openModal}
                />

                <Box className="grey-bx p-10 py-15">
                  <Box className="h4-title d-flex pt-10 alignItems-center">
                    <SettingsOutlinedIcon className="pr-5 fw-400" />
                    <Box>{t("USER_PREFERENCES")}</Box>
                  </Box>
                  <Box className="mb-20">
                    <Box className="h5-title mt-15 mb-10">
                      <span className="fw-400"> {t("DOMAIN")} </span> :{" "}
                      <span className="fw-600">{domain}</span>
                    </Box>
                    <Box className="h5-title">
                      <span className="fw-400"> {t("SUB_DOMAIN")} </span>:{" "}
                      <span className="fw-600">
                        {subDomain
                          ? subDomain?.length > 1
                            ? subDomain?.join(", ")
                            : subDomain[0]
                          : ""}
                      </span>
                    </Box>
                  </Box>
                  <Box className="text-center">
                    <Button
                      type="button"
                      className="custom-btn-primary my-10"
                      onClick={handleOpenModal}
                    >
                      {t("CHANGE_PREFERENCES")}
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={8} lg={8} className="pb-20 lg-pl-0">
            {showCertificate ? (
              <Certificate />
            ) : (
              <div>
                <TabContext value={value}>
                  <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                    <TabList
                      onChange={handleChange}
                      aria-label="lab API tabs example"
                    >
                      <Tab
                        label={t("CONTINUE_LEARNNG")}
                        className="tab-text profile-tab"
                        icon={<DomainVerificationOutlinedIcon />}
                        value="1"
                      />
                      <Tab
                        label={t("LEARNING HISTORY")}
                        className="tab-text profile-tab"
                        icon={<WatchLaterOutlinedIcon />}
                        value="2"
                      />
                    </TabList>
                  </Box>
                  <TabPanel value="1">
                    <ContinueLearning />
                  </TabPanel>
                  <TabPanel value="2">
                    <LearningHistory />
                  </TabPanel>
                </TabContext>
              </div>
            )}
          </Grid>
        </Grid>
      </Container>
      <FloatingChatIcon />
      <Footer />
    </div>
  );
};

export default Profile;
