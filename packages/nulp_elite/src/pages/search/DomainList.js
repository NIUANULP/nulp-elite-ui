import React, { useState, useEffect } from "react";
import { createTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import Grid from "@mui/material/Grid";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import domainWithImage from "../../assets/domainImgForm.json";
import Header from "../../components/header";
import * as frameworkService from ".././../services/frameworkService";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";
import { object } from "yup";
import Alert from "@mui/material/Alert";
import appConfig from "../../configs/appConfig.json";
const urlConfig = require("../../configs/urlConfig.json");
import ToasterCommon from "../ToasterCommon";
import DomainCarousel from "components/domainCarousel";
import NoResult from "pages/content/noResultFound";
import BoxCard from "../../components/Card";
import BookmarkAddedOutlinedIcon from "@mui/icons-material/BookmarkAddedOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
const routeConfig = require("../../configs/routeConfig.json");
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import SkeletonLoader from "components/skeletonLoader";
import FloatingChatIcon from "components/FloatingChatIcon";
import * as util from "../../services/utilService";
import { Loading } from "@shiksha/common-lib";


const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));
const theme = createTheme();

theme.typography.h3 = {
  fontSize: "0.938rem",
  background: "#fff",
  display: "block",
  "@media (min-width:600px)": {
    fontSize: "1.1rem",
  },
  [theme.breakpoints.up("md")]: {
    fontSize: "1.125rem",
  },
};

