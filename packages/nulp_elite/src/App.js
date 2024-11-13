import React, { useEffect, useState } from "react";
import "./App.css";
import "./styles/style.css";
import { NativeBaseProvider } from "native-base";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { initializeI18n } from "@shiksha/common-lib";
import * as util from "services/utilService";
import Profile from "pages/profile/Profile";
import Certificate from "pages/profile/certificate";
import FAQPage from "pages/FAQPage";
import AddConnections from "pages/connections/AddConnections";
import DomainList from "pages/search/DomainList";
import Registration from "pages/registration/Registration";
import ContentList from "pages/search/ContentList";
import AllContent from "pages/content/AllContent";
import CategoryPage from "pages/content/CategoryPage";
import LearningHistory from "pages/profile/learningHistory";
import continueLearning from "pages/profile/continueLearning";
import JoinCourse from "pages/content/joinCourse";
import Player from "pages/content/Player";
import Otp from "pages/registration/Otp";
import PDFContent from "pages/content/pdf";
import NoResult from "pages/content/noResultFound";
import Message from "pages/connections/message";
import Terms from "pages/terms";
import SelectPreference from "pages/SelectPreference";
import Chat from "pages/connections/chat";
import SampleComponent from "components/SampleComponent";
import EventList from "pages/events/eventList";
import EventDetails from "pages/events/eventDetails";
import Dashboard from "pages/events/dashboard";
import VotingList from "pages/voting/votingList";
import createForm from "pages/voting/createForm";
import VotingDetails from "pages/voting/votingDetails";
import votingDashboard from "pages/voting/votingDashboard";
import pollsDetails from "pages/voting/pollsDetails";
import LernCreatorForm from "pages/learnathon/lernCreatorForm";
const urlConfig = require("./configs/urlConfig.json");
const routeConfig = require("./configs/routeConfig.json");
import PopupForm from "pages/profileData";
import axios from "axios";
import ReactGA from "react-ga4";
import LernModal from "components/learnathon/LernModal";
import LernSubmissionTable from "pages/learnathon/LernSubmissionTable";
import LernVotingList from "pages/learnathon/lernVotingList";
import LernReviewList from "pages/learnathon/lernReviewerList";

