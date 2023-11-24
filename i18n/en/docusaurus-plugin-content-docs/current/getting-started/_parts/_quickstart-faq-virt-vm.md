The nodes deployed by All in One will deploy the Cloudpods host computing service as the host machine, which has the ability to create and manage private cloud virtual machines. If there is no virtual machine interface, it means that the host machine is not enabled in the Cloudpods environment.

Please go to the `Management Console` interface, click `Host/Basic Resources/Host` to view the host list, enable the corresponding host, and refresh the interface to display the virtual machine interface.

:::note
If you want to use Cloudpods private cloud virtual machines, and the host machine is a distribution of CentOS 7, the host machine needs to use the kernel compiled by Cloudpods. You can use the following command to check if the host machine is using the Cloudpods kernel (containing the keyword "yn").

```bash
# Check whether to use the yn kernel
uname -a | grep yn
Linux office-controller 3.10.0-1160.6.1.el7.yn20201125.x86_64

# If the kernel version does not contain the keyword "yn", it may be the first time the ocboot is installed, and you can enter the yn kernel by restarting.
reboot
```
:::

![Host machine](../images/host.png)