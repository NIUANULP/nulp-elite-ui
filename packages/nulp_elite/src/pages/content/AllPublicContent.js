import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BoxCard from "components/Card";
import Box from "@mui/material/Box";
import { getAllContents } from "services/contentService";
import Footer from "components/Footer";
import Container from "@mui/material/Container";
import Pagination from "@mui/material/Pagination";
import Alert from "@mui/material/Alert";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import Groups2OutlinedIcon from "@mui/icons-material/Groups2Outlined";
import GTranslateIcon from "@mui/icons-material/GTranslate";
import LanguageIcon from "@mui/icons-material/Language";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import { Badge } from "@mui/material";
import { changeLanguage, t } from "i18next";
import appConfig from "../../configs/appConfig.json";
const urlConfig = require("../../configs/urlConfig.json");
import ToasterCommon from "../ToasterCommon";
import NoResult from "./noResultFound";
import { Loading } from "@shiksha/common-lib";
import CourseStructuredData from "components/CourseStructuredData";
import Cookies from "js-cookie";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Menu from "@mui/material/Menu";
import LiveHelpOutlinedIcon from "@mui/icons-material/LiveHelpOutlined";

// Get domain from window location
const getDomain = () => {
  return window.location.origin;
};

const DOMAIN = getDomain();
function handleCloseNavMenu() {
  setAnchorElNav(null);
}

