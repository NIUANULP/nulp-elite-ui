import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import VotingCard from "../../components/VotingCard";
import Search from "components/search";
import Filter from "components/filter";
import Grid from "@mui/material/Grid";
import Footer from "components/Footer";
import Header from "components/header";
import Container from "@mui/material/Container";
import Pagination from "@mui/material/Pagination";
import NoResult from "pages/content/noResultFound";
import Alert from "@mui/material/Alert";
import ToasterCommon from "../ToasterCommon";
import VotingDrawerFilter from "../../components/VotingDrawerFilter";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
// import TabContext from "@material-ui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import RecentActorsOutlinedIcon from "@mui/icons-material/RecentActorsOutlined";
import FloatingChatIcon from "components/FloatingChatIcon";
const urlConfig = require("../../configs/urlConfig.json");

const VotingList = () => {
  const [toasterOpen, setToasterOpen] = useState(false);
  const [toasterMessage, setToasterMessage] = useState("");
  const [valueTab, setValueTab] = useState("2");
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();
  const location = useLocation();
  const globalSearchQuery = location.state?.globalSearchQuery || undefined;
  const [filters, setFilters] = useState({
    searchTerm: "",
    selectedStartDate: null,
    selectedEndDate: null,
    status: ["Live"],
  });
  const [finalFilters, setFinalFilters] = useState({});

  const handleFilterChange = (newFilters) => {
    const formatDateToISO = (dateStr) => {
      const localDate = new Date(dateStr);
      localDate.setUTCHours(0, 0, 0, 0);
      return localDate.toISOString();
    };

    const formattedFilters = {
      ...newFilters,
      selectedStartDate: newFilters.selectedStartDate
        ? formatDateToISO(newFilters.selectedStartDate)
        : null,
      selectedEndDate: newFilters.selectedEndDate
        ? formatDateToISO(newFilters.selectedEndDate)
        : null,
    };
    setFilters(formattedFilters);
  };

  const fetchPolls = async (visibility) => {
    setIsLoading(true);
    setError(null);

    const requestBody = {
      request: {
        filters: {
          visibility,
          status: filters.status || ["Live"],
          from_date: filters.selectedStartDate || "",
          to_date: filters.selectedEndDate || "",
        },
        search: filters.searchTerm || "",
        sort_by: {
          created_at: "desc",
          start_date: "desc",
        },
        offset: (currentPage - 1) * 10,
        limit: 10,
      },
    };

    try {
      const response = await fetch(
        `${urlConfig.URLS.POLL.LIST}?list_page=true`,
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
      setData(result.result.data);
      setTotalPages(Math.ceil(result.result.totalCount / 10));
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const visibility = valueTab === "1" ? "private" : "public";
    fetchPolls(visibility);
  }, [filters, currentPage, valueTab]);

  const handleCardClick = (poll_id) => {
    navigate(`/webapp/pollDetails?${poll_id}`);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleTabChange = (event, newValue) => {
    setValueTab(newValue);
    setCurrentPage(1); // Reset to the first page when tab changes
  };

  return (
    <div>
      <Header globalSearchQuery={globalSearchQuery} />
      {toasterMessage && <ToasterCommon response={toasterMessage} />}
      <Container maxWidth="xl" role="main" className="xs-pb-20 votingList">
        <Grid
          container
          spacing={2}
          className="pt-8 mt-2 custom-event-container min-472"
          style={{ paddingTop: "0" }}
        >
          <Grid
            item
            xs={12}
            md={4}
            lg={3}
            className="sm-p-25 left-container flter-btn w-100 my-20"
            style={{
              padding: "0",
              borderRight: "none",
              background: "none",
              boxShadow: "none",
            }}
          >
            <VotingDrawerFilter onFilterChange={handleFilterChange} />
          </Grid>
          <Grid item xs={12} md={8} lg={9} className="pb-20 pt-0 event-list">
            <Box textAlign="center" padding="10">
              <Box>
                <div>
                  <TabContext value={valueTab} className="eventTab">
                    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                      <TabList
                        onChange={handleTabChange}
                        aria-label="lab API tabs example"
                        className="jc-center"
                        style={{ justifyContent: "center" }}
                      >
                        <Tab
                          label="Private Polls"
                          className="tab-text"
                          icon={<RecentActorsOutlinedIcon />}
                          value="1"
                        />
                        <Tab
                          label="All Polls"
                          className="tab-text"
                          icon={<PublicOutlinedIcon />}
                          value="2"
                        />
                      </TabList>
                    </Box>
                    {isLoading ? (
                      <p>Loading...</p>
                    ) : error ? (
                      <Alert severity="error">{error}</Alert>
                    ) : data && data?.length ? (
                      <TabPanel value="1" className="mt-15">
                        <Grid
                          container
                          spacing={2}
                          style={{ marginBottom: "5px" }}
                        >
                          {data &&
                            data.map((items, index) => (
                              <Grid
                                item
                                xs={12}
                                md={6}
                                lg={6}
                                style={{ marginBottom: "10px" }}
                                key={items.poll_id}
                              >
                                <VotingCard
                                  items={items}
                                  index={index}
                                  onClick={() => handleCardClick(items.poll_id)}
                                />
                              </Grid>
                            ))}
                        </Grid>
                      </TabPanel>
                    ) : (
                      <NoResult />
                    )}
                    <TabPanel value="2" className="mt-15">
                      <Grid
                        container
                        spacing={2}
                        style={{ marginBottom: "5px" }}
                      >
                        {data &&
                          data.map((items, index) => (
                            <Grid
                              item
                              xs={12}
                              md={6}
                              lg={6}
                              style={{ marginBottom: "10px" }}
                              key={items.poll_id}
                            >
                              <VotingCard
                                items={items}
                                index={index}
                                onClick={() => handleCardClick(items.poll_id)}
                              />
                            </Grid>
                          ))}
                      </Grid>
                    </TabPanel>
                  </TabContext>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                  />
                </div>
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

export default VotingList;
