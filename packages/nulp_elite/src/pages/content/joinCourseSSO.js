/**
 * joinCourseSSO.js
 *
 * Purpose: Dedicated course details page for IGOT SSO users.
 * Opens inside an IGOT iframe with a minimal, clean layout.
 *
 * Key differences from joinCourse.js:
 *  - No Header / Footer / FloatingChatIcon / navbar chrome
 *  - No profile-completion popup or consent form (SSO backend already handles this)
 *  - contentId read from ?courseId= query param  (SSO URL format)
 *  - SSO flag detected via ?sso=igot OR sessionStorage "isIgotSSO"
 *  - iframe-safe: no window.top redirects, no forced reloads on close
 *  - All course / batch / progress API calls are identical to joinCourse.js
 *
 * Route: /webapp/joinCourseSSO?courseId=<do_xxx>&sso=igot
 *
 * DEPLOYMENT RULE: This file and its route are the ONLY changes.
 *                  No existing pages or global behaviour are modified.
 */

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Link from "@mui/material/Link";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import * as util from "../../services/utilService";
import appConfig from "../../configs/appConfig.json";
import ToasterCommon from "../ToasterCommon";

const urlConfig = require("../../configs/urlConfig.json");
const routeConfig = require("../../configs/routeConfig.json");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Normalise course section names for assessment detection. */
const isAssessmentSection = (name) => {
  if (!name) return false;
  return name
    .replaceAll(/[^a-zA-Z0-9]/g, "")
    .toLowerCase()
    .includes("assessment");
};

/** Attempt to load a domain-specific banner; fall back to default. */
const getCardImage = (subdomain) => {
  if (!subdomain) return require("../../assets/cardBanner/urbandesign.png");
  try {
    return require(`../../assets/cardBanner/${subdomain}.png`);
  } catch {
    return require("../../assets/cardBanner/urbandesign.png");
  }
};

