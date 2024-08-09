import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Footer from "components/Footer";
import Header from "components/header";
import Container from "@mui/material/Container";
import FloatingChatIcon from "../../components/FloatingChatIcon";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { SunbirdPlayer } from "@shiksha/common-lib";
import * as util from "../../services/utilService";
import axios from "axios";
import Link from "@mui/material/Link";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import FeedbackPopup from "components/FeedbackPopup";

const urlConfig = require("../../configs/urlConfig.json");

const Player = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [lessonId, setLessonId] = useState();
  const [trackData, setTrackData] = useState();
  const [contentData, setContentData] = useState();
  const [toasterMessage, setToasterMessage] = useState("");
  const [toasterOpen, setToasterOpen] = useState(false);
  const [previousRoute, setPreviousRoute] = useState("");
  const [userFirstName, setUserFirstName] = useState("");
  const [userLastName, setUserLastName] = useState("");
  const [courseName, setCourseName] = useState(location.state?.coursename);
  const [batchId, setBatchId] = useState(location.state?.batchid);
  const [courseId, setCourseId] = useState(location.state?.courseid);
  const [isEnrolled, setIsEnrolled] = useState(
    location.state?.isenroll || undefined
  );
  const [consumedContent, setConsumedContents] = useState(
    location.state?.consumedcontents || []
  );
  const [lesson, setLesson] = useState();
  const [isCompleted, setIsCompleted] = useState(false);
  const [openFeedBack, setOpenFeedBack] = useState(false);

  const _userId = util.userId();
  const queryString = location.search;
  const contentId = queryString.startsWith("?do_")
    ? queryString.slice(1)
    : null;

  const fetchUserData = useCallback(async () => {
    try {
      const userData = await util.userData();
      setUserFirstName(userData?.data?.result?.response?.firstName);
      setUserLastName(userData?.data?.result?.response?.lastName);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }, []);

  const handleTrackData = useCallback(
    ({ score, trackData, attempts, ...props }, playerType = "quml") => {
      CheckfeedBackSubmitted();
      if (
        playerType === "pdf-video" &&
        props.currentPage === props.totalPages
      ) {
        setIsCompleted(true);
      } else if (playerType === "ecml") {
        setIsCompleted(true);
      }
    },
    []
  );

  const CheckfeedBackSubmitted =async()=>{
    try{
      const url = "/custom_feedback/list";
      const RequestBody={
        request:{
          filters:{
          content_id:contentId,
          user_id:_userId,
          }
         
        }
      }
      const response=await axios.post(url,RequestBody);
      console.log(response.data);
      if(response.data?.result?.totalCount===0){
      setOpenFeedBack(true);
      }else{
       setOpenFeedBack(false);
      }
    }catch(error){
      console.error("Error fetching course data:", error);
    }
  }

  const updateContentState = useCallback(
    async (status) => {
      if (isEnrolled) {
        const url = `${urlConfig.URLS.CONTENT_PREFIX}${urlConfig.URLS.COURSE.USER_CONTENT_STATE_UPDATE}`;
        await axios.patch(url, {
          request: {
            userId: _userId,
            contents: [{ contentId, courseId, batchId, status }],
          },
        });
      }
    },
    [isEnrolled, _userId, contentId, courseId, batchId]
  );

  useEffect(() => {
    setPreviousRoute(sessionStorage.getItem("previousRoutes"));

    const fetchData = async () => {
      try {
        const response = await fetch(`/api/content/v1/read/${contentId}`, {
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) throw new Error("Failed to fetch course data");
        const data = await response.json();
        setLesson(data.result.content);
      } catch (error) {
        console.error("Error fetching course data:", error);
      }
    };

    if (!consumedContent.includes(contentId)) {
      updateContentState(1);
    }
    fetchData();
    fetchUserData();
  }, [contentId, consumedContent, fetchUserData, updateContentState]);

  useEffect(() => {
    if (isCompleted) {
      updateContentState(2);
    }
  }, [isCompleted, updateContentState]);

  const handleClose = () => setOpenFeedBack(false);
  const handleGoBack = () => navigate(sessionStorage.getItem("previousRoutes"));

  return (
    <div>
      <Header />
      <Container maxWidth="xl" role="main" className="player mt-15">
        <Box style={{ textAlign: "right" }}>
          <Link
            underline="hover"
            onClick={handleGoBack}
            color="#004367"
            href={previousRoute}
            className="viewAll"
          >
            {t("BACK")}
          </Link>
        </Box>
        <Grid container spacing={2} className="mt-10">
          <Grid item xs={8}>
            <Box>
              {lesson && (
                <Breadcrumbs
                  aria-label="breadcrumb"
                  style={{
                    padding: "5px 0",
                    fontSize: "16px",
                    fontWeight: "600",
                  }}
                >
                  <Link
                    underline="hover"
                    href=""
                    aria-current="page"
                    color="#484848"
                  >
                    {courseName}
                  </Link>
                </Breadcrumbs>
              )}
              <Box className="h3-title my-10">{lesson?.name}</Box>
            </Box>
          </Grid>
          <Grid item xs={4}>
            {/* Placeholder for future features */}
          </Grid>
          <Grid>
            {lesson && (
              <Box>
                <Typography
                  className="h6-title pl-20 mb-20"
                  style={{ display: "inline-block", verticalAlign: "super" }}
                >
                  {t("CONTENT_TAGS")}:{" "}
                </Typography>
                {lesson.board && (
                  <Button
                    key={`board`}
                    size="small"
                    style={{
                      color: "#424242",
                      fontSize: "10px",
                      margin: "0 10px 3px 6px",
                    }}
                    className="bg-blueShade3"
                  >
                    {lesson.board}
                  </Button>
                )}
                {lesson.se_boards &&
                  lesson.se_boards.map((item, index) => (
                    <Button
                      key={`se_boards-${index}`}
                      size="small"
                      style={{
                        color: "#424242",
                        fontSize: "10px",
                        margin: "0 10px 3px 6px",
                      }}
                      className="bg-blueShade3"
                    >
                      {item}
                    </Button>
                  ))}
                {lesson.gradeLevel &&
                  lesson.gradeLevel.map((item, index) => (
                    <Button
                      key={`gradeLevel-${index}`}
                      size="small"
                      style={{
                        color: "#424242",
                        fontSize: "10px",
                        margin: "0 10px 3px 6px",
                      }}
                      className="bg-blueShade3"
                    >
                      {item}
                    </Button>
                  ))}
                {lesson.se_gradeLevels &&
                  lesson.se_gradeLevels.map((item, index) => (
                    <Button
                      key={`se_gradeLevels-${index}`}
                      size="small"
                      style={{
                        color: "#424242",
                        fontSize: "10px",
                        margin: "0 10px 3px 6px",
                      }}
                      className="bg-blueShade3"
                    >
                      {item}
                    </Button>
                  ))}
              </Box>
            )}
          </Grid>
        </Grid>
        <Box
          className="lg-mx-90"
          style={{
            position: "relative",
            paddingBottom: "56.25%",
            height: 0,
            overflow: "hidden",
            maxWidth: "100%",
          }}
        >
          {lesson && (
            <SunbirdPlayer
              {...lesson}
              userData={{
                firstName: userFirstName || "",
                lastName: userLastName || "",
              }}
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
                    ? data.reduce((old, newData) => old + newData?.score, 0)
                    : 0;
                  handleTrackData({ ...data, score: `${score}` }, "ecml");
                  setTrackData(data);
                }
              }}
              public_url="https://devnulp.niua.org/newplayer"
            />
          )}
        </Box>
      </Container>
      {openFeedBack && (
        <FeedbackPopup
          open={openFeedBack}
          onClose={handleClose}
          className="feedback-popup"
          contentId={contentId}
        />
      )}
      <FloatingChatIcon />
      <Footer />
    </div>
  );
};

export default Player;
