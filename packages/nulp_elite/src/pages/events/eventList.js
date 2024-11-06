import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import EventCard from "components/EventCard";
import Box from "@mui/material/Box";
import { getAllContents } from "services/contentService";
import Grid from "@mui/material/Grid";
import Footer from "components/Footer";
import Header from "components/header";
import Container from "@mui/material/Container";
import Pagination from "@mui/material/Pagination";
import NoResult from "pages/content/noResultFound";
import Alert from "@mui/material/Alert";
import { useTranslation } from "react-i18next";
const urlConfig = require("../../configs/urlConfig.json");
const Events = require("./events.json");
import ToasterCommon from "../ToasterCommon";
import DomainCarousel from "components/domainCarousel";
import domainWithImage from "../../assets/domainImgForm.json";
import DrawerFilter from "components/drawerFilter";
import Tab from "@mui/material/Tab";
import TabContext from "@material-ui/lab/TabContext";
import TabList from "@material-ui/lab/TabList";
import TabPanel from "@material-ui/lab/TabPanel";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import RecentActorsOutlinedIcon from "@mui/icons-material/RecentActorsOutlined";

import * as util from "../../services/utilService";

import FloatingChatIcon from "components/FloatingChatIcon";
import SkeletonLoader from "components/skeletonLoader";
import { Loading } from "@shiksha/common-lib";

