---
sidebar_position: 2
---

# nginx 配置

部署完成后，如果要通过 nginx 将平台的前端暴露到外网访问，nginx 的推荐配置如下。

:::tip
注意需要专门为websocket的流量增加转发规则。
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
