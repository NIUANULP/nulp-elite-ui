import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Footer from "components/Footer";
import Header from "components/header";
import Container from "@mui/material/Container";
import FloatingChatIcon from "../../components/FloatingChatIcon";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Box from "@mui/material/Box";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import * as util from "../../services/utilService";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

import data from "../../assets/courseHierarchy.json";
import Alert from "@mui/material/Alert";
import Modal from "@mui/material/Modal";

import appConfig from "../../configs/appConfig.json";
const urlConfig = require("../../configs/urlConfig.json");
import ToasterCommon from "../ToasterCommon";
import Chat from "pages/connections/chat";
import {
  FacebookShareButton,
  WhatsappShareButton,
  LinkedinShareButton,
  TwitterShareButton,
  FacebookIcon,
  WhatsappIcon,
  LinkedinIcon,
} from "react-share";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const routeConfig = require("../../configs/routeConfig.json");
const processString = (str) => {
  return str.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
};
const JoinCourse = () => {
  const { t } = useTranslation();
  const [courseData, setCourseData] = useState();
  const [batchData, setBatchData] = useState();
  const [batchDetails, setBatchDetails] = useState();
  const [userCourseData, setUserCourseData] = useState({});
  const [showEnrollmentSnackbar, setShowEnrollmentSnackbar] = useState(false);
  const [showUnEnrollmentSnackbar, setShowUnEnrollmentSnackbar] =
    useState(false);
  const [showConsentForm, setShowConsentForm] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [progress, setCourseProgress] = useState();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [userInfo, setUserInfo] = useState();
  const [consentChecked, setConsentChecked] = useState(false);
  const [shareEnabled, setShareEnabled] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [userData, setUserData] = useState();
  const location = useLocation();
  const navigate = useNavigate();
  const [toasterOpen, setToasterOpen] = useState(false);
  const [toasterMessage, setToasterMessage] = useState("");
  const [creatorId, setCreatorId] = useState("");
  const [open, setOpen] = useState(false);
  const [chat, setChat] = useState([]);
  const [childnode, setChildNode] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [formData, setFormData] = useState({
    message: "",
  });
  const [showChat, setShowChat] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);
  const queryString = location.search;
  let contentId = queryString.startsWith("?do_") ? queryString.slice(1) : null;
  // Check if contentId ends with '=' and remove it
  if (contentId && contentId.endsWith("=")) {
    contentId = contentId.slice(0, -1);
  }
  const _userId = util.userId(); // Assuming util.userId() is defined
  const shareUrl = window.location.href; // Current page URL
  const [showMore, setShowMore] = useState(false);
  const [batchDetail, setBatchDetail] = useState("");
  const [score, setScore] = useState("");
  const [isEnroll, setIsEnroll] = useState(false);
  const [ConsumedContents, setConsumedContents] = useState();
  const [TotalContents, setTotalContents] = useState();
  const [IsUnitCompleted, setIsUnitCompleted] = useState();
  const [isNotStarted, setIsNotStarted] = useState(false);
  const [ContinueLearning, setContinueLearning] = useState();
  const [allContents, setAllContents] = useState();
  const [NotConsumedContent, setNotConsumedContent] = useState();
  const [isContentConsumed, setIsContentConsumed] = useState();
  const [completedContents, setCompletedContents] = useState([]);
  const [isCompleted, setIsCompleted] = useState();
  const [copyrightOpen, setcopyrightOpen] = useState(false);
  const toggleShowMore = () => {
    setShowMore((prevShowMore) => !prevShowMore);
  };
  const [activeBatch, SetActiveBatch] = useState(true);

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: "50%",
    transform: "translate(-50%, -50%)",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
  };
  const showErrorMessage = (msg) => {
    setToasterMessage(msg);
    setTimeout(() => {
      setToasterMessage("");
    }, 2000);
    setToasterOpen(true);
  };

  const showOpenContenErrorMessage = (msg) => {
    setToasterMessage(msg);
    setToasterOpen(true);
  };
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 767);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const newPath = location.pathname + "?" + contentId;
  sessionStorage.setItem("previousRoutes", newPath);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = `${urlConfig.URLS.PUBLIC_PREFIX}${urlConfig.URLS.COURSE.HIERARCHY}/${contentId}?orgdetails=${appConfig.ContentPlayer.contentApiQueryParams.orgdetails}&licenseDetails=${appConfig.ContentPlayer.contentApiQueryParams.licenseDetails}`;
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

        setCreatorId(data?.result?.content?.createdBy);
        setCourseData(data);
        setUserData(data);
        if (_userId == data?.result?.content?.createdBy) {
          console.log("here");
          setIsOwner(true);
        }
        let identifiers;
        if (data?.result?.content?.children[0]?.children) {
          identifiers =
            data?.result?.content?.children[0]?.children[0]?.identifier;
        } else {
          identifiers = data?.result?.content?.children[0]?.identifier;
        }
        console.log(identifiers, "setChildNode");
        setChildNode(identifiers);

        let allContents = [];

        const getAllLeafIdentifiers = (nodes) => {
          nodes.forEach((node) => {
            if (!node?.children || node?.children.length === 0) {
              if (node.identifier) {
                allContents.push(node?.identifier);
              }
            } else {
              getAllLeafIdentifiers(node?.children);
            }
          });
        };

        if (data?.result?.content?.children) {
          getAllLeafIdentifiers(data?.result?.content?.children);
        }

        setAllContents(allContents);
        console.log("allContents-------", allContents);
      } catch (error) {
        console.error("Error fetching course data:", error);
        showErrorMessage(t("FAILED_TO_FETCH_DATA"));
      }
    };

    const fetchBatchData = async () => {
      try {
        const url = `${urlConfig.URLS.LEARNER_PREFIX}${urlConfig.URLS.BATCH.GET_BATCHS}`;
        const response = await axios.post(url, {
          request: {
            filters: {
              status: "1",
              courseId: contentId,
              enrollmentType: "open",
            },
            sort_by: {
              createdDate: "desc",
            },
          },
        });

        const responseData = response.data;

        if (responseData.result.response) {
          const { count, content } = responseData.result.response;

          if (count === 0) {
            // console.warn("This course has no active batches.");
            SetActiveBatch(false);
            showErrorMessage(t("This course has no active Batches")); // Assuming `showErrorMessage` is used to display messages to the user
          } else if (content && content.length > 0) {
            const batchDetails = content[0];
            getBatchDetail(batchDetails.batchId);
            setBatchData({
              startDate: batchDetails.startDate,
              endDate: batchDetails.endDate,
              enrollmentEndDate: batchDetails.enrollmentEndDate,
              batchId: batchDetails.batchId,
            });
            setBatchDetails(batchDetails);
            console.log("batchDetail---", batchDetails);
          } else {
            console.error("Batch data not found in response");
          }
        } else {
          console.error("Batch data not found in response");
        }
      } catch (error) {
        console.error("Error fetching batch data:", error);
        showErrorMessage(t("FAILED_TO_FETCH_DATA"));
      }
    };

    const checkEnrolledCourse = async () => {
      try {
        const url = `${urlConfig.URLS.LEARNER_PREFIX}${urlConfig.URLS.COURSE.GET_ENROLLED_COURSES}/${_userId}?orgdetails=${appConfig.Course.contentApiQueryParams.orgdetails}&licenseDetails=${appConfig.Course.contentApiQueryParams.licenseDetails}&fields=${urlConfig.params.enrolledCourses.fields}&batchDetails=${urlConfig.params.enrolledCourses.batchDetails}`;
        const response = await fetch(url);
        if (!response.ok) {
          showErrorMessage(t("FAILED_TO_FETCH_DATA"));
          throw new Error(t("FAILED_TO_FETCH_DATA"));
        }
        const data = await response.json();
        setUserCourseData(data.result);
        if (
          data?.result?.courses?.some(
            (course) => course?.contentId === contentId
          )
        ) {
          setIsEnroll(true);
        }
      } catch (error) {
        console.error("Error while fetching courses:", error);
        showErrorMessage(t("FAILED_TO_FETCH_DATA"));
      }
    };
    const getBatchDetail = async (batchId) => {
      try {
        const url = `${urlConfig.URLS.LEARNER_PREFIX}${urlConfig.URLS.BATCH.GET_DETAILS}/${batchId}`;
        const response = await fetch(url);
        if (!response.ok) {
          showErrorMessage(t("FAILED_TO_FETCH_DATA"));
          throw new Error(t("FAILED_TO_FETCH_DATA"));
        }
        const data = await response.json();
        setBatchDetail(data.result);
        getScoreCriteria(data.result);
      } catch (error) {
        console.error("Error while fetching courses:", error);
        showErrorMessage(t("FAILED_TO_FETCH_DATA"));
      }
    };

    fetchData();
    fetchBatchData();
    checkEnrolledCourse();
    getUserData();
  }, []);

  const checkCourseComplition = async (allContents, userProgress) => {
    // const contentlength = allContents.length
    let completedCount = 0;
    userProgress.result.contentList.map((content) => {
      if (content.status) {
        completedCount = completedCount + 1;
      }
    });
    if (allContents.length == completedCount) {
      setIsCompleted(true);
    }
  };

  const flattenDeep = async (contents) => {
    if (contents) {
      let result = [];
      for (let val of contents) {
        result.push(val);
        if (val.children) {
          const children = await flattenDeep(val.children);
          result = result.concat(children);
        }
      }
      return result;
    }
    return [];
  };

  const calculateProgress = async () => {
    console.log(
      "courseData?.result?.content?.children",
      courseData?.result?.content?.children
    );
    let contentStatus = [];
    if (batchDetails?.batchId && courseData?.result?.content?.children) {
      let tempConsumedContents = 0;
      let tempTotalContents = 0;

      for (let unit of courseData?.result?.content?.children) {
        if (unit.mimeType === "application/vnd.ekstep.content-collection") {
          let consumedContents = [];
          let flattenDeepContents = [];

          if (unit.children) {
            flattenDeepContents = (await flattenDeep(unit.children)).filter(
              (item) =>
                item.mimeType !== "application/vnd.ekstep.content-collection"
            );
            console.log("flattenDeepContents", flattenDeepContents);
            consumedContents = flattenDeepContents?.filter((o) =>
              contentStatus?.some(
                ({ contentId, status }) =>
                  o?.identifier === contentId && status === 2
              )
            );
          }

          unit.consumedContent = consumedContents.length;
          unit.contentCount = flattenDeepContents.length;
          unit.isUnitConsumed =
            consumedContents.length === flattenDeepContents.length;
          unit.isUnitConsumptionStart = consumedContents.length > 0;
          unit.progress = flattenDeepContents.length
            ? (consumedContents.length / flattenDeepContents.length) * 100
            : 0;
        } else {
          const consumedContent = contentStatus.filter(
            ({ contentId, status }) =>
              unit.identifier === contentId && status === 2
          );
          unit.consumedContent = consumedContent.length;
          unit.contentCount = 1;
          unit.isUnitConsumed = consumedContent.length === 1;
          unit.progress = consumedContent.length ? 100 : 0;
          unit.isUnitConsumptionStart = Boolean(consumedContent.length);
        }

        tempConsumedContents += unit.consumedContent;
        tempTotalContents += unit.contentCount;
      }

      const progress = tempTotalContents
        ? (tempConsumedContents / tempTotalContents) * 100
        : 0;
      console.log("progress", progress);
      setConsumedContents(tempConsumedContents);
      setTotalContents(tempTotalContents);
      let courseHierarchy = {};
      courseHierarchy.progress = progress;
      const unitCompleted = tempTotalContents === tempConsumedContents;
      setIsUnitCompleted(unitCompleted);
    }
  };

  // useEffect(() => {
  //   calculateProgress();
  // }, [batchDetails, courseData]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const url = `${
          urlConfig.URLS.DIRECT_CONNECT.GET_CHATS
        }?sender_id=${_userId}&receiver_id=${creatorId}&is_accepted=${true}`;

        const response = await axios.get(url, {
          withCredentials: true,
        });
        console.log("chatResponse", response.data.result || []);
        setChat(response.data.result || []);
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };
    const getCourseProgress = async () => {
      if (batchDetails) {
        const request = {
          request: {
            userId: _userId,
            courseId: contentId,
            contentIds: allContents,
            batchId: batchDetails.batchId,
            fields: ["progress", "score"],
          },
        };

        try {
          const url = `${urlConfig.URLS.CONTENT_PREFIX}${urlConfig.URLS.COURSE.USER_CONTENT_STATE_READ}`;
          const response = await axios.post(url, request);
          const data = response.data;
          setCourseProgress(data);
          checkCourseComplition(allContents, data);

          const contentIds =
            data?.result?.contentList?.map((item) => item.contentId) || [];
          if (contentIds.length === 0) {
            setIsNotStarted(true);
          }
          setConsumedContents(contentIds);

          for (let content of data?.result?.contentList) {
            if (content.status === 1) {
              setContinueLearning(content.contentId);
              break;
            }
          }

          const newCompletedContents = [];

          for (let content of data?.result?.contentList) {
            if (content.status === 2) {
              newCompletedContents.push(content.contentId);
            }
          }

          if (newCompletedContents.length > 0) {
            setCompletedContents((prevContents) => [
              ...prevContents,
              ...newCompletedContents,
            ]);
            setIsContentConsumed(true);
          }

          const contentList = data.result.contentList;

          let allFound = true;
          let notConsumedContent;

          if (Array.isArray(allContents)) {
            for (let identifier of allContents) {
              const found = Array.isArray(contentList)
                ? contentList.find(
                    (item) => item.contentId === identifier && item.status === 2
                  )
                : undefined;

              if (!found) {
                notConsumedContent = identifier;
                allFound = false;
                break;
              }
            }
          } else {
            console.error("Error: allContents is not an array or is undefined");
          }

          if (allFound) {
            if (Array.isArray(allContents) && allContents?.length > 0) {
              notConsumedContent = allContents[0];
              try {
                const url = `${urlConfig.URLS.CONTENT_PREFIX}${urlConfig.URLS.COURSE.USER_CONTENT_STATE_UPDATE}`;
                const response = await axios.patch(url, {
                  request: {
                    userId: _userId,
                    courseId: contentId,
                    batchId: batchDetails?.batchId,
                  },
                });
                setToasterMessage(t("COURSE_SUCCESSFULLY_COMPLETED"));
                setTimeout(() => {
                  setToasterMessage("");
                }, 2000);
                setToasterOpen(true);
              } catch (error) {
                console.error("Error while fetching courses:", error);
              }
            } else {
              console.error(
                "Error: allContents is either not an array or it is empty."
              );
            }
          }

          setNotConsumedContent(notConsumedContent);
        } catch (error) {
          console.error("Error while fetching courses:", error);
          showErrorMessage(t("FAILED_TO_FETCH_DATA"));
        }
      }
    };
    fetchChats();
    getCourseProgress();
  }, [batchDetails, creatorId, allContents]);

  const handleDirectConnect = () => {
    if (chat.length === 0) {
      setOpen(true);
    } else if (!isMobile && chat[0]?.is_accepted == true) {
      setOpen(true);
    } else {
      navigate(routeConfig.ROUTES.ADDCONNECTION_PAGE.CHAT, {
        state: { senderUserId: _userId, receiverUserId: creatorId },
      });
    }
  };

  const handleGoBack = () => {
    navigate(-1); // Navigate back in history
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const handleLinkClick = (id) => {
    if (isEnroll) {
      navigate(`${routeConfig.ROUTES.PLAYER_PAGE.PLAYER}?${id}`, {
        state: {
          coursename: userData?.result?.content?.name,
          batchid: batchDetails?.batchId,
          courseid: contentId,
          isenroll: isEnroll,
          consumedcontents: ConsumedContents,
        },
      });
    } else {
      showErrorMessage(
        "You must join the course to get complete access to content."
      );
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setShowEnrollmentSnackbar(false);
  };

  const isEnrolled = () => {
    return (
      userCourseData &&
      userCourseData.courses &&
      userCourseData?.courses?.some((course) => course.contentId === contentId)
    );
  };

  const handleLeaveCourseClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
  };

  const handleLeaveConfirmed = async () => {
    try {
      const url = `${urlConfig.URLS.LEARNER_PREFIX}${urlConfig.URLS.COURSE.UNENROLL_USER_COURSE}`;
      const requestBody = {
        request: {
          courseId: contentId,
          userId: _userId,
          batchId: batchData?.batchId,
        },
      };
      const response = await axios.post(url, requestBody);
      if (response.status === 200) {
        setEnrolled(true);
        setShowUnEnrollmentSnackbar(true);
      }
    } catch (error) {
      console.error("Error enrolling in the course:", error);
      showErrorMessage(t("FAILED_TO_ENROLL_INTO_COURSE"));
    }
    window.location.reload();
  };

  const renderActionButton = () => {
    if (isEnrolled() || enrolled) {
      if (isNotStarted) {
        return (
          <Box>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Box>
                {" "}
                <Button
                  onClick={() => handleGoBack()}
                  className="custom-btn-primary mr-5"
                >
                  {t("BACK")}
                </Button>
              </Box>

              <Box>
                <Button
                  onClick={() => handleLinkClick(childnode)}
                  className="custom-btn-primary  mr-5"
                >
                  {t("START_LEARNING")}
                </Button>
                {!isCompleted && (
                  <Button
                    onClick={handleLeaveCourseClick} // Open confirmation dialog
                    className="custom-btn-danger xs-mt-10"
                  >
                    {" "}
                    {t("LEAVE_COURSE")}
                  </Button>
                }
              </Box>
            </div>

            {showConfirmation && (
              <Dialog open={showConfirmation} onClose={handleConfirmationClose}>
                <DialogTitle>
                  {t("LEAVE_COURSE_CONFIRMATION_TITLE")}
                </DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    {t("LEAVE_COURSE_CONFIRMATION_MESSAGE")}
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={handleConfirmationClose}
                    className="custom-btn-default"
                  >
                    {t("CANCEL")}
                  </Button>
                  <Button
                    onClick={handleLeaveConfirmed}
                    className="custom-btn-primary"
                    autoFocus
                  >
                    {t("LEAVE_COURSE")}
                  </Button>
                </DialogActions>
              </Dialog>
            )}
          </Box>
        );
      } else {
        return (
          <>
            <Box>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Box>
                  {" "}
                  <Button
                    onClick={() => handleGoBack()}
                    className="custom-btn-primary mr-5"
                  >
                    {t("BACK")}
                  </Button>
                </Box>
                <Box>
                  <Button
                    disabled={isCompleted}
                    onClick={() =>
                      handleLinkClick(
                        ContinueLearning ?? NotConsumedContent ?? childnode
                      )
                    }
                    className="custom-btn-primary mr-5"
                  >
                    {t("CONTINUE_LEARNNG")}
                  </Button>
                  {!isCompleted && (
                    <Button
                      onClick={handleLeaveCourseClick} // Open confirmation dialog
                      className="custom-btn-danger xs-mt-10"
                    >
                      {" "}
                      {t("LEAVE_COURSE")}
                    </Button>
                  )}{" "}
                </Box>
              </div>

              {showConfirmation && (
                <Dialog
                  open={showConfirmation}
                  onClose={handleConfirmationClose}
                >
                  <DialogTitle>
                    {t("LEAVE_COURSE_CONFIRMATION_TITLE")}
                  </DialogTitle>
                  <DialogContent>
                    <DialogContentText>
                      {t("LEAVE_COURSE_CONFIRMATION_MESSAGE")}
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <Button
                      onClick={handleConfirmationClose}
                      className="custom-btn-default"
                    >
                      {t("CANCEL")}
                    </Button>
                    <Button
                      onClick={handleLeaveConfirmed}
                      className="custom-btn-primary"
                      autoFocus
                    >
                      {t("LEAVE_COURSE")}
                    </Button>
                  </DialogActions>
                </Dialog>
              )}
            </Box>
            {isCompleted && <Box>{t("COURSE_SUCCESSFULLY_COMPLETED")}</Box>}
          </>
        );
      }
    } else {
      if (
        (batchData?.enrollmentEndDate &&
          new Date(batchData.enrollmentEndDate) < new Date()) ||
        (!batchData?.enrollmentEndDate &&
          batchData?.endDate &&
          new Date(batchData.endDate) < new Date())
      ) {
        return (
          <Typography
            variant="h7"
            style={{
              margin: "12px 0",
              display: "block",
              fontSize: "14px",
              color: "red",
            }}
          >
            <Alert severity="warning">{t("BATCH_EXPIRED_MESSAGE")}</Alert>
          </Typography>
        );
      } else {
        const today = new Date();
        let lastDayOfEnrollment = null;

        if (batchData?.enrollmentEndDate) {
          const enrollmentEndDate = new Date(batchData.enrollmentEndDate);
          if (!isNaN(enrollmentEndDate.getTime())) {
            lastDayOfEnrollment = enrollmentEndDate;
          }
        }

        const isLastDayOfEnrollment =
          lastDayOfEnrollment &&
          lastDayOfEnrollment.toDateString() === today.toDateString();

        const isExpired =
          lastDayOfEnrollment &&
          lastDayOfEnrollment < formatDate(today) &&
          !isLastDayOfEnrollment;

        if (isExpired) {
          return (
            <Typography
              variant="h7"
              style={{
                margin: "12px 0",
                display: "block",
                fontSize: "14px",
                color: "red",
              }}
            >
              <Alert severity="warning">{t("BATCH_EXPIRED_MESSAGE")}</Alert>
            </Typography>
          );
        }

        return (
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Button
              onClick={() => handleGoBack()}
              className="custom-btn-primary mr-5"
            >
              {t("BACK")}
            </Button>

            <Button
              onClick={handleJoinAndOpenModal}
              disabled={isExpired || !activeBatch || isOwner}
              className="custom-btn-primary"
              style={{
                background: isExpired ? "#ccc" : "#004367",
              }}
            >
              {t("JOIN_COURSE")}
            </Button>
          </div>
        );
      }
    }
  };

  const handleJoinAndOpenModal = async () => {
    try {
      await handleJoinCourse(); // Wait for the user to join the course
      setShowConsentForm(true); // Open the consent form after joining the course
    } catch (error) {
      setShowEnrollmentSnackbar;
      console.error("Error:", error);
    }
  };

  const handleJoinCourse = async () => {
    try {
      const url = `${urlConfig.URLS.LEARNER_PREFIX}${urlConfig.URLS.COURSE.ENROLL_USER_COURSE}`;
      const requestBody = {
        request: {
          courseId: contentId,
          userId: _userId,
          batchId: batchData?.batchId,
        },
      };
      const response = await axios.post(url, requestBody);
      if (response.status === 200) {
        setEnrolled(true);
        setShowEnrollmentSnackbar(true);
        setIsEnroll(true);
      }
    } catch (error) {
      console.error("Error enrolling in the course:", error);
      showErrorMessage(t("FAILED_TO_ENROLL_INTO_COURSE"));
    }
  };

  const consentUpdate = async (status) => {
    try {
      const urlUpdate = `${urlConfig.URLS.LEARNER_PREFIX}${urlConfig.URLS.USER.CONSENT_UPDATE}`;
      const updateRequestBody = {
        request: {
          consent: {
            status: status,
            userId: _userId,
            consumerId: courseData.result.content.channel,
            objectId: contentId,
            objectType: "Collection",
          },
        },
      };
      const response = await axios.post(urlUpdate, updateRequestBody);
      if (response.status === 200) {
        const url = `${urlConfig.URLS.LEARNER_PREFIX}${urlConfig.URLS.USER.CONSENT_READ}`;
        const requestBody = {
          request: {
            consent: {
              filters: {
                userId: _userId,
                consumerId: courseData.result.content.channel,
                objectId: contentId,
              },
            },
          },
        };
        const response = await axios.post(url, requestBody);
        if (response.status === 200) {
          setShowConsentForm(false);
        }
      }
    } catch (error) {
      console.error("Error updating consent:", error);
      showErrorMessage(t("FAILED_TO_FETCH_DATA"));
    }
  };

  const handleCheckboxChange = (event) => {
    setConsentChecked(event.target.checked);
    setShareEnabled(event.target.checked);
  };

  const getUserData = async () => {
    try {
      const url = `${urlConfig.URLS.LEARNER_PREFIX}${urlConfig.URLS.USER.GET_PROFILE}${_userId}?fields=${urlConfig.params.userReadParam.fields}`;

      const response = await fetch(url);
      const data = await response.json();
      setUserInfo(data.result.response);
    } catch (error) {
      console.error("Error while getting user data:", error);
      showErrorMessage(t("FAILED_TO_FETCH_DATA"));
    }
  };

  const handleShareClick = () => {
    consentUpdate("ACTIVE");
    setShowConsentForm(false);
  };

  const handleDontShareClick = () => {
    consentUpdate("REVOKED");
    setShowConsentForm(false);
  };
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async () => {
    const requestBody = {
      sender_id: _userId,
      receiver_id: creatorId,
      message: formData.message,
    };

    try {
      const url = `${urlConfig.URLS.DIRECT_CONNECT.SEND_CHATS}`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Failed to send chat");
      }
      setOpen(false);
      console.log("sentChatRequest", response);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handlecopyrightOpen = () => {
    setcopyrightOpen(true);
  };

  const handlecopyrightClose = () => {
    setcopyrightOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    window.location.reload();
  };
  function getScoreCriteria(data) {
    // Check if certTemplates exists and is an object
    if (
      !data?.response?.certTemplates ||
      typeof data.response.certTemplates !== "object"
    ) {
      setScore(false);
      return "no certificate";
    }

    const certTemplateKeys = Object.keys(data.response.certTemplates);

    const certTemplateId = certTemplateKeys[0];

    const criteria =
      data.response.certTemplates[certTemplateId]?.criteria?.assessment ||
      data.response.cert_templates?.[certTemplateId]?.criteria?.assessment;

    const score = criteria?.score?.[">="] || "no certificate";
    setScore(score);
    return score;
  }
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

        <Modal
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
          open={showConsentForm}
          onClose={(event, reason) => {
            if (reason === "backdropClick" || reason === "escapeKeyDown") {
              setOpenModal(true);
            } else {
              handleCloseModal();
            }
          }}
        >
          <Box sx={style} className="joinCourse">
            <Typography
              id="modal-modal-title"
              variant="h5"
              component="h2"
              style={{ marginBottom: "20px" }}
            >
              {t("CONSENT_FORM_TITLE")}
            </Typography>
            <Box>
              <label>
                {t("USERNAME")}: {userInfo?.firstName}
              </label>
            </Box>
            <Box>
              <label>
                {t("USER_ID")}: {userInfo?.organisations[0]?.userId}
              </label>
            </Box>
            <Box>
              <label>
                {t("MOBILENUMBER")}: {userInfo?.phone}
              </label>
            </Box>
            <Box>
              <label>
                {t("EMAIL_ADDRESS")}: {userInfo?.email}
              </label>
            </Box>

            <Box>
              <input
                type="checkbox"
                checked={consentChecked}
                onChange={handleCheckboxChange}
              />
              <label>{t("CONSENT_TEXT")}</label>
            </Box>
            <Box className="d-flex jc-en">
              <Button
                onClick={handleDontShareClick}
                className="custom-btn-default mr-5"
              >
                {t("DONT_SHARE")}
              </Button>
              <Button
                onClick={handleShareClick}
                className="custom-btn-primary"
                disabled={!shareEnabled}
              >
                {t("SHARE")}
              </Button>
            </Box>
          </Box>
        </Modal>

        <Container
          maxWidth="xxl"
          role="main"
          className="xs-pb-20 lg-mt-12 joinCourse"
        >
          <Box className=" pos-relative xs-ml-15 pt-10">
            <Box>
              <img
                src={
                  userData?.result?.content.se_gradeLevels
                    ? require(`../../assets/cardBanner/${processString(
                        userData?.result?.content?.se_gradeLevels[0]
                      )}.png`)
                    : require("../../assets/cardBanner/management.png")
                }
                alt="Speaker One"
                className="contentdetail-bg"
                style={{
                  height: "200px",
                  width: "100%",
                }}
              />
            </Box>
          </Box>
          <Grid container spacing={2} className="mt-9 m-0">
            <Grid
              item
              xs={12}
              md={4}
              lg={4}
              className="sm-p-25 left-container mt-9 xs-px-0 xs-pl-15 mb-20"
            >
              <Grid container spacing={2}>
                <Breadcrumbs
                  aria-label="breadcrumb"
                  className="h6-title mt-15 pl-18"
                >
                  <Link
                    underline="hover"
                    style={{ maxHeight: "inherit" }}
                    onClick={handleGoBack}
                    color="#004367"
                    href={routeConfig.ROUTES.ALL_CONTENT_PAGE.ALL_CONTENT}
                  >
                    {t("ALL_CONTENT")}
                  </Link>
                  <Link
                    underline="hover"
                    href=""
                    aria-current="page"
                    className="h6-title oneLineEllipsis height-inherit"
                  >
                    {userData?.result?.content?.name}
                  </Link>
                </Breadcrumbs>
              </Grid>
              <Box className="h3-title my-10">
                {" "}
                {userData?.result?.content?.name}
              </Box>

              {(courseData?.result?.content?.board ||
                courseData?.result?.content?.se_boards ||
                courseData?.result?.content?.gradeLevel ||
                courseData?.result?.content?.se_gradeLevels) && (
                <Box className="xs-mb-20">
                  <Typography
                    className="h6-title"
                    style={{ display: "inline-block" }}
                  >
                    {t("CONTENT_TAGS")}:{" "}
                  </Typography>

                  {Array.isArray(courseData?.result?.content?.board) &&
                    courseData?.result?.content?.board?.map((item, index) => (
                      <Button
                        key={`board-${index}`}
                        size="small"
                        style={{
                          color: "#424242",
                          fontSize: "10px",
                          margin: "0 10px 3px 6px",
                          cursor: "auto",
                        }}
                        className="bg-blueShade3"
                      >
                        {item}
                      </Button>
                    ))}
                  {courseData?.result?.content?.se_boards &&
                    courseData?.result?.content?.se_boards?.map(
                      (item, index) => (
                        <Button
                          key={`se_boards-${index}`}
                          size="small"
                          style={{
                            color: "#424242",
                            fontSize: "10px",
                            margin: "0 10px 3px 6px",
                            cursor: "auto",
                          }}
                          className="bg-blueShade3"
                        >
                          {item}
                        </Button>
                      )
                    )}
                  {courseData?.result?.content?.gradeLevel &&
                    courseData?.result?.content?.gradeLevel?.map(
                      (item, index) => (
                        <Button
                          key={`gradeLevel-${index}`}
                          size="small"
                          style={{
                            color: "#424242",
                            fontSize: "10px",
                            margin: "0 10px 3px 6px",
                            cursor: "auto",
                          }}
                          className="bg-blueShade3"
                        >
                          {item}
                        </Button>
                      )
                    )}
                  {courseData?.result?.content?.se_gradeLevels &&
                    courseData?.result?.content?.se_gradeLevels?.map(
                      (item, index) => (
                        <Button
                          key={`se_gradeLevels-${index}`}
                          size="small"
                          style={{
                            color: "#424242",
                            fontSize: "10px",
                            margin: "0 10px 3px 6px",
                            cursor: "auto",
                          }}
                          className="bg-blueShade3"
                        >
                          {item}
                        </Button>
                      )
                    )}
                </Box>
              )}
              <Box className="lg-hide"> {renderActionButton()}</Box>
              <Box
                style={{
                  background: "#F9FAFC",
                  padding: "10px",
                  borderRadius: "10px",
                  color: "#484848",
                  boxShadow: "0px 4px 4px 0px #00000040",
                }}
                className="xs-hide"
              >
                <Typography
                  variant="h7"
                  style={{
                    margin: "0 0 9px 0",
                    display: "block",
                    fontSize: "16px",
                  }}
                >
                  {t("BATCH_DETAILS")}:
                </Typography>
                <Box
                  style={{
                    background: "#fff",
                    padding: "10px",
                    borderRadius: "10px",
                  }}
                >
                  <Typography
                    variant="h7"
                    style={{
                      fontWeight: "500",
                      margin: "9px 0",
                      display: "block",
                      fontSize: "14px",
                    }}
                  >
                    {t("BATCH_START_DATE")}:{" "}
                    {batchData?.startDate
                      ? formatDate(batchData?.startDate)
                      : "Not Provided"}
                  </Typography>
                  <Typography
                    variant="h7"
                    style={{
                      fontWeight: "500",
                      margin: "9px 0",
                      display: "block",
                      fontSize: "14px",
                    }}
                  >
                    {t("BATCH_END_DATE")}:{" "}
                    {batchData?.endDate
                      ? formatDate(batchData?.endDate)
                      : "Not Provided"}
                  </Typography>
                  <Typography
                    variant="h7"
                    style={{
                      fontWeight: "500",
                      margin: "9px 0",
                      display: "block",
                      fontSize: "14px",
                    }}
                  >
                    {t("LAST_DATE_FOR_ENROLLMENT")}:{" "}
                    {batchData?.enrollmentEndDate
                      ? formatDate(batchData.enrollmentEndDate)
                      : "Not Provided"}
                  </Typography>
                </Box>
              </Box>
              {batchDetails && batchDetails.cert_templates != null && (
                <Accordion
                  className="xs-hide accordionBoxShadow"
                  style={{
                    background: "#F9FAFC",
                    borderRadius: "10px",
                    margin: "10px",
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1-content"
                    id="panel1-header"
                    className="xs-hide h4-title"
                  >
                    {t("CERTIFICATION_CRITERIA")}
                  </AccordionSummary>
                  <AccordionDetails
                    style={{
                      background: "#fff",
                      margin: "5px 10px",
                      borderRadius: "10px",
                    }}
                  >
                    {batchDetail && (
                      <ul>
                        <li className="h6-title">
                          {t("COMPLETION_CERTIFICATE_ISSUED")}
                        </li>
                        {score !== "no certificate" && (
                          <li className="h6-title">
                            {t("CERT_ISSUED_SCORE")}
                            {` ${score}% `}
                            {t("ASSESSMENT")}
                          </li>
                        )}
                      </ul>
                    )}
                  </AccordionDetails>
                </Accordion>
              )}

              {isEnrolled &&
                batchDetails &&
                batchDetails.cert_templates == null && (
                  <Box
                    style={{
                      background: "#e3f5ff",
                      padding: "10px",
                      borderRadius: "10px",
                      color: "#424242",
                    }}
                    className="xs-hide accordionBoxShadow"
                  >
                    <Typography
                      variant="h7"
                      style={{
                        margin: "0 0 9px 0",
                        display: "block",
                        fontSize: "16px",
                      }}
                    >
                      {t("CERT_NOT_ATTACHED")}
                    </Typography>
                  </Box>
                )}
              <Accordion
                className="xs-hide accordionBoxShadow"
                style={{
                  background: "#F9FAFC",
                  borderRadius: "10px",
                  marginTop: "10px",
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1-content"
                  id="panel1-header"
                  className="h4-title"
                >
                  {t("OTHER_DETAILS")}
                </AccordionSummary>
                <AccordionDetails style={{ background: "#fff" }}>
                  <Typography className="h6-title">
                    {t("CREATED_BY")}:{" "}
                    {userData &&
                      userData.result &&
                      userData.result.content.creator}
                  </Typography>
                  <Typography className="h6-title">
                    {t("PUBLISHED_ON_NULP_BY")}:{" "}
                    {userData &&
                      userData.result &&
                      userData.result?.content?.orgDetails?.orgName}
                  </Typography>
                  <Typography className="h6-title">
                    {t("CREATED_ON")}:{" "}
                    {userData &&
                      userData.result &&
                      formatDate(userData.result.content.children[0].createdOn)}
                  </Typography>
                  <Typography className="h6-title">
                    {t("UPDATED_ON")}:{" "}
                    {userData &&
                      userData.result &&
                      formatDate(
                        userData.result.content.children[0].lastUpdatedOn
                      )}
                  </Typography>

                  <Typography
                    className=""
                    onClick={handlecopyrightOpen}
                    style={{
                      cursor: "pointer",
                      color: "blue",
                      textDecoration: "underline",
                      fontSize: "small",
                    }}
                  >
                    {t("CREDITS")}
                  </Typography>
                  <Dialog
                    open={copyrightOpen}
                    onClose={handlecopyrightClose}
                    sx={{ "& .MuiDialog-paper": { width: "455px" } }}
                  >
                    <DialogTitle>{t("CREDITS")}</DialogTitle>
                    <DialogContent>
                      <p
                        style={{
                          color: "#4d4d4d",
                          fontSize: "13px",
                          fontWeight: "bold",
                        }}
                      >
                        {t("COPYRIGHT")}
                      </p>
                      {userData?.result?.content?.orgDetails?.orgName &&
                      userData?.result?.content?.copyrightYear
                        ? `${userData.result.content.orgDetails.orgName}, ${userData.result.content.copyrightYear}`
                        : userData?.result?.content?.orgDetails?.orgName ||
                          userData?.result?.content?.copyrightYear}
                      <h5>{t("THIS_CONTENT_IS_DERIVED_FROM")}</h5>
                      <p
                        style={{
                          color: "#4d4d4d",
                          fontSize: "13px",
                          fontWeight: "bold",
                        }}
                      >
                        {t("CONTENT")}
                      </p>
                      {userData?.result?.content?.name}
                      <p
                        style={{
                          color: "#4d4d4d",
                          fontSize: "13px",
                          fontWeight: "bold",
                        }}
                      >
                        {t("LICENSE_TERMS")}
                      </p>
                      {userData?.result?.content?.licenseDetails?.name}
                      <p
                        style={{
                          color: "#4d4d4d",
                          fontSize: "13px",
                          fontWeight: "bold",
                        }}
                      >
                        {t("PUBLISHED_ON_NULP_BY")}
                      </p>
                      {userData?.result?.content?.orgDetails?.orgName}
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={handlecopyrightClose} color="primary">
                        {t("CLOSE")}
                      </Button>
                    </DialogActions>
                  </Dialog>
                  <Typography className="h6-title">
                    {t("LICENSE_TERMS")}:{" "}
                    {userData?.result?.content?.licenseDetails?.name}
                    {t("FOR_DETAILS")}:{" "}
                    <a
                      href={userData?.result?.content?.licenseDetails?.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {userData?.result?.content?.licenseDetails?.url}
                    </a>
                  </Typography>
                </AccordionDetails>
              </Accordion>

              <div className="xs-hide">
                <React.Fragment>
                  {chat.length === 0 && (
                    <Button
                      onClick={handleDirectConnect}
                      variant="contained"
                      className="custom-btn-primary my-20"
                      style={{
                        background: "#004367",
                      }}
                    >
                      {t("CONNECT_WITH_CREATOR")}
                    </Button>
                  )}
                  {chat.length > 0 && chat[0]?.is_accepted === false && (
                    <React.Fragment>
                      <Alert severity="warning" style={{ margin: "10px 0" }}>
                        {t("YOUR_CHAT_REQUEST_IS_PENDING")}
                      </Alert>
                      <Button
                        variant="contained"
                        className="custom-btn-primary my-20"
                        style={{
                          background:
                            chat.length > 0 && chat[0]?.is_accepted === false
                              ? "#a9b3f5"
                              : "#004367",
                        }}
                        disabled
                      >
                        {t("CHAT_WITH_CREATOR")}
                      </Button>
                    </React.Fragment>
                  )}
                  {chat.length > 0 && chat[0].is_accepted === true && (
                    <Button
                      onClick={handleDirectConnect}
                      variant="contained"
                      className="custom-btn-primary my-20"
                      style={{
                        background: "#004367",
                      }}
                    >
                      {t("CHAT_WITH_CREATOR")}
                    </Button>
                  )}
                </React.Fragment>
                {_userId && creatorId && (
                  <Modal open={open} onClose={handleClose}>
                    <div className="contentCreator">
                      <Chat
                        senderUserId={_userId}
                        receiverUserId={creatorId}
                        onChatSent={handleClose}
                      />{" "}
                    </div>
                  </Modal>
                )}
              </div>
              <Box className="xs-hide mb-10">
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
            <Grid
              item
              xs={12}
              md={8}
              lg={8}
              className="mb-20 xs-pr-16 lg-pr-20"
            >
              <Box style={{ textAlign: "right" }} className="xs-hide">
                {" "}
                {renderActionButton()}
              </Box>
              <Box>
                {courseData && courseData?.result?.content && (
                  <>
                    <Typography
                      className="h5-title"
                      style={{ fontWeight: "600" }}
                    >
                      {t("DESCRIPTION")}:
                    </Typography>
                    <Typography
                      className="h5-title mb-15"
                      style={{ fontWeight: "400", fontSize: "14px" }}
                    >
                      {courseData?.result?.content?.description.split(" ")
                        .length > 100
                        ? showMore
                          ? courseData?.result?.content?.description
                          : courseData?.result?.content?.description
                              .split(" ")
                              .slice(0, 30)
                              .join(" ") + "..."
                        : courseData?.result?.content?.description}
                    </Typography>
                    {courseData?.result?.content?.description.split(" ")
                      .length > 100 && (
                      <Button onClick={toggleShowMore}>
                        {showMore ? t("Show Less") : t("Show More")}
                      </Button>
                    )}
                  </>
                )}
              </Box>

              <Accordion
                defaultExpanded
                style={{
                  background: "#F9FAFC",
                  borderRadius: "10px",
                  marginTop: "10px",
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1-content"
                  id="panel1-header"
                  className="h4-title"
                  style={{ fontWeight: "500" }}
                >
                  {t("COURSES_MODULE")}
                </AccordionSummary>
                <AccordionDetails>
                  {userData?.result?.content?.children.map((faqIndex) => (
                    <Accordion
                      key={faqIndex.id}
                      style={{ borderRadius: "10px", margin: "10px 0" }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls={`panel${faqIndex.id}-content`}
                        id={`panel${faqIndex.id}-header`}
                        className="h5-title"
                      >
                        {faqIndex.name}
                      </AccordionSummary>

                      <AccordionDetails
                        style={{ 'padding': '12px',margin: '-10px 0px'}}
                      >
                        {/* If it's not a content collection, render it like a clickable child */}
                        {faqIndex.mimeType !==
                        "application/vnd.ekstep.content-collection" ? (
                          <Link
                            href="#"
                            underline="none"
                            style={{ verticalAlign: "super" }}
                            onClick={() => handleLinkClick(faqIndex.identifier)}
                            className="h6-title"
                          >
                            {faqIndex.name}
                            {completedContents.includes(
                              faqIndex.identifier
                            ) && (
                              <CheckCircleIcon
                                style={{
                                  color: "green",
                                  fontSize: "24px",
                                  paddingLeft: "10px",
                                  float: "right",
                                }}
                              />
                            )}
                          </Link>
                        ) : (
                          faqIndex?.children?.map((faqIndexname) => (
                            <AccordionDetails
                              key={faqIndexname.identifier || faqIndexname.name}
                              className="border-bottom"
                              style={{ 'padding': '12px',margin: '-10px 0px'}}
                            >
                              {faqIndexname.children &&
                              faqIndexname.children.length > 0 ? (
                                <span
                                  className="h6-title"
                                  style={{ verticalAlign: "super" }}
                                >
                                  {faqIndexname.name}
                                </span>
                              ) : (
                                <Link
                                  href="#"
                                  underline="none"
                                  style={{ verticalAlign: "super" }}
                                  onClick={() =>
                                    handleLinkClick(faqIndexname.identifier)
                                  }
                                  className="h6-title"
                                >
                                  {faqIndexname.name}
                                  {completedContents.includes(
                                    faqIndexname.identifier
                                  ) && (
                                    <CheckCircleIcon
                                      style={{
                                        color: "green",
                                        fontSize: "24px",
                                        paddingLeft: "10px",
                                        float: "right",
                                      }}
                                    />
                                  )}
                                </Link>
                              )}

                              {faqIndexname.children &&
                                faqIndexname.children.length > 0 && (
                                  <div style={{ paddingLeft: "20px" }}>
                                    {faqIndexname.children.map((child) => (
                                      <AccordionDetails
                                        key={child.identifier || child.name}
                                        className="border-bottom"
                                        style={{ 'padding': '12px',margin: '-10px 0px'}}
                                      >
                                        {child.children &&
                                        child.children.length > 0 ? (
                                          <span
                                            className="h6-title"
                                            style={{ verticalAlign: "super" }}
                                          >
                                            {child.name}
                                          </span>
                                        ) : (
                                          <Link
                                            href="#"
                                            underline="none"
                                            style={{ verticalAlign: "super" }}
                                            onClick={() =>
                                              handleLinkClick(child.identifier)
                                            }
                                            className="h6-title"
                                          >
                                            {child.name}
                                            {completedContents.includes(
                                              child.identifier
                                            ) && (
                                              <CheckCircleIcon
                                                style={{
                                                  color: "green",
                                                  fontSize: "24px",
                                                  paddingLeft: "10px",
                                                  float: "right",
                                                }}
                                              />
                                            )}
                                          </Link>
                                        )}
                                        {child.children &&
                                          child.children.length > 0 && (
                                            <div
                                              style={{ paddingLeft: "20px" }}
                                            >
                                              {child.children.map(
                                                (grandchild) => (
                                                  <AccordionDetails
                                                    key={
                                                      grandchild.identifier ||
                                                      grandchild.name
                                                    }
                                                    className="border-bottom"
                                                    style={{
                                                      paddingLeft: "35px",
                                                    }}
                                                  >
                                                    {grandchild.children &&
                                                    grandchild.children.length >
                                                      0 ? (
                                                      <span
                                                        className="h6-title"
                                                        style={{
                                                          verticalAlign:
                                                            "super",
                                                        }}
                                                      >
                                                        {grandchild.name}
                                                      </span>
                                                    ) : (
                                                      <Link
                                                        href="#"
                                                        underline="none"
                                                        style={{
                                                          verticalAlign:
                                                            "super",
                                                        }}
                                                        onClick={() =>
                                                          handleLinkClick(
                                                            grandchild.identifier
                                                          )
                                                        }
                                                        className="h6-title"
                                                      >
                                                        {grandchild.name}
                                                        {completedContents.includes(
                                                          grandchild.identifier
                                                        ) && (
                                                          <CheckCircleIcon
                                                            style={{
                                                              color: "green",
                                                              fontSize: "24px",
                                                              paddingLeft:
                                                                "10px",
                                                              float: "right",
                                                            }}
                                                          />
                                                        )}
                                                      </Link>
                                                    )}
                                                  </AccordionDetails>
                                                )
                                              )}
                                            </div>
                                          )}
                                      </AccordionDetails>
                                    ))}
                                  </div>
                                )}
                            </AccordionDetails>
                          ))
                        )}
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </AccordionDetails>
              </Accordion>
              <Box
                style={{
                  background: "#F9FAFC",
                  padding: "10px",
                  borderRadius: "10px",
                  color: "#484848",
                }}
                className="lg-hide accordionBoxShadow"
              >
                <Typography
                  variant="h7"
                  style={{
                    margin: "0 0 9px 0",
                    display: "block",
                    fontSize: "16px",
                  }}
                >
                  {t("BATCH_DETAILS")}:
                </Typography>
                <Box
                  style={{
                    background: "#fff",
                    padding: "10px",
                    borderRadius: "10px",
                  }}
                >
                  <Typography
                    variant="h7"
                    style={{
                      fontWeight: "500",
                      margin: "9px 0",
                      display: "block",
                      fontSize: "14px",
                    }}
                  >
                    {t("BATCH_START_DATE")}: {formatDate(batchData?.startDate)}
                  </Typography>
                  <Typography
                    variant="h7"
                    style={{
                      fontWeight: "500",
                      margin: "9px 0",
                      display: "block",
                      fontSize: "14px",
                    }}
                  >
                    {t("BATCH_END_DATE")}: {formatDate(batchData?.endDate)}
                  </Typography>
                  <Typography
                    variant="h7"
                    style={{
                      fontWeight: "500",
                      margin: "9px 0",
                      display: "block",
                      fontSize: "14px",
                    }}
                  >
                    {t("LAST_DATE_FOR_ENROLLMENT")}:{" "}
                    {formatDate(batchData?.enrollmentEndDate)}
                  </Typography>
                </Box>
              </Box>
              {batchDetails && batchDetails.cert_templates != null && (
                <Accordion
                  className="lg-hide accordionBoxShadow"
                  style={{
                    background: "#F9FAFC",
                    borderRadius: "10px",
                    marginTop: "10px",
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1-content"
                    id="panel1-header"
                    className="h4-title"
                  >
                    {t("CERTIFICATION_CRITERIA")}
                  </AccordionSummary>
                  <AccordionDetails
                    style={{
                      background: "#fff",
                      padding: "5px 10px",
                      borderRadius: "10px",
                    }}
                  >
                    {batchDetail && (
                      <ul>
                        <li className="h6-title">
                          {t("COMPLETION_CERTIFICATE_ISSUED")}
                        </li>
                        {score !== "no certificate" && (
                          <li className="h6-title">
                            {t("CERT_ISSUED_SCORE")}
                            {` ${score}% `}
                            {t("ASSESSMENT")}
                          </li>
                        )}
                      </ul>
                    )}
                  </AccordionDetails>
                </Accordion>
              )}

              {isEnrolled &&
                batchDetails &&
                batchDetails.cert_templates == null && (
                  <Box
                    style={{
                      background: "#e3f5ff",
                      padding: "10px",
                      borderRadius: "10px",
                      color: "#424242",
                    }}
                    className="lg-hide accordionBoxShadow"
                  >
                    <Typography
                      variant="h7"
                      style={{
                        margin: "0 0 9px 0",
                        display: "block",
                        fontSize: "14px",
                      }}
                    >
                      {t("CERT_NOT_ATTACHED")}:
                    </Typography>
                  </Box>
                )}
              <Accordion
                className="lg-hide accordionBoxShadow"
                style={{
                  background: "#F9FAFC",
                  borderRadius: "10px",
                  marginTop: "10px",
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1-content"
                  id="panel1-header"
                  className="h4-title"
                >
                  {t("OTHER_DETAILS")}
                </AccordionSummary>
                <AccordionDetails
                  style={{
                    background: "#fff",
                    padding: "5px 10px",
                    borderRadius: "10px",
                  }}
                >
                  <Typography className="h6-title">
                    {t("CREATED_ON")}:{" "}
                    {courseData &&
                      courseData.result &&
                      formatDate(
                        courseData.result.content.children[0].createdOn
                      )}
                  </Typography>
                  <Typography className="h6-title">
                    {t("UPDATED_ON")}:{" "}
                    {courseData &&
                      courseData.result &&
                      formatDate(
                        courseData.result.content.children[0].lastUpdatedOn
                      )}
                  </Typography>
                  <Typography className="h6-title">{t("CREDITS")}:</Typography>
                  <Typography className="h6-title">
                    {t("LICENSE_TERMS")}:{" "}
                    {courseData?.result?.content?.licenseDetails?.name}
                    {t("FOR_DETAILS")}:{" "}
                    <a
                      href={courseData?.result?.content?.licenseDetails?.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ wordWrap: "break-word" }}
                    >
                      {courseData?.result?.content?.licenseDetails?.url}
                    </a>
                  </Typography>
                </AccordionDetails>
              </Accordion>
              <div className="lg-hide">
                <React.Fragment>
                  {chat && chat.length === 0 && (
                    <Button
                      onClick={handleDirectConnect}
                      variant="contained"
                      className="custom-btn-primary my-20"
                      style={{
                        background: "#004367",
                      }}
                    >
                      {t("CONNECT_WITH_CREATOR")}
                    </Button>
                  )}
                  {chat &&
                    chat.length > 0 &&
                    chat[0]?.is_accepted === false && (
                      <React.Fragment>
                        <Alert severity="warning" style={{ margin: "10px 0" }}>
                          {t("YOUR_CHAT_REQUEST_IS_PENDING")}
                        </Alert>
                        <Button
                          variant="contained"
                          className="custom-btn-primary my-20"
                          style={{
                            background:
                              chat.length > 0 && chat[0]?.is_accepted === false
                                ? "#a9b3f5"
                                : "#004367",
                          }}
                          disabled
                        >
                          {t("CHAT_WITH_CREATOR")}
                        </Button>
                      </React.Fragment>
                    )}
                  {chat && chat.length > 0 && chat[0].is_accepted === true && (
                    <Button
                      onClick={handleDirectConnect}
                      variant="contained"
                      className="custom-btn-primary my-20"
                      style={{
                        background: "#004367",
                      }}
                    >
                      {t("CHAT_WITH_CREATOR")}
                    </Button>
                  )}
                </React.Fragment>
                {_userId && creatorId && (
                  <Modal open={open} onClose={handleClose}>
                    <div
                      style={{
                        position: "absolute",
                        top: "0",
                        left: "35%",
                        padding: "20px",
                        boxShadow: "0 3px 5px rgba(0, 0, 0, 0.3)",
                        outline: "none",
                        borderRadius: 8,
                        width: "90%", // Relative width
                        maxWidth: "700px", // Maximum width
                        height: "80%", // Relative height
                        maxHeight: "90vh", // Maximum height
                        overflowY: "auto", // Scroll if content overflows
                      }}
                      className="contentCreator"
                    >
                      <Chat
                        senderUserId={_userId}
                        receiverUserId={creatorId}
                        onChatSent={handleClose}
                        onClose={handleClose}
                        showCloseIcon={true}
                      />{" "}
                    </div>
                  </Modal>
                )}
              </div>
              <Box className="my-20 lg-hide social-icons">
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
          </Grid>
        </Container>
        <FloatingChatIcon />
      </Box>
      <Footer />
    </div>
  );
};

export default JoinCourse;
