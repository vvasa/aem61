package com.aem.deloitte.amex.core.util;

import javax.jcr.Node;
import javax.jcr.Session;

import org.apache.felix.scr.annotations.Component;
import org.apache.felix.scr.annotations.Reference;
import org.apache.felix.scr.annotations.Service;
import org.apache.sling.api.resource.ResourceResolver;
import org.apache.sling.api.resource.ResourceResolverFactory;
import com.aem.deloitte.amex.core.util.CreateSamplePageInterface;
import com.day.cq.wcm.api.Page;
import com.day.cq.wcm.api.PageManager;

@Component(immediate = true, label = "Create Page Service", description = "Create Sample Page", metatype = true)
@Service(value = CreateSamplePageInterface.class)
public class CreateSamplePage implements CreateSamplePageInterface {

	@Reference
	private ResourceResolverFactory resolverFactory;
	
	private ResourceResolver resourceResolver;

	public void createPage() throws Exception {
		String path = "/content/poc";
		String pageName = "samplePage";
		String pageTitle = "Sample Amex Page";
		String template = "/apps/amex/templates/homepage";
		String renderer = "amex/components/page/homepage";

		this.resourceResolver = this.resolverFactory
				.getAdministrativeResourceResolver(null);
		Page prodPage = null;
		Session session = this.resourceResolver.adaptTo(Session.class);
		try {
			if (session != null) {

				// Create Page
				PageManager pageManager = this.resourceResolver
						.adaptTo(PageManager.class);
				prodPage = pageManager.create(path, pageName, template,
						pageTitle);
				Node pageNode = prodPage.adaptTo(Node.class);

				Node jcrNode = null;
				if (prodPage.hasContent()) {
					jcrNode = prodPage.getContentResource().adaptTo(Node.class);
				} else {
					jcrNode = pageNode.addNode("jcr:content", "cq:PageContent");
				}
				jcrNode.setProperty("sling:resourceType", renderer);

				Node parNode = jcrNode.addNode("par");
				parNode.setProperty("sling:resourceType",
						"foundation/components/parsys");

				Node textNode = parNode.addNode("text");
				textNode.setProperty("sling:resourceType",
						"foundation/components/text");
				textNode.setProperty("textIsRich", "true");
				textNode.setProperty("text", "Test page");

				session.save();
				session.logout();
				//session.refresh(true);
			}

		} catch (Exception e) {
			throw e;
		}
	}
}
