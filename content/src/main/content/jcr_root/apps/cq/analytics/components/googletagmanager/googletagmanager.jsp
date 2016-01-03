<%@page import="org.apache.sling.api.resource.Resource,
                org.apache.sling.api.resource.ValueMap,
                org.apache.sling.api.resource.ResourceUtil,
                com.day.cq.wcm.webservicesupport.Configuration,
                com.day.cq.wcm.webservicesupport.ConfigurationManager" %>
                    <%@include file="/libs/foundation/global.jsp" %>
<%
String[] services = pageProperties.getInherited("cq:cloudserviceconfigs", new String[]{});
ConfigurationManager cfgMgr = (ConfigurationManager)sling.getService(ConfigurationManager.class);
if(cfgMgr != null) {
    String id = null;
    Configuration cfg = cfgMgr.getConfiguration("google-tag-manager", services);
    if(cfg != null) {
        id = cfg.get("id", null);
    }

    if(id != null) {
    %>
    <!-- Google Tag Manager -->
    <noscript><iframe src="//www.googletagmanager.com/ns.html?id=<%= id %>"
    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    '//www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','<%= id %>');</script>
    <!-- End Google Tag Manager -->
<%
    }
}
%>