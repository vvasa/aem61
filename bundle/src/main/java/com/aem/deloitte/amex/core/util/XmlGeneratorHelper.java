package com.aem.deloitte.amex.core.util;

import io.sightly.java.api.Use;

import java.io.File;

import javax.script.Bindings;
import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Marshaller;

import com.adobe.cq.sightly.WCMUse;
import com.aem.deloitte.amex.core.bean.XmlBean;

public class XmlGeneratorHelper extends WCMUse {
	 
		//private String developer;
		private String title;
	 
		public void activate() throws Exception {
			// all standard objects/binding are available
		//	Resource resource = (Resource) bindings.get("resource");
	 
			// parameters are passed as bindings
			/*String developerName = (String) bindings.get("devName");
			String tool = (String) bindings.get("tool");
			String aboutMe = (String) bindings.get("about");*/
			String title = getProperties().get("title", String.class);
			String name = getProperties().get("name", String.class);
			String age = getProperties().get("age", String.class);
			String filePath = getProperties().get("filePath", String.class);
	 /*
			developer = "Our developer " + developerName.toUpperCase()
					+ " works on " + tool.toUpperCase()
					+ ", Here's whats he says about " + "himself\n\"" + aboutMe
					+ "\"";
			*/
			 XmlBean customer = new XmlBean();
			  customer.setId(100);
			  customer.setName(name);
			  customer.setAge(age);
			  customer.setTitle(title);

			 try {

				File file = new File(filePath);
				JAXBContext jaxbContext = JAXBContext.newInstance(XmlBean.class);
				Marshaller jaxbMarshaller = jaxbContext.createMarshaller();

				// output pretty printed
				jaxbMarshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, true);

				jaxbMarshaller.marshal(customer, file);
				jaxbMarshaller.marshal(customer, System.out);

			      } catch (JAXBException e) {
				e.printStackTrace();
			      }
	
		}
	 
		/*public String getProfile() {
			return developer;
		}*/
		public String getTitle() {
			return title;
		}
	}