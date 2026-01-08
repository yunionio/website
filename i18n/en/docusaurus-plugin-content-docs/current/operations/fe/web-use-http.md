---
sidebar_position: 3
---

# Frontend Using HTTP

Introduction to how to configure frontend access protocol as HTTP

After platform deployment, TLS server-side (one-way) authentication is enabled by default, using HTTPS protocol for browser access to the frontend interface. This article introduces how to configure using HTTP protocol to access the frontend.

## Edit onecloudcluster spec

First need to edit the oc.spec.web.useHTTP property, which defaults to false, and needs to be set to true, as follows:

```bash
$ kubectl edit oc -n onecloud
```

Search for the useHTTP keyword and edit as follows:

```diff
   spec:
     web:
@@ -1122,7 +1122,7 @@
         key: node-role.kubernetes.io/master
       - effect: NoSchedule
         key: node-role.kubernetes.io/controlplane
-      useHTTP: false
+      useHTTP: true
     webconsole:
       affinity:
         nodeAffinity:
```

## Delete old web configmap

The web component's configmap is actually an nginx configuration. This configuration will not be regenerated and needs to be deleted and recreated by the operator, as follows:

```bash
# Delete web component's configmap
$ kubectl delete configmap -n onecloud $(kubectl get configmap -n onecloud | grep web | grep -v console | awk '{print $1}')
configmap "default-web" deleted

# Wait 15s, this configmap will be recreated, view the generated content
$ kubectl get configmap -n onecloud $(kubectl get configmap -n onecloud | grep web | grep -v console | awk '{print $1}')
NAME          DATA   AGE
default-web   1      28s

# Check if there is port 80 configuration, if yes, there's no problem
$ kubectl get configmap -n onecloud $(kubectl get configmap -n onecloud | grep web | grep -v console | awk '{print $1}') -o yaml | grep 'listen 80'
        listen 80 default_server;
```

## Restart web component

After updating the web component's configmap, need to restart the web component's deployment, command:

```bash
# Restart web deployment
$ kubectl rollout restart deployment -n onecloud $(kubectl get deployment -n onecloud | grep web | grep -v console | awk '{print $1}')
deployment.extensions/default-web restarted

# Wait for pod to become Running
$ kubectl get pods -n onecloud | grep web | grep -v console
default-web-5bfb6c578b-mdh9w                        3/3     Running                 0          58s
```

## Update ingress

The web component's service is exposed via ingress. Ingress will not refresh by default and needs to be deleted and recreated, as follows:

```bash
$ kubectl delete ingress -n onecloud $(kubectl get ingress -n onecloud | grep web | awk '{print $1}')
ingress.extensions "default-web" deleted
```

View the recreated ingress rule, it should route to port 80:

```bash
$ kubectl get ingress -n onecloud $(kubectl get ingress -n onecloud | grep web | awk '{print $1}') -o yaml | grep -i port
    onecloud.yunion.io/last-applied-configuration: '{"rules":[{"http":{"paths":[{"backend":{"serviceName":"default-web","servicePort":80},"path":"/"}]}}],"tls":[{"secretName":"default-certs"}]}'
          servicePort: 80
```

## Configure traefik ingress controller

If using a helm-deployed cluster, skip this step. The ingress controller implementation is related to the specific k8s deployment platform. Now the web service is already using HTTP protocol.

The following steps only apply to platforms deployed using ocboot. Need to set traefik ingress controller to turn off the http redirect to https configuration, as follows:

```bash
$ kubectl edit configmaps -n kube-system traefik-ingress-lb
```

Comment out the entryPoints.http.redirect configuration:

```diff
@@ -14,8 +14,8 @@
     [entryPoints]
       [entryPoints.http]
         address = ":80"
-        [entryPoints.http.redirect]
-        entryPoint = "https"
+        #[entryPoints.http.redirect]
+        #entryPoint = "https"
```

Restart traefik ingress controller:

```bash
$ kubectl delete pods -n kube-system $(kubectl get pods -n kube-system | grep traefik-ingress-controller | awk '{print $1}')
pod "traefik-ingress-controller-xkmct" deleted
```

At this point, all HTTP configuration is complete.

