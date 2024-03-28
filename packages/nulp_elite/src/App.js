import React from "react";
import "./App.css";
import "./styles/style.css"
import Sample from "pages/Sample";
import Home from "pages/Home";
import Courses from "pages/Courses";
import Coursetest from "pages/CourseTest";
import Search from "pages/Search";

import Contents from "pages/Contents";
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
} from "native-base";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { DEFAULT_THEME, H2 ,initializeI18n} from "@shiksha/common-lib";
import { useTranslation, initReactI18next } from "react-i18next";
import i18n from 'i18next';
import Framework from "pages/Frmework";
import User from "pages/User";
import Registration from "pages/Registration";
import UserPrefData from "pages/UserPrefData";
// import { ChakraProvider } from "@chakra-ui/react";
import Profile from "pages/Profile";
import FAQPage from "pages/FAQPage";
import Certificate from "pages/Certificate";
import AddConnections from "pages/connections/AddConnections"; 
import MyConnections from "pages/connections/MyConnections"; 
import DomainList from "pages/search/DomainList";
import ContentList from "pages/search/ContentList";



function App() {
  // const [t] = useTranslation();
  const [search, setSearch] = React.useState(true);
  const [searchState, setSearchState] = React.useState(false);
  // const theme = extendTheme(DEFAULT_THEME);
  const colors = "";
  const [sortArray, setSortArray] = React.useState([]);
  
  const routes = [

    {
      moduleName: "nulp_elite",
      path: "/home",
      component: Home,
    },
    {
      moduleName: "nulp_elite",
      path: "/contents",
      component: Contents,
    },
    {
      moduleName: "nulp_elite",
      path: "/all",
      component: Courses,
    },
    {
      moduleName: "nulp_elite",
      path: "/sample",
      component: Sample,
    },
    {
      moduleName: "nulp_elite",
      path: "/profile",
      component: Profile,
    },
    {
      moduleName: "nulp_elite",
      path: "/help",
      component: FAQPage,
    },
    {
      moduleName: "nulp_elite",
      path: "/framework",
      component: Framework,
    },
    {
      moduleName: "nulp_elite",
      path: "/registration",
      component: Registration,
    },
    {
      moduleName: "nulp_elite",
      path: "/connections/addConnections",
      component: AddConnections,
    },
    {
      moduleName: "nulp_elite",
      path: "/connections/myConnections",
      component: MyConnections,
    },
    {
      moduleName: "nulp_elite",
      path: "search/domainList",
      component: DomainList,
    },
    {
      moduleName: "nulp_elite",
      path: "search/contentList",
      component: ContentList,
    },
    {
      moduleName: "nulp_elite",
      path: "/userPrefData",
      component: UserPrefData,
    },
    {
      moduleName: "nulp_elite",
      path: "/user",
      component: User,
    },
    {
      moduleName: "nulp_elite",
      path: "/coursetest",
      component: Coursetest,
    },
    {
      moduleName: "nulp_elite",
      path: "/search",
      component: Search,
    },
    {
      moduleName: "nulp_elite",
      path: "/certificate",
      component: Certificate,
    },
  ];
   // public_url="http://localhost:5000"
  //  public_url="https://alt.uniteframework.io"
  // initializeI18n(
  //   ["translation"],
  //   // `${process.env.PUBLIC_URL}/locales/{{lng}}/{{ns}}.json`
  //   // `http://localhost:3300/locales/{{lng}}/{{ns}}.json`
  // );
  initializeI18n(
    ["translation"],
    `${process.env.PUBLIC_URL}/locales/{{lng}}/{{ns}}.json`
  );

  // const resources = {
  //   en: {
  //     translation: {
  //       enTranslation
  //     }
  //   },
  //   hi: {
  //     translation: {
  //       hiTranslation
  //     }
  //   }
  // };
  // console.log(hiTranslation)
  
  // i18n.use(initReactI18next).init({
  //   resources,
  //   lng: 'en',
  
  //   interpolation: {
  //     escapeValue: false
  //   }
  // });


  // return(
  //   // <Box></Box>
  //   <NativeBaseProvider >
  //    <Router routes={routes}>

  //   </Router>
  //    </NativeBaseProvider>
  // // <NativeBaseProvider ><Router><Sample /></Router> </NativeBaseProvider>

  // );
  // <NativeBaseProvider > <Sample /></NativeBaseProvider>;

  // <AppShell routes={routes} AuthComponent={LoginComponent} />;
  return (
    <NativeBaseProvider>
      {/* <ChakraProvider> */}
      {/* <React.Suspense> */}
      {/* <I18nextProvider i18n={i18n}> */}
      {/* <ChakraProvider> */}
        <React.Suspense>
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
        </Router>
        </React.Suspense>
      {/* </ChakraProvider> */}
      {/* </ChakraProvider> */}
      {/* </I18nextProvider> */}
    </NativeBaseProvider>
  );
}

export default App;
