import React, { useState, useEffect } from "react";
import axios from "axios";
import { contentService } from "@shiksha/common-lib";
import URLSConfig from "../configs/urlConfig.json";
import { useTranslation } from "react-i18next";
import{changeLanguage} from "i18next";
import {
  Layout,
  IconByName,
  SearchLayout,
  FilterButton,
  overrideColorTheme,
} from "@shiksha/common-lib";
import {
  NativeBaseProvider,
  Box,
  Stack,
  VStack,
  Text,
  HStack,
  Button,
  extendTheme,
  Actionsheet,
  ScrollView,
  Heading,
  useDisclose,
  Menu,
  Image,
} from "native-base";

import { Link, useParams,useNavigate } from "react-router-dom";

const Contents = () => {
   const { t } = useTranslation();
  const [search, setSearch] = React.useState(true);
  const [searchState, setSearchState] = React.useState(false);
  // const theme = extendTheme(DEFAULT_THEME);
  const colors = "";
  const [sortArray, setSortArray] = React.useState([]);

  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Example of API Call
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      // Filters for API
      let data = JSON.stringify({
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
          },
          offset: null,
          sort_by: {
            lastUpdatedOn: "desc",
          },
        },
      });

      // Headers
      const headers = {
        "Content-Type": "application/json",
      };

      const url = `http://localhost:3000/content/${URLSConfig.URLS.CONTENT.SEARCH}?orgdetails=orgName,email`;
      try {
        const response = await contentService.getAllContents(
          url,
          data,
          headers
        );
        console.log(response.data.result);
        setData(response.data.result);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  const navigateToCourse = () => {};
  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
  };


  return (
    <Layout
      isDisabledAppBar={true}
      _header={{
        rightIcon: (
          <HStack paddingBottom={"25px"}>
            <IconByName name="CloseCircleFillIcon" />
          </HStack>
        ),
        customeComponent: (
          <Box flex={1} minH={"40px"}>
            <HStack>
              <VStack position={"relative"} padding="10px" top={"10px"}>
                <Menu
                  w="160"
                  trigger={(triggerProps) => {
                    return (
                      <Button
                        alignSelf="center"
                        variant="solid"
                        {...triggerProps}
                      >
                        <IconByName size="20px" name="MenuFillIcon" />
                      </Button>
                    );
                  }}
                >
                   <Menu.Item onPress={(item) => navigate("/help")}>
                    {t("HELP")}
                  </Menu.Item>
                  <Menu.Item onPress={(item) => navigate("/logoff")}>
                    {t("LOGOUT")}                    
                  </Menu.Item>
                 
                 
                </Menu>
              </VStack>
              <VStack></VStack>
              <VStack>
                <Image
                  source={require("../assets/nulp_logo.jpeg")}
                  alt=""
                  size="sm"
                />
              </VStack>
            </HStack>

            {/* <Right> */}
            <Box position={"absolute"} right={"20px"} top={"10px"}>
              <Menu
                w="160"
                trigger={(triggerProps) => {
                  return (
                    <Button
                      alignSelf="center"
                      variant="solid"
                      {...triggerProps}
                    >
                      {t("LANGUAGE")}
                    </Button>
                  );
                  // }}>
                }}
              >
                <Menu.Item onPress={(item) => changeLanguage('en')}>{t("ENGLISH")}</Menu.Item>
                <Menu.Item onPress={(item) => changeLanguage('hi')}>{t("HINDI")}</Menu.Item>
              </Menu>
            </Box>
          </Box>
        ),
      }}
      subHeader={
        <Link to="/" style={{ textDecoration: "none" }}>
          <HStack space="4" justifyContent="space-between">
            <VStack>
              <SearchLayout
                {...{
                  search,
                  setSearch,
                  // minStringLenght: 3,
                  notFoundMessage: "TYPE_TO_START_SEARCHING_LEARNING",
                  onCloseSearch: setSearchState,
                }}
              ></SearchLayout>
            </VStack>
          </HStack>
        </Link>
      }
      _subHeader={{ size: "20px" }}
      _footer={{
        menues: [
          {
            title: "Search",
            icon: "SearchLineIcon",
            route: "/contents",
          },
          {
            title: "Contents",
            icon: "BookOpenLineIcon",
            route: "/all",
          },
          {
            title: "Connections",
            icon: "TeamLineIcon",
            route: "/home",
          },
          {
            title: "Profie",
            icon: "AccountCircleLineIcon",
            route: "/profile",
          },
        ],
      }}
    >
      <Box textAlign="center" padding="10">
        <Heading as="h1" size="2xl" marginBottom="4">
          {t("WELCOME_TEXT")}
        </Heading>
        {/* <Text fontSize="xl" marginBottom="8">
          Enhance your knowledge and skills with our diverse range of courses
          and content.
        </Text> */}
        <Button colorScheme="blue" size="lg" onClick={navigateToCourse()}>
         {t( "EXPLORE_COURSES")}
        </Button>

        {isLoading && <p>Loading...</p>}
        {error && <p>Error: {error}</p>}
        {Object.keys(data).map((key) => (
          <div key={key}>
            <p>
              {key}: {JSON.stringify(data[key])}
            </p>
          </div>
        ))}
      </Box>

       {/* <Routes>
      //  <Route path="/" element={<Home />} />
      //  <Route path="/Contents" element={<Contents />} />
      //  <Route path="/Courses" element={<Courses />} />
      //  <Route path="/Sample" element={<Sample />} />
      // </Routes>     */}
     </Layout>
    //  <Box>HERE</Box>
  );
};

export default Contents;