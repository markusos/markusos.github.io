---
layout: post
title:  "Snowflake Key-Pair Authentication migration"
date:   2025-01-25 00:00:00
categories: projects
tags:
    - Data
    - Dev
    - Work
---

Snowflake is implementing an important security enhancement by phasing out the use of usernames and passwords for authentication in November 2025. This change necessitates a transition to a more secure authentication method known as Key-Pair Authentication. This change was announced on the [Snowflake Blog](https://www.snowflake.com/en/blog/blocking-single-factor-password-authentification/) and is part of Snowflake's ongoing commitment to enhancing security and protecting sensitive data.

![Snowflake]({{site.url}}/assets/snowflake_security.png){: .center-image }

### Understanding the Transition

Traditional password-based authentication, while convenient, presents inherent security vulnerabilities. Key-Pair Authentication addresses these concerns by employing a more robust security model.

Key-Pair Authentication utilizes a public-key/private-key pair for authentication. The public key is registered within the Snowflake environment, while the private key remains securely stored by the user. This eliminates the transmission of passwords over the network, significantly reducing the risk of unauthorized access.

### Implementing Key-Pair Authentication

The migration to Key-Pair Authentication involves several key steps outined in the [Snowflake documentation](https://docs.snowflake.com/en/user-guide/key-pair-auth):

**Generating a Key Pair:** Generate a unique pair of cryptographic keys – a private key and a corresponding public key.

Private Key:

```bash
openssl genrsa 2048 | openssl pkcs8 -topk8 -v2 des3 -inform PEM -out rsa_key.p8
```

This generates a private key PEM file named `rsa_key.p8`. 

```
-----BEGIN ENCRYPTED PRIVATE KEY-----
MIIE6T...
-----END ENCRYPTED PRIVATE KEY-----
```

Public Key:

```bash
openssl rsa -in rsa_key.p8 -pubout -out rsa_key.pub
```

Output:
```
-----BEGIN PUBLIC KEY-----
MIIBIj...
-----END PUBLIC KEY-----
```

**Registering the Public Key:** Register the public key within your Snowflake account.

```sql
ALTER USER example_user SET RSA_PUBLIC_KEY='MIIBIjANBgkqh...';
```

**Updating Applications:** Modify your applications to utilize the private key for authentication.

Depending on your Snowflake driver or library, the implementation may vary. For example, if you are using the JDBC driver with a Apache Tomcat server this sample Github repository might be of help: [https://github.com/markusos/tomcat-snowflake-sample/](https://github.com/markusos/tomcat-snowflake-sample/)

The relevant part of the `tomcat/conf/context.xml` file would look like this:

```xml
<Resource name="jdbc/snowflake"
        auth="Container"
        type="javax.sql.DataSource"
        driverClassName="net.snowflake.client.jdbc.SnowflakeDriver"
        url="jdbc:snowflake://${SNOWFLAKE_HOSTNAME}/?user=${SNOWFLAKE_USER}&amp;private_key_file=/tmp/rsa_key.p8&amp;private_key_pwd=${SNOWFLAKE_RSA_KEY_PASSWORD}&amp;db=${SNOWFLAKE_DATABASE}&amp;schema=${SNOWFLAKE_SCHEMA}&amp;warehouse=${SNOWFLAKE_WAREHOUSE}"
        maxTotal="20"
        maxIdle="10"
        maxWaitMillis="10000"/>
```

Note that this file is templated and the values are replaced using the `envsubst` command in the `startup.sh` script.

The raw connection string would look something like this:

```
jdbc:snowflake://myorganization-myaccount.snowflakecomputing.com/?user=demo_user&private_key_file=/tmp/rsa_key.p8&private_key_pwd=pwd&db=demo&schema=test&warehouse=demo_wh
```

This type of setup also works for applications like [Pentaho Business Analytics](https://pentaho.com/products/pentaho-business-analytics/) since it is built on top of Apache Tomcat webserver.

### Conclusion

To ensure a smooth and secure transition it is important to plan ahead. Begin the migration process well in advance of the November 2025 deadline to avoid any disruptions to your Snowflake operations. 

Migrating to Key-Pair Authentication is a crucial step in enhancing the security of your Snowflake environment. By implementing this more robust authentication method, you can significantly mitigate the risk of unauthorized access to your valuable data. 