import React, { useState, useEffect } from "react";
import URLSConfig from "../../configs/urlConfig.json";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import BoxCard from "components/Card";
import Box from "@mui/material/Box";
import Search from "components/search";
import Filter from "components/filter";
import contentData from "../../assets/contentSerach.json";
import Grid from "@mui/material/Grid";
import Footer from "components/Footer";
import Header from "components/header";
import Container from "@mui/material/Container";
import { contentService } from "@shiksha/common-lib";

const ContentList = (props) => {
  const [search, setSearch] = React.useState(true);
  const [searchState, setSearchState] = React.useState(false);
  // const theme = extendTheme(DEFAULT_THEME);
  const colors = "";
  const [sortArray, setSortArray] = React.useState([]);

  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gradeLevels, setGradeLevels] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { domain } = location.state || {};

  // Example of API Call
  useEffect(() => {
    fetchData();
    fetchGradeLevels(); // Fetch grade levels when component mounts
  }, [filters]);

  const handleFilterChange = (selectedOptions) => {
    const selectedValues = selectedOptions.map((option) => option.value);
    setFilters({ ...filters, se_gradeleverl: selectedValues });
  };

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    // Filters for API
    let requestData = {
      request: {
        filters: {
          status: ["Live"],
          contentType: [
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
          se_boards: [domain],
          se_gradeLevels: filters.se_gradeleverl, // Access selected grade levels from filters state
        },
        offset: null,
        sort_by: {
          lastUpdatedOn: "desc",
        },
      },
    };

    // Convert request data to JSON string
    let data = JSON.stringify(requestData);

    // Headers
    const headers = {
      "Content-Type": "application/json",
    };

    const url = `http://localhost:3000/content/${URLSConfig.URLS.CONTENT.SEARCH}?orgdetails=orgName,email`;
    try {
      const response = await contentService.getAllContents(url, data, headers);
      console.log(response.data.result);
      setData(response.data.result);
    } catch (error) {
      console.log("error---", error);
      setError(error.message);
    } finally {
      console.log("finally---");
      setIsLoading(false);
    }
  };

  const fetchGradeLevels = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/framework/v1/read/nulp?categories=gradeLevel"
      );
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
    }
  };

  return (
    <div>
      <Header />
      <Box sx={{ background: "#2D2D2D", padding: "20px" }}>
        <p
          style={{
            fontSize: "20px",
            fontWeight: "700",
            color: "#fff",
            paddingBottom: "5px",
            margin: "0",
          }}
        >
          Explore content related to your domain. Learn from well curated
          courses and content.
        </p>
        <p
          style={{
            fontSize: "16px",
            fontWeight: "700",
            color: "#C1C1C1",
            margin: "0",
            paddingBottom: "30px",
          }}
        >
          Learn from well curated courses and content.
        </p>
        <Search></Search>
      </Box>

      <Container maxWidth="xxl" role="main" className="container-pb">
        <Box style={{ margin: "20px 0" }}>
          <Filter
            options={gradeLevels}
            label="Filter by Grade Level"
            onChange={handleFilterChange}
          />
        </Box>

        <Box textAlign="center" padding="10">
          <Box sx={{ paddingTop: "30px" }}>
            <Grid
              container
              spacing={2}
              style={{ margin: "20px 0", marginBottom: "10px" }}
            >
              {data &&
                data.content &&
                data.content.map((items) => (
                  <Grid
                    item
                    xs={12}
                    md={6}
                    lg={3}
                    style={{ marginBottom: "10px" }}
                  >
                    <BoxCard items={items}></BoxCard>
                  </Grid>
                ))}
            </Grid>
          </Box>
        </Box>
      </Container>
      <Footer />
    </div>
  );
};
export default ContentList;
