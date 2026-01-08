---
sidebar_position: 18
---

# host-image Service Compilation

The host-image service is a component of cloudpods for remotely mounting disks. It depends on the libqemuio library compiled based on qemu. This article introduces how to compile host-image.


```sh
$ git clone -b stable-2.12 https://gitlab.com/qemu-project/qemu.git
$ wget https://raw.githubusercontent.com/yunionio/qemu/stable-2.12/0001-libqemuio-support-libqemuio-on-release-2.12.patch
$ cd qemu && mkdir src && mv ./* src/
$ git apply ../0001-libqemuio-support-libqemuio-on-release-2.12.patch

# Here /root/go/src/yunion.io/x/cloudpods is the local cloudpods path, which needs to be replaced with the corresponding local cloudpods path
$ docker run --network host -v $(pwd):/root/qemu -v /root/go/src/yunion.io/x/cloudpods:/go/src/yunion.io/x/cloudpods -it golang:1.18.10-buster

# Inside the container:
$ sed -i 's|http://deb.debian.org|http://mirrors.aliyun.com|g' /etc/apt/sources.list
$ apt-get update
$ apt-get install -y gcc make git vim python pkg-config flex bison libpixman-1-dev libudev-dev libaio-dev libcurl4-openssl-dev zlib1g-dev libglib2.0-dev libusb-1.0-0-dev libusbredirparser-dev libusbredirhost-dev libcapstone-dev libcephfs-dev librbd-dev librados-dev libspice-server-dev libspice-protocol-dev
$ cd /root/qemu/src
$ ./configure --target-list=$(uname -m)-softmmu --enable-libusb --extra-ldflags=-lrt --enable-spice --enable-rbd
# Compile libqemuio.a
$ make libqemuio.a

$ apt install -y file gnutls-bin libgnutls30 libgnutls28-dev
$ cd /go/src/yunion.io/x/cloudpods
# Compile host-image
$ git config --global --add safe.directory /go/src/yunion.io/x/cloudpods
$ LIBQEMUIO_PATH=/root/qemu make cmd/host-image
$ ./scripts/bundle_libraries.sh _output/bin/bundles/host-image _output/bin/host-image
```

After host-image compilation is complete, create a docker image:
```sh
$ cd /root/go/src/yunion.io/x/cloudpods
$ docker build -t test-host-image:v1 -f ./build/docker/Dockerfile.host-image . 
```