const AllPublicContent = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const [toasterMessage, setToasterMessage] = useState("");
  const routeConfig = require("../../configs/routeConfig.json");

  const [isLoading, setIsLoading] = useState(false);
  // search query
  const location = useLocation();
  const queryString = location.search;
  const params = new URLSearchParams(queryString);
  const search = params.get("query") || "";
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState(search);
  // show error message
  const showErrorMessage = (msg) => {
    setToasterMessage(msg);
    setTimeout(() => {
      setToasterMessage("");
    }, 2000);
    setToasterOpen(true);
  };

  const handlePageChange = (event, newValue) => {
    setCurrentPage(newValue);
  };
  useEffect(() => {
    fetchMoreItems();
  }, [currentPage]);

  const fetchMoreItems = async () => {
    setIsLoading(true);

    setError(null);
    let data = JSON.stringify({
      request: {
        filters: {
          status: ["Live"],

          visibility: [],
          primaryCategory: [
            "Collection",
            "Resource",
            "Course",
            "eTextbook",
            "Explanation Content",
            "Learning Resource",
            "Practice Question Set",
            "ExplanationResource",
            "Practice Resource",
            "Exam Question",
            "Good Practices",
            "Reports",
            "Manual/SOPs",
          ],
        },
        limit: 50,
        sort_by: {
          lastUpdatedOn: "desc",
        },
        fields: [
          "name",
          "appIcon",
          "medium",
          "subject",
          "resourceType",
          "contentType",
          "organisation",
          "topic",
          "mimeType",
          "trackable",
          "gradeLevel",
          "se_boards",
          "board",
          "se_subjects",
          "se_mediums",
          "se_gradeLevels",
          "primaryCategory",
          "createdOn",
          "previewUrl",
          "creator",
          "identifier",
          "lastPublishedOn",
          "lastUpdatedOn",
          "lastPublishedBy",
          "lastUpdatedBy",
          "lastPublishedByUser",
          "lastUpdatedByUser",
        ],
        facets: ["channel", "gradeLevel", "subject", "medium"],
        offset: 50 * (currentPage - 1),
        query: searchQuery || search || "",
      },
    });

    // Headers
    const headers = {
      "Content-Type": "application/json",
    };

    try {
      const url = `${urlConfig.URLS.PUBLIC_PREFIX}${urlConfig.URLS.CONTENT.SEARCH}?orgdetails=${appConfig.ContentPlayer.contentApiQueryParams.orgdetails}&licenseDetails=${appConfig.ContentPlayer.contentApiQueryParams.licenseDetails}`;
      const response = await getAllContents(url, data, headers);
      setData(response.data.result.content ?? []);
      setTotalPages(Math.ceil((response.data.result.count ?? 0) / 20));
    } catch (error) {
      showErrorMessage(t("FAILED_TO_FETCH_DATA"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = (contentId, courseType) => {
    if (courseType === "Course") {
      navigate(
        `${routeConfig.ROUTES.JOIN_COURSE_PAGE.JOIN_COURSE_PUBLIC}?${contentId}`
      );
    } else {
      navigate(`${routeConfig.ROUTES.PLAYER_PAGE.PLAYER}?id=${contentId}`);
    }
  };
  const textFieldStyle = {
    fontSize: "12px",
    backgroundColor: searchQuery ? "#065872" : "transparent",
    boxShadow: searchQuery ? "0 2px 4px rgba(0, 0, 0, 0.2)" : "none",
    color: searchQuery ? "#fff" : "#000",
  };
  const handleInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      fetchMoreItems();
    }
  };
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  useEffect(() => {
    setActivePath(location.pathname);
  }, [location.pathname]);
  const [activePath, setActivePath] = useState(location.pathname);
  const [language, setLanguage] = useState(Cookies.get("language") || "en");
  const [show, setShow] = useState(false);
  const [openNotification, setOpenNotification] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);

  const handleChangeLanguage = (event) => {
    setLanguage(event.target.value);
    changeLanguage(event.target.value);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };
  const handleClickOpenNotification = () => {
    setOpenNotification(true);
  };

  return (
    <>
      <Box
        className={
          scrolled
            ? "pos-fixed xs-hide d-flex bg-white"
            : "xs-hide d-flex  bg-white"
        }
      >
        <Box
          className="d-flex alignItems-center w-100"
          style={{ marginLeft: "10px" }}
        >
          <Link
            href={routeConfig.ROUTES.DOMAINLIST_PAGE.DOMAINLIST}
            className="pl-0 py-15 d-flex xs-py-3"
          >
            <img
              src={require("../../assets/logo.png")}
              style={{ maxWidth: "100%" }}
              className="logo"
            />
          </Link>

          <Box
            className="d-flex explore explore-text"
            style={{
              alignItems: "center",
              paddingLeft: "8px",
              marginLeft: "10px",
            }}
          >
            <Box className="h5-title px-10">{t("EXPLORE")}</Box>
            <Box style={{ width: "100%" }}>
              <TextField
                placeholder={t("WHAT_DO_YOU_WANT_TO_LEARN_TODAY")}
                variant="outlined"
                size="small"
                style={textFieldStyle}
                fullWidth
                value={searchQuery}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      type="submit"
                      aria-label="search"
                      onClick={() => fetchMoreItems()}
                    >
                      <SearchIcon
                        style={{ color: searchQuery ? "#fff" : "#000" }}
                      />
                    </IconButton>
                  ),
                  style: {
                    color: searchQuery ? "#fff" : "#000",
                  },
                }}
              />
            </Box>
          </Box>
        </Box>
        <Box
          style={{
            display: "flex",
            alignItems: "space-between",
          }}
        >
          <Box
            className="xs-hide spacing-header"
            sx={{
              flexGrow: 1,
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              marginLeft: "20px",
              marginRight: "10px",
            }}
          >
            <Link
              href={routeConfig.ROUTES.DOMAINLIST_PAGE.DOMAINLIST}
              className={
                activePath ===
                `${
                  routeConfig.ROUTES.DOMAINLIST_PAGE.DOMAINLIST ||
                  activePath.startsWith(
                    routeConfig.ROUTES.CONTENTLIST_PAGE.CONTENTLIST
                  )
                }`
                  ? "Menuactive"
                  : "headerMenu"
              }
              underline="none"
            >
              <Tooltip title={t("HOME")} placement="bottom" arrow>
                <HomeOutlinedIcon
                  style={{
                    verticalAlign: "middle",
                    fontSize: "30px",
                  }}
                />
                {/* {t("HOME")} */}
              </Tooltip>
            </Link>
            <Link
              href={routeConfig.ROUTES.ALL_CONTENT_PAGE.ALL_CONTENT}
              className={
                activePath ===
                  routeConfig.ROUTES.ALL_CONTENT_PAGE.ALL_CONTENT ||
                activePath.startsWith(routeConfig.ROUTES.VIEW_ALL_PAGE.VIEW_ALL)
                  ? "Menuactive"
                  : "headerMenu"
              }
              underline="none"
            >
              <Tooltip title={t("CONTENT")} placement="bottom" arrow>
                <MenuBookOutlinedIcon
                  style={{
                    verticalAlign: "middle",
                    fontSize: "27px",
                  }}
                />
              </Tooltip>
            </Link>
            <Link
              href={routeConfig.ROUTES.ADDCONNECTION_PAGE.ADDCONNECTION}
              className={
                activePath ===
                `${routeConfig.ROUTES.ADDCONNECTION_PAGE.ADDCONNECTION}`
                  ? "Menuactive"
                  : "headerMenu"
              }
              underline="none"
            >
              <Tooltip title={t("CONNECTIONS")} placement="bottom" arrow>
                <ChatOutlinedIcon
                  style={{
                    verticalAlign: "middle",
                    fontSize: "24px",
                  }}
                />
              </Tooltip>
            </Link>
            <Link
              href={routeConfig.ROUTES.EVENTS.EVENT_LIST}
              className={
                activePath === `${routeConfig.ROUTES.EVENTS.EVENT_LIST}`
                  ? "Menuactive"
                  : "headerMenu"
              }
              underline="none"
            >
              <Tooltip title={t("EVENTS")} placement="bottom" arrow>
                <VideocamOutlinedIcon
                  style={{
                    verticalAlign: "middle",
                    fontSize: "30px",
                  }}
                />
              </Tooltip>
            </Link>
            <Link
              href={`${routeConfig.ROUTES.FORUM.FORUM}`}
              className={
                activePath === `${routeConfig.ROUTES.FORUM.FORUM}`
                  ? "Menuactive"
                  : "headerMenu"
              }
              underline="none"
            >
              <Tooltip title={t("DISCUSSIONS")} placement="bottom" arrow>
                <Groups2OutlinedIcon
                  style={{
                    verticalAlign: "middle",
                    fontSize: "30px",
                  }}
                />
              </Tooltip>
            </Link>
            <Tooltip
              title={t("Language")}
              placement="bottom"
              arrow
              open={show}
              onMouseEnter={() => setShow(true)}
              onMouseLeave={() => setShow(false)}
            >
              <Box sx={{ minWidth: 102, padding: "0px 18px 0px 11px" }}>
                <FormControl
                  fullWidth
                  size="small"
                  className="translate xs-h-28"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    flexDirection: "row",
                    justifyContent: "end",
                  }}
                >
                  <GTranslateIcon />
                  <Select
                    labelId="language-select-label"
                    id="language-select"
                    className="language"
                    style={{ border: "none", color: "#4f4f4f" }}
                    label={t("LANGUAGE")}
                    value={language}
                    startIcon={<LanguageIcon />}
                    onChange={handleChangeLanguage}
                    inputProps={{ "aria-label": t("SELECT_LANGUAGE") }}
                    onOpen={() => setShow(false)}
                    onClose={() => setShow(true)}
                  >
                    <MenuItem value="en">{t("ENGLISH")}</MenuItem>
                    <MenuItem value="hi">{t("HINDI")}</MenuItem>
                    <MenuItem value="ma">{t("MARATHI")}</MenuItem>
                    <MenuItem value="gg">{t("GUJARATI")}</MenuItem>
                    <MenuItem value="ta">{t("TAMIL")}</MenuItem>
                    <MenuItem value="be">{t("BENGALI")}</MenuItem>
                    <MenuItem value="mal">{t("MALAYALAM")}</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Tooltip>
            <Tooltip title={t("Notification")} placement="bottom" arrow>
              <Box className="notification-circle xs-hide">
                <Tooltip>
                  <IconButton
                    sx={{ p: 0 }}
                    onClick={handleClickOpenNotification}
                  >
                    <Badge
                      badgeContent={notificationCount}
                      color="error"
                    ></Badge>
                    <NotificationsNoneOutlinedIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Tooltip>

            <Tooltip title={t("Notification")} placement="bottom" arrow>
              <Box className="notification-circle xs-hide"></Box>
            </Tooltip>

            {/* User Profile */}
            <Tooltip
              title={t("PROFILE")}
              placement="bottom"
              arrow
              className={
                activePath === `${routeConfig.ROUTES.POFILE_PAGE.PROFILE}` ||
                activePath === `${routeConfig.ROUTES.HELP_PAGE.HELP}`
                  ? "Menuactive"
                  : ""
              }
            >
              <IconButton
                onClick={handleOpenUserMenu}
                sx={{ p: 0 }}
                className="profile-btn"
              >
                <div className="profile-text-circle">G</div>
                <ExpandMoreIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>
      {/* Top Navigation Bar */}
      <AppBar className="bg-inherit pos-inherit">
        <Container className="p-0">
          <Box className="d-flex">
            <Toolbar
              disableGutters
              style={{
                justifyContent: "space-between",
                background: "#fff",
                width: "100%",
              }}
              className="lg-hide lg-mt-10"
            >
              <Box className="d-flex lg-hide">
                <Box
                  className="xs-pl-5"
                  sx={{
                    display: { xs: "block", md: "none" },
                  }}
                >
                  <Menu
                    id="menu-appbar"
                    anchorEl={anchorElNav}
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "left",
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "left",
                    }}
                    open={Boolean(anchorElNav)}
                    onClose={handleCloseNavMenu}
                  >
                    <Link
                      href={routeConfig.ROUTES.HELP_PAGE.HELP}
                      textAlign="center"
                      underline="none"
                    >
                      <MenuItem>
                        <LiveHelpOutlinedIcon
                          style={{ verticalAlign: "bottom", color: "#000" }}
                        />{" "}
                        {t("HELP")}
                      </MenuItem>
                    </Link>
                  </Menu>
                </Box>

                <Link
                  href={routeConfig.ROUTES.DOMAINLIST_PAGE.DOMAINLIST}
                  className="py-15 xs-py-3"
                >
                  <img
                    src={require("../../assets/logo.png")}
                    style={{ maxWidth: "100%" }}
                    className="lg-w-140 logo"
                  />
                </Link>
              </Box>
              {/* <Tooltip
                title={t("Language")}
                placement="bottom"
                arrow
                open={show}
                onMouseEnter={() => setShow(true)}
                onMouseLeave={() => setShow(false)}
              > */}
              <Box className="lg-hide  translate">
                {/* Language Select */}
                <Box>
                  <FormControl
                    fullWidth
                    size="small"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      flexDirection: "row",
                      justifyContent: "end",
                    }}
                  >
                    {/* <InputLabel id="language-select-label">
                  {t("LANGUAGE")}
                </InputLabel> */}
                    <GTranslateIcon style={{ color: "#000" }} />
                    <Select
                      labelId="language-select-label"
                      id="language-select"
                      className="language"
                      style={{ border: "none" }}
                      label={t("LANGUAGE")}
                      value={language}
                      startIcon={<LanguageIcon />}
                      onChange={handleChangeLanguage}
                      inputProps={{ "aria-label": t("SELECT_LANGUAGE") }}
                    >
                      <MenuItem value="en">{t("ENGLISH")}</MenuItem>
                      <MenuItem value="hi">{t("HINDI")}</MenuItem>
                      <MenuItem value="ma">{t("MARATHI")}</MenuItem>
                      <MenuItem value="gg">{t("GUJARATI")}</MenuItem>
                      <MenuItem value="ta">{t("TAMIL")}</MenuItem>
                      <MenuItem value="be">{t("BENGALI")}</MenuItem>
                      <MenuItem value="mal">{t("MALAYALAM")}</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
              {/* </Tooltip> */}
              <Box className="d-flex">
                <Tooltip title={t("Notification")} placement="bottom" arrow>
                  <Box className="notification-circle lg-hide">
                    {/* <NotificationsNoneOutlinedIcon />
                    ekta */}
                    {/* <IconButton onClick={handleOpenNotifyMenu} sx={{ p: 0 }}> */}

                    <Tooltip>
                      <IconButton sx={{ p: 0 }}>
                        <NotificationsNoneOutlinedIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Tooltip>
                <Tooltip
                  title={t("PROFILE")}
                  placement="bottom"
                  arrow
                  className={
                    activePath ===
                      `${routeConfig.ROUTES.POFILE_PAGE.PROFILE}` ||
                    activePath === `${routeConfig.ROUTES.HELP_PAGE.HELP}` ||
                    activePath ===
                      `${routeConfig.ROUTES.DASHBOARD_PAGE.DASHBOARD}`
                      ? "Menuactive"
                      : ""
                  }
                >
                  <IconButton
                    onClick={handleOpenUserMenu}
                    sx={{ p: 0 }}
                    className="profile-btn"
                  >
                    <div className="profile-text-circle">P</div>
                  </IconButton>
                </Tooltip>
              </Box>
              {/* Language Select */}
            </Toolbar>{" "}
            {/* Search Box */}
            <Box
              className="lg-hide d-flex"
              style={{
                alignItems: "center",
                padding: "15px",
                marginTop: "67px",
                background: "#fff",
                border: "2px solid #eee",
                borderRadius: "10px",
              }}
            >
              <TextField
                placeholder={t("WHAT_DO_YOU_WANT_TO_LEARN_TODAY")}
                variant="outlined"
                size="small"
                fullWidth
                className="searchField"
                value={searchQuery}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      type="submit"
                      aria-label="search"
                      onClick={() => fetchMoreItems()}
                    >
                      <SearchIcon />
                    </IconButton>
                  ),
                }}
              />
            </Box>
          </Box>
        </Container>
      </AppBar>
      <Box>
        {toasterMessage && <ToasterCommon response={toasterMessage} />}

        <Container
          maxWidth="xl"
          role="main"
          className="allContent xs-pb-20 pb-30 domain-list"
        >
          {error && (
            <Alert className="my-4" severity="error">
              {error}
            </Alert>
          )}

          {isLoading ? (
            <Loading message={t("LOADING")} />
          ) : (
            <>
              {data && data.length === 0 && !error && <NoResult />}
              <Box textAlign="center">
                <Box className="custom-card xs-pb-20">
                  {data &&
                    data.map((item) => (
                      <>
                        <CourseStructuredData
                          course={item}
                          url={
                            item.contentType === "Course"
                              ? `${DOMAIN}${routeConfig.ROUTES.JOIN_COURSE_PAGE.JOIN_COURSE}?${item.identifier}`
                              : `${DOMAIN}${routeConfig.ROUTES.PLAYER_PAGE.PLAYER}?id=${item.identifier}`
                          }
                        />
                        <Box
                          className="custom-card-box"
                          key={item.id}
                          style={{ marginBottom: "10px" }}
                        >
                          <BoxCard
                            items={item}
                            index={item.count}
                            onClick={() =>
                              handleCardClick(item.identifier, item.contentType)
                            }
                          />
                        </Box>
                      </>
                    ))}
                  <div className="blankCard"></div>
                </Box>
                {totalPages > 1 && (
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                  />
                )}
              </Box>
            </>
          )}
        </Container>
      </Box>
      <Footer />
    </>
  );
};

export default AllPublicContent;
