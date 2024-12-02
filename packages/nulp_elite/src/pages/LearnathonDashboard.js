import React, { useState, useEffect } from "react";
const urlConfig = require("../configs/urlConfig.json");
import ExportToCSV from "components/ExportToCSV";
import Paper from "@mui/material/Paper";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  Box,
  Grid,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import MenuItem from "@mui/material/MenuItem";

import { Edit, Visibility, Delete } from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate, useLocation } from "react-router-dom";
import { Pagination } from "@mui/material";

import Footer from "components/Footer";
import Header from "components/header";
import { Button } from "native-base";
const routeConfig = require("../configs/routeConfig.json");

const LearnathonDashboard = () => {
  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);
  const [exportdata, setExportData] = useState([]);

  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const [organisationsParticipated, setOrganisationsParticipated] = useState(0);
  const [publishedContent, setPublishedContent] = useState(0);
  const [academia, setAcademia] = useState(0);
  const [statesULBs, setStatesULBs] = useState(0);
  const [industry, setIndustry] = useState(0);
  const [stateCount, setStateCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [theme, setTheme] = useState("");
  const [state, setState] = useState("");
  const [status, setStatus] = useState("");
  const [totalParticipants, setTotalParticipants] = useState("");

  const { t } = useTranslation();

  const themeOptions = [
    { value: "Solid Waste Management", label: "Solid Waste Management" },
    { value: "Environment and Climate", label: "Environment and Climate" },
    {
      value: "WASH - Water, Sanitation and Hygiene",
      label: "WASH - Water, Sanitation and Hygiene",
    },
    {
      value: "Urban Planning and Housing",
      label: "Urban Planning and Housing",
    },
    { value: "Transport and Mobility", label: "Transport and Mobility" },
    { value: "Social Aspects", label: "Social Aspects" },
    { value: "Municipal Finance", label: "Municipal Finance" },
    { value: "General Administration", label: "General Administration" },
    {
      value: "Governance and Urban Management",
      label: "Governance and Urban Management",
    },
    { value: "Miscellaneous/ Others", label: "Miscellaneous/ Others" },
  ];

  const statusOptions = [
    { value: "Live", label: "Live" },
    { value: "draft", label: "Draft" },
    { value: "review", label: "Review" },
    { value: "Reject", label: "Reject" },
  ];

  const stateOptions = [
    { value: "Andhra Pradesh", label: "Andhra Pradesh" },
    { value: "Arunachal Pradesh", label: "Arunachal Pradesh" },
    { value: "Assam", label: "Assam" },
    { value: "Bihar", label: "Bihar" },
    { value: "Chhattisgarh", label: "Chhattisgarh" },
    { value: "Goa", label: "Goa" },
    { value: "Gujarat", label: "Gujarat" },
    { value: "Haryana", label: "Haryana" },
    { value: "Himachal Pradesh", label: "Himachal Pradesh" },
    { value: "Jharkhand", label: "Jharkhand" },
    { value: "Karnataka", label: "Karnataka" },
    { value: "Kerala", label: "Kerala" },
    { value: "Madhya Pradesh", label: "Madhya Pradesh" },
    { value: "Maharashtra", label: "Maharashtra" },
    { value: "Manipur", label: "Manipur" },
    { value: "Meghalaya", label: "Meghalaya" },
    { value: "Mizoram", label: "Mizoram" },
    { value: "Nagaland", label: "Nagaland" },
    { value: "Odisha", label: "Odisha" },
    { value: "Punjab", label: "Punjab" },
    { value: "Rajasthan", label: "Rajasthan" },
    { value: "Sikkim", label: "Sikkim" },
    { value: "Tamil Nadu", label: "Tamil Nadu" },
    { value: "Telangana", label: "Telangana" },
    { value: "Tripura", label: "Tripura" },
    { value: "Uttar Pradesh", label: "Uttar Pradesh" },
    { value: "Uttarakhand", label: "Uttarakhand" },
    { value: "West Bengal", label: "West Bengal" },
    { value: "Delhi", label: "Delhi" },
    { value: "Jammu and Kashmir", label: "Jammu and Kashmir" },
  ];
  useEffect(() => {
    const fetchTotalSubmissions = async () => {
      const assetBody = {
        request: {
          filters: {
            ...(state && { state: state }),
            ...(status && { status: status }),
            ...(theme && { indicative_theme: theme }),
          },

          sort_by: {
            created_on: "desc",
          },
          sort_by: {
            created_on: "desc",
          },
          limit: rowsPerPage,
          offset: 10 * (currentPage - 1),
          search: search,
        },
      };
      try {
        const response = await fetch(`${urlConfig.URLS.LEARNATHON.LIST}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(assetBody),
        });
        if (!response.ok) {
          throw new Error("Failed to fetch list");
        }
        const result = await response.json();
        console.log("suceesss----", result);
        console.log(result.result);
        setTotalSubmissions(result.result.totalCount);
        setTotalRows(Math.ceil(result.result.totalCount / 10));

        setData(result.result.data);
        const states = result.result.data
          .map((item) => item.state)
          .filter((state) => state !== null);
        const uniqueStates = [...new Set(states)]; // Removing duplicates
        const stateCount = uniqueStates.length;
        setStateCount(stateCount);
        const organizations = result.result.data
          .map((item) => item.name_of_organisation)
          .filter((org) => org); // Filter out empty strings
        const uniqueOrganizations = [...new Set(organizations)];
        const OrganisationsParticipated = uniqueOrganizations.length;
        setOrganisationsParticipated(OrganisationsParticipated);
        const StatesULBs = result.result.data.filter(
          (item) =>
            item.category_of_participation ===
            "State / UT / SPVs / ULBs / Any Other"
        ).length;
        setStatesULBs(StatesULBs);
        const Academia = result.result.data.filter(
          (item) => item.category_of_participation === "Academia"
        ).length;
        setAcademia(Academia);
        const Industry = result.result.data.filter(
          (item) => item.category_of_participation === "Industry"
        ).length;
        setIndustry(Industry);
      } catch (error) {
        console.log("error---", error);
        // setError(error.message);
      } finally {
        // setIsLoading(false);
      }
      const exportassetBody = {
        request: {
          filters: {
            ...(state && { state: state }),
            ...(status && { status: status }),
            ...(theme && { indicative_theme: theme }),
          },

          sort_by: {
            created_on: "desc",
          },
          sort_by: {
            created_on: "desc",
          },
          limit: 1000000,
          offset: 10 * (currentPage - 1),
          search: search,
        },
      };
      try {
        const response = await fetch(`${urlConfig.URLS.LEARNATHON.LIST}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(exportassetBody),
        });
        if (!response.ok) {
          throw new Error("Failed to fetch list");
        }
        const result = await response.json();
        console.log("suceesss----", result);
        console.log(result.result);
        setTotalSubmissions(result.result.totalCount);
        setTotalRows(Math.ceil(result.result.totalCount / 10));

        setExportData(result.result.data);
        const states = result.result.data
          .map((item) => item.state)
          .filter((state) => state !== null);
        const uniqueStates = [...new Set(states)]; // Removing duplicates
        const stateCount = uniqueStates.length;
        setStateCount(stateCount);
        const organizations = result.result.data
          .map((item) => item.name_of_organisation)
          .filter((org) => org); // Filter out empty strings
        const uniqueOrganizations = [...new Set(organizations)];
        const OrganisationsParticipated = uniqueOrganizations.length;
        setOrganisationsParticipated(OrganisationsParticipated);
        const StatesULBs = result.result.data.filter(
          (item) =>
            item.category_of_participation ===
            "State / UT / SPVs / ULBs / Any Other"
        ).length;
        setStatesULBs(StatesULBs);
        const Academia = result.result.data.filter(
          (item) => item.category_of_participation === "Academia"
        ).length;
        setAcademia(Academia);
        const Industry = result.result.data.filter(
          (item) => item.category_of_participation === "Industry"
        ).length;
        setIndustry(Industry);
      } catch (error) {
        console.log("error---", error);
        // setError(error.message);
      } finally {
        // setIsLoading(false);
      }
    };

    const fetchPublishedContent = async () => {
      const assetBody = {
        request: {
          filters: {
            status: "Live",
          },
          sort_by: {
            created_on: "desc",
          },
        },
      };
      try {
        const response = await fetch(`${urlConfig.URLS.LEARNATHON.LIST}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(assetBody),
        });
        if (!response.ok) {
          throw new Error("Failed to fetch list");
        }
        const result = await response.json();
        console.log("suceesss now----", result);
        console.log(result.result);
        setPublishedContent(result.result.totalCount);
      } catch (error) {
        console.log("error---", error);
        // setError(error.message);
      } finally {
        // setIsLoading(false);
      }
    };
    fetchTotalSubmissions();
    fetchPublishedContent();
    totalParticipations();
  }, [currentPage, rowsPerPage, search, theme, state, status]);
  const totalParticipations = async () => {
    try {
      const url = `${urlConfig.URLS.CHECK_USER_ACCESS}`;
      const response = await fetch(url);
      const data = await response.json();
      setTotalParticipants(data.result.totalCount);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };
  // Inline CSS for the component
  const dashboardStyle = {
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    textAlign: "center",
  };
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
  };
  const boxStyle = {
    backgroundColor: "#F0F0F0",
    borderRadius: "15px",
    padding: "20px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
  };
  const countStyle = {
    fontSize: "24px",
    fontWeight: "bold",
  };
  const handleChange = (event, value) => {
    if (value !== currentPage) {
      setCurrentPage(value);
      fetchTotalSubmissions();
    }
  };
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };
  const handleClearAll = () => {
    setTheme("");
    setState("");
    setStatus("");
    setSearch("");
    fetchTotalSubmissions();
    fetchPublishedContent();
  };

  return (
    <>
      <Header />
      <div style={dashboardStyle}>
        <h1>{t("LERN_DASHBOARD")}</h1>
        <div style={gridStyle}>
          <div style={boxStyle}>
            <h3>{t("TOTAL_PARTICIPANTS")}</h3>
            <p style={countStyle}>{totalParticipants}</p>
          </div>
          <div style={boxStyle}>
            <h3>{t("TOTAL_SUBMISSION")}</h3>
            <p style={countStyle}>{totalSubmissions}</p>
          </div>
          <div style={boxStyle}>
            <h3>{t("ORG_PARTICIPATED")}</h3>
            <p style={countStyle}>{organisationsParticipated}</p>
          </div>
          <div style={boxStyle}>
            <h3>{t("PUBLISHED_COUNT")}</h3>
            <p style={countStyle}>{publishedContent}</p>
          </div>
          <div style={boxStyle}>
            <h3>{t("ACEDEMIA")}</h3>
            <p style={countStyle}>{academia}</p>
          </div>
          <div style={boxStyle}>
            <h3>{t("STATE_ULBS")}</h3>
            <p style={countStyle}>{statesULBs}</p>
          </div>
          <div style={boxStyle}>
            <h3>{t("INDUSTRY")}</h3>
            <p style={countStyle}>{industry}</p>
          </div>
          <div style={boxStyle}>
            <h3>{t("STATE_COUNT")}</h3>
            <p style={countStyle}>{stateCount}</p>
          </div>
        </div>
      </div>

      <Grid xs={12} sm={12} style={dashboardStyle}>
        <Grid item xs={6}>
          <Box
            display="flex"
            sx={{ minWidth: "100px" }}
            gap={1}
            alignItems="center"
          >
            <TextField
              variant="outlined"
              placeholder={t("SEARCH_SUBMISSION")}
              value={search}
              onChange={handleSearchChange}
              InputProps={{
                endAdornment: <SearchIcon />,
              }}
              size="small"
              sx={{ minWidth: "70px", background: "#fff" }}
            />

            <ExportToCSV
              sx={{ minWidth: "30px" }}
              data={exportdata}
              fileName="table_data"
            />
          </Box>
        </Grid>

        {/* Filter Dropdowns */}
        <Grid item xs={6}>
          <Box display="flex" gap={2} alignItems="center">
            <TextField
              select
              variant="outlined"
              label={t("THEME_FILTER")}
              size="small"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              sx={{ background: "#fff", minWidth: "100px" }}
            >
              {themeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              variant="outlined"
              label={t("STATE_FILTER")}
              size="small"
              value={state}
              onChange={(e) => setState(e.target.value)}
              sx={{ background: "#fff", minWidth: "100px" }}
            >
              {stateOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              variant="outlined"
              label={t("STATUS_FILTER")}
              size="small"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              sx={{ background: "#fff", minWidth: "100px" }}
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <Button
              type="button"
              className="viewAll mb-20"
              onClick={handleClearAll}
            >
              {t("CLEAR_ALL")}
            </Button>
          </Box>
        </Grid>

        {/* <Grid item xs={2}>
            <ExportToCSV data={data} fileName="table_data" />        
        </Grid> */}
      </Grid>

      <TableContainer component={Paper}>
        <Table aria-label="simple table">
          <TableHead sx={{ background: "#D8F6FF" }}>
            <TableRow>
              <TableCell>{t("SUBMISSION_NAME")}</TableCell>
              <TableCell>{t("THEME")}</TableCell>
              <TableCell>{t("SUBTHEME")}</TableCell>
              <TableCell>{t("STATE")}</TableCell>
              <TableCell>{t("CITY")}</TableCell>
              <TableCell>{t("ORGANISATION")}</TableCell>
              <TableCell>{t("SUBMISSION_DATE")}</TableCell>
              <TableCell>{t("STATUS")}</TableCell>
              <TableCell>{t("VIEW")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.title_of_submission}</TableCell>
                <TableCell>{row.indicative_theme}</TableCell>
                <TableCell>{row.indicative_sub_theme}</TableCell>
                <TableCell>{row.state}</TableCell>
                <TableCell>{row.city}</TableCell>
                <TableCell>{row.name_of_organisation}</TableCell>
                <TableCell>
                  {formatDate(row.updated_on ? row.updated_on : row.created_on)}
                </TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell>
                  {row.poll_id && row.poll_id != null ? (
                    <IconButton
                      color="primary"
                      onClick={() =>
                        (window.location.href =
                          routeConfig.ROUTES.PLAYER_PAGE.PLAYER +
                          "?id=" +
                          row.learnathon_content_id +
                          "&page=dashboard")
                      }
                      sx={{ color: "#054753" }}
                      className="table-icon"
                    >
                      <Visibility />
                    </IconButton>
                  ) : (
                    <IconButton
                      color="primary"
                      onClick={() =>
                        (window.location.href =
                          routeConfig.ROUTES.PLAYER_PAGE.PLAYER +
                          "?id=" +
                          row.learnathon_content_id +
                          "&page=dashboard")
                      }
                      sx={{ color: "#054753" }}
                      className="table-icon"
                    >
                      <Visibility />
                    </IconButton>
                  )}
                </TableCell>
                {/* <TableCell>{row.indicative_sub_theme}</TableCell>
                <TableCell>{row.name_of_organisation}</TableCell>
                <TableCell>{row.indicative_theme}</TableCell>
                <TableCell>{row.indicative_sub_theme}</TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Pagination
        count={totalRows}
        page={currentPage}
        onChange={handleChange}
      />
      <Footer />
    </>
  );
};
export default LearnathonDashboard;
