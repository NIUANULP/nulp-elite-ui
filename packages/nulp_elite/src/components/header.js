import React, { useState, useEffect } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Menu from "@mui/material/Menu";
import Container from "@mui/material/Container";
import Tooltip from "@mui/material/Tooltip";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import { Badge } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import Link from "@mui/material/Link";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import LanguageIcon from "@mui/icons-material/Language";
import { useTranslation } from "react-i18next";
import { changeLanguage } from "i18next";
import LiveHelpOutlinedIcon from "@mui/icons-material/LiveHelpOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import GTranslateIcon from "@mui/icons-material/GTranslate";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import { useNavigate } from "react-router-dom";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import * as util from "../services/utilService";
const urlConfig = require("../configs/urlConfig.json");
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
const routeConfig = require("../configs/routeConfig.json");
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import Groups2OutlinedIcon from "@mui/icons-material/Groups2Outlined";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { Collapse, List } from "@mui/material";
import NotificationPopup from "./Notification";

function Header({ globalSearchQuery }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [language, setLanguage] = useState(
    localStorage.getItem("lang") ? localStorage.getItem("lang") : "en"
  );

  const handleChangeLanguage = (event) => {
    localStorage.setItem("lang", event.target.value);
    const selectedLanguage = event.target.value;
    setLanguage(selectedLanguage);
    changeLanguage(selectedLanguage);
  };

  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [anchorElNotify, setAnchorElNotify] = React.useState(null);

  const [searchQuery, setSearchQuery] = useState(globalSearchQuery || "");
  const _userId = util.userId();
  const [userData, setUserData] = useState(null);
  const [roles, setRoles] = useState([]);
  const [orgId, setOrgId] = useState();
  const [openSubmenu, setOpenSubmenu] = useState(false);
  const [openDashboardmenu, setopenDashboardmenu] = useState(false);
  const [open, setOpen] = useState(false);
  const [show, setShow] = React.useState(false);
  const [openNotification, setOpenNotification] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [accessWorkspace, setAccessWorkspace] = useState(false);
  let parsedRoles;
  const handleSubmenuToggle = () => {
    setOpenSubmenu(!openSubmenu);
  };
  const handleDashboardmenuToggle = () => {
    setopenDashboardmenu(!openDashboardmenu);
  };

  const checkAccess = async (roles) => {
    try {
      const url = `${urlConfig.URLS.CHECK_USER_ACCESS}`;
      const response = await fetch(url);
      const data = await response.json();
      const userID = data.result.data;

      const user = userID.find(
        (user) => user.user_id === _userId && user.creator_access === false
      );
      if (
        (roles.includes("COURSE_MENTOR") ||
          roles.includes("SYSTEM_ADMINISTRATION") ||
          roles.includes("CONTENT_CREATOR") ||
          roles.includes("CONTENT_CREATION") ||
          roles.includes("CONTENT_REVIEWER") ||
          roles.includes("FLAG_REVIEWER")|| roles.includes("ORG_ADMIN")) &&
        (!userID.some((item) => item.user_id === _userId) || user != undefined)
      ) {
        setAccessWorkspace(true);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // Retrieve roles from sessionStorage
  //const rolesJson = sessionStorage.getItem("roles");
  useEffect(() => {
    const rolesJson = sessionStorage.getItem("roles");
    if (rolesJson) {
      parsedRoles = JSON.parse(rolesJson);
      setRoles(parsedRoles);
      checkAccess(JSON.parse(sessionStorage.getItem("roles")));
    }
  }, []);
  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };
  const handleOpenNotifyMenu = (event) => {
    setAnchorElNotify(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  const handleCloseNotifyMenu = () => {
    setAnchorElNotify(null);
  };

  const [activePath, setActivePath] = useState(location.pathname);

  useEffect(() => {
    setActivePath(location.pathname);
    fetchData();
  }, [location.pathname]);

  const onGlobalSearch = () => {
    navigate(`${routeConfig.ROUTES.CONTENTLIST_PAGE.CONTENTLIST}?1`, {
      state: { globalSearchQuery: searchQuery },
    });
  };

  const handleClickOpenNotification = () => {
    setOpenNotification(true);
  };

  const fetchNotifications = async () => {
    try {
      const url = `${urlConfig.URLS.LEARNER_PREFIX}${urlConfig.URLS.NOTIFICATION.READ}${_userId}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data?.result?.feeds) {
        const unreadCount = data.result.feeds.filter(
          (notif) => notif.status === "unread"
        ).length;
        setNotificationCount(unreadCount);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const intervalId = setInterval(() => {
      fetchNotifications();
    }, 20000);

    return () => clearInterval(intervalId);
  }, [_userId]);

  const handleCloseNotification = () => {
    setOpenNotification(false);
  };

  const updateNotificationCount = (count) => {
    setNotificationCount(count);
  };

  const handleInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      onGlobalSearch();
    }
  };
  const fetchUserData = async () => {
    try {
      const uservData = await util.userData();
      setOrgId(uservData?.data?.result?.response?.rootOrgId);
      fetchDataFramework();
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
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };
  const [scrolled, setScrolled] = useState(false);

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 767);
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
  const roleNames =
    userData?.result?.response?.roles.map((role) => role.role) || [];

  const textFieldStyle = {
    fontSize: "12px",
    backgroundColor: searchQuery ? "#065872" : "transparent",
    boxShadow: searchQuery ? "0 2px 4px rgba(0, 0, 0, 0.2)" : "none",
    color: searchQuery ? "#fff" : "#000",
  };
  const handleLogout = () => {
    sessionStorage.setItem("isModalShown", "false");
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
              src={require("../assets/logo.png")}
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
                      onClick={onGlobalSearch}
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
              target="_blank"
              href="/my-groups?selectedTab=myGroups"
              className={
                activePath === `/my-groups?selectedTab=myGroups`
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
            <NotificationPopup
              open={openNotification}
              handleClose={handleCloseNotification}
              updateNotificationCount={updateNotificationCount}
            />
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
                {userData && (
                  <>
                    <div className="profile-text-circle">
                      {userData?.result?.response?.firstName[0]}
                    </div>
                  </>
                )}
                <ExpandMoreIcon />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: "45px" }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              <Link
                href={routeConfig.ROUTES.POFILE_PAGE.PROFILE}
                underline="none"
                textAlign="center"
              >
                <MenuItem>{t("PROFILE")}</MenuItem>
              </Link>
              {roleNames.some((role) => ["CONTENT_CREATOR"].includes(role)) && (
                <Link
                  href={routeConfig.ROUTES.DASHBOARD_PAGE.DASHBOARD}
                  underline="none"
                  textAlign="center"
                >
                  <MenuItem>{t("DASHBOARD")}</MenuItem>
                </Link>
                
              )}

              {/* Check if roles array is empty or contains "PUBLIC" */}

              {/* {accessWorkspace && ( */}
              {roleNames.some((role) => ["CONTENT_CREATOR"].includes(role)) && (
                <Link
                  target="_blank"
                  href="/workspace/content/create"
                  underline="none"
                  textAlign="center"
                >
                  <MenuItem>{t("WORKSPACE")}</MenuItem>
                </Link>
              )}
              <MenuItem
                onClick={handleSubmenuToggle}
                style={{ background: "#f9fafc", color: "#1976d2" }}
                className="lg-hide"
              >
                {t("POLL")}
                <Link primary="Submenu" />
                {openSubmenu ? <ExpandLess /> : <ExpandMore />}
              </MenuItem>
              <Collapse
                in={openSubmenu}
                timeout="auto"
                unmountOnExit
                className="lg-hide"
              >
                <List
                  component="div"
                  disablePadding
                  style={{ background: "#f9fafc" }}
                >
                  {roleNames.some((role) =>
                    ["SYSTEM_ADMINISTRATION", "CONTENT_CREATOR"].includes(role)
                  ) &&
                    accessWorkspace && (
                      <MenuItem
                        className="ml-10"
                        style={{ background: "#f9fafc" }}
                      >
                        <Link
                          href={routeConfig.ROUTES.POLL.POLL_FORM}
                          underline="none"
                          textAlign="center"
                        >
                          {t("CREATE_POLL")}
                        </Link>
                      </MenuItem>
                    )}
                  <MenuItem className="ml-10">
                    <Link
                      href={routeConfig.ROUTES.POLL.POLL_LIST}
                      underline="none"
                      textAlign="center"
                    >
                      {t("POLL_LIST")}
                    </Link>
                  </MenuItem>
                  {roleNames.some((role) =>
                    ["SYSTEM_ADMINISTRATION", "CONTENT_CREATOR"].includes(role)
                  ) && (
                    <MenuItem className="ml-10">
                      <Link
                        href={routeConfig.ROUTES.POLL.POLL_DASHBOARD}
                        underline="none"
                        textAlign="center"
                      >
                        {t("DASHBOARD")}
                      </Link>
                    </MenuItem>
                  )}
                </List>
              </Collapse>
              <Link
                href={routeConfig.ROUTES.HELP_PAGE.HELP}
                underline="none"
                textAlign="center"
              >
                <MenuItem>{t("HELP")}</MenuItem>
              </Link>
              <Link
                href="/logoff"
                underline="none"
                textAlign="center"
                onClick={handleLogout}
              >
                <MenuItem>{t("LOGOUT")}</MenuItem>
              </Link>
            </Menu>
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
                    <Link
                      href="/logoff"
                      textAlign="center"
                      underline="none"
                      onClick={handleLogout}
                    >
                      <MenuItem>
                        <LogoutOutlinedIcon
                          style={{ verticalAlign: "bottom", color: "#000" }}
                        />{" "}
                        {t("LOGOUT")}
                      </MenuItem>
                    </Link>
                  </Menu>
                </Box>

                <Link
                  href={routeConfig.ROUTES.DOMAINLIST_PAGE.DOMAINLIST}
                  className="py-15 xs-py-3"
                >
                  <img
                    src={require("../assets/logo.png")}
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
                    {userData && (
                      <>
                        <div className="profile-text-circle">
                          {userData?.result?.response?.firstName[0]}
                        </div>
                      </>
                    )}
                    {/* <ExpandMoreIcon /> */}
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: "45px" }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                  PaperProps={{
                    sx: {
                      width: "170px",
                    },
                  }}
                >
                  <Link
                    href={routeConfig.ROUTES.POFILE_PAGE.PROFILE}
                    underline="none"
                    textAlign="center"
                  >
                    <MenuItem>{t("PROFILE")}</MenuItem>
                  </Link>
                  <MenuItem
                    onClick={handleDashboardmenuToggle}
                    style={{ background: "#f9fafc", color: "#1976d2" }}
                  >
                    {t("DASHBOARD")}
                    <Link primary="Submenu" />
                    {openDashboardmenu ? <ExpandLess /> : <ExpandMore />}
                  </MenuItem>
                  <Collapse
                    in={openDashboardmenu}
                    timeout="auto"
                    unmountOnExit
                    style={{ background: "#f9fafc" }}
                  >
                    <List
                      component="div"
                      disablePadding
                      style={{ background: "#f9fafc" }}
                    >
                      {roleNames.some((role) =>
                        ["SYSTEM_ADMINISTRATION", "CONTENT_CREATOR"].includes(
                          role
                        )
                      ) && (
                        <Link
                          href={routeConfig.ROUTES.POLL.POLL_DASHBOARD}
                          underline="none"
                          textAlign="center"
                        >
                          <MenuItem className="ml-10">{t("POLL")}</MenuItem>
                        </Link>
                      )}
                      {roleNames.some((role) =>
                        [
                          "ORG_ADMIN",
                          "SYSTEM_ADMINISTRATION",
                          "CONTENT_CREATOR",
                        ].includes(role)
                      ) && (
                        <Link
                          href={routeConfig.ROUTES.DASHBOARD_PAGE.DASHBOARD}
                          underline="none"
                          textAlign="center"
                        >
                          <MenuItem className="ml-10">{t("EVENTS")}</MenuItem>
                        </Link>
                      )}
                      <MenuItem
                        className="ml-10"
                        onClick={() => {
                          sessionStorage.setItem("urlPath", "learningreport");
                          window.open(
                            routeConfig.ROUTES.LEARNING_REPORT,
                            "_blank"
                          );
                        }}
                        style={{ color: "#1976d2" }}
                      >
                        {t("LEARNING_REPORT")}
                      </MenuItem>
                    </List>
                  </Collapse>
                  {roleNames.some((role) =>
                    ["ORG_ADMIN", "SYSTEM_ADMINISTRATION"].includes(role)
                  ) && (
                    <Link
                      href={routeConfig.ROUTES.ADMIN}
                      underline="none"
                      textAlign="center"
                      target="_blank"
                    >
                      <MenuItem>{t("ADMIN")}</MenuItem>
                    </Link>
                  )}

                    {roleNames.some((role) =>
                    ["ORG_ADMIN", "SYSTEM_ADMINISTRATION"].includes(role)
                  ) && (
                    <Link
                      target="_blank"
                      href="/workspace/content/create"
                      underline="none"
                      textAlign="center"
                    >
                      <MenuItem>{t("WORKSPACE")}</MenuItem>
                    </Link>
                  )}

                        {roleNames.some((role) =>
                        ["ORG_ADMIN","CONTENT_CREATOR"].includes(
                          role
                        )
                      ) && (
                        <Link
                          href={routeConfig.ROUTES.LEARNATHON.DASHBOARD}
                          
                          underline="none"
                          textAlign="center"
                          disablePadding
          
                        >
                          
                    
                          <MenuItem style={{ color: "#1976d2" }}>
                            {t("LEARNATHON")}
                          </MenuItem>
                        </Link>
                      )}

                  {/* <NotificationsNoneOutlinedIcon />
                    ekta */}

                  <MenuItem
                    onClick={handleSubmenuToggle}
                    style={{ background: "#f9fafc", color: "#1976d2" }}
                  >
                    {t("POLL")}
                    <Link primary="Submenu" />
                    {openSubmenu ? <ExpandLess /> : <ExpandMore />}
                  </MenuItem>
                  <Collapse
                    in={openSubmenu}
                    timeout="auto"
                    unmountOnExit
                    style={{ background: "#f9fafc" }}
                  >
                    <List
                      component="div"
                      disablePadding
                      style={{ background: "#f9fafc" }}
                    >
                      {roleNames.some((role) =>
                        ["SYSTEM_ADMINISTRATION", "CONTENT_CREATOR"].includes(
                          role
                        )
                      ) && (
                        <Link
                          href={routeConfig.ROUTES.POLL.POLL_FORM}
                          underline="none"
                          textAlign="center"
                        >
                          <MenuItem className="ml-10">
                            {t("CREATE_POLL")}
                          </MenuItem>
                        </Link>
                      )}
                      <Link
                        href={routeConfig.ROUTES.POLL.POLL_LIST}
                        underline="none"
                        textAlign="center"
                      >
                        <MenuItem className="ml-10">{t("POLL_LIST")}</MenuItem>
                      </Link>
                    </List>
                  </Collapse>
                  {/* {roleNames.some((role) =>
                        ["ORG_ADMIN","CONTENT_CREATOR"].includes(
                          role
                        )
                      ) && (
                        <Link
                          href={routeConfig.ROUTES.LEARNATHON.DASHBOARD}
                          className={
                            activePath ===
                            `${routeConfig.ROUTES.LEARNATHON.DASHBOARD}`
                              ? "Menuactive"
                              : "headerMenu"
                          }
                          underline="none"
                          textAlign="center"
                          disablePadding
          
                        >
                          
                    
                          <MenuItem className="ml-10"style={{ background: "#f9fafc", color: "#1976d2" }}>
                            {t("LEARNATHON")}
                          </MenuItem>
                        </Link>
                      )} */}
                  <Link
                    href={routeConfig.ROUTES.HELP_PAGE.HELP}
                    underline="none"
                    textAlign="center"
                  >
                    <MenuItem>{t("HELP")}</MenuItem>
                  </Link>
                  <Link
                    href="/logoff"
                    underline="none"
                    textAlign="center"
                    onClick={handleLogout}
                  >
                    <MenuItem>{t("LOGOUT")}</MenuItem>
                  </Link>
                </Menu>
              </Box>
              {/* Language Select */}
            </Toolbar>{" "}
            {/* Search Box */}
            {/* <Box
              className="xs-hide d-flex header-bg w-40 mr-30"
              style={{ alignItems: "center", paddingLeft: "8px" }}
            >
              <Box className="h1-title px-10 pr-20">{t("EXPLORE")}</Box>
              <TextField
                placeholder={t("What do you want to learn today?  ")}
                variant="outlined"
                size="small"
                fullWidth
                value={searchQuery}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      type="submit"
                      aria-label="search"
                      onClick={onGlobalSearch}
                    >
                      <SearchIcon />
                    </IconButton>
                  ),
                }}
              />
            </Box>
            <Box
              className="xs-hide header-bg py-15"
              sx={{ flexGrow: 1, display: "flex", justifyContent: "flex-end" }}
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
                <HomeOutlinedIcon
                  style={{ padding: "0 5px 0 0", verticalAlign: "middle" }}
                />
                {t("HOME")}
              </Link>
              <Link
                href={routeConfig.ROUTES.ALL_CONTENT_PAGE.ALL_CONTENT}
                className={
                  activePath ===
                    routeConfig.ROUTES.ALL_CONTENT_PAGE.ALL_CONTENT ||
                  activePath.startsWith(
                    routeConfig.ROUTES.VIEW_ALL_PAGE.VIEW_ALL
                  )
                    ? "Menuactive"
                    : "headerMenu"
                }
                underline="none"
              >
                <MenuBookOutlinedIcon
                  style={{ padding: "0 5px", verticalAlign: "middle" }}
                />
                {t("CONTENT")}
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
                <ChatOutlinedIcon
                  style={{ padding: "0 10px", verticalAlign: "middle" }}
                />
                {t("CONNECTIONS")}
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
                <VideocamOutlinedIcon
                  style={{ padding: "0 5px 0 0", verticalAlign: "middle" }}
                />
                {t("WEBINAR")}
              </Link>

              <Tooltip
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
                  {userData && (
                    <>
                      <div className="profile-text-circle">
                        {userData?.result?.response?.firstName[0]}
                      </div>
                      <div
                        className="ellsp"
                        style={{
                          maxWidth: "52px",
                          textAlign: "left",
                          paddingTop: "0",
                        }}
                      >
                        {userData?.result?.response?.firstName}
                      </div>
                    </>
                  )}
                  <ExpandMoreIcon />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: "45px" }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                <MenuItem>
                  <Link
                    href={routeConfig.ROUTES.POFILE_PAGE.PROFILE}
                    underline="none"
                    textAlign="center"
                  >
                    {t("PROFILE")}
                  </Link>
                </MenuItem>
                <MenuItem>
                  <Link
                    href={routeConfig.ROUTES.HELP_PAGE.HELP}
                    underline="none"
                    textAlign="center"
                  >
                    {t("HELP")}
                  </Link>
                </MenuItem>
                <MenuItem>
                  <Link href="/logoff" underline="none" textAlign="center">
                    {t("LOGOUT")}
                  </Link>
                </MenuItem>
              </Menu>
            </Box> */}
          </Box>
          {/* <Box className="lg-hide header-bg" style={{ padding: "10px" }}>
            <TextField
              placeholder={t("What do you want to learn today?")}
              variant="outlined"
              size="small"
              style={{ background: "#fff" }}
              fullWidth
              InputProps={{
                endAdornment: (
                  <IconButton aria-label="search">
                    <SearchIcon />
                  </IconButton>
                ),
              }}
            />
          </Box> */}
        </Container>
      </AppBar>
    </>
  );
}

export default Header;
