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
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [userInfo, setUserInfo] = useState();
  const [consentChecked, setConsentChecked] = useState(false);
  const [shareEnabled, setShareEnabled] = useState(false);
  const [userData, setUserData] = useState();
  const location = useLocation();
  const navigate = useNavigate();
  const [toasterMessage, setToasterMessage] = useState("");
  const [creatorId, setCreatorId] = useState("");
  const [open, setOpen] = useState(false);
  const [chat, setChat] = useState([]);
  const [childnode, setChildNode] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
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
  const [isNotStarted, setIsNotStarted] = useState(false);
  const [ContinueLearning, setContinueLearning] = useState();
  const [allContents, setAllContents] = useState();
  const [NotConsumedContent, setNotConsumedContent] = useState();
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
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 767);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const newPath = location.pathname + "?" + contentId;
  sessionStorage.setItem("previousRoutes", newPath);

  // Helper function to extract identifiers efficiently
  const extractIdentifiers = (content) => {
    if (!content?.children?.length) return null;

    const firstChild = content.children[0];
    if (!firstChild) return null;

    // Check for nested structure
    if (firstChild.children?.[0]?.children) {
      return firstChild.children[0].children[0]?.identifier;
    } else if (firstChild.children) {
      return firstChild.children[0]?.identifier;
    } else {
      return firstChild.identifier;
    }
  };

  // Optimized function to get all leaf identifiers
  const getAllLeafIdentifiers = (nodes) => {
    const identifiers = [];

    const traverse = (nodeList) => {
      for (const node of nodeList) {
        if (!node?.children?.length) {
          if (node.identifier) {
            identifiers.push(node.identifier);
          }
        } else {
          traverse(node.children);
        }
      }
    };

    if (nodes?.length) {
      traverse(nodes);
    }

    return identifiers;
  };

  // Helper function to handle course data updates
  const updateCourseData = (content, data) => {
    const updates = {
      creatorId: content.createdBy,
      courseData: data,
      userData: data,
      isOwner: _userId === content.createdBy,
      childNode: extractIdentifiers(content),
      allContents: getAllLeafIdentifiers(content.children),
    };

    setCreatorId(updates.creatorId);
    setCourseData(updates.courseData);
    setUserData(updates.userData);
    setIsOwner(updates.isOwner);
    setChildNode(updates.childNode);
    setAllContents(updates.allContents);
  };

  // Helper function to handle batch data updates
  const updateBatchData = (batchDetails) => {
    setBatchData({
      startDate: batchDetails.startDate,
      endDate: batchDetails.endDate,
      enrollmentEndDate: batchDetails.enrollmentEndDate,
      batchId: batchDetails.batchId,
    });
    setBatchDetails(batchDetails);
  };

  // Helper function to handle enrolled course check
  const handleEnrolledCourseCheck = (data) => {
    setUserCourseData(data.result);
    const isEnrolled = data?.result?.courses?.some(
      (course) => course?.contentId === contentId
    );
    setIsEnroll(isEnrolled);
  };

  // Helper function to handle batch detail processing
  const handleBatchDetailProcessing = (data) => {
    setBatchDetail(data.result);
    getScoreCriteria(data.result);
    checkCertTemplate(data.result);
  };

  // Helper function to handle user data processing
  const handleUserDataProcessing = (data) => {
    setUserInfo(data.result.response);
  };

  // Helper functions to reduce cognitive complexity in render
  const renderContentTags = () => {
    const content = courseData?.result?.content;
    const hasTags =
      content?.board ||
      content?.se_boards ||
      content?.gradeLevel ||
      content?.se_gradeLevels;

    if (!hasTags) return null;

    const renderTagButtons = (items, prefix) => {
      if (!Array.isArray(items)) return null;
      return items.map((item, index) => (
        <Button
          key={`${prefix}-${index}`}
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
      ));
    };

    return (
      <Box className="xs-mb-20">
        <Typography className="h6-title" style={{ display: "inline-block" }}>
          {t("CONTENT_TAGS")}:{" "}
        </Typography>
        {renderTagButtons(content.board, "board")}
        {renderTagButtons(content.se_boards, "se_boards")}
        {renderTagButtons(content.gradeLevel, "gradeLevel")}
        {renderTagButtons(content.se_gradeLevels, "se_gradeLevels")}
      </Box>
    );
  };

  const renderChatSection = (isMobileView = false) => {
    const chatClass = isMobileView ? "lg-hide" : "xs-hide";

    if (chat.length === 0) {
      return (
        <div className={chatClass}>
          <Button
            onClick={handleDirectConnect}
            variant="contained"
            className="custom-btn-primary my-20"
            style={{ background: "#004367" }}
          >
            {t("CONNECT_WITH_CREATOR")}
          </Button>
        </div>
      );
    }

    if (chat[0]?.is_accepted === false) {
      return (
        <div className={chatClass}>
          <Alert severity="warning" style={{ margin: "10px 0" }}>
            {t("YOUR_CHAT_REQUEST_IS_PENDING")}
          </Alert>
          <Button
            variant="contained"
            className="custom-btn-primary my-20"
            style={{ background: "#a9b3f5" }}
            disabled
          >
            {t("CHAT_WITH_CREATOR")}
          </Button>
        </div>
      );
    }

    return chat[0]?.is_accepted === true ? (
      <div className={chatClass}>
        <Button
          onClick={handleDirectConnect}
          variant="contained"
          className="custom-btn-primary my-20"
          style={{ background: "#004367" }}
        >
          {t("CHAT_WITH_CREATOR")}
        </Button>
      </div>
    ) : null;
  };

  const renderSocialShareButtons = (isMobileView = false) => {
    const shareClass = isMobileView
      ? "my-20 lg-hide social-icons"
      : "xs-hide mb-10";

    return (
      <Box className={shareClass}>
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
    );
  };

  const renderContentItem = (item, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isCompleted = completedContents.includes(item.identifier);

    if (item.mimeType === "application/vnd.ekstep.content-collection") {
      return (
        <AccordionDetails
          key={item.identifier || item.name}
          className="border-bottom"
          style={{ padding: "12px", margin: "-10px 0px" }}
        >
          {hasChildren ? (
            <span className="h6-title" style={{ verticalAlign: "super" }}>
              {item.name}
            </span>
          ) : (
            <Link
              href="#"
              underline="none"
              style={{ verticalAlign: "super" }}
              onClick={() => handleLinkClick(item.identifier)}
              className="h6-title"
            >
              {item.name}
              {isCompleted && (
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
          {hasChildren && (
            <div style={{ paddingLeft: "20px" }}>
              {item.children.map((child) =>
                renderContentItem(child, level + 1)
              )}
            </div>
          )}
        </AccordionDetails>
      );
    }

    return (
      <Link
        href="#"
        underline="none"
        style={{ verticalAlign: "super" }}
        onClick={() => handleLinkClick(item.identifier)}
        className="h6-title"
      >
        {item.name}
        {isCompleted && (
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
    );
  };

  const renderDescription = () => {
    if (!courseData?.result?.content) return null;

    const description = courseData.result.content.description;
    const wordCount = description?.split(" ").length || 0;
    const shouldTruncate = wordCount > 100;

    const displayText =
      shouldTruncate && !showMore
        ? description.split(" ").slice(0, 30).join(" ") + "..."
        : description;

    return (
      <Box>
        <Typography className="h5-title" style={{ fontWeight: "600" }}>
          {t("DESCRIPTION")}:
        </Typography>
        <Typography
          className="h5-title mb-15"
          style={{ fontWeight: "400", fontSize: "14px" }}
        >
          {displayText}
        </Typography>
        {shouldTruncate && (
          <Button onClick={toggleShowMore}>
            {showMore ? t("Show Less") : t("Show More")}
          </Button>
        )}
      </Box>
    );
  };

  useEffect(() => {
    const abortController = new AbortController();

    const fetchCourseData = async () => {
      try {
        const url = `${urlConfig.URLS.PUBLIC_PREFIX}${urlConfig.URLS.COURSE.HIERARCHY}/${contentId}?orgdetails=${appConfig.ContentPlayer.contentApiQueryParams.orgdetails}&licenseDetails=${appConfig.ContentPlayer.contentApiQueryParams.licenseDetails}`;

        const response = await fetch(url, {
          headers: { "Content-Type": "application/json" },
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const content = data?.result?.content;

        if (!content) {
          throw new Error("Invalid course data structure");
        }

        updateCourseData(content, data);
      } catch (error) {
        if (error.name === "AbortError") return;
        console.error("Error fetching course data:", error);
        showErrorMessage(t("FAILED_TO_FETCH_DATA"));
      }
    };

    const fetchBatchData = async () => {
      try {
        const url = `${urlConfig.URLS.LEARNER_PREFIX}${urlConfig.URLS.BATCH.GET_BATCHS}`;
        const requestBody = {
          request: {
            filters: {
              status: "1",
              courseId: contentId,
              enrollmentType: "open",
            },
            sort_by: { createdDate: "desc" },
          },
        };

        const response = await axios.post(url, requestBody, {
          signal: abortController.signal,
        });

        const { result } = response.data;

        if (!result?.response) {
          SetActiveBatch(false);
          showErrorMessage(t("This course has no active Batches"));
          return;
        }

        const { count, content: batchContent } = result.response;

        if (count === 0 || !batchContent?.length) {
          SetActiveBatch(false);
          showErrorMessage(t("This course has no active Batches"));
          return;
        }

        const batchDetails = batchContent[0];
        await getBatchDetail(batchDetails.batchId);
        updateBatchData(batchDetails);
      } catch (error) {
        if (error.name === "AbortError") return;
        console.error("Error fetching batch data:", error);
        showErrorMessage(t("FAILED_TO_FETCH_DATA"));
      }
    };

    const checkEnrolledCourse = async () => {
      try {
        const url = `${urlConfig.URLS.LEARNER_PREFIX}${urlConfig.URLS.COURSE.GET_ENROLLED_COURSES}/${_userId}?orgdetails=${appConfig.Course.contentApiQueryParams.orgdetails}&licenseDetails=${appConfig.Course.contentApiQueryParams.licenseDetails}&fields=${urlConfig.params.enrolledCourses.fields}&batchDetails=${urlConfig.params.enrolledCourses.batchDetails}`;

        const response = await fetch(url, {
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        handleEnrolledCourseCheck(data);
      } catch (error) {
        if (error.name === "AbortError") return;
        console.error("Error while fetching courses:", error);
        showErrorMessage(t("FAILED_TO_FETCH_DATA"));
      }
    };

    const getBatchDetail = async (batchId) => {
      try {
        const url = `${urlConfig.URLS.LEARNER_PREFIX}${urlConfig.URLS.BATCH.GET_DETAILS}/${batchId}`;

        const response = await fetch(url, {
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        handleBatchDetailProcessing(data);
      } catch (error) {
        if (error.name === "AbortError") return;
        console.error("Error while fetching batch details:", error);
        showErrorMessage(t("FAILED_TO_FETCH_DATA"));
      }
    };

    const getUserData = async () => {
      try {
        const url = `${urlConfig.URLS.LEARNER_PREFIX}${urlConfig.URLS.USER.GET_PROFILE}${_userId}?fields=${urlConfig.params.userReadParam.fields}`;

        const response = await fetch(url, {
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        handleUserDataProcessing(data);
      } catch (error) {
        if (error.name === "AbortError") return;
        console.error("Error while getting user data:", error);
        showErrorMessage(t("FAILED_TO_FETCH_DATA"));
      }
    };

    const initializeData = async () => {
      try {
        await Promise.all([
          fetchCourseData(),
          _userId ? fetchBatchData() : Promise.resolve(),
          _userId ? checkEnrolledCourse() : Promise.resolve(),
          _userId ? getUserData() : Promise.resolve(),
        ]);
      } catch (error) {
        if (error.name === "AbortError") return;
        console.error("Error during data initialization:", error);
      }
    };

    initializeData();

    return () => {
      abortController.abort();
    };
  }, [contentId, _userId, t]);

  const checkCourseComplition = (allContents, userProgress) => {
    if (!allContents?.length || !userProgress?.result?.contentList?.length) {
      return;
    }

    const completedCount = userProgress.result.contentList.reduce(
      (count, content) => count + (content.status ? 1 : 0),
      0
    );

    setIsCompleted(allContents.length === completedCount);
  };

  // Helper function to process content list and set basic states
  const processContentList = (contentList) => {
    const contentIds = contentList.map((item) => item.contentId);
    setConsumedContents(contentIds);
    setIsNotStarted(contentIds.length === 0);

    // Find continue learning content
    const continueLearningContent = contentList.find(
      (content) => content.status === 1
    );
    if (continueLearningContent) {
      setContinueLearning(continueLearningContent.contentId);
    }

    // Process completed contents
    const newCompletedContents = contentList
      .filter((content) => content.status === 2)
      .map((content) => content.contentId);

    if (newCompletedContents.length > 0) {
      setCompletedContents((prevContents) => [
        ...prevContents,
        ...newCompletedContents,
      ]);
    }

    return { contentIds, newCompletedContents };
  };

  // Helper function to handle course completion
  const handleCourseCompletion = async (consumedSet) => {
    try {
      const updateUrl = `${urlConfig.URLS.CONTENT_PREFIX}${urlConfig.URLS.COURSE.USER_CONTENT_STATE_UPDATE}`;
      await axios.patch(updateUrl, {
        request: {
          userId: _userId,
          courseId: contentId,
          batchId: batchDetails.batchId,
        },
      });

      setToasterMessage(t("COURSE_SUCCESSFULLY_COMPLETED"));
      setTimeout(() => setToasterMessage(""), 2000);
    } catch (error) {
      console.error("Error updating course completion:", error);
    }
    setNotConsumedContent(allContents[0]);
  };

  // Helper function to determine not consumed content
  const determineNotConsumedContent = (consumedSet) => {
    if (!Array.isArray(allContents) || !allContents.length) {
      setNotConsumedContent(null);
      return;
    }

    const allConsumed = allContents.every((identifier) =>
      consumedSet.has(identifier)
    );

    if (allConsumed) {
      handleCourseCompletion(consumedSet);
    } else {
      const notConsumedContent = allContents.find(
        (identifier) => !consumedSet.has(identifier)
      );
      setNotConsumedContent(notConsumedContent);
    }
  };

  // Helper function to fetch chats
  const fetchChats = async () => {
    try {
      const url = `${
        urlConfig.URLS.DIRECT_CONNECT.GET_CHATS
      }?sender_id=${_userId}&receiver_id=${creatorId}&is_accepted=${true}`;

      const response = await axios.get(url, {
        withCredentials: true,
      });
      setChat(response.data.result || []);
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  // Helper function to get course progress
  const getCourseProgress = async () => {
    if (!batchDetails) return;

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

      const contentList = data?.result?.contentList || [];
      processContentList(contentList);

      const consumedSet = new Set(
        contentList
          .filter((item) => item.status === 2)
          .map((item) => item.contentId)
      );

      determineNotConsumedContent(consumedSet);
    } catch (error) {
      console.error("Error while fetching course progress:", error);
      showErrorMessage(t("FAILED_TO_FETCH_DATA"));
    }
  };

  useEffect(() => {
    if (!_userId || _userId.trim() === "") return;
    fetchChats();
    getCourseProgress();
  }, [batchDetails, creatorId, allContents, _userId]);

  const handleDirectConnect = () => {
    if (!_userId) {
      window.location.href = `/webapp/joinCourse?${contentId}`;
      return;
    }

    const shouldOpenModal =
      chat.length === 0 || (!isMobile && chat[0]?.is_accepted === true);

    if (shouldOpenModal) {
      setOpen(true);
    } else {
      navigate(routeConfig.ROUTES.ADDCONNECTION_PAGE.CHAT, {
        state: { senderUserId: _userId, receiverUserId: creatorId },
      });
    }
  };

  const handleGoBack = () => {
    navigate(-1); // Go back to the previous page
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
      navigate(
        `${routeConfig.ROUTES.PLAYER_PAGE.PLAYER}?id=${id}&cId=${contentId}&bId=${batchDetails?.batchId}`,
        {
          state: {
            coursename: userData?.result?.content?.name,
            batchid: batchDetails?.batchId,
            courseid: contentId,
            isenroll: isEnroll,
            consumedcontents: ConsumedContents,
          },
        }
      );
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

  // Helper function to check if batch is expired
  const isBatchExpired = () => {
    const enrollmentEndDate = batchData?.enrollmentEndDate;
    const endDate = batchData?.endDate;

    if (enrollmentEndDate && new Date(enrollmentEndDate) < new Date()) {
      return true;
    }

    if (!enrollmentEndDate && endDate && new Date(endDate) < new Date()) {
      return true;
    }

    return false;
  };

  // Helper function to check if enrollment is expired based on last day logic
  const isEnrollmentExpired = () => {
    if (!batchData?.enrollmentEndDate) return false;

    const today = new Date();
    const enrollmentEndDate = new Date(batchData.enrollmentEndDate);

    if (isNaN(enrollmentEndDate.getTime())) return false;

    const isLastDayOfEnrollment =
      enrollmentEndDate.toDateString() === today.toDateString();

    return enrollmentEndDate < formatDate(today) && !isLastDayOfEnrollment;
  };

  // Helper function to render confirmation dialog
  const renderConfirmationDialog = () => {
    if (!showConfirmation) return null;

    return (
      <Dialog open={showConfirmation} onClose={handleConfirmationClose}>
        <DialogTitle>{t("LEAVE_COURSE_CONFIRMATION_TITLE")}</DialogTitle>
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
    );
  };

  // Helper function to render enrolled user buttons
  const renderEnrolledUserButtons = () => {
    const backButton = (
      <Button
        onClick={() => handleGoBack()}
        className="custom-btn-primary mr-5"
      >
        {t("BACK")}
      </Button>
    );

    if (isNotStarted) {
      return (
        <Box>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Box>{backButton}</Box>
            <Box>
              <Button
                onClick={() => handleLinkClick(childnode)}
                className="custom-btn-primary mr-5"
              >
                {t("START_LEARNING")}
              </Button>
              {!isCompleted && (
                <Button
                  onClick={handleLeaveCourseClick}
                  className="custom-btn-danger xs-mt-10"
                >
                  {t("LEAVE_COURSE")}
                </Button>
              )}
            </Box>
          </div>
          {renderConfirmationDialog()}
        </Box>
      );
    }

    return (
      <>
        <Box>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Box>{backButton}</Box>
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
                  onClick={handleLeaveCourseClick}
                  className="custom-btn-danger xs-mt-10"
                >
                  {t("LEAVE_COURSE")}
                </Button>
              )}
            </Box>
          </div>
          {renderConfirmationDialog()}
        </Box>
        {isCompleted && <Box>{t("COURSE_SUCCESSFULLY_COMPLETED")}</Box>}
      </>
    );
  };

  // Helper function to render non-enrolled user buttons
  const renderNonEnrolledUserButtons = () => {
    if (isBatchExpired() || isEnrollmentExpired()) {
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

    const isExpired = isEnrollmentExpired();

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
          style={{ background: isExpired ? "#ccc" : "#004367" }}
        >
          {t("JOIN_COURSE")}
        </Button>
      </div>
    );
  };

  const renderActionButton = () => {
    if (isEnrolled() || enrolled) {
      return renderEnrolledUserButtons();
    }
    return renderNonEnrolledUserButtons();
  };

  const handleJoinAndOpenModal = async () => {
    if (!_userId) {
      // Redirect to login with return URL to this page (without hostname)
      const currentUrl = encodeURIComponent(window.location.search);
      console.log("currentUrl--------------------->", currentUrl);
      console.log("contentId--------------------->", contentId);

      window.location.href = `/webapp/joinCourse?${contentId}`;
      return;
    }
    try {
      await handleJoinCourse(); // Wait for the user to join the course
      setShowConsentForm(true); // Open the consent form after joining the course
    } catch (error) {
      showErrorMessage(t("FAILED_TO_ENROLL_INTO_COURSE"));
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

  const handleShareClick = () => {
    consentUpdate("ACTIVE");
    setShowConsentForm(false);
  };

  const handleDontShareClick = () => {
    consentUpdate("REVOKED");
    setShowConsentForm(false);
  };
  const handlecopyrightOpen = () => {
    setcopyrightOpen(true);
  };

  const handlecopyrightClose = () => {
    setcopyrightOpen(false);
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

  function checkCertTemplate(data) {
    const certTemplates = data.cert_templates; // Assuming data contains your JSON object

    if (certTemplates && Object.keys(certTemplates).length > 0) {
      console.log("cert_templates is not empty");
      return true;
    } else {
      console.log("cert_templates is empty");
      return false;
    }
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
          <Alert
            elevation={6}
            variant="filled"
            onClose={handleSnackbarClose}
            severity="success"
            sx={{ mt: 2 }}
          >
            {t("ENROLLMENT_SUCCESS_MESSAGE")}
          </Alert>
        </Snackbar>
        <Snackbar
          open={showUnEnrollmentSnackbar}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            elevation={6}
            variant="filled"
            onClose={handleSnackbarClose}
            severity="success"
            sx={{ mt: 2 }}
          >
            {t("UNENROLLMENT_SUCCESS_MESSAGE")}
          </Alert>
        </Snackbar>

        <Modal
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
          open={showConsentForm}
          onClose={() => setShowConsentForm(false)}
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

        <main className="xs-pb-20 lg-mt-12 joinCourse">
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

              {renderContentTags()}
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
              {batchDetails && checkCertTemplate(batchDetails) && (
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
                !checkCertTemplate(batchDetails) && (
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
                {renderChatSection(isMobile)}
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
              {renderSocialShareButtons(isMobile)}
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
              {renderDescription()}

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
                        style={{ padding: "12px", margin: "-10px 0px" }}
                      >
                        {renderContentItem(faqIndex)}
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

              {batchDetails && checkCertTemplate(batchDetails) && (
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
                !checkCertTemplate(batchDetails) && (
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
                {renderChatSection(isMobile)}
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
                {renderSocialShareButtons(isMobile)}
              </Box>
            </Grid>
          </Grid>
        </main>
        <FloatingChatIcon />
      </Box>
      <Footer />
    </div>
  );
};

export default JoinCourse;
