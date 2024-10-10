import React, { useEffect, useState } from "react";
import Footer from "components/Footer";
import Header from "components/header";
import Container from "@mui/material/Container";
import FloatingChatIcon from "../../components/FloatingChatIcon";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import axios from "axios";
import { useTranslation } from "react-i18next";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import {
  Alert,
  Button,
  Card,
  CardContent,
  DialogActions,
  Tooltip,
} from "@mui/material";
import TodayOutlinedIcon from "@mui/icons-material/TodayOutlined";
import ArrowForwardIosOutlinedIcon from "@mui/icons-material/ArrowForwardIosOutlined";
import IconButton from "@mui/material/IconButton";
import { PieChart, pieArcLabelClasses } from "@mui/x-charts/PieChart";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import CloseIcon from "@mui/icons-material/Close";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputAdornment from "@mui/material/InputAdornment";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import {
  FacebookShareButton,
  WhatsappShareButton,
  LinkedinShareButton,
  TwitterShareButton,
  FacebookIcon,
  WhatsappIcon,
  LinkedinIcon,
} from "react-share";
const urlConfig = require("../../configs/urlConfig.json");
import { useNavigate } from "react-router-dom";
import * as util from "../../services/utilService";
import Toast from "../Toast";
import Loader from "pages/Loader";
import Unauthorized from "pages/Unauthorized";
import moment from "moment";
import { Loading } from "@shiksha/common-lib";

