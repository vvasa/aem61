package com.aem.deloitte.amex.core.util;
import java.util.ArrayList;
import java.util.List;

import javax.jcr.Node;
import javax.jcr.NodeIterator;
import javax.jcr.RepositoryException;

import org.apache.commons.lang3.StringUtils;
import org.apache.sling.api.resource.ResourceResolver;
import org.apache.sling.api.resource.ValueMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.adobe.cq.sightly.WCMUse;
import com.aem.deloitte.amex.core.bean.HeroBean;

/**
 * The Class MultiFieldHelper for reading the custom multifield values.It reads the property name with xtype as custom
 * multifield and iterates through all the child nodes in the custom multifield reads their path and sets them in a
 * List.
 */
public class MultiFieldHelper extends WCMUse {
    /** The LOG. */
    private static final Logger LOG = LoggerFactory.getLogger(MultiFieldHelper.class.getSimpleName());
    /** The current node. */
    Node currentNode;
    /** The property name. */
    String propertyName;
    /** The resource resolver. */
    ResourceResolver resourceResolver;
    /** The Constant DEFAULT_PN_PROPERTY_NAME which is the name of the widget with xtype custom multifield. */
    private static final String DEFAULT_PN_PROPERTY_NAME = "propertyName";
    HeroBean heroBean;
    /**
     * Instantiates a new multi field helper.
     */
    public MultiFieldHelper() {
        super();
        
    }
    /**
     * Gets called at the bundle activate.
     */
    @Override
    public void activate() {
        // helper method to get the default bindings
        currentNode = getResource().adaptTo(Node.class);
        resourceResolver = getResourceResolver();
        // access to the parameters via get()
        propertyName = get(DEFAULT_PN_PROPERTY_NAME, String.class);
    }
    /**
     * The method which gets the node of the widget with xtype as custom multifield , iterates through all the child
     * nodes , gets their path and stores them into a List of type Value Map.
     * @return a List of multi field values
     */
    public List<ValueMap> getMultiFieldValues() {
        List<ValueMap> multifieldList = new ArrayList<ValueMap>();
        try {
            if (StringUtils.isNotBlank(propertyName) && currentNode != null && currentNode.hasNode(propertyName)) {
                Node propertyNode = currentNode.getNode(propertyName);
                if (propertyNode.hasNodes()) {
                    NodeIterator iterator = propertyNode.getNodes();
                    while (iterator.hasNext()) {
                        Node childNode = iterator.nextNode();
                        multifieldList.add(resourceResolver.getResource(childNode.getPath()).adaptTo(ValueMap.class));
                    }
                }
            }
        } catch (RepositoryException e) {
            LOG.debug("RepositoryException", e);
        }
        return multifieldList;
    }
    public List<HeroBean> getHeroModuleValues() {
        List<HeroBean> heroList = new ArrayList<HeroBean>();
        ValueMap prop;
        try {
            if (StringUtils.isNotBlank(propertyName) && currentNode != null && currentNode.hasNode(propertyName)) {
                Node propertyNode = currentNode.getNode(propertyName);
                if (propertyNode.hasNodes()) {
                    NodeIterator iterator = propertyNode.getNodes();
                    while (iterator.hasNext()) {
                    	heroBean = new HeroBean();
                        Node childNode = iterator.nextNode();
                        prop = resourceResolver.getResource(childNode.getPath()).adaptTo(ValueMap.class);
                        heroBean.setArtistId(prop.get("artistId", String.class));
                        heroBean.setImagePath(prop.get("imagePath", String.class));
                        heroBean.setVideoUrl(prop.get("videoUrl", String.class));
                        String[] querystring = prop.get("videoUrl", String.class).split("=");
                        String youtubeSuffix = StringUtils.EMPTY;
                        if (querystring.length > 1) {
                            youtubeSuffix = querystring[1];
                      }
                        heroBean.setYoutubeId(youtubeSuffix);
                        heroBean.setTitle(prop.get("title", String.class));
                        heroBean.setSubtitle(prop.get("subtitle", String.class));
                        heroBean.setMp4Url(prop.get("mp4Url", String.class));
                        heroList.add(heroBean);
                    }
                    
                   }
                }
            } catch (RepositoryException e) {
            LOG.debug("RepositoryException", e);
        }
        return heroList;
    }
}
