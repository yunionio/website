---
sidebar_position: 2
---

# nginx Configuration

After deployment is complete, if you want to expose the platform's frontend to external network access through nginx, the recommended nginx configuration is as follows.

:::tip
Note: You need to add forwarding rules specifically for websocket traffic.
:::

```nginx
# vi: ft=nginx
server {

    server_name {{ public_domain_name }};
    access_log /var/log/nginx/{{ public_domain_name }}.access.log;

    listen 443 http2 ssl;
    ssl_certificate /etc/ssl/yunion.io/cert.pem;
    ssl_certificate_key /etc/ssl/yunion.io/key.pem;

    client_max_body_size 10g;

    location ~ /.well-known {
        allow all;
    }

    location / {
        proxy_pass https://{{ backend_address }};
        proxy_read_timeout 3600s;
        proxy_redirect   off;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location ~ ^/(websockify|wsproxy|connect) {
        proxy_pass https://{{ backend_address }};
        proxy_redirect   off;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_read_timeout 86400;
    }
}
```

