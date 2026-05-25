/**
 * playerSSO.js
 *
 * Full-screen, iframe-compatible Sunbird content player for IGOT SSO users.
 *
 * What is REMOVED vs. Player.js:
 *   - Header / Footer / FloatingChatIcon
 *   - Breadcrumbs and back button
 *   - Social share buttons
 *   - Content tags section
 *   - Description / "About the content" accordions
 *   - Learnathon flow (review, vote, publish, reject)
 *   - Feedback popup
 *
 * What is KEPT (identical to Player.js):
 *   - SunbirdPlayer integration
 *   - Content fetch (PUBLIC_PREFIX + CONTENT.GET)
 *   - updateContentState (progress)
 *   - updateContentStateForAssessment (assessment submission)
 *   - handleAssessmentData (telemetry)
 *   - handleTrackData (track pdf/video/ecml completion)
 *   - Previous / Next content & module navigation
 *   - Session auth via util.userId()
 *
 * Route: /webapp/playerSSO?id=<contentId>&cId=<courseId>&bId=<batchId>&sso=igot
 *
 * DEPLOYMENT RULE: All changes isolated to playerSSO.js, playerSSO.css, their route.
 *                  No existing pages or global behaviour are modified.
 */

import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SunbirdPlayer } from "@shiksha/common-lib";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import * as util from "../../services/utilService";
import axios from "axios";
import md5 from "md5";
import "../../styles/playerSSO.css";

const urlConfig = require("../../configs/urlConfig.json");
const routeConfig = require("../../configs/routeConfig.json");

// Feature flag – set to false to disable this page
const ENABLE_IGOT_SSO_PLAYER = true;

// Full content fields string – identical to Player.js to avoid API drift
const CONTENT_FIELDS =
  "transcripts,ageGroup,appIcon,artifactUrl,attributions,attributions,audience,author," +
  "badgeAssertions,board,body,channel,code,concepts,contentCredits,contentType,contributors," +
  "copyright,copyrightYear,createdBy,createdOn,creator,creators,description,displayScore,domain," +
  "editorState,flagReasons,flaggedBy,flags,framework,gradeLevel,identifier,itemSetPreviewUrl," +
  "keywords,language,languageCode,lastUpdatedOn,license,mediaType,medium,mimeType,name,originData," +
  "osId,owner,pkgVersion,publisher,questions,resourceType,scoreDisplayConfig,status,streamingUrl," +
  "subject,template,templateId,totalQuestions,totalScore,versionKey,visibility,year,primaryCategory," +
  "additionalCategories,interceptionPoints,interceptionType";

