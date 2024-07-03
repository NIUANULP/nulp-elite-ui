import React, { useState, useEffect } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Tooltip from "@mui/material/Tooltip";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import Link from "@mui/material/Link";
import DevicesIcon from "@mui/icons-material/Devices";
import WebIcon from "@mui/icons-material/Web";
import InputLabel from "@mui/material/InputLabel";
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
import SortOutlinedIcon from "@mui/icons-material/SortOutlined";
import { useNavigate } from "react-router-dom";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import * as util from "../services/utilService";
const urlConfig = require("../configs/urlConfig.json");
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
const routeConfig = require("../configs/routeConfig.json");
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import Groups2OutlinedIcon from "@mui/icons-material/Groups2Outlined";

function Header({ globalSearchQuery }) {
  const { t } = useTranslation();
  const [language, setLanguage] = useState("en");

  const handleChangeLanguage = (event) => {
    const selectedLanguage = event.target.value;
    setLanguage(selectedLanguage);
    changeLanguage(selectedLanguage);
  };

  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [anchorElNotify, setAnchorElNotify] = React.useState(null);

  const [searchQuery, setSearchQuery] = useState(globalSearchQuery || "");
  const navigate = useNavigate();
  const _userId = util.userId();
  const [userData, setUserData] = useState(null);

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

  const handleInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      onGlobalSearch();
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
  // const navigate = useNavigate();

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
  return (
    <>
      <Box className={scrolled ? " scrolledTop" : ""}>
        {/* Sidebar Navigation */}
        <Box
          className="d-flex jc-en lg-pr-20 xs-pr-16"
          sx={{ background: "#484848" }}
        >
          <Box className="d-flex alignItems-center xs-hide">
            <Link href="#" underline="none" className="font-sizer">
              {" "}
              +A
            </Link>{" "}
            <Link href="#" underline="none" className="font-sizer">
              A -{" "}
            </Link>
            <Link href="#" underline="none" className="font-sizer">
              A
            </Link>{" "}
          </Box>
          <Box sx={{ minWidth: 102, paddingLeft: "0" }}>
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
                style={{ border: "none" }}
                label={t("LANGUAGE")}
                value={language}
                startIcon={<LanguageIcon />}
                onChange={handleChangeLanguage}
                inputProps={{ "aria-label": t("SELECT_LANGUAGE") }}
              >
                <MenuItem value="en">{t("ENGLISH")}</MenuItem>
                <MenuItem value="hi">{t("HINDI")}</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
        <Box className="xs-hide d-flex pos-fixed  bg-white">
          <Box className="d-flex alignItems-center w-100">
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
              className="xs-hide d-flex explore explore-text"
              style={{
                alignItems: "center",
                paddingLeft: "8px",
                marginLeft: "10px",
              }}
            >
              <Box className="h5-title px-10">{t("EXPLORE")}</Box>
              <TextField
                placeholder={t("What do you want to learn today?  ")}
                variant="outlined"
                size="small"
                style={{ fontSize: "12px" }}
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
          </Box>
          <Box
            style={{
              display: "flex",
              alignItems: "space-between",
              paddingRight: "14px",
            }}
          >
            {/* Navigation Links */}
            {/* <Box style={{ padding: "10px" }}>
            <DevicesIcon
              style={{
                padding: "0 10px",
                verticalAlign: "middle",
                color: "#424242",
              }}
            />

            <Link
              href="#"
              underline="none"
              style={{
                color: "#424242",
                fontSize: "16px",
                borderRight: "solid 1px #424242",
                paddingRight: "10px",
              }}
            >
              {t("MAIN_CONTENT")}{" "}
            </Link>
          </Box> */}

            {/* <Box
            style={{
              padding: "0 10px",
              color: "#424242",
              fontSize: "14px",
              borderRight: "solid 1px #424242",
            }}
          >
            <WebIcon style={{ padding: "0 10px", verticalAlign: "middle" }} />
            <Link
              href="#"
              underline="none"
              style={{ color: "#424242", fontSize: "16px" }}
            >
              {t("SCREEN_READER")}{" "}
            </Link>
          </Box> */}
            {/* Language Select */}

            <Box
              className="xs-hide"
              sx={{
                flexGrow: 1,
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                marginLeft: "20px",
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
                <HomeOutlinedIcon
                  style={{ padding: "0px 5px 0 0", verticalAlign: "middle" }}
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
                  style={{ padding: "0px 5px 0 0", verticalAlign: "middle" }}
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
                  style={{ padding: "0px 5px 0 0", verticalAlign: "middle" }}
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
                  style={{ padding: "0px 5px 0 0", verticalAlign: "middle" }}
                />
                {t("EVENTS")}
              </Link>
              <Link href="" className="headerMenu" underline="none">
                <Groups2OutlinedIcon
                  style={{ padding: "0px 5px 0 0", verticalAlign: "middle" }}
                />
                {t("DISCUSSIONS")}
              </Link>
              <Box className="notification-circle xs-hide">
                {/* <NotificationsNoneOutlinedIcon />
                    ekta */}

                <Tooltip>
                  <IconButton onClick={handleOpenNotifyMenu} sx={{ p: 0 }}>
                    <NotificationsNoneOutlinedIcon />
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: "45px" }}
                  id="menu-appbar"
                  anchorEl={anchorElNotify}
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  open={Boolean(anchorElNotify)}
                  onClose={handleCloseNotifyMenu}
                >
                  <MenuItem>
                    <Link underline="none" textAlign="center">
                      Text 1
                    </Link>
                  </MenuItem>
                  <MenuItem>
                    <Link underline="none" textAlign="center">
                      Text 2
                    </Link>
                  </MenuItem>
                  <MenuItem>
                    <Link underline="none" textAlign="center">
                      Text 3
                    </Link>
                  </MenuItem>
                </Menu>
              </Box>

              {/* User Profile */}
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
                          maxWidth: "50px",
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
            </Box>
          </Box>
        </Box>

        {/* Top Navigation Bar */}
        <AppBar className=" bg-inherit pos-inherit mt-65">
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
                  {/* <IconButton
                    size="large"
                    aria-label="account of current user"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    onClick={handleOpenNavMenu}
                    color="inherit"
                    className="lg-hide"
                  >
                    <SortOutlinedIcon />
                  </IconButton> */}
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
                      <MenuItem>
                        <Link
                          href={routeConfig.ROUTES.HELP_PAGE.HELP}
                          textAlign="center"
                          underline="none"
                        >
                          <LiveHelpOutlinedIcon
                            style={{ verticalAlign: "bottom", color: "#000" }}
                          />{" "}
                          {t("HELP")}
                        </Link>
                      </MenuItem>
                      <MenuItem>
                        <Link
                          href="/logoff"
                          textAlign="center"
                          underline="none"
                        >
                          <LogoutOutlinedIcon
                            style={{ verticalAlign: "bottom", color: "#000" }}
                          />{" "}
                          {t("LOGOUT")}
                        </Link>
                      </MenuItem>
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

                <Box className="lg-hide xs-hide translate">
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
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
                <Box className="d-flex">
                  <Box className="notification-circle lg-hide">
                    {/* <NotificationsNoneOutlinedIcon />
                    ekta */}

                    <Tooltip>
                      <IconButton onClick={handleOpenNotifyMenu} sx={{ p: 0 }}>
                        <NotificationsNoneOutlinedIcon />
                      </IconButton>
                    </Tooltip>
                    <Menu
                      sx={{ mt: "45px" }}
                      id="menu-appbar"
                      anchorEl={anchorElNotify}
                      anchorOrigin={{
                        vertical: "top",
                        horizontal: "right",
                      }}
                      keepMounted
                      transformOrigin={{
                        vertical: "top",
                        horizontal: "right",
                      }}
                      open={Boolean(anchorElNotify)}
                      onClose={handleCloseNotifyMenu}
                    >
                      <MenuItem>
                        <Link underline="none" textAlign="center">
                          Text 1
                        </Link>
                      </MenuItem>
                      <MenuItem>
                        <Link underline="none" textAlign="center">
                          Text 2
                        </Link>
                      </MenuItem>
                      <MenuItem>
                        <Link underline="none" textAlign="center">
                          Text 3
                        </Link>
                      </MenuItem>
                    </Menu>
                  </Box>
                  <Tooltip
                    className={
                      activePath ===
                        `${routeConfig.ROUTES.POFILE_PAGE.PROFILE}` ||
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
                          {/* <div
                            className="ellsp xs-pl-5"
                            style={{
                              maxWidth: "52px",
                              textAlign: "left",
                              paddingTop: "0",
                            }}
                          >
                            {userData?.result?.response?.firstName}
                          </div> */}
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
      </Box>
    </>
  );
}

export default Header;