const DomainList = ({ globalSearchQuery }) => {
  const { t } = useTranslation();
  const [data, setData] = React.useState();
  const [channelData, setChannelData] = React.useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [category, setCategory] = React.useState();
  const [imgItem, setImgItem] = React.useState(object ? object : {});
  const [itemsArray, setItemsArray] = useState([]);
  const [toasterOpen, setToasterOpen] = useState(false);
  const [toasterMessage, setToasterMessage] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);
  const [domain, setDomain] = useState();
  const [popularCourses, setPopularCourses] = useState([]);
  const [recentlyAddedCourses, setRecentlyAddedCourses] = useState([]);
  const [orgId, setOrgId] = useState();
  const [framework, setFramework] = useState();

  const [searchQuery, setSearchQuery] = useState(globalSearchQuery || "");

  const [isModalOpen, setIsModalOpen] = useState(() => {
    // Check if the modal has been shown in the current session
    const isModalShown = sessionStorage.getItem('isModalShown');
    return isModalShown !== 'true'; // Show modal if not already shown
  });

  const [lernUser, setLernUser] = useState([]);
  const _userId = util.userId();
  const fetchData = async () => {
    try {
      const url = `${urlConfig.URLS.LEARNER_PREFIX}${urlConfig.URLS.USER.GET_PROFILE}${_userId}`;
      const response = await fetch(url);
      const data = await response.json();
      const rolesData = data.result.response.channel;
      setLernUser(rolesData);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // Fetch data when the component mounts or _userId changes
  useEffect(() => {
    if (_userId) {
      fetchData();
    }
  }, [_userId]);

  const showErrorMessage = (msg) => {
    setToasterMessage(msg);
    setTimeout(() => {
      setToasterMessage("");
    }, 2000);
    setToasterOpen(true);
  };

  useEffect(() => {
    fetchUserData();
    getRecentlyAddedCourses();
    getPopularCourses();
    // console.log("domainWithImage--",domainWithImage)
  }, []);

  // Function to push data to the array
  const pushData = (term) => {
    setItemsArray((prevData) => [...prevData, term]);
  };
  const fetchUserData = async () => {
    const newPath = location.pathname;
    sessionStorage.setItem("previousRoutes", newPath);
    try {
      const uservData = await util.userData();
      console.log(
        "-------------",
        uservData?.data?.result?.response?.framework?.id[0]
      );
      setOrgId(uservData?.data?.result?.response?.rootOrgId);
      setFramework(uservData?.data?.result?.response?.framework?.id[0]);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    if (orgId && framework) {
      fetchDataFramework();
    }
  }, [orgId, framework]);

  const fetchDataFramework = async () => {
    setIsLoading(true);
    setError(null);
    const rootOrgId = sessionStorage.getItem("rootOrgId");
    const defaultFramework = localStorage.getItem("defaultFramework");

    try {
      const url = `${urlConfig.URLS.PUBLIC_PREFIX}${urlConfig.URLS.CHANNEL.READ}/${orgId}`;
      const response = await frameworkService.getChannel(url);
      // console.log("channel---",response.data.result);
      setChannelData(response.data.result);
    } catch (error) {
      console.log("error---", error);
      showErrorMessage(t("FAILED_TO_FETCH_DATA"));
    } finally {
      setIsLoading(false);
    }
    try {
      const url = `${urlConfig.URLS.PUBLIC_PREFIX}${urlConfig.URLS.FRAMEWORK.READ}/${framework}?categories=${urlConfig.params.framework}`;

      const response = await frameworkService.getSelectedFrameworkCategories(
        url
      );
      const categories = response?.data?.result?.framework?.categories;
      const selectedIndex = categories.findIndex(
        (category) => category.code === "board"
      );
      console.log("---------", selectedIndex);

      response?.data?.result?.framework?.categories[selectedIndex].terms.map(
        (term) => {
          setCategory(term);
          if (domainWithImage) {
            domainWithImage.result.form.data.fields.map((imgItem) => {
              if ((term && term.code) === (imgItem && imgItem.code)) {
                term["image"] = imgItem.image ? imgItem.image : "";
                pushData(term);
                itemsArray.push(term);
              }
            });
          }
        }
      );
      setDomain(
        response?.data?.result?.framework?.categories[selectedIndex].terms
      );
      setData(itemsArray);
    } catch (error) {
      console.log("nulp--  error-", error);
      showErrorMessage(t("FAILED_TO_FETCH_DATA"));
    } finally {
      console.log("nulp finally---");
      setIsLoading(false);
    }
  };

  const getRecentlyAddedCourses = async () => {
    setIsLoading(true);
    setError(null);

    let requestData = {
      request: {
        filters: {
          se_boards: [null],
          primaryCategory: ["Good Practices", "Reports", "Manual/SOPs"],
          visibility: ["Default", "Parent"],
        },
        limit: 100,
        sort_by: {
          createdOn: "desc",
        },
        fields: [
          "name",
          "appIcon",
          "mimeType",
          "gradeLevel",
          "identifier",
          "medium",
          "pkgVersion",
          "board",
          "subject",
          "resourceType",
          "primaryCategory",
          "contentType",
          "channel",
          "organisation",
          "trackable",
          "primaryCategory",
          "se_boards",
          "se_gradeLevels",
          "se_subjects",
          "se_mediums",
          "primaryCategory",
        ],
        facets: [
          "se_boards",
          "se_gradeLevels",
          "se_subjects",
          "se_mediums",
          "primaryCategory",
        ],

        offset: 0,
        query: globalSearchQuery || searchQuery,
      },
    };

    let req = JSON.stringify(requestData);

    const headers = {
      "Content-Type": "application/json",
    };

    try {
      const url = `${urlConfig.URLS.PUBLIC_PREFIX}${urlConfig.URLS.CONTENT.SEARCH}?orgdetails=${appConfig.ContentPlayer.contentApiQueryParams.orgdetails}&licenseDetails=${appConfig.ContentPlayer.contentApiQueryParams.licenseDetails}`;

      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: req,
      });

      if (!response.ok) {
        throw new Error(t("FAILED_TO_FETCH_DATA"));
      }

      const responseData = await response.json();
      console.log("data", responseData);
      setRecentlyAddedCourses(responseData?.result?.content || []);
    } catch (error) {
      showErrorMessage(t("FAILED_TO_FETCH_DATA"));
    } finally {
      setIsLoading(false);
    }
  };

  const loadContents = async (term) => {
    // console.log(term);
    navigate(`${routeConfig.ROUTES.CONTENTLIST_PAGE.CONTENTLIST}?1`, {
      state: { domain: term.name, domainName: term.name },
    });
  };

  const handleSearch = async (domainquery) => {
    console.log(domainquery);
    navigate(`${routeConfig.ROUTES.CONTENTLIST_PAGE.CONTENTLIST}?1`, {
      state: { domainquery },
    });
  };
  const handleDomainFilter = (query, domainName) => {
    setDomain(query);
    navigate(`${routeConfig.ROUTES.CONTENTLIST_PAGE.CONTENTLIST}?1`, {
      state: { domain: query, domainName: domainName },
    });
  };
  // console.log(frameworkHardCodedData.result.framework.categories[0].terms);

  const handleCardClick = (contentId, courseType) => {
    if (courseType === "Course") {
      // navigate("/joinCourse", { state: { contentId } });
      navigate(
        `${routeConfig.ROUTES.JOIN_COURSE_PAGE.JOIN_COURSE}?${contentId}`
      );
    } else {
      navigate(`${routeConfig.ROUTES.PLAYER_PAGE.PLAYER}?${contentId}`);
    }
  };

  const getPopularCourses = async () => {
    setIsLoading(true);
    setError(null);

    let requestData = {
      request: {
        filters: {
          se_boards: [null],
          primaryCategory: ["Course"],
          visibility: ["Default", "Parent"],
        },
        limit: 100,
        sort_by: {
          createdOn: "desc",
        },
        fields: [
          "name",
          "appIcon",
          "mimeType",
          "gradeLevel",
          "identifier",
          "medium",
          "pkgVersion",
          "board",
          "subject",
          "resourceType",
          "primaryCategory",
          "contentType",
          "channel",
          "organisation",
          "trackable",
          "primaryCategory",
          "se_boards",
          "se_gradeLevels",
          "se_subjects",
          "se_mediums",
        ],
        facets: [
          "se_boards",
          "se_gradeLevels",
          "se_subjects",
          "se_mediums",
          "primaryCategory",
        ],
        offset: 0,
      },
    };

    let req = JSON.stringify(requestData);

    const headers = {
      "Content-Type": "application/json",
    };

    try {
      const url = `${urlConfig.URLS.PUBLIC_PREFIX}${urlConfig.URLS.CONTENT.SEARCH}?orgdetails=${appConfig.ContentPlayer.contentApiQueryParams.orgdetails}&licenseDetails=${appConfig.ContentPlayer.contentApiQueryParams.licenseDetails}`;

      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: req,
      });

      if (!response.ok) {
        throw new Error(t("FAILED_TO_FETCH_DATA"));
      }

      const responseData = await response.json();
      console.log("data", responseData);
      setPopularCourses(responseData?.result?.content || []);
    } catch (error) {
      showErrorMessage(t("FAILED_TO_FETCH_DATA"));
    } finally {
      setIsLoading(false);
    }
  };

  const onMobileSearch = () => {
    navigate(`${routeConfig.ROUTES.CONTENTLIST_PAGE.CONTENTLIST}?1`, {
      state: { globalSearchQuery: searchQuery },
    });
  };

  const handleInputChange = (event) => {
    setSearchQuery(event.target.value);
    console.log("value", event.target.value);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      onMobileSearch();
    }
  };
  console.log(lernUser, 'lernUser from dashboard');


  return (
    <div>
      <Header />
      {toasterMessage && <ToasterCommon response={toasterMessage} />}
      <Box sx={{ height: 'calc(100vh - 210px)', overflowY: 'auto' }}>

        {/* Search Box */}
        <Box
          className="lg-hide d-flex"
          style={{
            alignItems: "center", padding: '15px', marginTop: '67px', background: '#fff', border: '2px solid #eee',
            borderRadius: '10px'
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
                  onClick={onMobileSearch}
                >
                  <SearchIcon />
                </IconButton>
              ),
            }}
          />
        </Box>

        {isMobile ? (
          <Container role="main" maxWidth="xxl" className="mt-180">
            {error && <Alert severity="error">{error}</Alert>}
            <Box sx={{ paddingTop: "30px" }}>
              <Box className="text-white h4-title">
                {t("SELECT_YOUR_PREFERRED_DOMAIN")}:
              </Box>

              <Grid
                container
                spacing={2}
                style={{ margin: "20px 0", marginBottom: "10px" }}
              >
                {data &&
                  data.slice(0, 10).map((term) => (
                    <Grid
                      item
                      xs={6}
                      md={6}
                      lg={2}
                      style={{ marginBottom: "10px" }}
                    >
                      <Box
                        onClick={() => loadContents(term)}
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                        className="domainlist-bx"
                      >
                        <Box>
                          <img
                            className="domainHover"
                            src={require(`../../assets/domainImgs${term.image}`)}
                          />
                        </Box>
                        <h5
                          className=" cursor-pointer domainText"
                        >
                          {term.name}
                        </h5>
                      </Box>
                    </Grid>
                  ))}
              </Grid>
            </Box>
          </Container>
        ) : domain ? (
          <DomainCarousel onSelectDomain={handleDomainFilter} domains={domain} />
        ) : (
          <SkeletonLoader />
          // <NoResult />
        )}

        <Container
          maxWidth="xl"
          className=" allContent allContentList domain-list mt-180"
          role="main"
        >

          {error && <Alert severity="error">{error}</Alert>}
          <Box textAlign="center">
            <p
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <VerifiedOutlinedIcon
                  className="text-grey"
                  style={{ verticalAlign: "top" }}
                />{" "}
                <Box
                  className="h3-title"
                  style={{
                    display: "inline-block",
                  }}
                >
                  {t("POPULAR_COURSES")}{" "}
                </Box>{" "}
              </Box>
            </p>
            {isMobile ? (
              <Box style={{ paddingTop: "0" }}>
                {isLoading ? (
                  <Loading message={t("LOADING")} />
                ) : error ? (
                  <Alert severity="error">{error}</Alert>
                ) : popularCourses.length > 0 ? (
                  <div>
                    <Box className="custom-card">
                      {popularCourses.slice(0, 10).map((items, index) => (
                        <Box className="custom-card-box" key={items.identifier}>
                          <BoxCard
                            items={items}
                            onClick={() =>
                              handleCardClick(items.identifier, items.contentType)
                            }
                          />
                        </Box>
                        // </Grid>
                      ))}
                      <div className="blankCard"></div>
                    </Box>
                  </div>
                ) : (
                  <NoResult />
                )}
              </Box>
            ) : (
              <Box sx={{ paddingTop: "0" }}>
                {isLoading ? (
                  <Loading message={t("LOADING")} />
                ) : error ? (
                  <Alert severity="error">{error}</Alert>
                ) : popularCourses.length > 0 ? (
                  <Box className="custom-card">
                    {popularCourses.slice(0, 10).map((items) => (
                      <Box key={items.identifier} className="custom-card-box">
                        <BoxCard
                          items={items}
                          onClick={() =>
                            handleCardClick(items.identifier, items.contentType)
                          }
                        />
                      </Box>
                      // </Grid>
                    ))}
                    <div className="blankCard"></div>
                  </Box>
                ) : (
                  <NoResult />
                )}
              </Box>
            )}
          </Box>
        </Container>
        <Container
          maxWidth="xl"
          className="allContent xs-mb-75 domain-list"
          role="main"
        >
          {error && <Alert severity="error">{error}</Alert>}

          <Box textAlign="center">
            <p
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <BookmarkAddedOutlinedIcon
                  className="text-grey"
                  style={{ verticalAlign: "top" }}
                />{" "}
                <Box
                  className="h3-title"
                  style={{
                    display: "inline-block",
                  }}
                >
                  {t("RECENTLY_ADDED")}{" "}
                </Box>{" "}
              </Box>
            </p>
            {isMobile ? (
              <Box sx={{ paddingTop: "0" }}>
                {isLoading ? (
                  <Loading message={t("LOADING")} />
                ) : error ? (
                  <Alert severity="error">{error}</Alert>
                ) : recentlyAddedCourses.length > 0 ? (
                  <div>
                    <Box className="custom-card">
                      {recentlyAddedCourses.slice(0, 10).map((items, index) => (
                        <Box className="custom-card-box" key={items.identifier}>
                          <BoxCard
                            items={items}
                            onClick={() =>
                              handleCardClick(items.identifier, items.contentType)
                            }
                          />
                        </Box>
                      ))}
                      <div className="blankCard"></div>
                    </Box>
                  </div>
                ) : (
                  <NoResult />
                )}
              </Box>
            ) : (
              <Box sx={{ paddingTop: "0" }}>
                {isLoading ? (
                  <Loading message={t("LOADING")} />
                ) : error ? (
                  <Alert severity="error">{error}</Alert>
                ) : recentlyAddedCourses.length > 0 ? (
                  <div>
                    <Box className="custom-card">
                      {recentlyAddedCourses.slice(0, 10).map((items) => (
                        <Box className="custom-card-box" key={items.identifier}>
                          <BoxCard
                            items={items}
                            onClick={() =>
                              handleCardClick(items.identifier, items.contentType)
                            }
                          />
                        </Box>
                      ))}
                      <div className="blankCard"></div>
                    </Box>
                  </div>
                ) : (
                  <NoResult />
                )}
              </Box>
            )}
          </Box>
        </Container>
        <FloatingChatIcon />
      </Box>
      <Footer />
    </div>
  );
};

export default DomainList;
