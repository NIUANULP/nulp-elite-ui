import React, { useEffect, useState } from "react";
import Header from "components/header";
import Footer from "components/Footer";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Avatar from "@mui/material/Avatar";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ImageNotSupportedOutlinedIcon from "@mui/icons-material/ImageNotSupportedOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import PersonSearchOutlinedIcon from "@mui/icons-material/PersonSearchOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ReplayIcon from "@mui/icons-material/Replay";
import axios from "axios";
import Unauthorized from "../Unauthorized";

const urlConfig = require("../../configs/urlConfig.json");

const ADMIN_ROLES = new Set(["SYSTEM_ADMINISTRATION"]);

const STEPS = [
  "Select User",
  "Select Course",
  "Batch & Certificate",
  "Review & Issue",
];

const userDisplayName = (user) => {
  if (!user) return "";
  return `${user.firstName || ""} ${user.lastName || ""}`.trim();
};

const userInitials = (user) => {
  if (!user) return "";
  return `${(user.firstName || "")[0] || ""}${(user.lastName || "")[0] || ""}`;
};

const courseThumbnail = (course) =>
  course?.appIcon || course?.thumbnail || course?.posterImage;

const ManualCertificate = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [issued, setIssued] = useState(null);

  const [userQuery, setUserQuery] = useState("");
  const [userResults, setUserResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [userOffset, setUserOffset] = useState(0);

  const [courseQuery, setCourseQuery] = useState("");
  const [courseResults, setCourseResults] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchingCourses, setSearchingCourses] = useState(false);
  const [courseOffset, setCourseOffset] = useState(0);

  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [loadingBatches, setLoadingBatches] = useState(false);

  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [previewError, setPreviewError] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const [isIssuing, setIsIssuing] = useState(false);

  useEffect(() => {
    const roles = JSON.parse(sessionStorage.getItem("roles") || "[]");
    const admin = Array.isArray(roles) && roles.some((r) => ADMIN_ROLES.has(r));
    setIsAdmin(admin);
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => searchUsers(true), 450);
    return () => clearTimeout(timer);
  }, [userQuery]);

  useEffect(() => {
    const timer = setTimeout(() => searchCourses(true), 450);
    return () => clearTimeout(timer);
  }, [courseQuery]);

  const clearFeedback = () => setError(null);

  const setUser = (user) => {
    setSelectedUser(user);
    clearFeedback();
  };

  const setCourse = (course) => {
    setSelectedCourse(course);
    void loadBatches(course?.identifier);
    clearFeedback();
  };

  const searchUsers = async (reset = true) => {
    if (!userQuery.trim()) {
      if (reset) setUserResults([]);
      return;
    }
    setSearchingUsers(true);
    try {
      const url = `${urlConfig.URLS.LEARNER_PREFIX}${urlConfig.URLS.ADMIN.USER_SEARCH}`;
      const request = {
        request: {
          query: userQuery,
          filters: {},
          limit: 20,
          offset: reset ? 0 : userOffset,
          softConstraints: {},
        },
      };
      const response = await axios.post(url, request);
      const content =
        response?.data?.result?.response?.content ||
        response?.data?.result?.content ||
        [];
      setUserResults((prev) => (reset ? content : [...prev, ...content]));
      setUserOffset(reset ? content.length : userOffset + content.length);
    } catch (e) {
      console.error("Error searching users:", e);
      setError("Failed to search users. Please try again.");
      if (reset) setUserResults([]);
    } finally {
      setSearchingUsers(false);
    }
  };

  const searchCourses = async (reset = true) => {
    if (!courseQuery.trim()) {
      if (reset) setCourseResults([]);
      return;
    }
    setSearchingCourses(true);
    try {
      const url = `${urlConfig.URLS.PUBLIC_PREFIX}${urlConfig.URLS.CONTENT.SEARCH}`;
      const request = {
        request: {
          query: courseQuery,
          filters: {
            contentType: ["Course"],
            status: ["Live"],
          },
          limit: 20,
          offset: reset ? 0 : courseOffset,
          fields: [
            "name",
            "identifier",
            "description",
            "primaryCategory",
            "appIcon",
            "thumbnail",
            "posterImage",
          ],
        },
      };
      const response = await axios.post(url, request);
      const content = response?.data?.result?.content || [];
      setCourseResults((prev) =>
        reset ? content : [...prev, ...content]
      );
      setCourseOffset(reset ? content.length : courseOffset + content.length);
    } catch (e) {
      console.error("Error searching courses:", e);
      setError("Failed to search courses. Please try again.");
      if (reset) setCourseResults([]);
    } finally {
      setSearchingCourses(false);
    }
  };

  const loadBatches = async (courseId) => {
    clearFeedback();
    setLoadingBatches(true);
    setBatches([]);
    setSelectedBatchId("");
    setSelectedBatch(null);
    setTemplates([]);
    setSelectedTemplate(null);
    setPreviewError(false);
    if (!courseId) {
      setLoadingBatches(false);
      return;
    }
    try {
      const url = `${urlConfig.URLS.LEARNER_PREFIX}${urlConfig.URLS.BATCH.GET_BATCHS}`;
      const response = await axios.post(url, {
        request: {
          filters: { courseId },
          sort_by: { createdDate: "desc" },
        },
      });
      const content = response?.data?.result?.response?.content || [];
      setBatches(content);
      if (content.length > 0) applyBatch(content[0]);
    } catch (e) {
      console.error("Error fetching batches:", e);
      setError("Failed to fetch batches for the course.");
    } finally {
      setLoadingBatches(false);
    }
  };

  const applyBatch = (batch) => {
    const certTemplates =
      batch?.cert_templates || batch?.certTemplates || {};
    const tplList = Object.keys(certTemplates).map((id) => ({
      id,
      ...certTemplates[id],
    }));
    setSelectedBatch(batch);
    setSelectedBatchId(batch.batchId);
    setTemplates(tplList);
    setPreviewError(false);
    if (tplList.length > 0) setSelectedTemplate(tplList[0]);
    else setSelectedTemplate(null);
  };

  const handleBatchChange = (batchId) => {
    const batch = batches.find((b) => b.batchId === batchId);
    if (batch) applyBatch(batch);
  };

  const issueCertificate = async () => {
    const template = selectedTemplate;
    setIsIssuing(true);
    setConfirmOpen(false);
    clearFeedback();
    try {
      const rcSearchUrl = `${urlConfig.URLS.LEARNER_PREFIX}${urlConfig.URLS.CERTIFICATE.CERTIF_SEARCH}`;
      const dupRes = await axios.post(rcSearchUrl, {
        filters: { recipient: { id: { eq: selectedUser.userId } } },
      });
      const existingCerts = Array.isArray(dupRes.data)
        ? dupRes.data
        : dupRes.data?.result?.response?.content ||
          dupRes.data?.result?.certificates ||
          dupRes.data?.certificates ||
          [];
      const alreadyIssued = existingCerts.some(
        (c) => c?.training?.id === selectedCourse.identifier
      );
      if (alreadyIssued) {
        setError("Certificate already issued for this user and course.");
        setActiveStep(3);
        setIsIssuing(false);
        return;
      }

      const payload = {
        recipient: {
          id: selectedUser.userId,
          name: userDisplayName(selectedUser),
          type: "user",
        },
        issuer: template.issuer,
        training: {
          id: selectedCourse.identifier,
          name: selectedCourse.name,
          type: "Course",
          batchId: selectedBatchId,
        },
        templateUrl: template.url,
        status: "ACTIVE",
        signatory: template.signatoryList || template.signatory,
        certificateLabel: template.name || selectedCourse.name,
        issuedOn: new Date().toISOString(),
      };

      const url = urlConfig.URLS.CERTIFICATE.CUSTOM_CERTIFICATE_CREATE_MANUAL;
      const response = await axios.post(url, payload);
      if (response.data.responseCode === "OK") {
        setIssued({
          certificateName: template.name || selectedCourse.name,
          user: selectedUser,
          course: selectedCourse,
          batchId: selectedBatchId,
          date: new Date().toLocaleString(),
        });
      } else {
        setError(response.data.params?.errmsg || "Failed to issue certificate.");
        setActiveStep(3);
      }
    } catch (e) {
      console.error("Error issuing certificate:", e);
      setError(
        e?.response?.data?.params?.errmsg ||
          e?.message ||
          "Failed to issue certificate."
      );
      setActiveStep(3);
    } finally {
      setIsIssuing(false);
    }
  };

  const handleNext = () => {
    clearFeedback();
    if (activeStep === 0 && !selectedUser) {
      setError("Select a user to continue.");
      return;
    }
    if (activeStep === 1 && !selectedCourse) {
      setError("Select a course to continue.");
      return;
    }
    if (activeStep === 2 && templates.length === 0) {
      setError("Select a batch that has a certificate template.");
      return;
    }
    if (activeStep === 2 && !selectedTemplate) {
      setError("Select a certificate template to continue.");
      return;
    }
    if (activeStep === 3) {
      setConfirmOpen(true);
      return;
    }
    setActiveStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    clearFeedback();
    setActiveStep((s) => Math.max(s - 1, 0));
  };

  const canNext = () => {
    if (activeStep === 0) return !!selectedUser;
    if (activeStep === 1) return !!selectedCourse;
    if (activeStep === 2) return !!selectedTemplate;
    return true;
  };

  const resetForm = () => {
    setActiveStep(0);
    setUserQuery("");
    setUserResults([]);
    setSelectedUser(null);
    setCourseQuery("");
    setCourseResults([]);
    setSelectedCourse(null);
    setBatches([]);
    setSelectedBatchId("");
    setSelectedBatch(null);
    setTemplates([]);
    setSelectedTemplate(null);
    setPreviewError(false);
    setConfirmOpen(false);
    clearFeedback();
    setIssued(null);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAdmin) {
    return <Unauthorized />;
  }

  const renderUserStep = () => (
    <Box>
      <TextField
        fullWidth
        size="small"
        placeholder="Search user by name or ID"
        value={userQuery}
        onChange={(e) => setUserQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") void searchUsers(true);
        }}
        sx={{ mb: 1 }}
        InputProps={{
          endAdornment: searchingUsers ? <CircularProgress size={18} /> : null,
        }}
      />
      {selectedUser && (
        <Chip
          sx={{ mb: 1 }}
          icon={<CheckCircleOutlineIcon />}
          color="primary"
          label={userDisplayName(selectedUser)}
          onDelete={() => setUser(null)}
          variant="outlined"
        />
      )}
      {!searchingUsers && userResults.length === 0 && userQuery && (
        <Alert
          severity="info"
          icon={<PersonSearchOutlinedIcon />}
          sx={{ mb: 1 }}
        >
          No users found for "{userQuery}".
        </Alert>
      )}
      <Box sx={{ maxHeight: 300, overflowY: "auto" }}>
        <List disablePadding>
          {userResults.slice(0, 20).map((u) => {
            const isSelected = selectedUser?.userId === u.userId;
            return (
              <ListItem key={u.userId} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => setUser(u)}
                  selected={isSelected}
                  sx={{
                    borderRadius: 1,
                    border: isSelected
                      ? "1px solid #1976d2"
                      : "1px solid transparent",
                    bgcolor: isSelected
                      ? "rgba(25,118,210,0.06)"
                      : "transparent",
                  }}
                >
                  <ListItemAvatar>
                    <Avatar src={u.avatar}>{userInitials(u)}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={userDisplayName(u)}
                    secondary={
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        component="span"
                      >
                        {u.userId}
                      </Typography>
                    }
                  />
                  {isSelected && <CheckCircleOutlineIcon color="primary" />}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
      {userResults.length >= 20 && (
        <Box display="flex" justifyContent="center" mt={1}>
          <Button
            size="small"
            onClick={() => searchUsers(false)}
            disabled={searchingUsers}
          >
            Load more
          </Button>
        </Box>
      )}
    </Box>
  );

  const renderCourseStep = () => (
    <Box>
      <TextField
        fullWidth
        size="small"
        placeholder="Search course by name"
        value={courseQuery}
        onChange={(e) => setCourseQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") void searchCourses(true);
        }}
        sx={{ mb: 1 }}
        InputProps={{
          endAdornment: searchingCourses ? (
            <CircularProgress size={18} />
          ) : null,
        }}
      />
      {selectedCourse && (
        <Chip
          sx={{ mb: 1 }}
          icon={<CheckCircleOutlineIcon />}
          color="primary"
          label={selectedCourse.name}
          onDelete={() => {
            setSelectedCourse(null);
            setBatches([]);
            setTemplates([]);
            setSelectedTemplate(null);
            setSelectedBatchId("");
            setSelectedBatch(null);
          }}
          variant="outlined"
        />
      )}
      {!searchingCourses && courseResults.length === 0 && courseQuery && (
        <Alert
          severity="info"
          icon={<MenuBookOutlinedIcon />}
          sx={{ mb: 1 }}
        >
          No courses found for "{courseQuery}".
        </Alert>
      )}
      <Box sx={{ maxHeight: 300, overflowY: "auto" }}>
        <List disablePadding>
          {courseResults.slice(0, 20).map((c) => {
            const isSelected = selectedCourse?.identifier === c.identifier;
            return (
              <ListItem key={c.identifier} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => setCourse(c)}
                  selected={isSelected}
                  sx={{
                    borderRadius: 1,
                    border: isSelected
                      ? "1px solid #1976d2"
                      : "1px solid transparent",
                    bgcolor: isSelected
                      ? "rgba(25,118,210,0.06)"
                      : "transparent",
                  }}
                >
                  <ListItemAvatar>
                    {courseThumbnail(c) ? (
                      <CardMedia
                        component="img"
                        src={courseThumbnail(c)}
                        alt={c.name}
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1,
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <Avatar variant="rounded">
                        <SchoolOutlinedIcon />
                      </Avatar>
                    )}
                  </ListItemAvatar>
                  <ListItemText
                    primary={c.name}
                    secondary={
                      <React.Fragment>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          component="span"
                        >
                          {c.identifier}
                        </Typography>
                        {c.primaryCategory && (
                          <Chip
                            label={c.primaryCategory}
                            size="small"
                            sx={{ ml: 1, height: 20 }}
                          />
                        )}
                      </React.Fragment>
                    }
                  />
                  {isSelected && <CheckCircleOutlineIcon color="primary" />}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
      {courseResults.length >= 20 && (
        <Box display="flex" justifyContent="center" mt={1}>
          <Button
            size="small"
            onClick={() => searchCourses(false)}
            disabled={searchingCourses}
          >
            Load more
          </Button>
        </Box>
      )}
    </Box>
  );

  const renderBatchStep = () => {
    if (!selectedCourse) {
      return (
        <Alert severity="info">Select a course in the previous step.</Alert>
      );
    }
    if (loadingBatches) {
      return (
        <Box display="flex" justifyContent="center" py={2}>
          <CircularProgress size={28} />
        </Box>
      );
    }
    if (batches.length === 0) {
      return <Alert severity="warning">No batches found for this course.</Alert>;
    }
    return (
      <Box>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Batch</InputLabel>
              <Select
                value={selectedBatchId}
                onChange={(e) => handleBatchChange(e.target.value)}
                label="Batch"
              >
                {batches.map((b) => (
                  <MenuItem key={b.batchId} value={b.batchId}>
                    {b.batchId}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl
              fullWidth
              size="small"
              disabled={templates.length === 0}
            >
              <InputLabel>Certificate Template</InputLabel>
              <Select
                value={selectedTemplate?.id || ""}
                onChange={(e) => {
                  const t = templates.find((x) => x.id === e.target.value);
                  setSelectedTemplate(t);
                  setPreviewError(false);
                }}
                label="Certificate Template"
              >
                {templates.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.name || t.id}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        {templates.length === 0 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            This batch has no certificate template. Choose another batch.
          </Alert>
        )}
        {selectedTemplate && (
          <Card variant="outlined" sx={{ mt: 2 }}>
            <CardContent>
              <Typography
                variant="subtitle1"
                fontWeight={600}
                gutterBottom
              >
                <BadgeOutlinedIcon
                  sx={{ mr: 1, verticalAlign: "middle" }}
                />
                {selectedTemplate.name || selectedTemplate.id}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={5}>
                  {(() => {
                    if (previewError) {
                      return (
                        <Box
                          sx={{
                            width: "100%",
                            height: 150,
                            borderRadius: 1,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: "#f5f5f5",
                            color: "text.secondary",
                          }}
                        >
                          <ImageNotSupportedOutlinedIcon sx={{ fontSize: 36, mb: 1 }} />
                          <Typography variant="caption">
                            Preview unavailable
                          </Typography>
                        </Box>
                      );
                    }
                    if (selectedTemplate.url) {
                      return (
                        <CardMedia
                          component="img"
                          src={selectedTemplate.url}
                          alt={selectedTemplate.name || "Certificate template"}
                          onError={() => setPreviewError(true)}
                          onClick={() => setPreviewOpen(true)}
                          title="Click to open preview"
                          sx={{
                            width: "100%",
                            maxHeight: 150,
                            objectFit: "contain",
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 1,
                            cursor: "zoom-in",
                          }}
                        />
                      );
                    }
                    return (
                      <Box
                        sx={{
                          width: "100%",
                          height: 150,
                          borderRadius: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: "#f5f5f5",
                          color: "text.secondary",
                        }}
                      >
                        <ImageNotSupportedOutlinedIcon />
                      </Box>
                    );
                  })()}
                </Grid>
                <Grid item xs={12} sm={7}>
                  <Stack spacing={1}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Issuer
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {selectedTemplate.issuer?.name ||
                          selectedTemplate.issuer ||
                          "—"}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Signatories
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {Array.isArray(selectedTemplate.signatoryList)
                          ? selectedTemplate.signatoryList
                              .map((s) => s?.name || s?.title || "")
                              .filter(Boolean)
                              .join(", ")
                          : "—"}
                      </Typography>
                    </Box>
                    {selectedTemplate.description && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Description
                        </Typography>
                        <Typography variant="body2">
                          {selectedTemplate.description}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}
      </Box>
    );
  };

  const renderReviewStep = () => (
    <Box>
      <Stack spacing={2}>
        <SelectionRow
          label="Recipient"
          icon={
            selectedUser ? (
              <Avatar sx={{ width: 28, height: 28, fontSize: 13 }}>
                {userInitials(selectedUser)}
              </Avatar>
            ) : (
              <PersonSearchOutlinedIcon color="disabled" />
            )
          }
          value={selectedUser ? userDisplayName(selectedUser) : "Not selected"}
          sub={selectedUser?.userId}
        />
        <Divider />
        <SelectionRow
          label="Course"
          icon={
            <SchoolOutlinedIcon
              color={selectedCourse ? "primary" : "disabled"}
            />
          }
          value={selectedCourse ? selectedCourse.name : "Not selected"}
          sub={selectedCourse?.identifier}
        />
        <Divider />
        <Box
          onClick={() => selectedTemplate && setPreviewOpen(true)}
          sx={{ cursor: selectedTemplate ? "zoom-in" : "default" }}
        >
          <SelectionRow
            label="Certificate"
            icon={
              <BadgeOutlinedIcon
                color={selectedTemplate ? "primary" : "disabled"}
              />
            }
            value={
              selectedTemplate
                ? selectedTemplate.name || selectedTemplate.id
                : "Not selected"
            }
            sub={selectedBatchId || undefined}
          />
        </Box>
        <Divider />
        <SelectionRow
          label="Will be issued on"
          icon={<WorkspacePremiumOutlinedIcon color="success" />}
          value={new Date().toLocaleString()}
        />
        <Alert severity="info">
          This creates the certificate in the RC registry and it becomes
          available in the recipient's profile. A duplicate check is run
          automatically.
        </Alert>
      </Stack>
    </Box>
  );

  const renderStepperContent = () => (
    <React.Fragment>
      {activeStep === STEPS.length - 1 && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
          <Button size="small" onClick={resetForm} startIcon={<ReplayIcon />}>
            Start over
          </Button>
        </Box>
      )}
      <Stepper activeStep={activeStep} orientation="horizontal">
        {STEPS.map((label, index) => (
          <Step key={label} completed={activeStep > index || !!issued}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Box
        sx={{
          mt: 3,
          p: 2,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        {activeStep === 0 && renderUserStep()}
        {activeStep === 1 && renderCourseStep()}
        {activeStep === 2 && renderBatchStep()}
        {activeStep === 3 && renderReviewStep()}
        <Box sx={{ mt: 2 }}>
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            {activeStep > 0 && (
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={handleBack}
              >
                Back
              </Button>
            )}
            {activeStep < STEPS.length - 1 && (
              <Button
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                disabled={!canNext()}
                onClick={handleNext}
              >
                Continue
              </Button>
            )}
            {activeStep === STEPS.length - 1 && (
              <Button
                variant="contained"
                color="success"
                startIcon={
                  isIssuing ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <VerifiedUserOutlinedIcon />
                  )
                }
                disabled={isIssuing || !canNext()}
                onClick={() => setConfirmOpen(true)}
              >
                {isIssuing ? "Issuing..." : "Issue Certificate"}
              </Button>
            )}
          </Stack>
        </Box>
      </Box>
    </React.Fragment>
  );

  return (
    <div>
      <Header />
      <Container
        role="main"
        className="xs-pb-20 mt-12 dashboard mt-32 pt-121"
        sx={{
          maxWidth: "md !important",
          pb: "3rem",
        }}
      >
        <Box className="mb-20">
          <Typography variant="h5" fontWeight={600} gutterBottom>
            <WorkspacePremiumOutlinedIcon
              sx={{ mr: 1, verticalAlign: "middle" }}
            />
            Manual Certificate Issue
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Issue certificates manually to learners.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {issued ? (
          <Card elevation={3}>
            <CardContent>
              <Box textAlign="center" py={2}>
                <CheckCircleOutlineIcon
                  color="success"
                  sx={{ fontSize: 56, mb: 1 }}
                />
                <Typography variant="h6" gutterBottom>
                  Certificate Issued
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {issued.certificateName}
                </Typography>
                <Alert severity="success" sx={{ mt: 2, textAlign: "left" }}>
                  <Stack spacing={0.5}>
                    <Typography variant="body2">
                      <b>Recipient:</b> {userDisplayName(issued.user)} (
                      {issued.user.userId})
                    </Typography>
                    <Typography variant="body2">
                      <b>Course:</b> {issued.course.name}
                    </Typography>
                    <Typography variant="body2">
                      <b>Batch:</b> {issued.batchId}
                    </Typography>
                    <Typography variant="body2">
                      <b>Issued on:</b> {issued.date}
                    </Typography>
                  </Stack>
                </Alert>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  sx={{ mt: 2 }}
                >
                  The certificate is now available in the user's profile.
                </Typography>
                <Button
                  variant="contained"
                  sx={{ mt: 2 }}
                  onClick={resetForm}
                  startIcon={<ReplayIcon />}
                >
                  Issue Another Certificate
                </Button>
              </Box>
            </CardContent>
          </Card>
        ) : (
          <Card elevation={3}>
            <CardContent>{renderStepperContent()}</CardContent>
          </Card>
        )}
      </Container>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Certificate Issue</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.5}>
            <SelectionRow
              label="Recipient"
              icon={
                <Avatar sx={{ width: 28, height: 28, fontSize: 13 }}>
                  {userInitials(selectedUser)}
                </Avatar>
              }
              value={userDisplayName(selectedUser)}
              sub={selectedUser?.userId}
            />
            <Divider />
            <SelectionRow
              label="Course"
              icon={<SchoolOutlinedIcon color="primary" />}
              value={selectedCourse?.name}
              sub={selectedCourse?.identifier}
            />
            <Divider />
            <SelectionRow
              label="Certificate"
              icon={<BadgeOutlinedIcon color="primary" />}
              value={
                selectedTemplate
                  ? selectedTemplate.name || selectedTemplate.id
                  : ""
              }
              sub={selectedBatchId || undefined}
            />
            <Alert severity="warning">
              This will immediately create an active certificate for this
              recipient. Please verify all details before confirming.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="success"
            onClick={issueCertificate}
            disabled={isIssuing}
            startIcon={
              isIssuing ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <VerifiedUserOutlinedIcon />
              )
            }
          >
            Confirm & Issue
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {selectedTemplate?.name ||
            selectedTemplate?.id ||
            "Certificate preview"}
        </DialogTitle>
        <DialogContent
          dividers
          sx={{ textAlign: "center", bgcolor: "#fafafa" }}
        >
          {previewError || !selectedTemplate?.url ? (
            <Box sx={{ py: 6, color: "text.secondary" }}>
              <ImageNotSupportedOutlinedIcon sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="body2">Preview unavailable</Typography>
            </Box>
          ) : (
            <Box
              component="img"
              src={selectedTemplate.url}
              alt={selectedTemplate.name || "Certificate preview"}
              onError={() => setPreviewError(true)}
              sx={{ width: "100%", maxHeight: "70vh", objectFit: "contain" }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </div>
  );
};

const SelectionRow = ({ label, icon, value, sub }) => (
  <Stack direction="row" spacing={1.5} alignItems="center">
    {icon}
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500} noWrap>
        {value}
      </Typography>
      {sub && (
        <Typography variant="caption" color="text.secondary" noWrap>
          {sub}
        </Typography>
      )}
    </Box>
  </Stack>
);

export default ManualCertificate;
