package com.aem.deloitte.amex.core.util;
import com.adobe.cq.sightly.WCMUsePojo;

public class SamplePageUtil extends WCMUsePojo {
	
	CreateSamplePageInterface createSample;
	
	@Override
	public void activate() throws Exception {
		System.out.println("Hello activate");
		}
	public void getCallService() throws Exception{
		createSample = getSlingScriptHelper().getService(CreateSamplePageInterface.class);
		System.out.println("Hello");
		createSample.createPage();
	}
}