const votingDashboard = () => {
  const { t } = useTranslation();
  const [openModal, setOpenModal] = useState(false);
  const [pollResult, setPollResult] = useState([]);
  const [poll, setPoll] = useState([]);
  const [signlePOll, setSinglePoll] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const shareUrl = window.location.href;
  const hasData =
    Array.isArray(pollResult) && pollResult.some((d) => d.count > 0);
  const [pieData, setPieData] = useState([]);
  const [showAllLive, setShowAllLive] = useState(false);
  const [showAllDraft, setShowAllDraft] = useState(false);
  const [showAllClosed, setShowAllClosed] = useState(false);
  const [toasterMessage, setToasterMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [filters, setFilters] = useState({
    searchTerm: "",
    selectedStartDate: null,
    selectedEndDate: null,
  });
  const [errormessage, setErrormessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const [timeDifference, setTimeDifference] = useState(0);
  const userId = util.userId();
  const [creatorId, setCreatorId] = useState("");
  const [userData, setUserData] = useState([]);
  const [admin, setAdmin] = useState(false);
  const [contentCreator, setContentCreator] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPollId, setSelectedPollId] = useState(null);

  const handleDialogOpen = (id, event) => {
    event.stopPropagation();
    setDialogOpen(true);
    setSelectedPollId(id);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleDeletePollConfirmed = async (event) => {
    event.stopPropagation();
    try {
      const response = await axios.delete(
        `${urlConfig.URLS.POLL.DELETE_POLL}?poll_id=${selectedPollId}`
      );
      if (response.status === 200) {
        setDialogOpen(false);
        // console.log(response.params.status);
        setToasterMessage("Poll deleted successfully");
        fetchPolls();
        setPoll((prevPolls) => {
          const updatedPolls = prevPolls.filter(
            (poll) => poll.poll_id !== selectedPollId
          );
          return updatedPolls;
        });
      }
    } catch (error) {
      console.error("Error deleting poll", error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);
  const handleViewAll = (polls, type) => {
    navigate("/webapp/pollsDetails", { state: { polls, type } });
  };
  // const userData = await util.userData();

  const fetchData = async () => {
    try {
      const url = `${urlConfig.URLS.LEARNER_PREFIX}${urlConfig.URLS.USER.GET_PROFILE}${userId}?fields=${urlConfig.params.userReadParam.fields}`;

      const header = "application/json";
      const response = await fetch(url, {
        // headers: {
        //   "Content-Type": "application/json",
        // },
      });
      const data = await response.json();
      setUserData(data.result.response);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (creatorId) {
      fetchPolls();
    }
  }, [creatorId, filters, currentPage]);

  const fetchPolls = async () => {
    setIsLoading(true);
    setError(null);
    const requestBody = {
      request: {
        filters: {
          status: ["Live", "Closed", "Draft"],
          from_date: filters.selectedStartDate,
          to_date: filters.selectedEndDate,
          created_by: creatorId,
        },
        search: filters.searchTerm || "",
        sort_by: {
          created_at: "desc",
          start_date: "desc",
        },
        limit: 100,
      },
    };

    try {
      const response = await fetch(
        `${urlConfig.URLS.POLL.LIST}?dashboard=true`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch polls");
      }

      const result = await response.json();
      setPoll(result.result.data);
      setPollResult(result.result.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = async (pollId, event) => {
    event.stopPropagation();
    setOpenModal(true);
    try {
      const response = await axios.get(
        `${urlConfig.URLS.POLL.GET_POLL}?poll_id=${pollId}`
      );
      setSinglePoll(response.data.result.poll);
      setPieData(response.data.result.result);
    } catch (error) {
      console.error("Error fetching poll", error);
    }
  };
  const handleCloseModal = (event) => {
    event.stopPropagation();
    setOpenModal(false);
    setPollResult(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const handleDateToISO = (dateStr) => {
    if (!dateStr) return null;
    const localDate = new Date(dateStr);
    localDate.setUTCHours(0, 0, 0, 0);
    return localDate.toISOString();
  };

  useEffect(() => {
    setFilters({
      searchTerm,
      selectedStartDate: handleDateToISO(selectedStartDate),
      selectedEndDate: handleDateToISO(selectedEndDate),
    });
  }, [searchTerm, selectedStartDate, selectedEndDate]);

  const handleClearAll = () => {
    setSearchTerm("");
    setSelectedStartDate(null);
    setSelectedEndDate(null);
    setFilters({
      searchTerm: "",
      selectedStartDate: null,
      selectedEndDate: null,
    });
    fetchPolls();
  };

  const openSocialMediaLink = (event, url) => {
    event.stopPropagation();
    event.preventDefault();
    window.open(url, "_blank");
  };

  const livePolls = poll.filter((poll) => poll.status === "Live");
  const draftPolls = poll.filter((poll) => poll.status === "Draft");
  const closedPolls = poll.filter((poll) => poll.status === "Closed");

  const visibleLivePolls = showAllLive ? livePolls : livePolls.slice(0, 3);
  const visibleDraftPolls = showAllDraft ? draftPolls : draftPolls.slice(0, 3);
  const visibleClosedPolls = showAllClosed
    ? closedPolls
    : closedPolls.slice(0, 3);

  const handleCardClick = (poll_id) => {
    navigate(`/webapp/pollDetails?${poll_id}`);
  };

  const handleEdit = (event, item) => {
    event.stopPropagation();
    navigate("/webapp/createform", { state: item });
  };
  const totalVotes = pieData?.reduce((sum, option) => sum + option.count, 0);

  const getProgressValue = (count) =>
    totalVotes > 0 ? (count / totalVotes) * 100 : 0;

  useEffect(() => {
    getProgressValue();
    const roleNames = userData?.roles?.map((role) => role.role) || [];
    // Check for admin roles
    const isAdmin = roleNames.includes("SYSTEM_ADMINISTRATION");
    // Check for content creator role
    const isContentCreator = roleNames.includes("CONTENT_CREATOR");
    if (isAdmin) {
      setAdmin(true);
      fetchPolls();
    }
    if (isContentCreator) {
      setContentCreator(true);
      setCreatorId(userId);
    }
  }, [pieData, userData, filters]);

  const hasPollData = pieData.some((d) => d.count > 0);

  const sizing = {
    width: 400,
    height: 400,
    legend: { hidden: true },
  };

  return (
    <div>
      <Header />
      {toasterMessage && <Toast response={toasterMessage} type="success" />}

      {contentCreator || admin ? (
        <Container
          maxWidth="xl"
          role="main"
          className="xs-pb-20 lg-pt-20 votingDashboard"
        >
          <Box mb={2} mt={2}>
            <Box className="p-15">
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={3} className="lg-pl-0">
                  <FormControl fullWidth>
                    <InputLabel htmlFor="outlined-adornment-search">
                      {t("SEARCH_FOR_POLL")}
                    </InputLabel>
                    <OutlinedInput
                      id="outlined-adornment-search"
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton aria-label="toggle search visibility">
                            <SearchOutlinedIcon />
                          </IconButton>
                        </InputAdornment>
                      }
                      label={t("SEARCH_FOR_POLL")}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  {/* <Box className="ml-20">Select Date Range</Box> */}
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label={t("SELECT_DATE_FROM")}
                      value={selectedStartDate}
                      onChange={(newValue) => setSelectedStartDate(newValue)}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} md={3}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label={t("SELECT_DATE_TO")}
                      value={selectedEndDate}
                      onChange={(newValue) => setSelectedEndDate(newValue)}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button
                    type="button"
                    className="custom-btn-primary"
                    sx={{ height: "50px" }}
                    onClick={handleClearAll}
                    fullWidth
                  >
                    {t("CLEAR_ALL")}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Box>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
            className="mb-20 mt-20 mr-13"
          >
            <Box display="flex" alignItems="center" className="h3-title">
              <DashboardOutlinedIcon style={{ paddingRight: "10px" }} />
              {t("LIVE_POLLS")}
            </Box>
            {!showAllLive && visibleLivePolls.length >= 3 && (
              <Box>
                <Button
                  type="button"
                  className="custom-btn-primary ml-20"
                  onClick={() => handleViewAll(livePolls, "live")}
                >
                  {t("VIEW_ALL")}
                </Button>
              </Box>
            )}
          </Box>

          <Grid container spacing={2} style={{ marginBottom: "30px" }}>
            {isLoading ? (
              <Loading message={t("LOADING")} />
            ) : visibleLivePolls && visibleLivePolls.length >= 1 ? (
              visibleLivePolls.map((items, index) => (
                <Grid
                  item
                  xs={12}
                  md={4}
                  lg={4}
                  style={{ marginBottom: "10px" }}
                  key={items.poll_id}
                >
                  <Card
                    className="pb-10 cardBox1"
                    sx={{
                      position: "relative",
                      cursor: "pointer",
                      textAlign: "left",
                      borderRadius: "10px",
                      boxShadow: "0 4px 4px 0 #00000040!important",
                    }}
                    onClick={() => handleCardClick(items.poll_id)}
                  >
                    <CardContent className="d-flex">
                      <Grid
                        item
                        xs={12}
                        md={8}
                        lg={8}
                        style={{ marginBottom: "10px" }}
                        key={items.poll_id}
                      >
                        <Box>
                          {items.title && (
                            <Typography
                              gutterBottom
                              className="mt-10 event-title width-inherit"
                            >
                              {items.title}
                            </Typography>
                          )}
                          <Box
                            className="d-flex h6-title mt-30"
                            style={{ color: "#484848" }}
                          >
                            <Box className="d-flex alignItems-center">
                              <TodayOutlinedIcon className="fs-14 pr-5" />
                              {moment(items.start_date).format(
                                "dddd, MMMM Do YYYY, h:mm:ss a"
                              )}
                            </Box>
                          </Box>
                          <Box className="fs-14">
                            {items.poll_keywords && items.poll_keywords.length > 0 ? (
                              <>
                                {items.poll_keywords.slice(0, 2).map((keyword, index) => (
                                  <Tooltip
                                    key={index}
                                    title={keyword}
                                    placement="right"
                                    className="customlabeltwo"
                                  >
                                    <Button className="d-inline-block">
                                    {index < 2
                                          ? keyword
                                          : `${keyword} + ${
                                              items.poll_keywords.length - 2
                                            }`}
                                    </Button>
                                  </Tooltip>
                                ))}
                                {items.poll_keywords.length > 3 && (
                                  <Tooltip
                                    title={items.poll_keywords.slice(3).join(", ")}
                                    placement="right"
                                    className="customlabeltwo"
                                  >
                                    <Button className="d-inline-block">
                                      {items.poll_keywords[2]} + {items.poll_keywords.length - 3}
                                    </Button>
                                  </Tooltip>
                                )}
                              </>
                            ) : (
                              <Box style={{ height: "40px" }} />
                            )}
                          </Box>
                        </Box>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        md={4}
                        lg={4}
                        style={{ marginBottom: "10px" }}
                        key={items.poll_id}
                      >
                        <Box className="xs-hide text-right">
                          <FacebookShareButton
                            url={shareUrl}
                            className="pr-4"
                            quote={`Check out this poll: ${items.title}`}
                            onClick={(event) => {
                              openSocialMediaLink(event, shareUrl);
                            }}
                          >
                            <FacebookIcon url={shareUrl} size={32} round={true} />
                          </FacebookShareButton>
                          <WhatsappShareButton
                            url={shareUrl}
                            title={`Check out this poll: ${items.title}`}
                            separator=":: "
                            className="pr-4"
                            onClick={(event) => openSocialMediaLink(event, shareUrl)}
                          >
                            <WhatsappIcon size={32} round />
                          </WhatsappShareButton>
                          <LinkedinShareButton
                            url={shareUrl}
                            className="pr-4"
                            title={items.title}
                            summary={`Participate in this poll: ${items.title}`}
                            onClick={(event) => openSocialMediaLink(event, shareUrl)}
                          >
                            <LinkedinIcon size={32} round={true} />
                          </LinkedinShareButton>
                          <TwitterShareButton
                            url={shareUrl}
                            className="pr-4"
                            title={`Check out this poll: ${items.title}`}
                            onClick={(event) => openSocialMediaLink(event, shareUrl)}
                          >
                            <img
                              src={require("../../assets/twitter.png")}
                              alt="Twitter"
                              style={{ width: 32, height: 32 }}
                            />
                          </TwitterShareButton>
                        </Box>
                      </Grid>
                    </CardContent>
                    <Box className="voting-text">
                      <Box>
                        <Button
                          type="button"
                          className="custom-btn-primary ml-20 lg-mt-20 mb-10"
                          onClick={(event) => handleOpenModal(items.poll_id, event)}
                        >
                          {t("VIEW_STATUS")}{" "}
                          <ArrowForwardIosOutlinedIcon className="fs-12" />
                        </Button>
                        <Button
                          onClick={(event) => handleEdit(event, items)}
                          type="button"
                          className="custom-btn-primary ml-20 lg-mt-20 mb-10"
                        >
                          {t("EDIT")} <ArrowForwardIosOutlinedIcon className="fs-12" />
                        </Button>
                        {(admin || contentCreator) && (
                          <Button
                            type="button"
                            className="custom-btn-primary ml-20 lg-mt-20 mb-10"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDialogOpen(items.poll_id, event);
                            }}
                          >
                            {t("DELETE")}{" "}
                            <ArrowForwardIosOutlinedIcon className="fs-12" />
                          </Button>
                        )}
                      </Box>
                    </Box>
                    <Box className="lg-hide pl-20">
                      <FacebookShareButton
                        url={shareUrl}
                        className="pr-4"
                        quote={`Check out this poll: ${items.title}`}
                        onClick={(event) => openSocialMediaLink(event, shareUrl)}
                      >
                        <FacebookIcon url={shareUrl} size={32} round={true} />
                      </FacebookShareButton>
                      <WhatsappShareButton
                        url={shareUrl}
                        title={`Check out this poll: ${items.title}`}
                        separator=":: "
                        className="pr-4"
                        onClick={(event) => openSocialMediaLink(event, shareUrl)}
                      >
                        <WhatsappIcon size={32} round />
                      </WhatsappShareButton>
                      <LinkedinShareButton
                        url={shareUrl}
                        className="pr-4"
                        title={items.title}
                        summary={`Participate in this poll: ${items.title}`}
                        onClick={(event) => openSocialMediaLink(event, shareUrl)}
                      >
                        <LinkedinIcon size={32} round={true} />
                      </LinkedinShareButton>
                      <TwitterShareButton
                        url={shareUrl}
                        className="pr-4"
                        title={`Check out this poll: ${items.title}`}
                        onClick={(event) => openSocialMediaLink(event, shareUrl)}
                      >
                        <img
                          src={require("../../assets/twitter.png")}
                          alt="Twitter"
                          style={{ width: 32, height: 32 }}
                        />
                      </TwitterShareButton>
                    </Box>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid
                item
                xs={12}
                md={12}
                lg={12}
                style={{ textAlign: "center" }}
                className="h2-title mt-30"
              >
                <Alert severity="info" style={{ margin: "10px 0" }}>
                  {t("NO_POLL_AVAILABLE_NOW")}
                </Alert>
              </Grid>
            )}
          </Grid>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
            className="mb-20 mt-20 mr-13"
          >
            <Box display="flex" alignItems="center" className="h3-title">
              <DashboardOutlinedIcon style={{ paddingRight: "10px" }} />
              {t("DRAFT_POLLS")}
            </Box>
            {!showAllDraft && visibleDraftPolls.length >= 3 && (
              <Box>
                <Button
                  type="button"
                  className="custom-btn-primary ml-20"
                  onClick={() => handleViewAll(draftPolls, "Draft")}
                >
                  {t("VIEW_ALL")}
                </Button>
              </Box>
            )}
          </Box>
          <Grid container spacing={2} style={{ marginBottom: "30px" }}>
          {isLoading ? (
              <Loading message={t("LOADING")} /> 
            ) : visibleDraftPolls && visibleDraftPolls?.length >= 1 ? (
              visibleDraftPolls?.map((items, index) => (
                <Grid
                  item
                  xs={12}
                  md={4}
                  lg={4}
                  style={{ marginBottom: "10px" }}
                  key={items.poll_id}
                >
                  <Card
                    className="pb-10 cardBox1"
                    sx={{
                      position: "relative",
                      cursor: "pointer",
                      textAlign: "left",
                      borderRadius: "10px",
                      boxShadow: "0 4px 4px 0 #00000040!important",
                    }}
                    onClick={() => handleCardClick(items.poll_id)}
                  >
                    <CardContent>
                      <Box>
                        <Box className="d-flex">
                          <Box>
                            {items.title && (
                              <Typography
                                gutterBottom
                                className="mt-10  event-title width-inherit"
                              >
                                {items.title}
                              </Typography>
                            )}
                          </Box>
                          <Box>
                            <Box className="xs-hide text-right">
                              <FacebookShareButton
                                url={shareUrl}
                                className="pr-3"
                                quote={`Check out this poll: ${items.title}`}
                                onClick={(event) => {
                                  openSocialMediaLink(event, shareUrl);
                                }}
                              >
                                <FacebookIcon
                                  url={shareUrl}
                                  size={32}
                                  round={true}
                                />
                              </FacebookShareButton>
                              <WhatsappShareButton
                                url={shareUrl}
                                title={`Check out this poll: ${items.title}`}
                                separator=":: "
                                className="pr-3"
                                onClick={(event) =>
                                  openSocialMediaLink(event, shareUrl)
                                }
                              >
                                <WhatsappIcon size={32} round />
                              </WhatsappShareButton>
                              <LinkedinShareButton
                                url={shareUrl}
                                className="pr-3"
                                title={items.title}
                                summary={`Participate in this poll: ${items.title}`}
                                onClick={(event) => {
                                  openSocialMediaLink(event, shareUrl);
                                }}
                              >
                                <LinkedinIcon size={32} round={true} />
                              </LinkedinShareButton>
                              <TwitterShareButton
                                url={shareUrl}
                                className="pr-3"
                                title={`Check out this poll: ${items.title}`}
                                onClick={(event) => {
                                  openSocialMediaLink(event, shareUrl);
                                }}
                              >
                                <img
                                  src={require("../../assets/twitter.png")}
                                  alt="Twitter"
                                  style={{ width: 32, height: 32 }}
                                />
                              </TwitterShareButton>
                            </Box>
                          </Box>
                        </Box>
                        <Box
                          className="d-flex h6-title mt-30"
                          style={{ color: "#484848" }}
                        >
                          <Box className="d-flex alignItems-center">
                            <TodayOutlinedIcon className="fs-14 pr-5" />
                            {moment(items?.start_date).format(
                              "dddd, MMMM Do YYYY, h:mm:ss a"
                            )}
                          </Box>
                        </Box>
                        <Box className="fs-14">
                          {items?.poll_keywords && items.poll_keywords.length > 0 ? (
                            <>
                              {items.poll_keywords.slice(0, 2).map((keyword, index) => (
                                <Tooltip
                                  key={index}
                                  title={keyword}
                                  placement="right"
                                  className="customlabeltwo"
                                >
                                  <Button className="d-inline-block">
                                    {index < 2
                                      ? keyword
                                      : `${keyword} + ${items.poll_keywords.length - 2
                                      }`}
                                  </Button>
                                </Tooltip>
                              ))}
                              {items.poll_keywords.length > 3 && (
                                <Tooltip
                                  title={items.poll_keywords.slice(3).join(", ")}
                                  placement="right"
                                  className="customlabeltwo"
                                >
                                  <Button className="d-inline-block">
                                    {items.poll_keywords[2]} + {items.poll_keywords.length - 3}
                                  </Button>
                                </Tooltip>
                              )}
                            </>
                          ) : (
                            <Box style={{ height: "40px" }}>
                            </Box>
                          )}
                        </Box>

                      </Box>
                    </CardContent>
                    <Box className="voting-text">
                      <Box>
                        <Button
                          onClick={(event) => handleEdit(event, items)}
                          type="button"
                          className="custom-btn-primary ml-20 lg-mt-20 mb-10"
                        >
                          {t("EDIT")} <ArrowForwardIosOutlinedIcon className="fs-12" />
                        </Button>
                        <Button
                          type="button"
                          className="custom-btn-primary ml-20 lg-mt-20 mb-10"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDialogOpen(items.poll_id, event);
                          }}
                        >
                          {t("DELETE")}{" "}
                          <ArrowForwardIosOutlinedIcon className="fs-12" />
                        </Button>
                      </Box>
                      <Box className="lg-hide pl-20">
                        <FacebookShareButton
                          url={shareUrl}
                          className="pr-3"
                          quote={`Check out this poll: ${items.title}`}
                          onClick={(event) => {
                            openSocialMediaLink(event, shareUrl);
                          }}
                        >
                          <FacebookIcon url={shareUrl} size={32} round={true} />
                        </FacebookShareButton>
                        <WhatsappShareButton
                          url={shareUrl}
                          title={`Check out this poll: ${items.title}`}
                          separator=":: "
                          className="pr-3"
                          onClick={(event) =>
                            openSocialMediaLink(event, shareUrl)
                          }
                        >
                          <WhatsappIcon size={32} round />
                        </WhatsappShareButton>
                        <LinkedinShareButton
                          url={shareUrl}
                          className="pr-3"
                          title={items.title}
                          summary={`Participate in this poll: ${items.title}`}
                          onClick={(event) => {
                            openSocialMediaLink(event, shareUrl);
                          }}
                        >
                          <LinkedinIcon size={32} round={true} />
                        </LinkedinShareButton>
                        <TwitterShareButton
                          url={shareUrl}
                          className="pr-3"
                          title={`Check out this poll: ${items.title}`}
                          onClick={(event) => {
                            openSocialMediaLink(event, shareUrl);
                          }}
                        >
                          <img
                            src={require("../../assets/twitter.png")}
                            alt="Twitter"
                            style={{ width: 32, height: 32 }}
                          />
                        </TwitterShareButton>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              ))
          ) : (
              <Grid
                item
                xs={12}
                md={12}
                lg={12}
                style={{ textAlign: "center" }}
                className="h2-title mt-30"
              >
                <Alert severity="info" style={{ margin: "10px 0" }}>
                  {t("NO_POLL_AVAILABLE_NOW")}
                </Alert>
              </Grid>
            )}
          </Grid>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
            className="mb-20 mt-20 mr-13"
          >
            <Box display="flex" alignItems="center" className="h3-title">
              <WorkspacePremiumIcon style={{ paddingRight: "10px" }} />
             {t("CLOSED_POLLS")}
            </Box>
            {!showAllClosed && visibleClosedPolls.length >= 3 && (
              <Box>
                <Button
                  type="button"
                  className="custom-btn-primary ml-20"
                  onClick={() => handleViewAll(closedPolls, "closed")}
                >
                  {t("VIEW_ALL")}
                </Button>
              </Box>
            )}
          </Box>
          <Grid container spacing={2} style={{ marginBottom: "30px" }}>
          {isLoading ? (
              <Loading message={t("LOADING")} /> 
            ) : visibleClosedPolls && visibleClosedPolls?.length >= 1 ? (
              visibleClosedPolls?.map((items, index) => (
                <Grid
                  item
                  xs={12}
                  md={4}
                  lg={4}
                  style={{ marginBottom: "10px" }}
                  key={items.poll_id}
                >
                  <Card
                    className="pb-10 cardBox1"
                    sx={{
                      position: "relative",
                      cursor: "pointer",
                      textAlign: "left",
                      borderRadius: "10px",
                      boxShadow: "0 4px 4px 0 #00000040!important",
                    }}
                    onClick={() => handleCardClick(items.poll_id)}
                  >
                    <CardContent>
                      <Box>
                        <Box className="d-flex">
                          <Box>
                            {items.title && (
                              <Typography
                                gutterBottom
                                className="mt-10  event-title width-inherit"
                              >
                                {items.title}
                              </Typography>
                            )}
                          </Box>
                          <Box>
                            <Box className="xs-hide text-right">
                              <FacebookShareButton
                                url={shareUrl}
                                className="pr-3"
                                quote={`Check out this poll: ${items.title}`}
                                onClick={(event) => {
                                  openSocialMediaLink(event, shareUrl);
                                }}
                              >
                                <FacebookIcon
                                  url={shareUrl}
                                  size={32}
                                  round={true}
                                />
                              </FacebookShareButton>
                              <WhatsappShareButton
                                url={shareUrl}
                                title={`Check out this poll: ${items.title}`}
                                separator=":: "
                                className="pr-3"
                                onClick={(event) =>
                                  openSocialMediaLink(event, shareUrl)
                                }
                              >
                                <WhatsappIcon size={32} round />
                              </WhatsappShareButton>
                              <LinkedinShareButton
                                url={shareUrl}
                                className="pr-3"
                                title={items.title}
                                summary={`Participate in this poll: ${items.title}`}
                                onClick={(event) => {
                                  openSocialMediaLink(event, shareUrl);
                                }}
                              >
                                <LinkedinIcon size={32} round={true} />
                              </LinkedinShareButton>
                              <TwitterShareButton
                                url={shareUrl}
                                className="pr-3"
                                title={`Check out this poll: ${items.title}`}
                                onClick={(event) => {
                                  openSocialMediaLink(event, shareUrl);
                                }}
                              >
                                <img
                                  src={require("../../assets/twitter.png")}
                                  alt="Twitter"
                                  style={{ width: 32, height: 32 }}
                                />
                              </TwitterShareButton>
                            </Box>
                          </Box>
                        </Box>
                        <Box
                          className="d-flex h6-title mt-30"
                          style={{ color: "#484848" }}
                        >
                          <Box className="d-flex alignItems-center">
                            <TodayOutlinedIcon className="fs-14 pr-5" />
                            {moment(items?.start_date).format(
                              "dddd, MMMM Do YYYY, h:mm:ss a"
                            )}
                          </Box>
                        </Box>
                        <Box className="fs-14">
                          <Box className="fs-14">
                            {items?.poll_keywords && items.poll_keywords.length > 0 ? (
                              <>
                                {items.poll_keywords.slice(0, 2).map((keyword, index) => (
                                  <Tooltip
                                    key={index}
                                    title={keyword}
                                    placement="right"
                                    className="customlabeltwo"
                                  >
                                    <Button className="d-inline-block">
                                      {index < 2
                                        ? keyword
                                        : `${keyword} + ${items.poll_keywords.length - 2
                                        }`}
                                    </Button>
                                  </Tooltip>
                                ))}
                                {items.poll_keywords.length > 3 && (
                                  <Tooltip
                                    title={items.poll_keywords.slice(3).join(", ")}
                                    placement="right"
                                    className="customlabeltwo"
                                  >
                                    <Button className="d-inline-block">
                                      {items.poll_keywords[2]} +{" "}
                                      {items.poll_keywords.length - 3}
                                    </Button>
                                  </Tooltip>
                                )}
                              </>
                            ) : (
                              <Box className="d-inline-block" style={{ height: "40px" }} />
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                    <Box className="voting-text">
                      <Box>
                        <Button
                          type="button"
                          className="custom-btn-primary ml-20 lg-mt-20 mb-10"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDialogOpen(items.poll_id, event);
                          }}
                        >
                          {t("DELETE")}{" "}
                          <ArrowForwardIosOutlinedIcon className="fs-12" />
                        </Button>
                        <Button
                          type="button"
                          className="custom-btn-primary ml-20 lg-mt-20 mb-10"
                          onClick={(event) =>
                            handleOpenModal(items.poll_id, event)
                          }
                        >
                          {t("VIEW_RESULT")}{" "}
                          <ArrowForwardIosOutlinedIcon className="fs-12" />
                        </Button>
                      </Box>
                      <Box className="lg-hide pl-20">
                        <FacebookShareButton
                          url={shareUrl}
                          className="pr-3"
                          quote={`Check out this poll: ${items.title}`}
                          onClick={(event) => {
                            openSocialMediaLink(event, shareUrl);
                          }}
                        >
                          <FacebookIcon url={shareUrl} size={32} round={true} />
                        </FacebookShareButton>
                        <WhatsappShareButton
                          url={shareUrl}
                          title={`Check out this poll: ${items.title}`}
                          separator=":: "
                          className="pr-3"
                          onClick={(event) =>
                            openSocialMediaLink(event, shareUrl)
                          }
                        >
                          <WhatsappIcon size={32} round />
                        </WhatsappShareButton>
                        <LinkedinShareButton
                          url={shareUrl}
                          className="pr-3"
                          title={items.title}
                          summary={`Participate in this poll: ${items.title}`}
                          onClick={(event) => {
                            openSocialMediaLink(event, shareUrl);
                          }}
                        >
                          <LinkedinIcon size={32} round={true} />
                        </LinkedinShareButton>
                        <TwitterShareButton
                          url={shareUrl}
                          className="pr-3"
                          title={`Check out this poll: ${items.title}`}
                          onClick={(event) => {
                            openSocialMediaLink(event, shareUrl);
                          }}
                        >
                          <img
                            src={require("../../assets/twitter.png")}
                            alt="Twitter"
                            style={{ width: 32, height: 32 }}
                          />
                        </TwitterShareButton>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid
                item
                xs={12}
                md={12}
                lg={12}
                style={{ textAlign: "center" }}
                className="h2-title mt-30"
              >
                <Alert severity="info" style={{ margin: "10px 0" }}>
                  {t("NO_POLL_AVAILABLE_NOW")}
                </Alert>
              </Grid>
            )}
          </Grid>
        </Container>
      ) : (
        <div>{loading ? <Loader /> : <Unauthorized />}</div>
      )}
      <FloatingChatIcon />
      <Footer />
      {signlePOll && (
        <>
          <Dialog
            fullWidth={true}
            maxWidth="lg"
            open={openModal}
            onClose={handleCloseModal}
          >
            <IconButton
              aria-label="close"
              onClick={handleCloseModal}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
              }}
            >
              <CloseIcon />
            </IconButton>
            <DialogContent>
              <Grid container>
                <Grid
                  item
                  xs={12}
                  sm={12}
                  lg={4}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    width: "100%",
                    order: { xs: 2, lg: 1 },
                  }}
                >
                  <Box sx={{ marginLeft: "25%" }}>
                    {hasPollData ? (
                      <PieChart
                        series={[
                          {
                            data: pieData.map((d) => ({
                              value: d.count,
                              label: d.poll_option,
                            })),
                            arcLabel: (item) => (
                              <>({getProgressValue(item.value).toFixed(2)})</>
                            ),
                            arcLabelMinAngle: 45,
                          },
                        ]}
                        sx={{
                          [`& .${pieArcLabelClasses.root}`]: {
                            fill: "white",
                            fontSize: 14,
                          },
                        }}
                        {...sizing}
                      />
                    ) : (
                      <Box>{t("NO_DATA_FOUND")}</Box>
                    )}
                  </Box>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={12}
                  lg={8}
                  sx={{
                    p: 2,
                    order: { xs: 1, lg: 2 },
                  }}
                >
                  <Box className="h1-title fw-600 lg-mt-20">
                    {signlePOll.title}
                  </Box>
                  <Box>
                    <Box>
                      <Box className="mt-9 h5-title">
                        {t("CREATED_ON")}:
                        <TodayOutlinedIcon
                          className="fs-14 pr-5"
                          style={{ verticalAlign: "middle" }}
                        />
                        {moment(signlePOll.created_at).format(
                          "dddd, MMMM Do YYYY, h:mm:ss a"
                        )}
                      </Box>
                      <Box className="mt-9 h5-title">
                        {t("ENDED_ON")}:
                        <TodayOutlinedIcon
                          className="fs-14 pr-5"
                          style={{ verticalAlign: "middle" }}
                        />{" "}
                        {moment(signlePOll.end_date).format(
                          "dddd, MMMM Do YYYY, h:mm:ss a"
                        )}
                      </Box>
                      <Box className="mt-9 h5-title">
                        {t("TOTAL_VOTES")}: {totalVotes}
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
          </Dialog>
          <Dialog open={dialogOpen} onClose={handleDialogClose}>
            <DialogContent>
              <Box className="h5-title">
                {t("CONFIRM_POLL_DELETE")}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={handleDialogClose}
                className="custom-btn-default"
              >
                {t("NO")}
              </Button>
              <Button
                onClick={(event) => handleDeletePollConfirmed(event)}
                className="custom-btn-primary"
              >
                {t("YES")}

              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </div>
  );
};
export default votingDashboard;
