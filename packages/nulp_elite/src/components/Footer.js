import * as React from "react";
import Box from "@mui/material/Box";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import TwitterIcon from "@mui/icons-material/Twitter";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import * as util from "../services/utilService";
const urlConfig = require("../configs/urlConfig.json");
const routeConfig = require("../configs/routeConfig.json");
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import Groups2OutlinedIcon from "@mui/icons-material/Groups2Outlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";

export default function Footer() {
  const { t } = useTranslation();
  const [value, setValue] = React.useState(0);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const navigate = useNavigate();
  const [activePath, setActivePath] = React.useState(location.pathname);
  const _userId = util.userId();
  const [userData, setUserData] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const onGlobalSearch = () => {
    navigate(`${routeConfig.ROUTES.CONTENTLIST_PAGE.CONTENTLIST}?1`, {
      state: { globalSearchQuery: searchQuery },
    });
  };
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      onGlobalSearch();
    }
  };

  const navigateToDiscussion = () => {
    navigate(`${routeConfig.ROUTES.FORUM.FORUM}`);
    window.location.reload();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  React.useEffect(() => {
    if (!_userId || _userId.trim() === "") return;
    setActivePath(location.pathname);
    fetchData();
  }, [location.pathname, _userId]);
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
  return (
    <>
      <Box maxWidth="xl" className="lg-hide bg-blue">
        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            width: "100%",
            zIndex: "9999",
          }}
        >
          <BottomNavigation
            sx={{
              width: "100%",
              display: "flex",
              position: "relative",
              paddingTop: "10px",
            }}
            showLabels
            value={value}
            onChange={(event, newValue) => setValue(newValue)}
          >
            <BottomNavigationAction
              onClick={() =>
                navigate(routeConfig.ROUTES.DOMAINLIST_PAGE.DOMAINLIST)
              }
              label={t("HOME")}
              icon={<HomeOutlinedIcon />}
              className={
                location.pathname ===
                `${routeConfig.ROUTES.DOMAINLIST_PAGE.DOMAINLIST}`
                  ? "navigateActive"
                  : ""
              }
            />
            <BottomNavigationAction
              onClick={() =>
                navigate(routeConfig.ROUTES.ALL_CONTENT_PAGE.ALL_CONTENT)
              }
              label={t("CONTENTS")}
              className={
                location.pathname ===
                `${routeConfig.ROUTES.ALL_CONTENT_PAGE.ALL_CONTENT}`
                  ? "navigateActive"
                  : ""
              }
              icon={<MenuBookOutlinedIcon />}
            />
            <BottomNavigationAction
              onClick={() =>
                navigate(routeConfig.ROUTES.ADDCONNECTION_PAGE.ADDCONNECTION)
              }
              label={t("CONNECTION")}
              className={
                location.pathname ===
                  `${routeConfig.ROUTES.ADDCONNECTION_PAGE.ADDCONNECTION}` ||
                location.pathname === routeConfig.ROUTES.CHAT_PAGE.CHAT
                  ? "navigateActive"
                  : ""
              }
              icon={<ChatOutlinedIcon />}
            />
            <BottomNavigationAction
              onClick={() => navigate(routeConfig.ROUTES.EVENTS.EVENT_LIST)}
              label={t("EVENTS")}
              className={
                location.pathname === `${routeConfig.ROUTES.EVENTS.EVENT_LIST}`
                  ? "navigateActive"
                  : ""
              }
              icon={<VideocamOutlinedIcon />}
            />
            <BottomNavigationAction
              target="_blank"
              onClick={() => navigateToDiscussion()}
              className={
                location.pathname === `${routeConfig.ROUTES.FORUM.FORUM}`
                  ? "navigateActive"
                  : ""
              }
              // onClick={() => navigate(routeConfig.ROUTES.POFILE_PAGE.PROFILE)}
              label={t("DISCUSSIONS")}
              // className={
              //   location.pathname ===
              //   `${routeConfig.ROUTES.POFILE_PAGE.PROFILE}`
              //     ? "navigateActive"
              //     : ""
              // }
              icon={<Groups2OutlinedIcon />}
            />
          </BottomNavigation>
        </Box>
      </Box>
      <Box
        className="xs-hide"
        style={{
          background: "#065872",
          color: "#fff",
          padding: "15px 15px 13px",
          marginTop: "auto",
          position: "absolute",
          bottom: "0px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <Grid container spacing={2}>
          <Grid
            item
            xs={8}
            md={3}
            style={{ fontSize: "14px", lineHeight: "2.4", fontWeight: "400" }}
          >
            <Link
              underline="none"
              target="_blank"
              href="https://niua.in/"
              style={{ padding: "10px 0 2px", color: "#fff", margin: "0 8px" }}
            >
              {t("NIUA")}
            </Link>
            <Link
              underline="none"
              target="_blank"
              href="https://mohua.gov.in/"
              style={{ padding: "10px 0 2px", color: "#fff", margin: "0 8px" }}
            >
              {t("MOHUA")}
            </Link>
            <br />
            <Link
              underline="none"
              target="_blank"
              href="/aboutus.html"
              style={{ padding: "10px 0 2px", color: "#fff", margin: "0 8px" }}
            >
              {t("ABOUT_US")}
            </Link>
            <Link
              underline="none"
              href={routeConfig.ROUTES.HELPDESK.HELPDESK}
              style={{ padding: "10px 0 2px", color: "#fff", margin: "0 8px" }}
            >
              {t("CONTACT_US")}
            </Link>
            <Link
              underline="none"
              href={routeConfig.ROUTES.HELP_PAGE.HELP}
              style={{ padding: "10px 0 2px", color: "#fff", margin: "0 8px" }}
            >
              {t("FAQS")}
            </Link>
            <Link
              underline="none"
              href="/logout"
              style={{ padding: "10px 0 2px", color: "#fff", margin: "0 8px" }}
            >
              {t("LOG_OUT")}
            </Link>
          </Grid>
          <Grid
            item
            xs={4}
            md={3}
            style={{ fontSize: "14px", lineHeight: "2.4", fontWeight: "400" }}
          >
            {/* <Link underline="none" target="_blank" href="https://niua.org/cdg/" style={{padding:'10px 0 2px',color:'#fff', fontSize:'14px'}}>{t("CENTER_FOR_DIGITAL_GOVERNANCE")}</Link><br/> */}
            <Link
              underline="none"
              target="_blank"
              href="https://nudm.mohua.gov.in/"
              style={{ padding: "10px 0 2px", color: "#fff", fontSize: "14px" }}
            >
              {t("NATIONAL_URBAN_DIGITAL_MISSION")}
            </Link>
            <Box className="social-icons">
              <Link
                href="https://www.facebook.com/NIUA.India/"
                underline="none"
                target="_blank"
              >
                <FacebookIcon />
              </Link>
              <Link
                href="https://www.instagram.com/niua_india/"
                underline="none"
                target="_blank"
              >
                <InstagramIcon />
              </Link>
              <Link
                href="https://www.linkedin.com/school/national-institute-of-urban-affairs/"
                underline="none"
                target="_blank"
              >
                <LinkedInIcon />
              </Link>
              <Link
                href="https://x.com/NIUA_India"
                underline="none"
                target="_blank"
              >
                <TwitterIcon />
              </Link>
            </Box>
          </Grid>
          <Grid
            item
            xs={4}
            md={3}
            style={{ fontSize: "14px", lineHeight: "1.5", fontWeight: "400" }}
          >
            <Box style={{ fontSize: "14px", fontWeight: "700" }}>
              {t("N0DAL_MINISTRY")}:
            </Box>
            {t("MINISTRY_OF_HOUSING_AND_URBAN")}
            <br />
            {t("NIRMAN_BHAWAN")}
          </Grid>
          <Grid
            item
            xs={8}
            md={3}
            style={{ fontSize: "14px", lineHeight: "1.5", fontWeight: "400" }}
          >
            <Box style={{ fontSize: "14px", fontWeight: "700" }}>
              {" "}
              {t("ANCHOR_INSTITUE")}:
            </Box>
            {t("NATIONAL_INSTITUE_OF_URBAN")}
            <br />
            {t("FIRST_FLOOR_CORE")}
            <br />
            {t("PHONE")}: {t("PHONE_NUMBER")}
          </Grid>
        </Grid>
      </Box>
    </>
  );
}
