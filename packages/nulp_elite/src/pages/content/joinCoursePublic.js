import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import Footer from "components/Footer";
import Header from "components/header";
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
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

// Import reusable components
import BatchDetailsSection from "../../components/BatchDetailsSection";
import CertificationCriteriaSection from "../../components/CertificationCriteriaSection";
import OtherDetailsSection from "../../components/OtherDetailsSection";
import ChatSection from "../../components/ChatSection";
import SocialShareButtons from "../../components/SocialShareButtons";
import CertNotAttachedSection from "../../components/CertNotAttachedSection";

const routeConfig = require("../../configs/routeConfig.json");

const processString = (str) => {
  return str.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
};

// Moved SectionRenderer component outside and added PropTypes
const SectionRenderer = ({
  className,
  batchData,
  batchDetails,
  batchDetail,
  score,
  checkCertTemplate,
  isEnrolled,
  userData,
  courseData,
  formatDate,
  copyrightOpen,
  onCopyrightOpen,
  onCopyrightClose,
}) => (
  <>
    <BatchDetailsSection
      batchData={batchData}
      className={className}
      formatDate={formatDate}
    />
    <CertificationCriteriaSection
      batchDetails={batchDetails}
      batchDetail={batchDetail}
      score={score}
      checkCertTemplate={checkCertTemplate}
      className={className}
    />
    <CertNotAttachedSection
      isEnrolled={isEnrolled}
      batchDetails={batchDetails}
      checkCertTemplate={checkCertTemplate}
      className={className}
    />
    <OtherDetailsSection
      userData={userData}
      courseData={courseData}
      formatDate={formatDate}
      copyrightOpen={copyrightOpen}
      handlecopyrightOpen={onCopyrightOpen}
      handlecopyrightClose={onCopyrightClose}
      className={className}
    />
  </>
);

SectionRenderer.propTypes = {
  className: PropTypes.string,
  batchData: PropTypes.object,
  batchDetails: PropTypes.object,
  batchDetail: PropTypes.object,
  score: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.bool,
  ]),
  checkCertTemplate: PropTypes.func.isRequired,
  isEnrolled: PropTypes.bool,
  userData: PropTypes.object,
  courseData: PropTypes.object,
  formatDate: PropTypes.func.isRequired,
  copyrightOpen: PropTypes.bool,
  onCopyrightOpen: PropTypes.func.isRequired,
  onCopyrightClose: PropTypes.func.isRequired,
};

SectionRenderer.defaultProps = {
  className: "",
  batchData: null,
  batchDetails: null,
  batchDetail: null,
  score: "no certificate",
  isEnrolled: false,
  userData: null,
  courseData: null,
  copyrightOpen: false,
};

// Custom hook for content ID extraction
const useContentId = () => {
  const location = useLocation();
  const queryString = location.search;
  let contentId = queryString.startsWith("?do_") ? queryString.slice(1) : null;

  if (contentId && contentId.endsWith("=")) {
    contentId = contentId.slice(0, -1);
  }

  return contentId;
};

// Custom hook for responsive behavior
const useResponsive = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 767);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
};

