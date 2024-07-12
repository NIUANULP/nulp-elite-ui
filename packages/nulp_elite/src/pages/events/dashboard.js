import React, { useEffect, useState } from "react";
import Footer from "components/Footer";
import Header from "components/header";
import Container from "@mui/material/Container";
import FloatingChatIcon from "../../components/FloatingChatIcon";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { LineChart } from "@mui/x-charts/LineChart";
import { BarChart } from "@mui/x-charts/BarChart";
import { useTranslation } from "react-i18next";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import { Pagination, TextField } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker as MuiDatePicker } from "@mui/x-date-pickers/DatePicker";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import dayjs from "dayjs";
const urlConfig = require("../../configs/urlConfig.json");
import { Checkbox, ListItemText, Chip } from "@material-ui/core";
import { saveAs } from "file-saver";
import * as util from "../../services/utilService";

const Dashboard = () => {
  const { t } = useTranslation();
  const [events, setEvents] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [certificateFilter, setCertificateFilter] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState("");
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [eventCount, setEventCount] = useState({
    totalEvent: 0,
    totalEventInThisMonth: 0,
    totalParticipants: 0,
    totalCreators: 0,
    totalCertifiedUsers: 0,
  });
  const [topEvent, setTopEvent] = useState([]);
  const [topDesignation, setTopDesignation] = useState([]);
  const [startDateFilter, setStartDateFilter] = useState(null);
  const [endDateFilter, setEndDateFilter] = useState(null);
  const [startDateDesignationFilter, setStartDateDesignationFilter] =
    useState(null);
  const [endDateDesignationFilter, setEndDateDesignationFilter] =
    useState(null);
  const [domainList, setDomainList] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState([]);
  const [selectedSubDomain, setSelectedSubDomain] = useState([]);
  const [creator, setCreatorList] = useState([]);
  const [data, setData] = useState(null);
  const [currentEventId, setCurrentEventId] = useState(null);
  const _userId = util.userId();
  const [userData, setUserData] = useState(null);

  const handleDomainChange = (event) => {
    setSelectedDomain(event.target.value);
  };
  const [selectedUser, setSelectedUser] = useState("");
  const handleUserChange = (event) => {
    setSelectedUser(event.target.value);
  };
  const handleSubDomainChange = (event) => {
    setSelectedSubDomain(event.target.value);
  };
  const handleStartDateChange = (date) => {
    setStartDateFilter(date);
  };

  const handleEndDateChange = (date) => {
    setEndDateFilter(date);
  };
  const handleDesignationStartDateChange = (date) => {
    setStartDateDesignationFilter(date);
  };

  const handleDesignationEndDateChange = (date) => {
    setEndDateDesignationFilter(date);
  };
  const convertArrayToCSV = (array) => {
    const keys = Object?.keys(array[0]);
    const csvContent = [
      keys?.join(","), // header row
      ...array?.map((row) => keys?.map((key) => row[key])?.join(",")),
    ]?.join("\n");

    return csvContent;
  };

  const downloadCSV = (event) => {
    const csvContent = convertArrayToCSV(data);
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const fileName = `${data[0]?.eventName}-${event}.csv` || `${event}.csv`;
    saveAs(blob, fileName);
  };

  const eventReports = async (event_id) => {
    try {
      const params = new URLSearchParams({ event_id: event_id });
      const url = `${urlConfig.URLS.EVENT.REPORT}?${params.toString()}`;
      // const url = `https://devnulp.niua.org/event/reports?${params.toString()}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const responseData = await response.json();
      setData(responseData?.result);
      setCurrentEventId(event_id); // Set the current event ID for which data is fetched
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (data && currentEventId) {
      downloadCSV(currentEventId);
      setData(null); // Reset data after download
      setCurrentEventId(null); // Reset current event ID after download
    }
  }, [data, currentEventId]);

  const handleDownloadClick = (event_id) => {
    eventReports(event_id);
  };

  useEffect(() => {
    const fetchOptions = async () => {
      const requestBody = {
        request: {
          filters: {
            objectType: ["Event"],
            se_boards: [null],
            gradeLevel: [],
            startDate: {
              ">=": [],
              "<=": [],
            },
            IssueCerificate: certificateFilter ? certificateFilter : undefined,
            eventVisibility: visibilityFilter ? visibilityFilter : undefined,
            board: selectedDomain ? selectedDomain : undefined,
            gradeLevel: selectedSubDomain ? selectedSubDomain : undefined,
            owner: selectedUser ? selectedUser : undefined,
          },
          query: searchQuery,
          sort_by: {
            lastPublishedOn: "desc",
            startDate: "desc",
          },
          limit: 10,
          offset: 10 * (currentPage - 1),
        },
      };

      try {
        const url = `${urlConfig.URLS.EVENT.GET_LIST}`;
        // const url = `https://devnulp.niua.org/event/list`;
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        let responseData = await response.json();
        console.log(responseData?.result?.result?.Event);
        setTotalCount(responseData?.result?.result?.count);
        setTotalPages(Math.ceil(responseData?.result?.result?.count / 10));

        setEvents(responseData?.result?.result?.Event || []);
        setPage(responseData?.result?.result?.Event?.length);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    const eventList = async () => {
      const requestBody = {
        request: {
          filters: {
            objectType: ["Event"],
          },
          sort_by: {
            lastPublishedOn: "desc",
            startDate: "desc",
          },
          offset: 0,
        },
      };

      try {
        const url = `${urlConfig.URLS.EVENT.GET_LIST}`;
        // const url = `https://devnulp.niua.org/event/list`;
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        let responseData = await response.json();
        console.log(responseData?.result?.result?.Event);
        const eventArray = responseData?.result?.result?.Event;
        const userIds = eventArray?.map((event) => event.owner);
        if (userIds) {
          getCreatorList(userIds);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    const eventCounts = async () => {
      const requestBody = {
        request: {
          filters: {
            objectType: ["Event"],
            se_boards: [null],
            gradeLevel: [],
            startDate: {
              ">=": [],
              "<=": [],
            },
          },
          sort_by: {
            lastPublishedOn: "desc",
            startDate: "desc",
          },
          offset: 0,
        },
      };

      try {
        const url = `${urlConfig.URLS.EVENT.GET_COUNT}`;
        // const url = `https://devnulp.niua.org/event/event_count`;

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        let responseData = await response.json();
        console.log(responseData?.result);
        setEventCount(responseData?.result);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    const topTrendingEvents = async () => {
      try {
        const params = new URLSearchParams({ user: true, designation: true });
        if (startDateFilter && endDateFilter) {
          params.append(
            "fromDate",
            dayjs(startDateFilter).format("YYYY-MM-DD")
          );
          params.append("toDate", dayjs(endDateFilter).format("YYYY-MM-DD"));
        }

        const url = `${
          urlConfig.URLS.EVENT.TOP_TRENDING_EVENT
        }?${params.toString()}`;
        // const url = `https://devnulp.niua.org/event/get_top_trending?${params.toString()}`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const responseData = await response.json();
        console.log(responseData?.result);
        setTopEvent(responseData?.result?.topEvent);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    const topTrendingDesignation = async () => {
      try {
        const params = new URLSearchParams({ user: true, designation: true });

        if (startDateDesignationFilter && endDateDesignationFilter) {
          params.append(
            "fromDate",
            dayjs(startDateDesignationFilter).format("YYYY-MM-DD")
          );
          params.append(
            "toDate",
            dayjs(endDateDesignationFilter).format("YYYY-MM-DD")
          );
        }

        const url = `${
          urlConfig.URLS.EVENT.TOP_TRENDING_EVENT
        }?${params.toString()}`;
        // const url = `https://devnulp.niua.org/event/get_top_trending?${params.toString()}`;
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const responseData = await response.json();
        console.log(responseData?.result);
        setTopDesignation(responseData?.result?.topDesignation);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    const fetchDomain = async () => {
      const defaultFramework =
        localStorage.getItem("defaultFramework") || "nulp";
      try {
        const url = `${urlConfig.URLS.PUBLIC_PREFIX}${urlConfig.URLS.FRAMEWORK.READ}/${defaultFramework}?orgdetails=${urlConfig.params.framework}`;

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
            const domainList =
              responseData?.result?.framework?.categories[0].terms;
            setDomainList(domainList || []);
            setSubCategory(
              responseData?.result?.framework?.categories[1]?.terms || []
            );
          }
        } else {
          throw new Error(t("FAILED_TO_FETCH_DATA"));
        }
      } catch (error) {
        console.log("Error fetching domain data:", error);
      }
    };
    const getCreatorList = async (userIds) => {
      const requestBody = {
        request: {
          filters: {
            status: "1",
            userId: userIds,
          },
        },
      };

      try {
        const url = `${urlConfig.URLS.LEARNER_PREFIX}${urlConfig.URLS.ADMIN.USER_SEARCH}`;
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error(t("FAILED_TO_FETCH_DATA"));
        }

        const responseData = await response.json();
        const content = responseData?.result;
        setCreatorList(content.response.content);
      } catch (error) {
        console.error("Error fetching data:", error);
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
    fetchDomain();
    fetchOptions();
    eventList();
    eventCounts();
    topTrendingEvents();
    topTrendingDesignation();
    fetchData();
  }, [
    currentPage,
    searchQuery,
    certificateFilter,
    visibilityFilter,
    startDateFilter,
    endDateFilter,
    startDateDesignationFilter,
    endDateDesignationFilter,
    selectedDomain,
    selectedSubDomain,
    selectedUser,
    _userId,
  ]);

  const handlePageChange = (event, newValue) => {
    setCurrentPage(newValue);
  };

  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    if (query.length >= 2) {
      setCurrentPage(1);
    } else {
      setSearchQuery("");
    }
  };

  const handleCertificateFilterChange = (event) => {
    setCertificateFilter(event.target.value);
  };
  const handleVisibilityFilterChange = (event) => {
    setVisibilityFilter(event.target.value);
  };
  const xAxisDataa = topEvent?.map((event) => event.event_name);
  const seriesDataa = [
    { data: topEvent?.map((event) => parseInt(event.user_count)) },
  ];
  const xAxisData = topDesignation?.map(
    (designation) => designation.event_name
  );
  const seriesData = [
    {
      data: topDesignation?.map((designation) =>
        parseFloat(designation.user_count)
      ),
    },
  ];
  console.log("000000000000000000000000000000000000000000000", userData);
  const roleNames =
    userData?.result?.response?.roles.map((role) => role.role) || [];
  console.log("1111111111111111111111111111", roleNames);
  // Check for admin roles
  const isAdmin =
    roleNames.includes("SYSTEM_ADMINISTRATION") ||
    roleNames.includes("ORG_ADMIN");
  // Check for content creator role
  const isContentCreator = roleNames.includes("CONTENT_CREATOR");

  return (
    <div>
      <Header />

      <Container
        maxWidth="xl"
        role="main"
        className=" xs-pb-20 mt-12  dashboard mt-32 pt-121"
      >
        <Box className="mb-30 h3-title">
          <DashboardOutlinedIcon
            style={{ paddingRight: "10px", marginBottom: "-4px" }}
          />
          {t("EVENTS_DASHBOARD")}
        </Box>
        <Grid container spacing={2} className="dashboard-cards">
          <Box className="dashboard-card">
            <Box className="h2-title">{t("TOTAl_EVENTS")}</Box>
            <Box className="h1-title fs-40">{eventCount.totalEvent}</Box>
          </Box>

          <Box className="dashboard-card">
            <Box className="h2-title">{t("EVENTS_THIS_MONTH")}</Box>
            <Box className="h1-title fs-40">
              {eventCount.totalEventInThisMonth}
            </Box>
          </Box>

          <Box className="dashboard-card">
            <Box className="h2-title">{t("TOTAL_PARTICIPANTS")}</Box>
            <Box className="h1-title fs-40">{eventCount.totalParticipants}</Box>
          </Box>
          {isAdmin ? (
            <Box className="dashboard-card">
              <Box className="h2-title">{t("TOTAL_CREATORS")}</Box>
              <Box className="h1-title fs-40">{eventCount.totalCreators}</Box>
            </Box>
          ) : isContentCreator ? (
            <Box className="dashboard-card">
              <Box className="h2-title">{t("UPCOMING_EVENTS")}</Box>
              <Box className="h1-title fs-40">{eventCount.upComingEvent}</Box>
            </Box>
          ) : null}
          <Box className="dashboard-card">
            <Box className="h2-title">{t("TOTAL_CERTIFIED_USERS")}</Box>
            <Box className="h1-title fs-40">
              {eventCount.totalCertifiedUsers}
            </Box>
          </Box>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box className="mb-10 h3-title mt-32">
              <TrendingUpOutlinedIcon style={{ paddingRight: "10px" }} />
              {t("TOP_TRENDING_EVENT")}
            </Box>
            <Box className="d-flex">
              <Box>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <MuiDatePicker
                    label="Select Date from"
                    value={startDateFilter}
                    onChange={handleStartDateChange}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </LocalizationProvider>
              </Box>
              <Box>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <MuiDatePicker
                    label="Select Date To"
                    value={endDateFilter}
                    onChange={handleEndDateChange}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </LocalizationProvider>
              </Box>
            </Box>

            <BarChart
              xAxis={[{ scaleType: "band", data: xAxisDataa }]}
              series={seriesDataa}
              axisLeft={{
                title: "Participants",
                titleProps: { fill: "#000", fontSize: 14, fontWeight: "bold" },
              }}
              height={300}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box className="mb-10 h3-title mt-32">
              <TrendingUpOutlinedIcon style={{ paddingRight: "10px" }} />
              {t("TOP_TRENDING_DESIGNATIONS")}
            </Box>
            <Box className="d-flex">
              <Box>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <MuiDatePicker
                    label="Select Date from"
                    value={startDateDesignationFilter}
                    onChange={handleDesignationStartDateChange}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </LocalizationProvider>
              </Box>
              <Box>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <MuiDatePicker
                    label="Select Date To"
                    value={endDateDesignationFilter}
                    onChange={handleDesignationEndDateChange}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </LocalizationProvider>
              </Box>
            </Box>
            <LineChart
              xAxis={[{ data: [1, 4, 6, 8, 10, 12] }]}
              series={seriesData}
              height={300}
            />
          </Grid>
        </Grid>
        <Grid container spacing={2} className="mt-32">
          {isAdmin ? (
            <Grid item xs={6} md={2}>
              <FormControl>
                <InputLabel id="demo-simple-select-label">
                  {t("Created By")}
                </InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={selectedUser}
                  onChange={handleUserChange}
                  label={t("Created By")}
                >
                  {creator?.map((user, index) => (
                    <MenuItem key={index} value={user.userId}>
                      {user.firstName + " " + (user.lastName || "")}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          ) : null}
          <Grid item xs={6} md={2}>
            <FormControl>
              <InputLabel id="demo-simple-select-label">Category</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={selectedDomain}
                onChange={handleDomainChange}
                label="Category"
              >
                {domainList?.map((domain, index) => (
                  <MenuItem key={index} value={domain.code}>
                    {domain.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth>
              <InputLabel id="sub-category-select-label">
                Sub-Category
              </InputLabel>
              <Select
                labelId="sub-category-select-label"
                id="sub-category-select"
                multiple
                value={selectedSubDomain}
                onChange={handleSubDomainChange}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected?.map((value) => (
                      <Chip
                        key={value}
                        label={
                          subCategory.find((item) => item.code === value)?.name
                        }
                      />
                    ))}
                  </Box>
                )}
              >
                {subCategory?.map((domain) => (
                  <MenuItem key={domain.code} value={domain.code}>
                    <Checkbox
                      checked={selectedSubDomain.includes(domain.code)}
                    />
                    <ListItemText primary={domain.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl>
              <InputLabel id="demo-simple-select-label">
                Public/ Invite Only
              </InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={visibilityFilter}
                onChange={handleVisibilityFilterChange}
                label="Public/ Invite Only"
              >
                <MenuItem value="Public">Public</MenuItem>
                <MenuItem value="Private">Invite Only</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl>
              <InputLabel id="demo-simple-select-label">
                Certificate Attached
              </InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={certificateFilter}
                onChange={handleCertificateFilterChange}
                label="Certificate Attached"
              >
                <MenuItem value="Yes">Yes</MenuItem>
                <MenuItem value="No">No</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2} className="search-event">
            <TextField
              label="Search By Event Name"
              id="outlined-basic"
              variant="outlined"
              fullWidth
              margin="normal"
              onChange={handleSearchChange}
            />
          </Grid>
        </Grid>
        <TableContainer component={Paper} className="lg-mb-20">
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead sx={{ background: "#f4efe3" }}>
              <TableRow>
                <TableCell>S.No.</TableCell>
                <TableCell align="center">Event Name</TableCell>
                <TableCell align="center">Event Date</TableCell>
                <TableCell align="center">No. of Participants</TableCell>
                <TableCell align="center">Certificate Attached</TableCell>
                <TableCell align="center">Creator</TableCell>
                <TableCell align="center">Download Report</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {events.map((event, index) => (
                <TableRow
                  key={event.identifier}
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                  }}
                >
                  <TableCell component="th" scope="row">
                    {index + 1}
                  </TableCell>
                  <TableCell align="center">{event.name}</TableCell>
                  <TableCell align="center">
                    {new Date(event.startDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="center">
                    {event.totalParticipants}
                  </TableCell>
                  <TableCell align="center">{event.IssueCerificate}</TableCell>
                  <TableCell align="center">{event.EventOrganisedby}</TableCell>
                  <TableCell align="center">
                    <FileDownloadOutlinedIcon
                      onClick={() => handleDownloadClick(event.identifier)}
                      className="text-primary"
                      style={{ cursor: "pointer" }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        Showing {page} of {totalCount} Entries
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
        />
      </Container>
      <FloatingChatIcon />
      <Footer />
    </div>
  );
};

export default Dashboard;
