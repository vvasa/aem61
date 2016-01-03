<%@page contentType="text/html" pageEncoding="utf-8"%>
<%@include file="/libs/foundation/global.jsp" %>
<div>
    <h3>Google Tag Manager</h3>
    <ul>
        <li>
            <div class="li-bullet">
                <strong>Google Tag Manager ID: </strong><br><%= xssAPI.encodeForHTML(properties.get("id", "")) %>
            </div>
        </li>
    </ul>
</div>

