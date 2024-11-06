import React, { useState, useEffect } from "react";
import Footer from "components/Footer";
import Header from "components/header";
import Container from "@mui/material/Container";
import FloatingChatIcon from "../../components/FloatingChatIcon";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import axios from "axios";
import { Button, Card, CardContent, DialogActions, Tooltip } from "@mui/material";
import TodayOutlinedIcon from "@mui/icons-material/TodayOutlined";
import ArrowForwardIosOutlinedIcon from "@mui/icons-material/ArrowForwardIosOutlined";
import IconButton from "@mui/material/IconButton";
import { PieChart, pieArcLabelClasses } from "@mui/x-charts/PieChart";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import CloseIcon from "@mui/icons-material/Close";
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
import { useLocation } from "react-router-dom";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import { useNavigate } from "react-router-dom";
import { t } from "i18next";

const pollsDetailes = () => {
  const location = useLocation();
  const [openModal, setOpenModal] = useState(false);
  const [signlePOll, setSinglePoll] = useState([]);
  const [pollResult, setPollResult] = useState([]);
  const [toasterMessage, setToasterMessage] = useState("");
  const { polls, type } = location.state || { polls: [], type: "" };
  const [pieData, setPieData] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPollId, setSelectedPollId] = useState(null);
  const shareUrl = window.location.href;
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };
  const navigate = useNavigate();
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

  const handleCardClick = (poll_id) => {
    navigate(`/webapp/pollDetails?${poll_id}`);
  };

  const handleBackNavigate = () => {
    navigate("/webapp/pollDashboard");
  };

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

  const totalVotes = pieData?.reduce((sum, option) => sum + option.count, 0);

  const getProgressValue = (count) =>
    totalVotes > 0 ? (count / totalVotes) * 100 : 0;
  console.log(getProgressValue, "getProgressValue");

  useEffect(() => {
    getProgressValue();
  }, [pieData]);
  const hasPollData = pieData.some((d) => d.count > 0);

  const openSocialMediaLink = (event, url) => {
    event.stopPropagation();
    event.preventDefault();
    window.open(url, "_blank");
  };

  const handleEdit = (event, item) => {
    event.stopPropagation();
    navigate("/webapp/createform", { state: item });
  };

  const sizing = {
    width: 400,
    height: 400,
    legend: { hidden: true },
  };

  return (
    <div>
      <Header />
      <Box>
      <div>
        {polls.length === 0 ? (
          <p>{t("NO_POLL_AVAILABLE")}</p>
        ) : (
          <Container
            maxWidth="xl"
            role="main"
            className="xs-pb-20 lg-pt-20 votingDashboard"
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
              className="mb-20 mt-20 mr-13"
            >
              <Box display="flex" alignItems="center" className="h3-title">
                {type === "live" ? (
                  <Box display="flex">
                    <DashboardOutlinedIcon style={{ paddingRight: "10px" }} />{" "}
                    {t("LIVE_POLLS")}
                  </Box>
                ) : type === "closed" ? (
                  <Box display="flex">
                    <WorkspacePremiumIcon style={{ paddingRight: "10px" }} />{" "}
                    {t("CLOSED_POLLS")}
                  </Box>
                ) : (
                  <Box display="flex">
                    <DashboardOutlinedIcon style={{ paddingRight: "10px" }} />{" "}
                    {t("DRAFT_POLLS")}
                  </Box>
                )}
              </Box>
              <Box>
                <Button
                  type="button"
                  className="custom-btn-primary ml-20"
                  onClick={handleBackNavigate}
                >
                  {t("BACK")}
                </Button>
              </Box>
            </Box>
            <Grid container spacing={2} style={{ marginBottom: "30px" }}>
              {polls &&
                polls.map((items, index) => (
                  <Grid
                    item
                    xs={12}
                    md={4}
                    lg={4}
                    style={{ marginBottom: "10px" }}
                    key={items.poll_id}
                  >
                    <Card
                      className="cardBox1 pb-10"
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
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={8} lg={8}>
                              {items.title && (
                                <Typography
                                  gutterBottom
                                  className="mt-10 event-title"
                                >
                                  {items.title}
                                </Typography>
                              )}
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
                            </Grid>
                          </Grid>
                          <Box
                            className="d-flex h6-title mt-30"
                            style={{ color: "#484848" }}
                          >
                            <Box className="d-flex alignItems-center fs-13">
                              <TodayOutlinedIcon className="fs-14 pr-5" />
                              {formatDate(items.start_date)}
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
                        {type === "Draft" ? (
                          <Box>
                            <Button
                              type="button"
                              className="custom-btn-primary ml-20 lg-mt-20"
                              onClick={(event) => handleEdit(event, items)}
                            >
                              {t("EDIT")}{" "}
                              <ArrowForwardIosOutlinedIcon className="fs-12" />
                            </Button>
                            <Button
                              type="button"
                              className="custom-btn-primary ml-20 lg-mt-20"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleDialogOpen(items.poll_id, event);
                              }}
                            >
                              {t("DELETE")}{" "}
                              <ArrowForwardIosOutlinedIcon className="fs-12" />
                            </Button>
                          </Box>
                        ) : type === "live" ? (
                          <Box>
                            <Button
                              type="button"
                              className="custom-btn-primary ml-20 lg-mt-20 mb-10"
                              onClick={(event) =>
                                handleOpenModal(items.poll_id, event)
                              }
                            >
                              {t("VIEW_STATUS")}{" "}
                              <ArrowForwardIosOutlinedIcon className="fs-12" />
                            </Button>
                            <Button
                              onClick={(event) => handleEdit(event, items)}
                              type="button"
                              className="custom-btn-primary ml-20 lg-mt-20 mb-10"
                            >
                              {t("EDIT")}{" "}
                              <ArrowForwardIosOutlinedIcon className="fs-12" />
                            </Button>

                            <Button
                              type="button"
                              className="custom-btn-primary ml-20 lg-mt-20 mb-10"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleDialogOpen(items.poll_id, event);
                              }}
                            >
                              {t("DELETE")} <ArrowForwardIosOutlinedIcon className="fs-12" />
                            </Button>
                          </Box>
                        ) : type === "closed" ? (
                          <Box>
                            <Button
                              type="button"
                              className="custom-btn-primary ml-20 lg-mt-20"
                              onClick={(event) =>
                                handleOpenModal(items.poll_id, event)
                              }
                            >
                              {t("VIEW_RESULT")}{" "}
                              <ArrowForwardIosOutlinedIcon className="fs-12" />
                            </Button>

                          </Box>
                        ) : null}
                        <Box className="lg-hide">
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
                    </Card>
                  </Grid>
                ))}
            </Grid>
          </Container>
        )}
      </div>
      <FloatingChatIcon />
      {signlePOll && (
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
                            <>
                              ({getProgressValue(item.value).toFixed(2)})
                            </>
                          ),
                          arcLabelMinAngle: 45,
                        },
                      ]}
                      sx={{
                        [`& .${pieArcLabelClasses.root}`]: {
                          fill: 'white',
                          fontSize: 14,
                        },
                      }}
                      {...sizing} />
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
                  <Box className="mt-9 h5-title">
                    {t("CREATED_ON")}
                    <TodayOutlinedIcon className="fs-14 pr-5" />
                    {formatDate(signlePOll.created_at)}
                  </Box>
                  <Box className="mt-9 h5-title">
                    {t("ENDED_ON")}
                    <TodayOutlinedIcon className="fs-14 pr-5" />{" "}
                    {formatDate(signlePOll.end_date)}
                  </Box>
                  <Box className="mt-9 h5-title">{t("TOTAL_VOTES")}: {totalVotes}</Box>
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
        </Dialog>
      )}
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        maxWidth="md"
      >
        <DialogContent>
          <Box className="h5-title">
            {t("CONFIRM_POLL_DELETE")}
          </Box>

        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} className="custom-btn-default">
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
      </Box>
      <Footer />
    </div>
  );
};
export default pollsDetailes;
