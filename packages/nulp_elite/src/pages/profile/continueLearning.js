import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import BoxCard from "components/Card";
import FloatingChatIcon from "../../components/FloatingChatIcon";
import { useNavigate, useLocation } from "react-router-dom";
import * as util from "../../services/utilService";
import NoResult from "pages/content/noResultFound";
import Alert from "@mui/material/Alert";
import Pagination from "@mui/material/Pagination";
import appConfig from "../../configs/appConfig.json";
const urlConfig = require("../../configs/urlConfig.json");
import ToasterCommon from "../ToasterCommon";
import { TextField } from "@mui/material";
const routeConfig = require("../../configs/routeConfig.json");
import { Loading } from "@shiksha/common-lib";
const ContinueLearning = () => {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gradeLevels, setGradeLevels] = useState([]);
  const [courseStatus, setCourseStatus] = useState([]);
  const [toasterOpen, setToasterOpen] = useState(false);
  const [toasterMessage, setToasterMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(4); // Number of items per page
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const [orgId, setOrgId] = useState();
  const [framework, setFramework] = useState();
  const { domain } = location.state || {};
  const showErrorMessage = (msg) => {
    setToasterMessage(msg);
    setTimeout(() => {
      setToasterMessage("");
    }, 2000);
    setToasterOpen(true);
  };
  useEffect(() => {
    fetchData();
    fetchUserData();
  }, [filters]);
  const handleFilterChange = (selectedOptions) => {
    const selectedValues = selectedOptions.map((option) => option.value);
    setFilters({ ...filters, se_gradeLevel: selectedValues });
  };
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    const _userId = util.userId();
    const headers = {
      "Content-Type": "application/json",
    };
    try {
      const url = `${urlConfig.URLS.LEARNER_PREFIX}${urlConfig.URLS.COURSE.GET_ENROLLED_COURSES}/${_userId}?orgdetails=${appConfig.Course.contentApiQueryParams.orgdetails}&licenseDetails=${appConfig.Course.contentApiQueryParams.licenseDetails}&fields=${urlConfig.params.enrolledCourses.fields}&batchDetails=${urlConfig.params.enrolledCourses.batchDetails}&contentDetails=${urlConfig.params.enrolledCourses.contentDetails}`;
      const response = await fetch(url, headers);
      const responseData = await response.json();
      setData(responseData.result.courses);
    } catch (error) {
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
      fetchGradeLevels();
    }
  }, [orgId, framework]);

  const fetchGradeLevels = async () => {
    try {
      const url = `${urlConfig.URLS.PUBLIC_PREFIX}${urlConfig.URLS.FRAMEWORK.READ}/${framework}?categories=${urlConfig.params.framework}`;
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

  const filteredCourses = useMemo(() => {
    let filtered = data;

    if (courseStatus.length) {
      filtered = filtered.filter((course) =>
        courseStatus.includes(course.contents.status)
      );
    }

    if (searchQuery) {
      filtered = filtered.filter((course) => {
        const title = course.content?.name || "";
        return title.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }

    return filtered;
  }, [courseStatus, data, searchQuery]);

  const handleCardClick = (contentId, courseType) => {
    if (courseType === "Course") {
      navigate(
        `${routeConfig.ROUTES.JOIN_COURSE_PAGE.JOIN_COURSE}?${contentId}`
      );
    } else {
      navigate(`${routeConfig.ROUTES.PLAYER_PAGE.PLAYER}?id=${contentId}`);
    }
  };
  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCourses.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, itemsPerPage, filteredCourses]);

  return (
    <div>
      {toasterMessage && <ToasterCommon response={toasterMessage} />}
      <Container
        maxWidth="xl"
        className="filter-profile allContentlearning cardheight lg-pr-0"
      >
        {error && (
          <Alert severity="error" className="my-10">
            {error}
          </Alert>
        )}
        <Box style={{ margin: "20px 0 20px -12px" }}>
          <TextField
            fullWidth
            variant="outlined"
            label="Search"
            className="w-33"
            style={{ width: "100%", background: "#fff" }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Box>
        <Box textAlign="center" padding="10" className="mt-30">
          <Box>
            <Grid container spacing={2}>
              <Box className="custom-card profile-card-view w-100">
                {isLoading ? (
                  <Loading message={t("LOADING")} />
                ) : (
                  paginatedCourses.map((items) => (
                    <Box className="custom-card-box" key={items.contentId}>
                      <BoxCard
                        items={items}
                        index={filteredCourses.length}
                        onClick={() =>
                          handleCardClick(
                            items.content.identifier,
                            items.content.primaryCategory
                          )
                        }
                        continueLearning={false}
                      ></BoxCard>
                    </Box>
                  ))
                )}
              </Box>
              <Box>
                {!isLoading && paginatedCourses.length === 0 && (
                  <>
                    <Box style={{ width: "100%" }}>
                      <NoResult className="center-no-result " />
                      <Box className="h5-title">{t("EXPLORE_CONTENT")}</Box>
                    </Box>
                  </>
                )}
              </Box>
              <div className="blankCard"></div>
            </Grid>
          </Box>
          <Pagination
            count={Math.ceil(filteredCourses.length / itemsPerPage)}
            page={currentPage}
            onChange={handlePageChange}
          />
        </Box>
      </Container>
      <FloatingChatIcon />
    </div>
  );
};

export default ContinueLearning;
