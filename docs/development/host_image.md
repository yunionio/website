---
sidebar_position: 18
---

# host-image 服务编译

host-image 服务是 cloudpods 远程挂载磁盘的组件，依赖基于 qemu 编译的 libqemuio 库，本文介绍如何编译 host-image。


```sh
$ git clone -b stable-2.12 https://gitlab.com/qemu-project/qemu.git
$ wget https://raw.githubusercontent.com/yunionio/qemu/stable-2.12/0001-patch-for-2.12.patch
$ cd qemu && mkdir src && mv ./* src/
$ git apply src/0001-libqemuio-support-libqemuio-on-release-2.12.patch

# 这里 /root/go/src/yunion.io/x/cloudpods 为本地 cloudpods 路径，需替换成本地相应的 cloudpods 路径
$ docker run --network host -v $(pwd):/root/qemu -v /root/go/src/yunion.io/x/cloudpods:/go/src/yunion.io/x/cloudpods -it golang:1.18.10-buster

# 容器内：
$ sed -i 's|http://deb.debian.org|http://mirrors.aliyun.com|g' /etc/apt/sources.list
$ apt-get update
$ apt-get install -y gcc make git vim python pkg-config flex bison libpixman-1-dev libudev-dev libaio-dev libcurl4-openssl-dev zlib1g-dev libglib2.0-dev libusb-1.0-0-dev libusbredirparser-dev libusbredirhost-dev libcapstone-dev libcephfs-dev librbd-dev librados-dev libspice-server-dev libspice-protocol-dev libfdt
$ cd /root/qemu/src
$ ./configure --target-list=$(uname -m)-softmmu --enable-libusb --extra-ldflags=-lrt --enable-spice --enable-rbd
# 编译 libqemuio.a
$ make libqemuio.a

$ apt install -y file gnutls-bin libgnutls30 libgnutls28-dev
$ cd /go/src/yunion.io/x/cloudpods
# 编译 host-image
$ LIBQEMUIO_PATH=/root/qemu make cmd/host-image
$ ./scripts/bundle_libraries.sh _output/bin/bundles/host-image _output/bin/host-image
```

host-image 编译完成后制作 docker 镜像：
```sh
$ cd /root/go/src/yunion.io/x/cloudpods
$ docker build -t test-host-image:v1 -f ./build/docker/Dockerfile.host-image . 
```