// Custom hook for API operations
const useApiOperations = (contentId, _userId, t) => {
  const showErrorMessage = useCallback((msg) => {
    setToasterMessage(msg);
    setTimeout(() => setToasterMessage(""), 2000);
  }, []);

  const [toasterMessage, setToasterMessage] = useState("");

  const fetchCourseData = useCallback(
    async (signal) => {
      const url = `${urlConfig.URLS.PUBLIC_PREFIX}${urlConfig.URLS.COURSE.HIERARCHY}/${contentId}?orgdetails=${appConfig.ContentPlayer.contentApiQueryParams.orgdetails}&licenseDetails=${appConfig.ContentPlayer.contentApiQueryParams.licenseDetails}`;

      const response = await fetch(url, {
        headers: { "Content-Type": "application/json" },
        signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    },
    [contentId]
  );

  const fetchBatchData = useCallback(
    async (signal) => {
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

      const response = await axios.post(url, requestBody, { signal });
      return response.data;
    },
    [contentId]
  );

  const checkEnrolledCourse = useCallback(
    async (signal) => {
      const url = `${urlConfig.URLS.LEARNER_PREFIX}${urlConfig.URLS.COURSE.GET_ENROLLED_COURSES}/${_userId}?orgdetails=${appConfig.Course.contentApiQueryParams.orgdetails}&licenseDetails=${appConfig.Course.contentApiQueryParams.licenseDetails}&fields=${urlConfig.params.enrolledCourses.fields}&batchDetails=${urlConfig.params.enrolledCourses.batchDetails}`;

      const response = await fetch(url, { signal });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    },
    [_userId]
  );

  const getBatchDetail = useCallback(async (batchId, signal) => {
    const url = `${urlConfig.URLS.LEARNER_PREFIX}${urlConfig.URLS.BATCH.GET_DETAILS}/${batchId}`;

    const response = await fetch(url, { signal });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }, []);

  const getUserData = useCallback(
    async (signal) => {
      const url = `${urlConfig.URLS.LEARNER_PREFIX}${urlConfig.URLS.USER.GET_PROFILE}${_userId}?fields=${urlConfig.params.userReadParam.fields}`;

      const response = await fetch(url, { signal });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    },
    [_userId]
  );

  return {
    fetchCourseData,
    fetchBatchData,
    checkEnrolledCourse,
    getBatchDetail,
    getUserData,
    showErrorMessage,
    toasterMessage,
  };
};

const JoinCourse = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const contentId = useContentId();
  const isMobile = useResponsive();
  const _userId = util.userId();
  const shareUrl = window.location.href;

  // State management - consolidated
  const [state, setState] = useState({
    courseData: undefined,
    batchData: undefined,
    batchDetails: undefined,
    userCourseData: {},
    showEnrollmentSnackbar: false,
    showUnEnrollmentSnackbar: false,
    showConsentForm: false,
    enrolled: false,
    showConfirmation: false,
    userInfo: undefined,
    consentChecked: false,
    shareEnabled: false,
    userData: undefined,
    creatorId: "",
    open: false,
    chat: [],
    childNode: [],
    isOwner: false,
    showMore: false,
    batchDetail: "",
    score: "",
    isEnroll: false,
    ConsumedContents: undefined,
    isNotStarted: false,
    ContinueLearning: undefined,
    allContents: undefined,
    NotConsumedContent: undefined,
    completedContents: [],
    isCompleted: undefined,
    copyrightOpen: false,
    activeBatch: true,
  });

  const {
    showErrorMessage,
    toasterMessage,
    fetchCourseData,
    fetchBatchData,
    checkEnrolledCourse,
    getBatchDetail,
    getUserData,
  } = useApiOperations(contentId, _userId, t);

  // Helper function to update state efficiently
  const updateState = useCallback((updates) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Memoized computed values
  const isEnrolled = useMemo(() => {
    return state.userCourseData?.courses?.some(
      (course) => course.contentId === contentId
    );
  }, [state.userCourseData, contentId]);

  const isBatchExpired = useMemo(() => {
    const { enrollmentEndDate, endDate } = state.batchData || {};
    return (
      (enrollmentEndDate && new Date(enrollmentEndDate) < new Date()) ||
      (!enrollmentEndDate && endDate && new Date(endDate) < new Date())
    );
  }, [state.batchData]);

  const isEnrollmentExpired = useMemo(() => {
    if (!state.batchData?.enrollmentEndDate) return false;

    const today = new Date();
    const enrollmentEndDate = new Date(state.batchData.enrollmentEndDate);

    if (isNaN(enrollmentEndDate.getTime())) return false;

    const isLastDayOfEnrollment =
      enrollmentEndDate.toDateString() === today.toDateString();
    return enrollmentEndDate < formatDate(today) && !isLastDayOfEnrollment;
  }, [state.batchData]);

  // Store previous route
  useEffect(() => {
    const newPath = location.pathname + "?" + contentId;
    sessionStorage.setItem("previousRoutes", newPath);
  }, [location.pathname, contentId]);

  // Helper functions
  const extractIdentifiers = useCallback((content) => {
    if (!content?.children?.length) return null;

    const firstChild = content.children[0];
    if (!firstChild) return null;

    if (firstChild.children?.[0]?.children) {
      return firstChild.children[0].children[0]?.identifier;
    } else if (firstChild.children) {
      return firstChild.children[0]?.identifier;
    } else {
      return firstChild.identifier;
    }
  }, []);

  const getAllLeafIdentifiers = useCallback((nodes) => {
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
  }, []);

  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }, []);

  const toggleShowMore = useCallback(() => {
    updateState({ showMore: !state.showMore });
  }, [state.showMore, updateState]);

  // API data processing functions
  const processApiData = useCallback(
    {
      updateCourseData: (content, data) => {
        const updates = {
          creatorId: content.createdBy,
          courseData: data,
          userData: data,
          isOwner: _userId === content.createdBy,
          childNode: extractIdentifiers(content),
          allContents: getAllLeafIdentifiers(content.children),
        };
        updateState(updates);
      },

      updateBatchData: (batchDetails) => {
        updateState({
          batchData: {
            startDate: batchDetails.startDate,
            endDate: batchDetails.endDate,
            enrollmentEndDate: batchDetails.enrollmentEndDate,
            batchId: batchDetails.batchId,
          },
          batchDetails,
        });
      },

      handleEnrolledCourseCheck: (data) => {
        const isEnrolledCheck = data?.result?.courses?.some(
          (course) => course?.contentId === contentId
        );
        updateState({
          userCourseData: data.result,
          isEnroll: isEnrolledCheck,
        });
      },

      handleBatchDetailProcessing: (data) => {
        updateState({ batchDetail: data.result });
        getScoreCriteria(data.result);
        checkCertTemplate(data.result);
      },

      handleUserDataProcessing: (data) => {
        updateState({ userInfo: data.result.response });
      },
    },
    [_userId, contentId, extractIdentifiers, getAllLeafIdentifiers, updateState]
  );

  // API calls
  const initializeData = useCallback(async () => {
    const abortController = new AbortController();

    try {
      const fetchPromises = [fetchCourseData(abortController.signal)];

      if (_userId) {
        fetchPromises.push(
          fetchBatchData(abortController.signal),
          checkEnrolledCourse(abortController.signal),
          getUserData(abortController.signal)
        );
      }

      const [courseResponse, batchResponse, enrolledResponse, userResponse] =
        await Promise.all(fetchPromises);

      // Process course data
      if (courseResponse?.result?.content) {
        processApiData.updateCourseData(
          courseResponse.result.content,
          courseResponse
        );
      }

      // Process batch data
      if (batchResponse?.result?.response) {
        const { count, content: batchContent } = batchResponse.result.response;

        if (count === 0 || !batchContent?.length) {
          updateState({ activeBatch: false });
          showErrorMessage(t("This course has no active Batches"));
        } else {
          const batchDetails = batchContent[0];
          const batchDetailResponse = await getBatchDetail(
            batchDetails.batchId,
            abortController.signal
          );
          processApiData.updateBatchData(batchDetails);
          processApiData.handleBatchDetailProcessing(batchDetailResponse);
        }
      }

      // Process enrollment data
      if (enrolledResponse) {
        processApiData.handleEnrolledCourseCheck(enrolledResponse);
      }

      // Process user data
      if (userResponse) {
        processApiData.handleUserDataProcessing(userResponse);
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error during data initialization:", error);
        showErrorMessage(t("FAILED_TO_FETCH_DATA"));
      }
    }

    return () => abortController.abort();
  }, [
    contentId,
    _userId,
    t,
    fetchCourseData,
    fetchBatchData,
    checkEnrolledCourse,
    getUserData,
    getBatchDetail,
    processApiData,
    showErrorMessage,
    updateState,
  ]);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // Event handlers
  const handleGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleLinkClick = useCallback(
    (id) => {
      if (state.isEnroll) {
        navigate(
          `${routeConfig.ROUTES.PLAYER_PAGE.PLAYER}?id=${id}&cId=${contentId}&bId=${state.batchDetails?.batchId}`,
          {
            state: {
              coursename: state.userData?.result?.content?.name,
              batchid: state.batchDetails?.batchId,
              courseid: contentId,
              isenroll: state.isEnroll,
              consumedcontents: state.ConsumedContents,
            },
          }
        );
      } else {
        showErrorMessage(
          "You must join the course to get complete access to content."
        );
      }
    },
    [
      state.isEnroll,
      state.batchDetails,
      state.userData,
      contentId,
      state.ConsumedContents,
      navigate,
      showErrorMessage,
    ]
  );

  const handleJoinCourse = useCallback(async () => {
    try {
      const url = `${urlConfig.URLS.LEARNER_PREFIX}${urlConfig.URLS.COURSE.ENROLL_USER_COURSE}`;
      const requestBody = {
        request: {
          courseId: contentId,
          userId: _userId,
          batchId: state.batchData?.batchId,
        },
      };
      const response = await axios.post(url, requestBody);
      if (response.status === 200) {
        updateState({
          enrolled: true,
          showEnrollmentSnackbar: true,
          isEnroll: true,
        });
      }
    } catch (error) {
      console.error("Error enrolling in the course:", error);
      showErrorMessage(t("FAILED_TO_ENROLL_INTO_COURSE"));
    }
  }, [contentId, _userId, state.batchData, updateState, showErrorMessage, t]);

  const handleJoinAndOpenModal = useCallback(async () => {
    if (!_userId) {
      window.location.href = `/webapp/joinCourse?${contentId}`;
      return;
    }
    try {
      await handleJoinCourse();
      updateState({ showConsentForm: true });
    } catch (error) {
      showErrorMessage(t("FAILED_TO_ENROLL_INTO_COURSE"));
      console.error("Error:", error);
    }
  }, [_userId, contentId, handleJoinCourse, updateState, showErrorMessage, t]);

  const handleLeaveConfirmed = useCallback(async () => {
    try {
      const url = `${urlConfig.URLS.LEARNER_PREFIX}${urlConfig.URLS.COURSE.UNENROLL_USER_COURSE}`;
      const requestBody = {
        request: {
          courseId: contentId,
          userId: _userId,
          batchId: state.batchData?.batchId,
        },
      };
      const response = await axios.post(url, requestBody);
      if (response.status === 200) {
        updateState({
          enrolled: true,
          showUnEnrollmentSnackbar: true,
        });
      }
    } catch (error) {
      console.error("Error enrolling in the course:", error);
      showErrorMessage(t("FAILED_TO_ENROLL_INTO_COURSE"));
    }
    window.location.reload();
  }, [contentId, _userId, state.batchData, updateState, showErrorMessage, t]);

  const consentUpdate = useCallback(
    async (status) => {
      try {
        const urlUpdate = `${urlConfig.URLS.LEARNER_PREFIX}${urlConfig.URLS.USER.CONSENT_UPDATE}`;
        const updateRequestBody = {
          request: {
            consent: {
              status: status,
              userId: _userId,
              consumerId: state.courseData.result.content.channel,
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
                  consumerId: state.courseData.result.content.channel,
                  objectId: contentId,
                },
              },
            },
          };
          await axios.post(url, requestBody);
          updateState({ showConsentForm: false });
        }
      } catch (error) {
        console.error("Error updating consent:", error);
        showErrorMessage(t("FAILED_TO_FETCH_DATA"));
      }
    },
    [_userId, state.courseData, contentId, updateState, showErrorMessage, t]
  );

  // Utility functions
  const getScoreCriteria = useCallback(
    (data) => {
      if (
        !data?.response?.certTemplates ||
        typeof data.response.certTemplates !== "object"
      ) {
        updateState({ score: false });
        return "no certificate";
      }

      const certTemplateKeys = Object.keys(data.response.certTemplates);
      const certTemplateId = certTemplateKeys[0];
      const criteria =
        data.response.certTemplates[certTemplateId]?.criteria?.assessment ||
        data.response.cert_templates?.[certTemplateId]?.criteria?.assessment;
      const score = criteria?.score?.[">="] || "no certificate";

      updateState({ score });
      return score;
    },
    [updateState]
  );

  const checkCertTemplate = useCallback((data) => {
    const certTemplates = data.cert_templates;
    return certTemplates && Object.keys(certTemplates).length > 0;
  }, []);

  // Render helper functions
  const renderContentTags = useMemo(() => {
    const content = state.courseData?.result?.content;
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
  }, [state.courseData, t]);

  const renderContentItem = useCallback(
    (item, level = 0) => {
      const hasChildren = item.children && item.children.length > 0;
      const isCompleted = state.completedContents.includes(item.identifier);

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
    },
    [state.completedContents, handleLinkClick]
  );

  const renderDescription = useMemo(() => {
    if (!state.courseData?.result?.content) return null;

    const description = state.courseData.result.content.description;
    const wordCount = description?.split(" ").length || 0;
    const shouldTruncate = wordCount > 100;

    const displayText =
      shouldTruncate && !state.showMore
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
            {state.showMore ? t("Show Less") : t("Show More")}
          </Button>
        )}
      </Box>
    );
  }, [state.courseData, state.showMore, t, toggleShowMore]);

  // Action button renderer
  const renderActionButton = useMemo(() => {
    const backButton = (
      <Button onClick={handleGoBack} className="custom-btn-primary mr-5">
        {t("BACK")}
      </Button>
    );

    const renderConfirmationDialog = () => (
      <Dialog
        open={state.showConfirmation}
        onClose={() => updateState({ showConfirmation: false })}
      >
        <DialogTitle>{t("LEAVE_COURSE_CONFIRMATION_TITLE")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("LEAVE_COURSE_CONFIRMATION_MESSAGE")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => updateState({ showConfirmation: false })}
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

    if (isEnrolled || state.enrolled) {
      if (state.isNotStarted) {
        return (
          <Box>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Box>{backButton}</Box>
              <Box>
                <Button
                  onClick={() => handleLinkClick(state.childNode)}
                  className="custom-btn-primary mr-5"
                >
                  {t("START_LEARNING")}
                </Button>
                {!state.isCompleted && (
                  <Button
                    onClick={() => updateState({ showConfirmation: true })}
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
                  disabled={state.isCompleted}
                  onClick={() =>
                    handleLinkClick(
                      state.ContinueLearning ??
                        state.NotConsumedContent ??
                        state.childNode
                    )
                  }
                  className="custom-btn-primary mr-5"
                >
                  {t("CONTINUE_LEARNNG")}
                </Button>
                {!state.isCompleted && (
                  <Button
                    onClick={() => updateState({ showConfirmation: true })}
                    className="custom-btn-danger xs-mt-10"
                  >
                    {t("LEAVE_COURSE")}
                  </Button>
                )}
              </Box>
            </div>
            {renderConfirmationDialog()}
          </Box>
          {state.isCompleted && <Box>{t("COURSE_SUCCESSFULLY_COMPLETED")}</Box>}
        </>
      );
    }

    // Non-enrolled user buttons
    if (isBatchExpired || isEnrollmentExpired) {
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
        <Button onClick={handleGoBack} className="custom-btn-primary mr-5">
          {t("BACK")}
        </Button>
        <Button
          onClick={handleJoinAndOpenModal}
          disabled={isEnrollmentExpired || !state.activeBatch || state.isOwner}
          className="custom-btn-primary"
          style={{ background: isEnrollmentExpired ? "#ccc" : "#004367" }}
        >
          {t("JOIN_COURSE")}
        </Button>
      </div>
    );
  }, [
    isEnrolled,
    state.enrolled,
    state.isNotStarted,
    state.isCompleted,
    state.childNode,
    state.ContinueLearning,
    state.NotConsumedContent,
    state.showConfirmation,
    isBatchExpired,
    isEnrollmentExpired,
    state.activeBatch,
    state.isOwner,
    handleGoBack,
    handleLinkClick,
    handleLeaveConfirmed,
    handleJoinAndOpenModal,
    updateState,
    t,
  ]);

  return (
    <div>
      <Header />
      {toasterMessage && <ToasterCommon response={toasterMessage} />}
      <Box>
        <Snackbar
          open={state.showEnrollmentSnackbar}
          autoHideDuration={6000}
          onClose={() => updateState({ showEnrollmentSnackbar: false })}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            elevation={6}
            variant="filled"
            onClose={() => updateState({ showEnrollmentSnackbar: false })}
            severity="success"
            sx={{ mt: 2 }}
          >
            {t("ENROLLMENT_SUCCESS_MESSAGE")}
          </Alert>
        </Snackbar>

        <Snackbar
          open={state.showUnEnrollmentSnackbar}
          autoHideDuration={6000}
          onClose={() => updateState({ showUnEnrollmentSnackbar: false })}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            elevation={6}
            variant="filled"
            onClose={() => updateState({ showUnEnrollmentSnackbar: false })}
            severity="success"
            sx={{ mt: 2 }}
          >
            {t("UNENROLLMENT_SUCCESS_MESSAGE")}
          </Alert>
        </Snackbar>

        <Modal
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
          open={state.showConsentForm}
          onClose={() => updateState({ showConsentForm: false })}
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
            }}
            className="joinCourse"
          >
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
                {t("USERNAME")}: {state.userInfo?.firstName}
              </label>
            </Box>
            <Box>
              <label>
                {t("USER_ID")}: {state.userInfo?.organisations[0]?.userId}
              </label>
            </Box>
            <Box>
              <label>
                {t("MOBILENUMBER")}: {state.userInfo?.phone}
              </label>
            </Box>
            <Box>
              <label>
                {t("EMAIL_ADDRESS")}: {state.userInfo?.email}
              </label>
            </Box>
            <Box>
              <input
                type="checkbox"
                checked={state.consentChecked}
                onChange={(e) =>
                  updateState({
                    consentChecked: e.target.checked,
                    shareEnabled: e.target.checked,
                  })
                }
              />
              <label>{t("CONSENT_TEXT")}</label>
            </Box>
            <Box className="d-flex jc-en">
              <Button
                onClick={() => consentUpdate("REVOKED")}
                className="custom-btn-default mr-5"
              >
                {t("DONT_SHARE")}
              </Button>
              <Button
                onClick={() => consentUpdate("ACTIVE")}
                className="custom-btn-primary"
                disabled={!state.shareEnabled}
              >
                {t("SHARE")}
              </Button>
            </Box>
          </Box>
        </Modal>

        <main
          className="xs-pb-20 lg-mt-12 joinCourse"
          style={{ margin: "20px" }}
        >
          <Box className="pos-relative xs-ml-15 pt-10">
            <Box>
              <img
                src={
                  state.userData?.result?.content.se_gradeLevels
                    ? require(`../../assets/cardBanner/${processString(
                        state.userData?.result?.content?.se_gradeLevels[0]
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
                    {state.userData?.result?.content?.name}
                  </Link>
                </Breadcrumbs>
              </Grid>

              <Box className="h3-title my-10">
                {state.userData?.result?.content?.name}
              </Box>

              {renderContentTags}

              <Box className="lg-hide">{renderActionButton}</Box>

              <SectionRenderer
                className="xs-hide"
                batchData={state.batchData}
                batchDetails={state.batchDetails}
                batchDetail={state.batchDetail}
                score={state.score}
                checkCertTemplate={checkCertTemplate}
                isEnrolled={isEnrolled}
                userData={state.userData}
                courseData={state.courseData}
                formatDate={formatDate}
                copyrightOpen={state.copyrightOpen}
                onCopyrightOpen={() => updateState({ copyrightOpen: true })}
                onCopyrightClose={() => updateState({ copyrightOpen: false })}
              />

              <ChatSection
                chat={state.chat}
                handleDirectConnect={() => {
                  if (!_userId) {
                    window.location.href = `/webapp/joinCourse?${contentId}`;
                    return;
                  }

                  const shouldOpenModal =
                    state.chat.length === 0 ||
                    (!isMobile && state.chat[0]?.is_accepted === true);

                  if (shouldOpenModal) {
                    updateState({ open: true });
                  } else {
                    navigate(routeConfig.ROUTES.ADDCONNECTION_PAGE.CHAT, {
                      state: {
                        senderUserId: _userId,
                        receiverUserId: state.creatorId,
                      },
                    });
                  }
                }}
                _userId={_userId}
                creatorId={state.creatorId}
                open={state.open}
                handleClose={() => {
                  updateState({ open: false });
                  window.location.reload();
                }}
                isMobile={isMobile}
              />

              <SocialShareButtons shareUrl={shareUrl} />
            </Grid>

            <Grid
              item
              xs={12}
              md={8}
              lg={8}
              className="mb-20 xs-pr-16 lg-pr-20"
            >
              <Box style={{ textAlign: "right" }} className="xs-hide">
                {renderActionButton}
              </Box>

              {renderDescription}

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
                  {state.userData?.result?.content?.children.map((faqIndex) => (
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

              <SectionRenderer
                className="lg-hide accordionBoxShadow"
                batchData={state.batchData}
                batchDetails={state.batchDetails}
                batchDetail={state.batchDetail}
                score={state.score}
                checkCertTemplate={checkCertTemplate}
                isEnrolled={isEnrolled}
                userData={state.userData}
                courseData={state.courseData}
                formatDate={formatDate}
                copyrightOpen={state.copyrightOpen}
                onCopyrightOpen={() => updateState({ copyrightOpen: true })}
                onCopyrightClose={() => updateState({ copyrightOpen: false })}
              />

              <ChatSection
                chat={state.chat}
                handleDirectConnect={() => {
                  if (!_userId) {
                    window.location.href = `/webapp/joinCourse?${contentId}`;
                    return;
                  }

                  const shouldOpenModal =
                    state.chat.length === 0 ||
                    (!isMobile && state.chat[0]?.is_accepted === true);

                  if (shouldOpenModal) {
                    updateState({ open: true });
                  } else {
                    navigate(routeConfig.ROUTES.ADDCONNECTION_PAGE.CHAT, {
                      state: {
                        senderUserId: _userId,
                        receiverUserId: state.creatorId,
                      },
                    });
                  }
                }}
                _userId={_userId}
                creatorId={state.creatorId}
                open={state.open}
                handleClose={() => {
                  updateState({ open: false });
                  window.location.reload();
                }}
                isMobile={isMobile}
              />

              <Box className="my-20 lg-hide social-icons">
                <SocialShareButtons shareUrl={shareUrl} isMobileView={true} />
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