function App() {
  // const [t] = useTranslation();
  const [search, setSearch] = React.useState(true);
  const [searchState, setSearchState] = React.useState(false);
  // const theme = extendTheme(DEFAULT_THEME);
  const colors = "";
  const [sortArray, setSortArray] = React.useState([]);
  const [checkPref, setCheckPref] = React.useState(true);
  const _userId = util.userId();
  const [orgId, setOrgId] = useState();
  const [userData, setUserData] = React.useState(false);
  ReactGA.initialize("G-QH3SHT9MTG");

  const routes = [
    {
      moduleName: "nulp_elite",
      path: routeConfig.ROUTES.ALL_CONTENT_PAGE.ALL_CONTENT,
      component: AllContent,
    },
    {
      moduleName: "nulp_elite",
      path: routeConfig.ROUTES.DASHBOARD_PAGE.DASHBOARD,
      component: Dashboard,
    },
    {
      moduleName: "nulp_elite",
      path: routeConfig.ROUTES.POFILE_PAGE.PROFILE,
      component: Profile,
    },
    {
      moduleName: "nulp_elite",
      path: routeConfig.ROUTES.CERTIFICATE_PAGE.CERTIFICATE,
      component: Certificate,
    },
    {
      moduleName: "nulp_elite",
      path: routeConfig.ROUTES.LEARNING_HISTORY_PAGE.LEARNING_HISTORY,
      component: LearningHistory,
    },
    {
      moduleName: "nulp_elite",
      path: routeConfig.ROUTES.CONTINUE_LEARNING_PAGE.CONTINUE_LEARNING,
      component: continueLearning,
    },
    {
      moduleName: "nulp_elite",
      path: routeConfig.ROUTES.HELP_PAGE.HELP,
      component: FAQPage,
    },
    {
      moduleName: "nulp_elite",
      path: routeConfig.ROUTES.ADDCONNECTION_PAGE.ADDCONNECTION,
      component: AddConnections,
    },
    {
      moduleName: "nulp_elite",
      path: routeConfig.ROUTES.DOMAINLIST_PAGE.DOMAINLIST,
      component: DomainList,
    },
    {
      moduleName: "nulp_elite",
      path: routeConfig.ROUTES.CONTENTLIST_PAGE.CONTENTLIST,
      component: ContentList,
    },
    {
      moduleName: "nulp_elite",
      path: routeConfig.ROUTES.JOIN_COURSE_PAGE.JOIN_COURSE,
      component: JoinCourse,
    },
    {
      moduleName: "nulp_elite",
      path: routeConfig.ROUTES.PLAYER_PAGE.PLAYER,
      component: Player,
    },
    {
      moduleName: "nulp_elite",
      path: routeConfig.ROUTES.PDF_PAGE.PDF,
      component: PDFContent,
    },
    {
      moduleName: "nulp_elite",
      path: routeConfig.ROUTES.NORESULT_PAGE.NORESULT,
      component: NoResult,
    },
    {
      moduleName: "nulp_elite",
      path: routeConfig.ROUTES.CERTIFICATE_OLD_PAGE.CERTIFICATE_OLD,
      component: Certificate,
    },
    {
      moduleName: "nulp_elite",
      path: routeConfig.ROUTES.SIGNUP_PAGE.SIGNUP,
      component: Registration,
    },
    {
      moduleName: "nulp_elite",
      path: routeConfig.ROUTES.TERMS_PAGE.TERMS,
      component: Terms,
    },
    {
      moduleName: "nulp_elite",
      path: routeConfig.ROUTES.OTP_PAGE.OTP,
      component: Otp,
    },
    {
      moduleName: "nulp_elite",
      path: routeConfig.ROUTES.VIEW_ALL_PAGE.VIEW_ALL,
      component: CategoryPage,
    },
    {
      moduleName: "nulp_elite",
      path: routeConfig.ROUTES.MESSAGE_PAGE.MESSAGE,
      component: Message,
    },
    {
      moduleName: "nulp_elite",
      path: routeConfig.ROUTES.SELECT_PREFERENCE_PAGE.SELECT_PREFERENCE,
      component: SelectPreference,
    },
    {
      moduleName: "nulp_elite",
      path: routeConfig.ROUTES.CHAT_PAGE.CHAT,
      component: Chat,
    },
    {
      moduleName: "nulp_elite",
      path: routeConfig.ROUTES.EVENTS.EVENT_LIST,
      component: EventList,
    },
    {
      moduleName: "nulp_elite",
      path: routeConfig.ROUTES.EVENTS.EVENT_DETAILS,
      component: EventDetails,
    },
    {
      moduleName: "nulp_elite",
      path: "/webapp/demo",
      component: SampleComponent,
    },
    {
      moduleName: "nulp_elite",
      path: routeConfig.ROUTES.POLL.POLL_LIST,
      component: VotingList,
    },
    {
      moduleName: "nulp_elite",
      path: routeConfig.ROUTES.POLL.POLL_FORM,
      component: createForm,
    },
    {
      moduleName: "nulp_elite",
      path: routeConfig.ROUTES.POLL.POLL_DETAILS,
      component: VotingDetails,
    },
    {
      moduleName: "nulp_elite",
      path: routeConfig.ROUTES.POLL.POLL_DASHBOARD,
      component: votingDashboard,
    },
    {
      moduleName: "nulp_elite",
      path: routeConfig.ROUTES.POLL.POLLS_VIEW_ALL,
      component: pollsDetails,
    },
    {
      moduleName: "nulp_elite",
      path: routeConfig.ROUTES.LEARNATHON.CREATELEARNCONTENT,
      component: LernCreatorForm,
    },
    {
      moduleName: "nulp_elite",
      path: routeConfig.ROUTES.LEARNATHON.MYLERNSUBMISSION,
      component: LernSubmissionTable,
    },
    {
      moduleName: "nulp_elite",
      path: routeConfig.ROUTES.LEARNATHON.LERNVOTINGLIST,
      component: LernVotingList,
    },
    ,
    {
      moduleName: "nulp_elite",
      path: routeConfig.ROUTES.LEARNATHON.LERNREVIEWLIST,
      component: LernReviewList,
    },
  ];

  initializeI18n(
    ["translation"],
    `${process.env.PUBLIC_URL}/locales/{{lng}}/{{ns}}.json`
  );
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const uservData = await util.userData();
        setOrgId(uservData?.data?.result?.response?.rootOrgId);
        fetchDataFramework();
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    const UserData = async () => {
      const url = `${urlConfig.URLS.POFILE_PAGE.USER_READ}`;
      const requestBody = {
        user_ids: [_userId],
      };
      const response = await axios.post(url, requestBody);
      const Data = response.data;
      if (
        (Array.isArray(Data?.result) && Data.result.length === 0) ||
        (Array.isArray(Data?.result) &&
          Data.result.length > 0 &&
          (Data.result[0]?.designation === null ||
            Data.result[0]?.user_type === null ||
            Data.result[0]?.organisation === null))
      ) {
        setUserData(true);
      }
    };
    const fetchData = async () => {
      try {
        const url = `${urlConfig.URLS.LEARNER_PREFIX}${urlConfig.URLS.USER.GET_PROFILE}${_userId}`;
        const response = await fetch(url);
        const data = await response.json();
        const rootOrgId = data.result.response.rootOrgId;
        sessionStorage.setItem("rootOrgId", rootOrgId);
        sessionStorage.setItem(
          "userDomain",
          data.result.response.framework.board
        );
        const rolesData = data.result.response.roles;
        const roles = rolesData?.map((roleObject) => roleObject.role);

        // Convert the roles array to a JSON string
        const rolesJson = JSON.stringify(roles);

        // Save the JSON string to sessionStorage
        sessionStorage.setItem("roles", rolesJson);

        localStorage.setItem(
          "defaultFramework",
          data.result.response.framework.id
        );
        if (data.result.response.framework.id) {
          // setCheckPref(true);
          if (data.result.response.framework.id[0] !== "nulp-domain") {
            setCheckPref(false);
          } else {
            setCheckPref(true);
          }
        } else {
          setCheckPref(false);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchData();
    UserData();
  }, []);

  return (
    <NativeBaseProvider>
      {/* <ChakraProvider> */}
      {/* <React.Suspense> */}
      {/* <I18nextProvider i18n={i18n}> */}
      {/* <ChakraProvider> */}
      <React.Suspense>
        {!checkPref && !userData && (
          <SelectPreference
            isOpen={!checkPref}
            onClose={() => setCheckPref(true)}
          />
        )}
        {userData && (
          <PopupForm
            open={userData}
            handleClose={() => setUserData(false)}
          ></PopupForm>
        )}

        <Router>
          <Routes>
            {routes.map((route, index) => (
              <Route
                key={index}
                path={route.path}
                element={<route.component />}
              />
            ))}
          </Routes>

          <LernModal />
        </Router>
      </React.Suspense>
      {/* </ChakraProvider> */}
      {/* </ChakraProvider> */}
      {/* </I18nextProvider> */}
    </NativeBaseProvider>
  );
}

export default App;
