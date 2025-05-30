import React from "react";
import { Helmet } from "react-helmet";
// Dynamic data for course and course info structured data for SEO
const CourseStructuredData = ({ course, url }) => {
  console.log("CourseStructuredData - Received course data:", course);

  // Course Schema
  const courseJsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course?.name,
    description: course?.description || "Not specified",
    provider: {
      "@type": "Organization",
      name:
        course?.organisation?.[0] ||
        course?.orgDetails?.orgName ||
        "Not specified",
    },
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      price: "0",
      priceCurrency: "INR",
      url:
        url ||
        course?.previewUrl ||
        course?.artifactUrl ||
        course?.streamingUrl,
      category: course?.primaryCategory || "Course",
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      startDate: course?.createdOn,
      endDate: course?.lastUpdatedOn,
      inLanguage: course?.language?.[0] || "English",
      courseWorkload: "PT1H",
    },
    educationalLevel: course?.gradeLevel?.[0],
    inLanguage: course?.language?.[0],
    url:
      url || course?.previewUrl || course?.artifactUrl || course?.streamingUrl,
    license: course?.licenseDetails?.url,
    author: {
      "@type": "Person",
      name: course?.creator,
    },
    keywords: course?.keywords?.join(", "),
    audience: course?.audience?.[0],
    datePublished: course?.createdOn,
    dateModified: course?.lastUpdatedOn,
    contentUrl: course?.artifactUrl,
    downloadUrl: course?.downloadUrl,
    streamingUrl: course?.streamingUrl,
    copyright: course?.copyright,
    subject: course?.subject?.[0],
    domain: course?.board || course?.se_boards?.[0],
    resourceType: course?.resourceType,
    primaryCategory: course?.primaryCategory,
    status: course?.status,
    framework: course?.framework,
    medium: course?.medium?.[0],
    idealScreenSize: course?.idealScreenSize,
    idealScreenDensity: course?.idealScreenDensity,
    compatibilityLevel: course?.compatibilityLevel,
    os: course?.os?.[0],
    lastPublishedOn: course?.lastPublishedOn,
    lastSubmittedOn: course?.lastSubmittedOn,
    lastUpdatedOn: course?.lastUpdatedOn,
    contentType: course?.contentType,
    mediaType: course?.mediaType,
    mimeType: course?.mimeType,
    size: course?.size,
    language: course?.se_mediums?.[0],
    subdomain: course?.se_gradeLevels?.[0],
    se_subjects: course?.se_subjects?.[0],
    visibility: course?.visibility,
    contentEncoding: course?.contentEncoding,
  };

  // Course video structured data for SEO
  // Video Schema
  const videoJsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: course?.name || "Not specified",
    description: course?.description || "Not specified",
    thumbnailUrl:
      course?.thumbnailUrl ||
      course?.previewUrl ||
      course?.appIcon ||
      "/webapp/assets/images/default-thumbnail.png",
    uploadDate: course?.createdOn,
    contentUrl:
      url ||
      course?.streamingUrl ||
      course?.artifactUrl ||
      "/webapp/assets/images/default-thumbnail.png",
    embedUrl:
      url ||
      course?.streamingUrl ||
      "/webapp/assets/images/default-thumbnail.png",
    author: {
      "@type": "Person",
      name: course?.creator || "Not specified",
    },
    publisher: {
      "@type": "Organization",
      name:
        course?.organisation?.[0] ||
        course?.orgDetails?.orgName ||
        "Not specified",
    },
    license: course?.licenseDetails?.url || "Not specified",
    keywords: course?.keywords?.join(", ") || "Not specified",
    inLanguage: course?.language?.[0] || "English",
    isFamilyFriendly: true,
    interactionStatistic: {
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/WatchAction",
      userInteractionCount: course?.viewCount || 0,
    },
  };

  console.log("CourseStructuredData - Generated Course JSON-LD:", courseJsonLd);
  console.log("CourseStructuredData - Generated Video JSON-LD:", videoJsonLd);

  // Validate required fields
  if (!course?.name) {
    console.log("CourseStructuredData - Missing required field: name");
  }
  if (!course?.description) {
    console.log("CourseStructuredData - Missing required field: description");
  }
  if (!course?.creator) {
    console.log("CourseStructuredData - Missing required field: creator");
  }

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(courseJsonLd)}</script>
      <script type="application/ld+json">{JSON.stringify(videoJsonLd)}</script>
    </Helmet>
  );
};

export default CourseStructuredData;
