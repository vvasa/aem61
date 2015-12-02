FROM gcr.io/stacksmith-images/debian:wheezy

MAINTAINER Bitnami <containers@bitnami.com>

LABEL com.bitnami.stacksmith.id="dK9qfYE" \
      com.bitnami.stacksmith.name="AEM61"

ENV STACKSMITH_STACK_ID="dK9qfYE" \
    STACKSMITH_STACK_NAME="AEM61"
ENV STACKSMITH_STACK_PRIVATE=1

# Runtime
RUN bitnami-pkg-install java-1.8.0_65-0

# Runtime template
ENV PATH=/opt/bitnami/java/bin:$PATH
ENV JAVA_HOME=/opt/bitnami/java
