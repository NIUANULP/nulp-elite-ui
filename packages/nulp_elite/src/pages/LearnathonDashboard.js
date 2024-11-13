import React, { useState, useEffect } from "react";
const urlConfig = require("../configs/urlConfig.json");
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  Button,
  Box,
} from "@mui/material";
import Paper from "@mui/material/Paper";
import { useTranslation } from "react-i18next";
const routeConfig = require("../configs/routeConfig.json");
const LearnathonDashboard = () => {
  const [data, setData] = useState([]);
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const [organisationsParticipated, setOrganisationsParticipated] = useState(0);
  const [publishedContent, setPublishedContent] = useState(0);
  const [academia, setAcademia] = useState(0);
  const [statesULBs, setStatesULBs] = useState(0);
  const [industry, setIndustry] = useState(0);
  const [stateCount, setStateCount] = useState(0);
  const { t } = useTranslation();
  useEffect(() => {
    const fetchTotalSubmissions = async () => {
      const assetBody = {
        request: {
          filters: {},
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
        console.log("suceesss----", result);
        console.log(result.result);
        setTotalSubmissions(result.result.totalCount);
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
        console.log("suceesss----", result);
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
  }, []);
  const handleClick = (contentId) => {
    navigate(
      `${routeConfig.ROUTES.PLAYER_PAGE.PLAYER}?id=${contentId}&page=vote`
    );
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
  return (
    <>
      <div style={dashboardStyle}>
        <h1>Learnathon Dashboard</h1>
        <div style={gridStyle}>
          <div style={boxStyle}>
            <h3>Total Submissions</h3>
            <p style={countStyle}>{totalSubmissions}</p>
          </div>
          <div style={boxStyle}>
            <h3>Organisations Participated</h3>
            <p style={countStyle}>{organisationsParticipated}</p>
          </div>
          <div style={boxStyle}>
            <h3>Published Content</h3>
            <p style={countStyle}>{publishedContent}</p>
          </div>
          <div style={boxStyle}>
            <h3>Academia</h3>
            <p style={countStyle}>{academia}</p>
          </div>
          <div style={boxStyle}>
            <h3>States / ULBS etc</h3>
            <p style={countStyle}>{statesULBs}</p>
          </div>
          <div style={boxStyle}>
            <h3>Industry</h3>
            <p style={countStyle}>{industry}</p>
          </div>
          <div style={boxStyle}>
            <h3>State Count</h3>
            <p style={countStyle}>{stateCount}</p>
          </div>
        </div>
      </div>
      <TableContainer component={Paper}>
        <Table aria-label="simple table">
          <TableHead sx={{ background: "#D8F6FF" }}>
            <TableRow>
              <TableCell>{t("SUBMISSION_NAME")}</TableCell>
              <TableCell>{t("VOTING_DEADLINE")}</TableCell>
              <TableCell>{t("VOTE_COUNT")}</TableCell>
              <TableCell>{t("VOTE_NOW")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.title_of_submission}</TableCell>
                <TableCell>{row.name_of_organisation}</TableCell>
                <TableCell>{row.indicative_theme}</TableCell>
                <TableCell>{row.indicative_sub_theme}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {/* <Pagination
          count={27}
          page={pageNumber}
          onChange={handleChange}
        /> */}
    </>
  );
};
export default LearnathonDashboard;
