#!/bin/bash
rm -rf prod-build
mkdir prod-build
mkdir prod-build/modules
find packages \( ! -path packages/common-lib -o ! -path packages/teacher-app \) -type d  -maxdepth 1 -mindepth 1 -exec bash -c '
for f  do
    # echo $f
    if [ $f != "packages/common-lib" ] &&  [ $f != "packages/teacher-app" ] && [ $f != "packages/student-app" ]; then
        echo "Processing ${f//packages\//}"
        cp -rf "$f/build" "prod-build/modules/${f//packages\//}"
    fi
done 
' sh {} +
cp -r  packages/nulp_elite/build/* prod-build/
# cp -r  packages/players/* prod-build/
find  prod-build -name  'modules.json' | xargs sed -i 's|http://localhost:[0-9]*||g'

cd prod-build && tar -cf ../shiksha-ui.tar . && cd ../
if [ ! -d "../dist" ]; then
    mkdir ../dist
fi
if [ ! -d "../dist/webapp" ]; then
    mkdir ../dist/webapp
fi

cp -r prod-build/* ../dist/webapp/

find ../dist -type f -name 'index.html' -exec bash -c 'mv "$1" "${1%.html}.ejs" && sed -i "/<body>/s|<body>|&\
  <input type=\"hidden\" id=\"userId\" value=\"<%=userId%>\" />\
  <input type=\"hidden\" id=\"userSid\" value=\"<%=userSid%>\" />\
  <input type=\"hidden\" id=\"sessionId\" value=\"<%=sessionId%>\" />\
  <input type=\"hidden\" id=\"appId\" value=\"<%=appId%>\" />\
  <input type=\"hidden\" id=\"cloudStorageUrls\" value=\"<%=cloudStorageUrls%>\" />\
  <input type=\"hidden\" id=\"publicStorageAccount\" value=\"<%=publicStorageAccount%>\" />\
  <input type=\"hidden\" id=\"defaultTenant\" value=\"<%=defaultTenant%>\" />\
  <input type=\"hidden\" id=\"exploreButtonVisibility\" value=\"<%=exploreButtonVisibility%>\" />\
  <input type=\"hidden\" id=\"helpLinkVisibility\" value=\"<%=helpLinkVisibility%>\" />\
  <input type=\"hidden\" id=\"apiCacheTtl\" value=\"<%=apiCacheTtl%>\" />\
  <input type=\"hidden\" id=\"userUploadRefLink\" value=\"<%=userUploadRefLink%>\" />\
  <input type=\"hidden\" id=\"defaultTenantIndexStatus\" value=\"<%=defaultTenantIndexStatus%>\" />\
  <input type=\"hidden\" id=\"buildNumber\" value=\"<%=buildNumber%>\" />\
  <input type=\"hidden\" id=\"extContWhitelistedDomains\" value=\"<%=extContWhitelistedDomains%>\" />\
  <input type=\"hidden\" id=\"deviceRegisterApi\" value=\"<%=deviceRegisterApi%>\" />\
  <input type=\"hidden\" id=\"deviceProfileApi\" value=\"<%=deviceProfileApi%>\" />\
  <input type=\"hidden\" id=\"cdnUrl\" value=\"<%=cdnUrl%>\" />\
  <input type=\"hidden\" id=\"theme\" value=\"<%=theme%>\" />\
  <input type=\"hidden\" id=\"defaultPortalLanguage\" value=\"<%=defaultPortalLanguage%>\" />\
  <input type=\"hidden\" id=\"instance\" value=\"<%=instance%>\" />\
  <input type=\"hidden\" id=\"deviceId\" value=\"<%=deviceId%>\" />\
  <input type=\"hidden\" id=\"googleCaptchaSiteKey\" value=\"<%=googleCaptchaSiteKey%>\" />\
  <input type=\"hidden\" id=\"videoMaxSize\" value=\"<%=videoMaxSize%>\" />\
  <input type=\"hidden\" id=\"sunbirdDefaultFileSize\" value=\"<%=sunbirdDefaultFileSize%>\" />\
  <input type=\"hidden\" id=\"reportsLocation\" value=\"<%=reportsLocation%>\" />\
  <input type=\"hidden\" id=\"previewCdnUrl\" value=\"<%=previewCdnUrl%>\" />\
  <input type=\"hidden\" id=\"offlineDesktopAppTenant\" value=\"<%=offlineDesktopAppTenant%>\" />\
  <input type=\"hidden\" id=\"offlineDesktopAppVersion\" value=\"<%=offlineDesktopAppVersion%>\" />\
  <input type=\"hidden\" id=\"offlineDesktopAppReleaseDate\" value=\"<%=offlineDesktopAppReleaseDate%>\" />\
  <input type=\"hidden\" id=\"offlineDesktopAppSupportedLanguage\" value=\"<%=offlineDesktopAppSupportedLanguage%>\" />\
  <input type=\"hidden\" id=\"offlineDesktopAppDownloadUrl\" value=\"<%=offlineDesktopAppDownloadUrl%>\" />\
  <input type=\"hidden\" id=\"logFingerprintDetails\" value=\"<%=logFingerprintDetails%>\" />\
  <input type=\"hidden\" id=\"deviceApi\" value=\"<%=deviceApi%>\" />\
  <input type=\"hidden\" id=\"slugForProminentFilter\" value=\"<%=slugForProminentFilter%>\" />\
  <input type=\"hidden\" id=\"collectionEditorURL\" value=\"<%=collectionEditorURL%>\" />\
  <input type=\"hidden\" id=\"contentEditorURL\" value=\"<%=contentEditorURL%>\" />\
  <input type=\"hidden\" id=\"genericEditorURL\" value=\"<%=genericEditorURL%>\" />\
  <input type=\"hidden\" id=\"isBotConfigured\" value=\"<%=botConfigured%>\" />\
  <input type=\"hidden\" id=\"botServiceURL\" value=\"<%=botServiceURL%>\" />\
  <input type=\"hidden\" id=\"superAdminSlug\" value=\"<%=superAdminSlug%>\" />\
  <input type=\"hidden\" id=\"enableSSO\" value=\"<%=enableSSO%>\" />\
  <input type=\"hidden\" id=\"reportsListVersion\" value=\"<%=reportsListVersion%>\" />\
  <input type=\"hidden\" id=\"baseUrl\" value=\"<%=baseUrl%>\" />\
  <input type=\"hidden\" id=\"blobUrl\" value=\"<%=blobUrl%>\" />\
  <input type=\"hidden\" id=\"sunbirdQuestionSetChildrenLimit\" value=\"<%=sunbirdQuestionSetChildrenLimit%>\" />\
  <input type=\"hidden\" id=\"sunbirdCollectionChildrenLimit\" value=\"<%=sunbirdCollectionChildrenLimit%>\" />\
  <input type=\"hidden\" id=\"uciBotPhoneNumber\" value=\"<%=uciBotPhoneNumber%>\" />\
  |" "${1%.html}.ejs"' _ {} \;

# rm ../dist/webapp/index.ejs  # need to uncomment this line when dev deployment
find ../dist -type f -name 'index.ejs' -exec sed -i '/<head>/a \
<% if (structuredData && structuredData.length) { %>\
  <% structuredData.forEach(function(jsonLd) { %>\
    <script type="application/ld+json">\
      <%- jsonLd %>\
    </script>\
  <% }); %>\
<% } %>\
<% \
  const totalPages = Math.ceil(totalCount / pageSize);\
%>\
<% if (page > 1) { %>\
  <link rel="prev" href="/webapp?page=<%= page - 1 %>&pageSize=<%= pageSize %>">\
<% } %>\
<% if (page < totalPages) { %>\
  <link rel="next" href="/webapp?page=<%= page + 1 %>&pageSize=<%= pageSize %>">\
<% } %>\
' {} \;

cp -r ../dist/webapp/* ../dist/