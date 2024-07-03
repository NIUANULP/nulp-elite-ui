import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import BoxCard from "components/Card";
import Box from "@mui/material/Box";
import Search from "components/search";
import SearchBox from "components/search";
import Filter from "components/filter";
import contentData from "../../assets/contentSerach.json";
import RandomImage from "../../assets/cardRandomImgs.json";
import Grid from "@mui/material/Grid";
import Footer from "components/Footer";
import Header from "components/header";
import Container from "@mui/material/Container";
import * as contentService from "../../services/contentService";
import queryString from "query-string";
import Pagination from "@mui/material/Pagination";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import NoResult from "pages/content/noResultFound";
import { t } from "i18next";
import Alert from "@mui/material/Alert";
import { useTranslation } from "react-i18next";
import appConfig from "../../configs/appConfig.json";
const urlConfig = require("../../configs/urlConfig.json");
import ToasterCommon from "../ToasterCommon";
import Carousel from "react-multi-carousel";
import DomainCarousel from "components/domainCarousel";
import domainWithImage from "../../assets/domainImgForm.json";
import DrawerFilter from "components/drawerFilter";
const routeConfig = require("../../configs/routeConfig.json");
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import CircularProgress from "@mui/material/CircularProgress";
import FloatingChatIcon from "components/FloatingChatIcon";
import SkeletonLoader from "components/skeletonLoader";

const responsive = {
  superLargeDesktop: {
    // the naming can be any, depends on you.
    breakpoint: { max: 4000, min: 3000 },
    items: 5,
  },
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 8,
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 2,
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1,
  },
};