const EventList = (props) => {
  const [search, setSearch] = useState(true);
  const location = useLocation();
  const [pageNumber, setPageNumber] = useState(1);
  const [data, setData] = useState();
  const [myData, setMyData] = useState();
  const [filters, setFilters] = useState({});
  const [domainfilter, setDomainfilter] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState([]);
  const navigate = useNavigate();
  const [domain, setDomain] = useState(location.state?.domain || undefined);
  const [domainName, setDomainName] = useState(
    location.state?.domainName || undefined
  );
  const [domainList, setDomainList] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPage, setTotalPage] = useState(1)
  const [currentPage, setCurrentPage] = useState(1);
  const { t } = useTranslation();
  const [toasterOpen, setToasterOpen] = useState(false);
  const [toasterMessage, setToasterMessage] = useState("");
  const [globalSearchQuery, setGlobalSearchQuery] = useState(
    location.state?.globalSearchQuery || undefined
  );
  const [searchQuery, setSearchQuery] = useState(globalSearchQuery || "");
  const [subDomainFilter, setSubDomainFilter] = useState([]);
  const [startDateFilter, setStartDateFilter] = useState([]);
  const [endDateFilter, setEndDateFilter] = useState([]);
  const [valueTab, setValueTab] = React.useState("2");
  const [orgId, setOrgId] = useState();
  const [framework, setFramework] = useState();

  const showErrorMessage = (msg) => {
    setToasterMessage(msg);
    setTimeout(() => {
      setToasterMessage("");
    }, 2000);
    setToasterOpen(true);
  };

  useEffect(() => {
    // fetchAllData();
    fetchMyEvents();
    fetchUserData();
  }, [    subDomainFilter,
    endDateFilter,
    startDateFilter,
    searchQuery,
    domainName,
    domain,
    currentPage,
    subDomainFilter,]);
  useEffect(() => {
    fetchAllData();
  }, [
    subDomainFilter,
    endDateFilter,
    startDateFilter,
    searchQuery,
    domainName,
    domain,
    currentPage,
    subDomainFilter,
  ]);

  const handleChangeTab = (event, newValue) => {
    setCurrentPage(1);
    setValueTab(newValue);
  };

  const handlePageChange = (event, newValue) => {
    setCurrentPage(newValue);
  };
  const handleCardClick = (identifier) => {
    navigate(`/webapp/eventDetails?${identifier}`);
  };
  // Function to handle data from the child
  const handlefilterChanges = (selectedFilters) => {
    setStartDateFilter(selectedFilters.startDate);
    setEndDateFilter(selectedFilters.endDate);
    setSubDomainFilter(selectedFilters.subDomainFilter);
    setSearchQuery(selectedFilters.eventSearch);

    // fetchAllData();
  };
  const handleDomainFilter = (query, domainName) => {
    setDomain(query);
    setPageNumber(1);
    setCurrentPage(1);
    // setData({});
    setDomainName(domainName);
    // fetchAllData();
  };
  const [value, setValue] = React.useState("1");
  let startDate = [];
  if (startDateFilter != null && endDateFilter != null) {
    startDate =
      {
        ">=": startDateFilter,
        "<=": endDateFilter,
      } || [];
  }

  const fetchAllData = async () => {
    console.log("searchQuery", searchQuery);
    let filters = {
      eventVisibility:"Public",
      objectType: ["Event"],
      ...((domainfilter?.se_board != null || domainName != null) && {
        board: domainfilter?.se_board || [domainName],
      }),
      ...(subDomainFilter && { gradeLevel: subDomainFilter }),
      ...(startDate && { startDate: startDate }),
    };

    setError(null);
    let data = JSON.stringify({
      request: {
        status: "Live",
        filters: filters,
        limit: 10,
        query: searchQuery,
        sort_by: { lastPublishedOn: "desc", startDate: "desc" },
        offset: 10 * (currentPage - 1),
      },
    });

    const headers = {
      "Content-Type": "application/json",
    };
    // console.log(data.result.content)

    try {
      const url = `${urlConfig.URLS.CUSTOM_EVENT.CUSTOM_COMPOSITE_SEARCH}`;
      const response = await getAllContents(url, data, headers);
      console.log("All Event ----", response.data.result.Event);
      setData(response.data.result.Event);
      setTotalPages(Math.ceil(response.data.result.count / 10));
    } catch (error) {
      showErrorMessage(t("FAILED_TO_FETCH_DATA"));
    }
  };

  const fetchMyEvents = async () => {
    setIsLoading(true);
    setError(null);
    const _userId = util.userId();
    let data = JSON.stringify({
      request: {
    status: "Live",
    filters: { user_id: _userId ,      ...((domainfilter?.se_board != null || domainName != null) && {
        board: domainfilter?.se_board || [domainName],
      }), ...(subDomainFilter && { gradeLevel: subDomainFilter }),
      ...(startDate && { startDate: startDate }),},
       query: searchQuery,
        limit: 10,
        sort_by: { created_at: "desc" },
        offset: 10 * (currentPage - 1), // Use currentPage for pagination
      },
    });
    const headers = {
      "Content-Type": "application/json",
    };
    try {
      const url = `${urlConfig.URLS.CUSTOM_EVENT.CUSTOM_ENROLL_LIST}`;
      const response = await getAllContents(url, data, headers);
      console.log("My data  ---", response.data.result.event);
      setMyData(response.data.result.event);
      setTotalPage(Math.ceil(response.data.result.totalCount / 10));
    } catch (error) {
      console.log("m data error---", error);
      showErrorMessage(t("FAILED_TO_FETCH_DATA"));
    } finally {
      setIsLoading(false);
    }
  };
  const fetchUserData = async () => {
    try {
      const uservData = await util.userData();

      setOrgId(uservData?.data?.result?.response?.rootOrgId);
      setFramework(uservData?.data?.result?.response?.framework?.id[0]);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };
  useEffect(() => {
    if (orgId && framework) {
      Fetchdomain();
    }
  }, [orgId, framework]);

  const Fetchdomain = async () => {
    const defaultFramework = localStorage.getItem("defaultFramework") || "nulp";
    try {
      const url = `${urlConfig.URLS.PUBLIC_PREFIX}${urlConfig.URLS.FRAMEWORK.READ}/${framework}?orgdetails=${urlConfig.params.framework}`;

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
          const categories = responseData?.result?.framework?.categories;
          const selectedIndex = categories.findIndex(
            (category) => category.code === "board"
          );
          setCategory(domainOptions);
          responseData.result.framework.categories[selectedIndex].terms?.map(
            (term) => {
              setCategory(term);
              if (domainWithImage) {
                domainWithImage.result.form.data.fields.map((imgItem) => {
                  if ((term && term.code) === (imgItem && imgItem.code)) {
                    term["image"] = imgItem.image ? imgItem.image : "";
                  }
                });
              }
            }
          );
          const domainList =
            responseData?.result?.framework?.categories[selectedIndex].terms;
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
  return (
    <div>
      <Header globalSearchQuery={globalSearchQuery} />
      {toasterMessage && <ToasterCommon response={toasterMessage} />}
     <Box>
      <Box>
        {domainList && domainList.length > 0 ? (
          <DomainCarousel
            onSelectDomain={handleDomainFilter}
            selectedDomainCode={domain}
            domains={domainList}
          />
        ) : (
          <SkeletonLoader />
          // <CircularProgress color="inherit" />
        )}
      </Box>
      <Container maxWidth="xl" role="main" className="xs-pb-20">
        <Grid
          container
          spacing={2}
          className="pt-8 mt-2 custom-event-container"
        >
          <Grid
            item
            xs={12}
            md={4}
            lg={3}
            className="sm-p-25 left-container flter-btn w-100"
            style={{
              padding: "0",
              borderRight: "none",
              background: "none",
              boxShadow: "none",
            }}
          >
            <DrawerFilter
              SelectedFilters={handlefilterChanges}
              renderedPage="eventList"
              domainCode={domain}
            />
          </Grid>
          <Grid item xs={12} md={8} lg={9} className="pb-20 pt-0 event-list ">
            <Box textAlign="center" padding="10">
              <Box>
                {isLoading ? (
                   <Loading message={t("LOADING")} />
                ) : error ? (
                  <Alert severity="error">{error}</Alert>
                ) : data ? (
                  <div>
                    <TabContext value={valueTab} className="eventTab">
                      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                        <TabList
                          onChange={handleChangeTab}
                          aria-label="lab API tabs example"
                        >
                          <Tab
                            label={t("MY_EVENTS")}
                            className="tab-text"
                            icon={<RecentActorsOutlinedIcon />}
                            value="1"
                          />
                          <Tab
                            label={t("ALL_EVENTS")}
                            className="tab-text"
                            icon={<PublicOutlinedIcon />}
                            value="2"
                          />
                        </TabList>
                      </Box>
                      <TabPanel value="1" className="mt-15">
                        <Grid
                          container
                          spacing={2}
                          style={{ marginBottom: "5px" }}
                        >
                          {myData && myData.length != 0 ? (
                            myData.map((item, index) => (
                              <Grid
                                item
                                xs={12}
                                md={6}
                                lg={6}
                                style={{
                                  marginBottom: "10px",
                                }}
                                key={item.identifier}
                              >
                                <EventCard
                                  items={item}
                                  index={index}
                                  onClick={() =>
                                    handleCardClick(item.identifier)
                                  }
                                  // onClick={() => alert("hii")}
                                ></EventCard>
                              </Grid>
                            ))
                          ) : (
                            <NoResult />
                          )}
                        </Grid>
                        <Pagination
                          count={totalPage}
                          page={currentPage}
                          onChange={handlePageChange}
                        />
                      </TabPanel>
                      <TabPanel value="2" className="mt-15">
                        <Grid
                          container
                          spacing={2}
                          style={{ marginBottom: "5px" }}
                        >
                          {data ? (
                            data.map((items, index) => (
                              <Grid
                                item
                                xs={12}
                                md={6}
                                lg={6}
                                style={{ marginBottom: "10px" }}
                                key={items.identifier}
                              >
                                <EventCard
                                  items={items}
                                  index={index}
                                  onClick={() =>
                                    handleCardClick(items.identifier)
                                  }
                                ></EventCard>
                              </Grid>
                            ))
                          ) : (
                            <NoResult />
                          )}
                        </Grid>
                        <Pagination
                          count={totalPages}
                          page={currentPage}
                          onChange={handlePageChange}
                        />
                      </TabPanel>
                    </TabContext>
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
      </Box>
      <Footer />
    </div>
  );
};

export default EventList;
