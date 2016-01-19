package com.aem.deloitte.amex.core.bean;

import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement
public class XmlBean {
		String name;
		String age;
		int id;
		String title;

		public String getName() {
			return name;
		}

		public String getTitle() {
			return title;
		}
		
		@XmlElement
		public void setTitle(String title) {
			this.title = title;
		}

		@XmlElement
		public void setName(String name) {
			this.name = name;
		}

		public String getAge() {
			return age;
		}

		@XmlElement
		public void setAge(String age) {
			this.age = age;
		}

		public int getId() {
			return id;
		}

		@XmlAttribute
		public void setId(int id) {
			this.id = id;
		}

	}