const ContentList = (props) => {
  const [search, setSearch] = useState(true);
  const location = useLocation();
  const [pageNumber, setPageNumber] = useState(1);
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({});
  const [domainfilter, setDomainfilter] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gradeLevels, setGradeLevels] = useState([]);
  const [category, setCategory] = useState([]);
  const navigate = useNavigate();
  const [domain, setDomain] = useState(location.state?.domain || undefined);
  const [domainName, setDomainName] = useState(
    location.state?.domainName || undefined
  );
  const [domainList, setDomainList] = useState([]);
  const { domainquery } = location.state || {};
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const { t } = useTranslation();
  const [toasterOpen, setToasterOpen] = useState(false);
  const [toasterMessage, setToasterMessage] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);
  const [channelData, setChannelData] = React.useState(true);
  const [globalSearchQuery, setGlobalSearchQuery] = useState(
    location.state?.globalSearchQuery || undefined
  );
  const [searchQuery, setSearchQuery] = useState(globalSearchQuery || "");
  const [contentTypeFilter, setContentTypeFilter] = useState([]);
  const [subDomainFilter, setSubDomainFilter] = useState([]);
  const [contentCount, setContentCount] = useState(0);

  const showErrorMessage = (msg) => {
    setToasterMessage(msg);
    setTimeout(() => {
      setToasterMessage("");
    }, 2000);
    setToasterOpen(true);
  };

  useEffect(() => {
    fetchData();
    fetchGradeLevels();
    Fetchdomain();
    const random = getRandomValue();
  }, [filters, search, currentPage, domainfilter]);

  useEffect(() => {
    fetchData();
  }, [domain]);

  useEffect(() => {
    fetchData();
  }, [contentTypeFilter]);
  useEffect(() => {
    fetchData();
  }, [subDomainFilter]);

  useEffect(() => {
    fetchData();
  }, [globalSearchQuery]);

  useEffect(() => {
    if (
      (location.state?.globalSearchQuery &&
        location.state?.globalSearchQuery !== globalSearchQuery) ||
      location.state?.globalSearchQuery === ""
    ) {
      setGlobalSearchQuery(location.state?.globalSearchQuery);
    }
  }, [location.state?.globalSearchQuery, globalSearchQuery]);

  const handleFilterChange = (selectedOptions) => {
    const selectedValues = selectedOptions.map((option) => option.value);
    setFilters({ ...filters, se_gradeleverl: selectedValues });
  };

  const handlefilter = (selectedOption) => {
    const selectedValue = selectedOption.map((option) => option.value);
    setDomainfilter({ ...domainfilter, se_board: selectedValue });
  };

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    let requestData = {
      request: {
        filters: {
          status: ["Live"],
          contentType:
            contentTypeFilter && contentTypeFilter.length > 0
              ? contentTypeFilter
              : [
                  "Collection",
                  "TextBook",
                  "Course",
                  "LessonPlan",
                  "Resource",
                  "SelfAssess",
                  "PracticeResource",
                  "LearningOutcomeDefinition",
                  "ExplanationResource",
                  "ExperientialResource",
                  "eTextBook",
                  "TVLesson",
                ],
          se_boards: domainfilter.se_board || [domain],
          se_gradeLevels:
            subDomainFilter && subDomainFilter.length > 0
              ? subDomainFilter
              : [],
        },
        limit: 20,
        query: search.query || globalSearchQuery,
        offset: 20 * (currentPage - 1),
        sort_by: {
          lastUpdatedOn: "desc",
        },
      },
    };

    let req = JSON.stringify(requestData);

    const headers = {
      "Content-Type": "application/json",
    };

    try {
      const url = `${urlConfig.URLS.PUBLIC_PREFIX}${urlConfig.URLS.CONTENT.SEARCH}?orgdetails=${appConfig.ContentPlayer.contentApiQueryParams.orgdetails}&licenseDetails=${appConfig.ContentPlayer.contentApiQueryParams.licenseDetails}`;
      const response = await contentService.getAllContents(url, req, headers);

      if (response.data.result.content && response.data.result.count <= 20) {
        setTotalPages(1);
        if (response.data.result.count === 0) {
          setContentCount(0);
        } else {
          setContentCount(response.data.result.count);
        }
      } else if (response.data.result.count > 20) {
        setTotalPages(Math.ceil(response.data.result.count / 20));
        let count = Number(response.data.result.count);
        if (count === 0) {
          setContentCount(0);
        } else {
          setContentCount(20);
        }
      }

      setData(response.data.result);
    } catch (error) {
      showErrorMessage(t("FAILED_TO_FETCH_DATA"));
    } finally {
      setIsLoading(false);
    }
  };

  const getRandomValue = () => {
    const randomIndex = RandomImage;
    return randomIndex;
  };

  const handleChange = (event, value) => {
    if (value !== pageNumber) {
      setPageNumber(value);
      setCurrentPage(value);
      setData({});
      navigate(`${routeConfig.ROUTES.CONTENTLIST_PAGE.CONTENTLIST}?${value}`, {
        state: { domain: domain },
        replace: true,
      });
      fetchData();
    }
  };

  const handleGoBack = () => {
    navigate(-1); // Navigate back in history
  };

  const fetchGradeLevels = async () => {
    const defaultFramework = localStorage.getItem("defaultFramework");
    try {
      const url = `${urlConfig.URLS.PUBLIC_PREFIX}${urlConfig.URLS.FRAMEWORK.READ}/nulp?categories=${urlConfig.params.framework}`;
      const response = await fetch(url);
      const data = await response.json();
      if (
        data.result &&
        data.result.framework &&
        data.result.framework.categories
      ) {
        const gradeLevelCategory = data.result.framework.categories.find(
          (category) => category.identifier === "nulp_gradelevel"
        );
        if (gradeLevelCategory && gradeLevelCategory.terms) {
          const gradeLevelsOptions = gradeLevelCategory.terms.map((term) => ({
            value: term.code,
            label: term.name,
          }));
          setGradeLevels(gradeLevelsOptions);
        }
      }
    } catch (error) {
      console.error("Error fetching grade levels:", error);
      showErrorMessage(t("FAILED_TO_FETCH_DATA"));
    }
  };

  const Fetchdomain = async () => {
    const defaultFramework = localStorage.getItem("defaultFramework");
    try {
      const url = `${urlConfig.URLS.PUBLIC_PREFIX}${urlConfig.URLS.FRAMEWORK.READ}/nulp?orgdetails=${urlConfig.params.framework}`;

      const response = await fetch(url);

      if (response.ok) {
        const responseData = await response.json();
        if (
          responseData.result &&
          responseData.result.framework &&
          responseData.result.framework.categories &&
          responseData.result.framework.categories.length > 0 &&
          responseData.result.framework.categories[0].terms
        ) {
          const domainOptions =
            responseData.result.framework.categories[0].terms.map((term) => ({
              value: term.code,
              label: term.name,
            }));
          setCategory(domainOptions);
          responseData.result.framework.categories[0].terms?.map((term) => {
            setCategory(term);
            if (domainWithImage) {
              domainWithImage.result.form.data.fields.map((imgItem) => {
                if ((term && term.code) === (imgItem && imgItem.code)) {
                  term["image"] = imgItem.image ? imgItem.image : "";
                }
              });
            }
          });
          const domainList =
            responseData?.result?.framework?.categories[0].terms;
          setDomainList(domainList);
        }
      } else {
        showErrorMessage(t("FAILED_TO_FETCH_DATA"));
        throw new Error(t("FAILED_TO_FETCH_DATA"));
      }
    } catch (error) {
      console.log("Error fetching domain data:", error);
      showErrorMessage(t("FAILED_TO_FETCH_DATA"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = (contentId, courseType) => {
    if (courseType === "Course") {
      // navigate("/joinCourse", { state: { contentId } });
      navigate(
        `${routeConfig.ROUTES.JOIN_COURSE_PAGE.JOIN_COURSE}?${contentId}`
      );
    } else {
      navigate(routeConfig.ROUTES.PLAYER_PAGE.PLAYER);
    }
  };

  const handleDomainFilter = (query, domainName) => {
    setDomain(query);
    setPageNumber(1);
    setCurrentPage(1);
    setData({});
    setDomainName(domainName);
    // navigate(`${routeConfig.ROUTES.CONTENTLIST_PAGE.CONTENTLIST}?1`, {
    //   state: { domain: query },
    // });
  };
  const handleSearch = () => {
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
      fetchData();
    }
  };
  // Function to handle data from the child
  const handlefilterChanges = (selectedFilters) => {
    setContentTypeFilter(selectedFilters.contentFilter || []);
    setSubDomainFilter(selectedFilters.subDomainFilter || []);
    fetchData();
  };

  return (
    <div>
      <Header globalSearchQuery={globalSearchQuery} />
      {toasterMessage && <ToasterCommon response={toasterMessage} />}

      <Box
        className="lg-hide header-bg"
        style={{ alignItems: "center", paddingLeft: "23px" }}
      >
        <TextField
          placeholder={t("What do you want to learn today?  ")}
          variant="outlined"
          size="small"
          fullWidth
          value={searchQuery}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          className="searchField"
          InputProps={{
            endAdornment: (
              <IconButton
                type="submit"
                aria-label="search"
                onClick={handleSearch}
              >
                <SearchIcon />
              </IconButton>
            ),
          }}
        />
      </Box>
      <Box>
        {domainList && domainList.length > 0 ? (
          <DomainCarousel
            // className={`my-class ${
            //   activeStates[index] ? "carousel-active-ui" : ""
            // }`}
            onSelectDomain={handleDomainFilter}
            selectedDomainCode={domain}
            domains={domainList}
          />
        ) : (
          <SkeletonLoader />
          //CircularProgress color="inherit" />
        )}
      </Box>

      <Container
        maxWidth="xl"
        className="allContent xs-pb-20  pb-30 content-list eventTab"
      >
        {/* <Box style={{ margin: "20px 0" }}> */}
        {/* <domainCarousel></domainCarousel> */}
        {/* <Box
            style={{ display: "flex", justifyContent: "space-between" }}
            className="filter-domain"
          >
            <Filter
              options={gradeLevels}
              label="Filter by Sub-Domain"
              onChange={handleFilterChange}
            />
            {!domain && (
              <Filter
                options={category}
                label="Filter by Domain"
                onChange={handlefilter}
              />
            )}
          </Box> */}
        {/* </Box> */}
        <Box
          className="d-flex jc-bw mr-20 my-20"
          style={{ alignItems: "center" }}
        >
          {domainName || searchQuery ? (
            <Box
              sx={{ marginTop: "10px", alignItems: "center" }}
              className="d-flex h3-title xs-d-none"
            >
              <Box className="h3-custom-title">
                {domainName && !searchQuery
                  ? t("YOU_ARE_VIEWING_CONTENTS_FOR")
                  : t("YOU_ARE_SHOWING_CONTENTS_FOR")}
              </Box>
              <Box
                sx={{ fontSize: "16px", fontWeight: "600", paddingLeft: "5px" }}
                className="text-blueShade2 h4-custom"
              >
                {domainName || searchQuery
                  ? `${searchQuery || ""}${
                      searchQuery && domainName ? ", " : ""
                    }${domainName || ""}`
                  : ""}
              </Box>
            </Box>
          ) : (
            <Box sx={{ marginTop: "10px" }}></Box>
          )}
          <Link onClick={handleGoBack} className="viewAll xs-hide">
            {t("BACK")}
          </Link>
        </Box>
        <Box className="h3-custom-title">
          {searchQuery &&
            `Showing ${contentCount} out of ${data?.count || 0} results`}
        </Box>

        <Grid container spacing={2} className="pt-8 mt-15">
          <Grid
            item
            xs={12}
            md={4}
            lg={3}
            className="sm-p-25 left-container  flter-btn w-100 xs-m-10"
            style={{ padding: "0", borderRight: "none", background: "#f9fafc" }}
          >
            <DrawerFilter
              SelectedFilters={handlefilterChanges}
              renderedPage="contentlist"
            />
          </Grid>
          <Grid
            item
            xs={12}
            md={8}
            lg={9}
            className=" height-none lg-pl-12 "
            style={{ paddingTop: "0" }}
          >
            <Box textAlign="center" padding="10">
              <Box>
                {isLoading ? (
                  <p>{t("LOADING")}</p>
                ) : error ? (
                  <Alert severity="error">{error}</Alert>
                ) : data && data.content && data.content.length > 0 ? (
                  <div>
                    <Box className="custom-card">
                      {/* <Grid
                      container
                      spacing={2}
                      style={{ margin: "20px 0", marginBottom: "10px" }}
                    > */}
                      {data?.content?.map((items, index) => (
                        // <Grid
                        //   item
                        //   xs={6}
                        //   md={6}
                        //   lg={3}
                        //   style={{ marginBottom: "10px" }}
                        //   key={items.identifier}
                        // >
                        <Box
                          className="custom-card-box jc-bw"
                          key={items.identifier}
                        >
                          <BoxCard
                            items={items}
                            index={index}
                            onClick={() =>
                              handleCardClick(
                                items.identifier,
                                items.contentType
                              )
                            }
                          ></BoxCard>
                        </Box>

                        // </Grid>
                      ))}
                      <div className="blankCard"></div>
                    </Box>
                    {/* </Grid> */}
                    <Pagination
                      count={totalPages}
                      page={pageNumber}
                      onChange={handleChange}
                    />
                  </div>
                ) : (
                  <NoResult /> // Render NoResult component when there are no search results
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
      <FloatingChatIcon />
      <Footer />
    </div>
  );
};

export default ContentList;
