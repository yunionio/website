# ref: https://github.com/m3ng9i/ran
FROM registry.cn-beijing.aliyuncs.com/yunionio/ran:v0.1

COPY ./build /web
WORKDIR /web
ENTRYPOINT ["/ran", "-port=8081"]