function formatDate() {
  const now = new Date();
  const pad = (n, l = 2) => String(n).padStart(l, "0");
  const offset = -now.getTimezoneOffset();
  const sign = offset >= 0 ? "+" : "-";
  return (
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ` +
    `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}:` +
    `${pad(now.getMilliseconds(), 3)}${sign}${pad(Math.floor(Math.abs(offset) / 60))}` +
    `${pad(Math.abs(offset) % 60)}`
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const PlayerSSO = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);

  // ── URL parameters ────────────────────────────────────────────────────────
  const [contentId, setContentId] = useState(() => {
    const id = params.get("id");
    return id?.endsWith("=") ? id.slice(0, -1) : id;
  });
  const [courseId, setCourseId] = useState(params.get("cId"));
  const [batchId, setBatchId] = useState(params.get("bId"));

  const _userId = util.userId();

  // ── Navigation context passed from joinCourseSSO ──────────────────────────
  const [courseName] = useState(location.state?.coursename);
  const [isEnrolled] = useState(location.state?.isenroll || undefined);
  const [consumedContent] = useState(location.state?.consumedcontents || []);
  const [courseHierarchy] = useState(location.state?.courseHierarchy);
  const [allContents] = useState(location.state?.allContents || []);

  // ── Player state ──────────────────────────────────────────────────────────
  const [lesson, setLesson] = useState(null);
  const [userFirstName, setUserFirstName] = useState("");
  const [userLastName, setUserLastName] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);

  // ── Assessment tracking (identical to Player.js) ──────────────────────────
  const [assessEvents, setAssessEvents] = useState([]);
  const [propLength, setPropLength] = useState();
  const [isEndEventReceived, setIsEndEventReceived] = useState(false);
  const [hasCalledUpdateAPI, setHasCalledUpdateAPI] = useState(false);

  // ── Loading / error ───────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [contentError, setContentError] = useState(null);
  const [sessionExpired, setSessionExpired] = useState(false);

  // ── Player URL (identical to Player.js) ──────────────────────────────────
  const playerUrl =
    globalThis.location.origin === "http://localhost:3000"
      ? "https://nulp.niua.org/newplayer"
      : `${globalThis.location.origin}/newplayer`;

  // ── Guards ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!_userId) setSessionExpired(true);
    if (!contentId) setContentError("Invalid or missing content ID.");
  }, []); // runs once on mount

  // ── Date / ID helpers (identical to Player.js) ───────────────────────────

  const getCurrentTimestamp = () => Date.now();

  const attemptid = () => {
    const ts = Date.now();
    return md5([courseId, batchId, contentId, _userId, ts].join("-"));
  };

  /** Replaces a CDN domain across a deeply nested content object. */
  const replaceDomain = (obj, oldDomain, newDomain) => {
    if (typeof obj === "string")
      return obj.replace(new RegExp(oldDomain, "g"), newDomain);
    if (Array.isArray(obj))
      return obj.map((item) => replaceDomain(item, oldDomain, newDomain));
    if (typeof obj === "object" && obj !== null) {
      return Object.entries(obj).reduce((acc, [key, value]) => {
        acc[key] = replaceDomain(value, oldDomain, newDomain);
        return acc;
      }, {});
    }
    return obj;
  };

  // ── Progress API calls (identical to Player.js) ───────────────────────────

  const updateContentState = useCallback(
    async (status) => {
      if (!_userId) return;
      const url = `${urlConfig.URLS.CONTENT_PREFIX}${urlConfig.URLS.COURSE.USER_CONTENT_STATE_UPDATE}`;
      await axios.patch(url, {
        request: {
          userId: _userId,
          contents: [{ contentId, courseId, batchId, status }],
        },
      });
    },
    [isEnrolled, _userId, contentId, courseId, batchId]
  );

  const updateContentStateForAssessment = useCallback(async () => {
    if (!_userId) return;
    try {
      const url = `${urlConfig.URLS.CONTENT_PREFIX}${urlConfig.URLS.COURSE.USER_CONTENT_STATE_UPDATE}`;
      await axios.patch(url, {
        request: {
          userId: _userId,
          contents: [
            {
              contentId,
              batchId,
              status: 2,
              courseId,
              lastAccessTime: formatDate(),
            },
          ],
          assessments: [
            {
              assessmentTs: getCurrentTimestamp(),
              batchId,
              courseId,
              userId: _userId,
              attemptId: attemptid(),
              contentId,
              events: assessEvents,
            },
          ],
        },
      });
    } catch (error) {
      console.error("Error updating assessment state:", error);
    }
  }, [_userId, contentId, batchId, courseId, assessEvents]);

  // ── Telemetry / track handlers (identical to Player.js) ──────────────────

  const handleTrackData = useCallback(
    async ({ score, trackData: td, attempts, currentPage, totalPages, ...props }, playerType = "quml") => {
      if (!_userId) return;
      setPropLength(Object.keys(props).length);
      if (playerType === "pdf-video" && currentPage === totalPages) {
        setIsCompleted(true);
      }
    },
    [assessEvents, _userId]
  );

  const handleAssessmentData = async (data) => {
    if (data.eid === "ASSESS") {
      setAssessEvents((prev) => [...prev, data]);
    } else if (data.eid === "END") {
      setIsEndEventReceived(true);
    } else if (data.eid === "START") {
      // On START, mark the content as accessed (status 2)
      // This matches the effective behaviour of the original Player.js
      await updateContentState(2);
    }
  };

  // Assessment END-event handler (identical logic to Player.js)
  useEffect(() => {
    if (hasCalledUpdateAPI) return;
    if (isEndEventReceived && assessEvents.length > 0) {
      if (propLength !== undefined && propLength === assessEvents.length) {
        if (!_userId) return;
        setHasCalledUpdateAPI(true);
        updateContentStateForAssessment();
        setIsEndEventReceived(false);
        return;
      }
      // Fallback timeout when propLength doesn't match
      const timeoutId = setTimeout(() => {
        if (!_userId || hasCalledUpdateAPI) return;
        setHasCalledUpdateAPI(true);
        updateContentStateForAssessment();
        setIsEndEventReceived(false);
      }, propLength === undefined ? 1000 : 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [
    isEndEventReceived,
    assessEvents,
    propLength,
    _userId,
    updateContentStateForAssessment,
    hasCalledUpdateAPI,
  ]);

  // Mark content complete when pdf/video reaches last page
  useEffect(() => {
    if (isCompleted) updateContentState(2);
  }, [isCompleted, updateContentState]);

  // ── User data ─────────────────────────────────────────────────────────────

  const fetchUserData = useCallback(async () => {
    if (!_userId) return;
    try {
      const userData = await util.userData();
      setUserFirstName(userData?.data?.result?.response?.firstName || "");
      setUserLastName(userData?.data?.result?.response?.lastName || "");
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }, []);

  // ── Content fetch ─────────────────────────────────────────────────────────

  const fetchContent = useCallback(
    async (id) => {
      if (!id) {
        setLesson(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      setLesson(null);
      try {
        const url =
          `${urlConfig.URLS.PUBLIC_PREFIX}${urlConfig.URLS.CONTENT.GET}/${id}` +
          `?fields=${CONTENT_FIELDS}&orgdetails=orgName,email&licenseDetails=name,description,url`;
        const response = await fetch(url, {
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) throw new Error("Failed to fetch content");
        const data = await response.json();
        const updated = replaceDomain(
          data.result.content,
          "nulpstorage1.blob.core.windows.net",
          "nulpstorage.blob.core.windows.net"
        );
        setLesson(updated);
      } catch (error) {
        console.error("Error fetching content:", error);
        setContentError("Failed to load content. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Sync state when URL changes (content navigation)
  useEffect(() => {
    const newParams = new URLSearchParams(location.search);
    const rawId = newParams.get("id");
    const cleanId = rawId?.endsWith("=") ? rawId.slice(0, -1) : rawId;
    const newCId = newParams.get("cId");
    const newBId = newParams.get("bId");

    if (cleanId) setContentId(cleanId);
    if (newCId) setCourseId(newCId);
    if (newBId) setBatchId(newBId);

    // Reset assessment state for new content
    setAssessEvents([]);
    setPropLength(undefined);
    setIsEndEventReceived(false);
    setHasCalledUpdateAPI(false);
    setIsCompleted(false);
  }, [location.search]);

  // Fetch content whenever contentId changes
  useEffect(() => {
    if (!contentId || !_userId) return;
    fetchContent(contentId);
    fetchUserData();
    // Mark content as accessed if not already in consumed list
    if (consumedContent && !consumedContent.includes(contentId)) {
      updateContentState(2);
    }
    localStorage.setItem("playerVisited", "true");
  }, [contentId, fetchContent, fetchUserData, updateContentState]);

  // ── Content navigation (mirrors Player.js; navigates within SSO route) ───

  const buildContentList = (hierarchy) => {
    const list = [];
    if (!hierarchy?.children) return list;
    const traverse = (nodes, moduleInfo = null) => {
      for (const node of nodes) {
        if (!node.children || node.children.length === 0) {
          list.push({
            identifier: node.identifier,
            name: node.name,
            moduleIdentifier: moduleInfo?.identifier || null,
            moduleName: moduleInfo?.name || null,
          });
        } else {
          traverse(node.children, {
            identifier: node.identifier,
            name: node.name,
          });
        }
      }
    };
    traverse(hierarchy.children);
    return list;
  };

  const findFirstContentInModule = (list, moduleId) => {
    for (const item of list) {
      if (item.moduleIdentifier === moduleId) {
        return {
          identifier: moduleId,
          name: item.moduleName,
          firstContentId: item.identifier,
        };
      }
    }
    return null;
  };

  const findPreviousModule = (list, idx, currentModuleId) => {
    if (!currentModuleId) return null;
    for (let i = idx - 1; i >= 0; i--) {
      if (
        list[i].moduleIdentifier &&
        list[i].moduleIdentifier !== currentModuleId
      ) {
        return findFirstContentInModule(list, list[i].moduleIdentifier);
      }
    }
    return null;
  };

  const findNextModule = (list, idx, currentModuleId) => {
    if (!currentModuleId) return null;
    for (let i = idx + 1; i < list.length; i++) {
      if (
        list[i].moduleIdentifier &&
        list[i].moduleIdentifier !== currentModuleId
      ) {
        return findFirstContentInModule(list, list[i].moduleIdentifier);
      }
    }
    return null;
  };

  const getNavigationInfo = () => {
    const empty = {
      previousContent: null,
      nextContent: null,
      previousModule: null,
      nextModule: null,
    };
    if (!courseHierarchy || !contentId || !allContents?.length) return empty;
    const list = buildContentList(courseHierarchy);
    const idx = list.findIndex((item) => item.identifier === contentId);
    if (idx === -1) return empty;
    const curr = list[idx];
    return {
      previousContent: idx > 0 ? list[idx - 1] : null,
      nextContent: idx < list.length - 1 ? list[idx + 1] : null,
      previousModule: findPreviousModule(list, idx, curr.moduleIdentifier),
      nextModule: findNextModule(list, idx, curr.moduleIdentifier),
    };
  };

  /** Navigate to another content item, staying within the SSO player route. */
  const navigateToContent = (targetId) => {
    if (!targetId) return;
    setLesson(null);
    navigate(
      `${routeConfig.ROUTES.PLAYER_PAGE.PLAYER_SSO}?id=${targetId}&cId=${courseId}&bId=${batchId}&sso=igot`,
      {
        replace: false,
        state: {
          coursename: courseName,
          batchid: batchId,
          courseid: courseId,
          isenroll: isEnrolled,
          consumedcontents: consumedContent,
          courseHierarchy,
          allContents,
        },
      }
    );
  };

  const navigationInfo = useMemo(
    () => getNavigationInfo(),
    [courseHierarchy, contentId, allContents]
  );

  // ── Feature flag guard ────────────────────────────────────────────────────

  if (!ENABLE_IGOT_SSO_PLAYER) {
    return (
      <Box className="sso-player-root sso-center">
        <Alert severity="info" sx={{ maxWidth: 400 }}>
          SSO player is currently disabled.
        </Alert>
      </Box>
    );
  }

  // ── Early-exit states ─────────────────────────────────────────────────────

  if (sessionExpired) {
    return (
      <Box className="sso-player-root sso-center">
        <Alert severity="error" sx={{ maxWidth: 420 }}>
          Your session has expired. Please log in again.
        </Alert>
      </Box>
    );
  }

  if (contentError) {
    return (
      <Box className="sso-player-root sso-center">
        <Alert severity="error" sx={{ maxWidth: 420 }}>
          {contentError}
        </Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box className="sso-player-root sso-center">
        <CircularProgress size={52} sx={{ color: "#fff" }} />
        <Typography variant="body2" sx={{ color: "#aaa", mt: 2 }}>
          Loading content…
        </Typography>
      </Box>
    );
  }

  if (!lesson) {
    return (
      <Box className="sso-player-root sso-center">
        <Alert severity="warning" sx={{ maxWidth: 420 }}>
          No content available to play.
        </Alert>
      </Box>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────

  return (
    <Box className="sso-player-root">
      {/* ── Player stage (fills all available height above nav) ── */}
      <Box className="sso-player-stage">
        <Box className="sso-player-ratio">
          <SunbirdPlayer
            {...lesson}
            userData={{
              firstName: userFirstName || "",
              lastName: userLastName || "",
            }}
            telemetryData={(data) => handleAssessmentData(data)}
            setTrackData={(data) => {
              const type = lesson?.mimeType;
              if (
                [
                  "assessment",
                  "SelfAssess",
                  "QuestionSet",
                  "QuestionSetImage",
                ].includes(type)
              ) {
                handleTrackData(data);
              } else if (
                [
                  "application/vnd.ekstep.html-archive",
                  "application/epub",
                ].includes(type)
              ) {
                handleTrackData(data);
              } else if (
                ["application/vnd.sunbird.questionset"].includes(type)
              ) {
                handleTrackData(data, "application/vnd.sunbird.questionset");
              } else if (
                [
                  "application/pdf",
                  "video/mp4",
                  "video/webm",
                  "video/x-youtube",
                  "application/vnd.ekstep.h5p-archive",
                ].includes(type)
              ) {
                handleTrackData(data, "pdf-video");
              } else if (
                ["application/vnd.ekstep.ecml-archive"].includes(type)
              ) {
                const score = Array.isArray(data)
                  ? data.reduce((acc, n) => acc + (n?.score || 0), 0)
                  : 0;
                handleTrackData({ ...data, score: `${score}` }, "ecml");
              }
            }}
            public_url={playerUrl}
          />
        </Box>
      </Box>

      {/* ── Prev / Next navigation bar (only shown when course context exists) ── */}
      {courseHierarchy && courseId && (
        <Box className="sso-player-nav">
          {/* Left: back navigation */}
          <Box className="sso-nav-group">
            {navigationInfo.previousModule && (
              <Button
                variant="outlined"
                onClick={() =>
                  navigateToContent(
                    navigationInfo.previousModule.firstContentId
                  )
                }
                className="sso-nav-btn"
              >
                ← Prev Module
              </Button>
            )}
            {navigationInfo.previousContent && (
              <Button
                variant="outlined"
                onClick={() =>
                  navigateToContent(
                    navigationInfo.previousContent.identifier
                  )
                }
                className="sso-nav-btn"
              >
                ← Previous
              </Button>
            )}
          </Box>

          {/* Right: forward navigation */}
          <Box className="sso-nav-group">
            {navigationInfo.nextContent && (
              <Button
                variant="contained"
                onClick={() =>
                  navigateToContent(navigationInfo.nextContent.identifier)
                }
                className="sso-nav-btn-primary"
              >
                Next →
              </Button>
            )}
            {navigationInfo.nextModule && (
              <Button
                variant="contained"
                onClick={() =>
                  navigateToContent(
                    navigationInfo.nextModule.firstContentId
                  )
                }
                className="sso-nav-btn-primary"
              >
                Next Module →
              </Button>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default PlayerSSO;