/** Format an ISO date string to "DD Month YYYY". */
const formatDate = (dateString) => {
  if (!dateString) return "Not Provided";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Not Provided";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const JoinCourseSSO = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);

  // SSO URL format: /webapp/joinCourseSSO?courseId=do_xxx&sso=igot
  const contentId = searchParams.get("courseId");

  const _userId = util.userId();

  // ── Course & batch data ──────────────────────────────────────────────────
  const [courseData, setCourseData] = useState(null);
  const [batchData, setBatchData] = useState(null);
  const [batchDetails, setBatchDetails] = useState(null);

  // ── Enrollment ───────────────────────────────────────────────────────────
  const [userCourseData, setUserCourseData] = useState({});
  const [enrolled, setEnrolled] = useState(false);   // set after successful join
  const [activeBatch, setActiveBatch] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  // ── Progress ─────────────────────────────────────────────────────────────
  const [childNode, setChildNode] = useState(null);
  const [allContents, setAllContents] = useState([]);
  const [completedContents, setCompletedContents] = useState([]);
  const [ConsumedContents, setConsumedContents] = useState([]);
  const [isNotStarted, setIsNotStarted] = useState(false);
  const [ContinueLearning, setContinueLearning] = useState(null);
  const [NotConsumedContent, setNotConsumedContent] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);

  // ── UI ───────────────────────────────────────────────────────────────────
  const [showMore, setShowMore] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showEnrollmentSnackbar, setShowEnrollmentSnackbar] = useState(false);
  const [showUnEnrollmentSnackbar, setShowUnEnrollmentSnackbar] =
    useState(false);
  const [toasterMessage, setToasterMessage] = useState("");

  // ── Loading / error ──────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [courseError, setCourseError] = useState(null);
  const [sessionExpired, setSessionExpired] = useState(false);

  // ── Guard: validate required params immediately ──────────────────────────
  useEffect(() => {
    if (!contentId) {
      setCourseError(t("INVALID_COURSE_ID") || "Invalid or missing courseId.");
      setLoading(false);
    }
    if (!_userId) {
      setSessionExpired(true);
      setLoading(false);
    }
  }, []);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const showErrorMessage = (msg) => {
    setToasterMessage(msg);
    setTimeout(() => setToasterMessage(""), 3000);
  };

  // ── API calls (same logic as joinCourse.js) ──────────────────────────────

  const fetchCourseData = async () => {
    const url =
      `${urlConfig.URLS.PUBLIC_PREFIX}${urlConfig.URLS.COURSE.HIERARCHY}/${contentId}` +
      `?orgdetails=${appConfig.ContentPlayer.contentApiQueryParams.orgdetails}` +
      `&licenseDetails=${appConfig.ContentPlayer.contentApiQueryParams.licenseDetails}`;

    const response = await fetch(url, {
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error(t("FAILED_TO_FETCH_DATA"));
    const data = await response.json();

    setCourseData(data);
    if (_userId === data?.result?.content?.createdBy) setIsOwner(true);

    // Determine first navigable leaf node (mirrors joinCourse.js logic)
    const children = data?.result?.content?.children || [];
    let firstLeaf;
    if (children[0]?.children?.[0]?.children?.[0]) {
      firstLeaf = children[0].children[0].children[0].identifier;
    } else if (children[0]?.children?.[0]) {
      firstLeaf = children[0].children[0].identifier;
    } else {
      firstLeaf = children[0]?.identifier;
    }
    setChildNode(firstLeaf);

    // Collect every leaf content identifier for progress tracking
    const leafIds = [];
    const collectLeafs = (nodes) => {
      nodes.forEach((node) => {
        if (!node?.children || node.children.length === 0) {
          if (node.identifier) leafIds.push(node.identifier);
        } else {
          collectLeafs(node.children);
        }
      });
    };
    collectLeafs(children);
    setAllContents(leafIds);
  };

  const fetchBatchData = async () => {
    const url = `${urlConfig.URLS.LEARNER_PREFIX}${urlConfig.URLS.BATCH.GET_BATCHS}`;
    const response = await axios.post(url, {
      request: {
        filters: { status: "1", courseId: contentId, enrollmentType: "open" },
        sort_by: { createdDate: "desc" },
      },
    });

    const { count, content } = response.data?.result?.response || {};
    if (!count || count === 0) {
      setActiveBatch(false);
      return;
    }
    if (content?.length > 0) {
      const batch = content[0];
      setBatchData({
        startDate: batch.startDate,
        endDate: batch.endDate,
        enrollmentEndDate: batch.enrollmentEndDate,
        batchId: batch.batchId,
      });
      setBatchDetails(batch);
    }
  };

  const checkEnrolledCourse = async () => {
    const url =
      `${urlConfig.URLS.LEARNER_PREFIX}${urlConfig.URLS.COURSE.GET_ENROLLED_COURSES}/${_userId}` +
      `?orgdetails=${appConfig.Course.contentApiQueryParams.orgdetails}` +
      `&licenseDetails=${appConfig.Course.contentApiQueryParams.licenseDetails}` +
      `&fields=${urlConfig.params.enrolledCourses.fields}` +
      `&batchDetails=${urlConfig.params.enrolledCourses.batchDetails}`;

    const response = await fetch(url);
    if (!response.ok) return;
    const data = await response.json();
    setUserCourseData(data.result || {});
  };

  const markCourseCompleteIfNeeded = async (activeBatchDetails, leafIds, contentList) => {
    const allDone =
      leafIds.length > 0 &&
      leafIds.every((id) =>
        contentList.some((c) => c.contentId === id && c.status === 2)
      );
    if (!allDone) return;
    setIsCompleted(true);
    try {
      await axios.patch(
        `${urlConfig.URLS.CONTENT_PREFIX}${urlConfig.URLS.COURSE.USER_CONTENT_STATE_UPDATE}`,
        {
          request: {
            userId: _userId,
            courseId: contentId,
            batchId: activeBatchDetails.batchId,
          },
        }
      );
    } catch (e) {
      console.error("Error marking course complete:", e);
    }
  };

  const getCourseProgress = async (activeBatchDetails, leafIds) => {
    if (!activeBatchDetails?.batchId || !leafIds?.length) return;

    try {
      const url = `${urlConfig.URLS.CONTENT_PREFIX}${urlConfig.URLS.COURSE.USER_CONTENT_STATE_READ}`;
      const response = await axios.post(url, {
        request: {
          userId: _userId,
          courseId: contentId,
          contentIds: leafIds,
          batchId: activeBatchDetails.batchId,
          fields: ["progress", "score"],
        },
      });
      const data = response.data;
      const contentList = data?.result?.contentList || [];

      const consumedIds = contentList.map((item) => item.contentId);
      if (consumedIds.length === 0) setIsNotStarted(true);
      setConsumedContents(consumedIds);

      const completed = [];
      let continueId = null;
      for (const item of contentList) {
        if (item.status === 1 && !continueId) continueId = item.contentId;
        if (item.status === 2) completed.push(item.contentId);
      }
      setContinueLearning(continueId);
      setCompletedContents(completed);

      // Find first unconsumed leaf for "next up"
      let nextUp = null;
      for (const id of leafIds) {
        if (!contentList.some((c) => c.contentId === id && c.status === 2)) {
          nextUp = id;
          break;
        }
      }
      setNotConsumedContent(nextUp);

      await markCourseCompleteIfNeeded(activeBatchDetails, leafIds, contentList);
    } catch (error) {
      console.error("Error fetching course progress:", error);
    }
  };

  // ── Primary data load ────────────────────────────────────────────────────

  useEffect(() => {
    if (!contentId || !_userId) return;

    const loadAll = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchCourseData(),
          fetchBatchData(),
          checkEnrolledCourse(),
        ]);
      } catch (error) {
        console.error("Error loading SSO course page:", error);
        setCourseError(t("FAILED_TO_FETCH_DATA"));
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  // Refresh progress whenever batch or content list becomes available
  useEffect(() => {
    if (batchDetails && allContents.length > 0) {
      getCourseProgress(batchDetails, allContents);
    }
  }, [batchDetails, allContents]);

  // Auto-enroll SSO users: once data has loaded, join immediately if eligible
  useEffect(() => {
    if (loading) return;
    if (courseError || !courseData) return;
    const alreadyEnrolled =
      userCourseData?.courses?.some((c) => c.contentId === contentId) || enrolled;
    if (alreadyEnrolled) return;
    if (!activeBatch) return;
    if (isOwner) return;
    if (!batchData?.batchId) return;
    const expiryDate = batchData.enrollmentEndDate || batchData.endDate;
    const expired = expiryDate ? new Date(expiryDate) < new Date() : false;
    if (expired) return;
    handleJoinCourse();
  }, [loading]);

  // ── Derived state ────────────────────────────────────────────────────────

  const isEnrolled = () =>
    userCourseData?.courses?.some((c) => c.contentId === contentId) || enrolled;

  const isBatchExpired = () => {
    if (!batchData) return false;
    const expiryDate = batchData.enrollmentEndDate || batchData.endDate;
    const expiry = expiryDate ? new Date(expiryDate) : null;
    return Boolean(expiry && expiry < new Date());
  };

  // ── Actions ──────────────────────────────────────────────────────────────

  /** Join the course directly — no consent form for SSO users. */
  const handleJoinCourse = async () => {
    if (!_userId) {
      setSessionExpired(true);
      return;
    }
    try {
      const url = `${urlConfig.URLS.LEARNER_PREFIX}${urlConfig.URLS.COURSE.ENROLL_USER_COURSE}`;
      const response = await axios.post(url, {
        request: {
          courseId: contentId,
          userId: _userId,
          batchId: batchData?.batchId,
        },
      });
      if (response.status === 200) {
        setEnrolled(true);
        setShowEnrollmentSnackbar(true);
        setIsNotStarted(true);
      }
    } catch (error) {
      console.error("Error enrolling:", error);
      showErrorMessage(t("FAILED_TO_ENROLL_INTO_COURSE"));
    }
  };

  const handleLeaveConfirmed = async () => {
    try {
      const url = `${urlConfig.URLS.LEARNER_PREFIX}${urlConfig.URLS.COURSE.UNENROLL_USER_COURSE}`;
      await axios.post(url, {
        request: {
          courseId: contentId,
          userId: _userId,
          batchId: batchData?.batchId,
        },
      });
      setShowConfirmation(false);
      setShowUnEnrollmentSnackbar(true);
      // Small delay so the snackbar is visible before reload
      setTimeout(() => globalThis.location.reload(), 1200);
    } catch (error) {
      console.error("Error unenrolling:", error);
      showErrorMessage(t("FAILED_TO_ENROLL_INTO_COURSE"));
    }
  };

  const handleLinkClick = (id) => {
    if (!isEnrolled()) {
      showErrorMessage(
        t("JOIN_COURSE_TO_ACCESS") ||
          "You must join the course to access content."
      );
      return;
    }
    navigate(
      `${routeConfig.ROUTES.PLAYER_PAGE.PLAYER_SSO}?id=${id}&cId=${contentId}&bId=${batchDetails?.batchId}&sso=igot`,
      {
        state: {
          coursename: courseData?.result?.content?.name,
          batchid: batchDetails?.batchId,
          courseid: contentId,
          isenroll: isEnrolled(),
          consumedcontents: ConsumedContents,
          courseHierarchy: courseData?.result?.content,
          allContents: allContents,
        },
      }
    );
  };

  const handleSnackbarClose = (_, reason) => {
    if (reason === "clickaway") return;
    setShowEnrollmentSnackbar(false);
    setShowUnEnrollmentSnackbar(false);
  };

  // ── Render helpers ───────────────────────────────────────────────────────

  const renderActionButton = () => {
    if (isEnrolled()) {
      const nextId = ContinueLearning ?? NotConsumedContent ?? childNode;
      return (
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button
            variant="contained"
            disabled={isCompleted}
            onClick={() => handleLinkClick(nextId)}
            className="custom-btn-primary"
            sx={{ background: "#004367", textTransform: "none" }}
          >
            {isNotStarted ? t("START_LEARNING") : t("CONTINUE_LEARNNG")}
          </Button>
          <Button
            variant="outlined"
            color="error"
            disabled
            onClick={() => setShowConfirmation(true)}
            className="custom-btn-danger"
            sx={{ textTransform: "none" }}
          >
            {t("LEAVE_COURSE")}
          </Button>
          {isCompleted && (
            <Typography
              variant="body2"
              color="success.main"
              sx={{ alignSelf: "center", fontWeight: 600 }}
            >
              {t("COURSE_SUCCESSFULLY_COMPLETED")}
            </Typography>
          )}
        </Box>
      );
    }

    if (isBatchExpired()) {
      return <Alert severity="warning">{t("BATCH_EXPIRED_MESSAGE")}</Alert>;
    }

    return (
      <Button
        variant="contained"
        onClick={handleJoinCourse}
        disabled={!activeBatch || isOwner}
        className="custom-btn-primary"
        sx={{ background: "#004367", textTransform: "none" }}
      >
        {t("JOIN_COURSE")}
      </Button>
    );
  };

  /**
   * Recursively renders the course module tree.
   * Mirrors joinCourse.js renderContentItem logic but extracted as a named
   * function for clarity and to avoid prop drilling.
   */
  const renderContentItem = (item, depth = 0) => {
    const isCollection =
      item.mimeType === "application/vnd.ekstep.content-collection";

    if (!isCollection) {
      return (
        <AccordionDetails
          key={item.identifier || item.name}
          className="border-bottom"
          style={{ padding: "8px 16px", margin: 0 }}
        >
          <Link
            href="#"
            underline="none"
            onClick={(e) => {
              e.preventDefault();
              handleLinkClick(item.identifier);
            }}
            className="h6-title"
            style={{ verticalAlign: "middle", display: "flex", alignItems: "center", gap: 4 }}
          >
            {item.name}
            {completedContents.includes(item.identifier) && (
              <CheckCircleIcon
                style={{ color: "green", fontSize: "18px", marginLeft: "auto" }}
              />
            )}
          </Link>
        </AccordionDetails>
      );
    }

    return (
      <Accordion
        key={item.identifier || item.name}
        style={{ borderRadius: "8px", margin: "6px 0" }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />} className="h6-title">
          {item.name}
        </AccordionSummary>
        <AccordionDetails style={{ padding: "4px 0" }}>
          {item.children?.map((child) => renderContentItem(child, depth + 1))}
        </AccordionDetails>
      </Accordion>
    );
  };

  // ── Early-exit states ────────────────────────────────────────────────────

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          gap: 2,
          background: "#f5f5f5",
        }}
      >
        <CircularProgress size={48} sx={{ color: "#004367" }} />
        <Typography variant="body1" color="text.secondary">
          {t("LOADING") || "Loading course…"}
        </Typography>
      </Box>
    );
  }

  if (sessionExpired) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          p: 2,
        }}
      >
        <Alert severity="error" sx={{ maxWidth: 480 }}>
          {t("SESSION_EXPIRED") ||
            "Your session has expired. Please log in again."}
        </Alert>
      </Box>
    );
  }

  if (courseError || !courseData) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          p: 2,
        }}
      >
        <Alert severity="error" sx={{ maxWidth: 480 }}>
          {courseError || t("FAILED_TO_FETCH_DATA") || "Course not found."}
        </Alert>
      </Box>
    );
  }

  const content = courseData?.result?.content;

  const descWords = content?.description?.split(" ") ?? [];
  let displayDescription = content?.description ?? "";
  if (descWords.length > 50) {
    displayDescription = showMore
      ? content.description
      : descWords.slice(0, 50).join(" ") + "…";
  }

  // ── Main render ──────────────────────────────────────────────────────────

  return (
    <Box sx={{ minHeight: "100vh", background: "#f5f5f5" }}>
      {/* Inline toaster (same component used by joinCourse.js) */}
      {toasterMessage && <ToasterCommon response={toasterMessage} />}

      {/* Enrollment success snackbar */}
      <Snackbar
        open={showEnrollmentSnackbar}
        autoHideDuration={4000}
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

      {/* Unenrollment success snackbar */}
      <Snackbar
        open={showUnEnrollmentSnackbar}
        autoHideDuration={4000}
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

      {/* Leave course confirmation dialog */}
      <Dialog
        open={showConfirmation}
        onClose={() => setShowConfirmation(false)}
      >
        <DialogTitle>{t("LEAVE_COURSE_CONFIRMATION_TITLE")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("LEAVE_COURSE_CONFIRMATION_MESSAGE")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowConfirmation(false)}
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

      {/* Course banner image */}
      <Box>
        <img
          src={
            content?.se_gradeLevels
              ? getCardImage(content.se_gradeLevels[0])
              : getCardImage("urbandesign")
          }
          alt={content?.name || "Course banner"}
          style={{ height: "180px", width: "100%", objectFit: "cover" }}
        />
      </Box>

      {/* Page body */}
      <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 4 }, py: 3 }}>
        <Grid container spacing={3}>
          {/* ── Left panel: meta + batch info + action button ── */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, mb: 2, color: "#004367" }}
            >
              {content?.name}
            </Typography>

            {/* Batch details card */}
            {batchData && (
              <Box
                sx={{
                  background: "#F9FAFC",
                  p: 2,
                  borderRadius: 2,
                  mb: 2,
                  boxShadow: "0px 2px 6px rgba(0,0,0,0.08)",
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, mb: 1, fontSize: "14px" }}
                >
                  {t("BATCH_DETAILS")}:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ mb: 0.5, fontWeight: 500, fontSize: "13px" }}
                >
                  {t("BATCH_START_DATE")}: {formatDate(batchData.startDate)}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ mb: 0.5, fontWeight: 500, fontSize: "13px" }}
                >
                  {t("BATCH_END_DATE")}: {formatDate(batchData.endDate)}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 500, fontSize: "13px" }}
                >
                  {t("LAST_DATE_FOR_ENROLLMENT")}:{" "}
                  {batchData.enrollmentEndDate
                    ? formatDate(batchData.enrollmentEndDate)
                    : "Not Provided"}
                </Typography>
              </Box>
            )}

            {/* Primary action */}
            <Box sx={{ mb: 2 }}>{renderActionButton()}</Box>

            {/* Creator */}
            {content?.creator && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {t("CREATED_BY")}: {content.creator}
              </Typography>
            )}

            {/* No active batch warning */}
            {!activeBatch && (
              <Alert severity="info" sx={{ mt: 2 }}>
                {t("This course has no active Batches")}
              </Alert>
            )}
          </Grid>

          {/* ── Right panel: description + module tree ── */}
          <Grid item xs={12} md={8}>
            {/* Description */}
            {content?.description && (
              <Box sx={{ mb: 3 }}>
                <Typography
                  className="h5-title"
                  sx={{ fontWeight: 600, mb: 1 }}
                >
                  {t("DESCRIPTION")}:
                </Typography>
                <Typography
                  className="h5-title"
                  sx={{ fontWeight: 400, fontSize: "14px" }}
                >
                  {displayDescription}
                </Typography>
                {descWords.length > 50 && (
                  <Button
                    size="small"
                    onClick={() => setShowMore((v) => !v)}
                    sx={{ p: 0, mt: 0.5, textTransform: "none" }}
                  >
                    {showMore ? t("Show Less") : t("Show More")}
                  </Button>
                )}
              </Box>
            )}

            {/* Course modules tree */}
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
                className="h4-title"
                style={{ fontWeight: 500 }}
              >
                {t("COURSES_MODULE")}
              </AccordionSummary>
              <AccordionDetails>
                {content?.children?.map((item) => renderContentItem(item))}
              </AccordionDetails>
            </Accordion>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default JoinCourseSSO;
