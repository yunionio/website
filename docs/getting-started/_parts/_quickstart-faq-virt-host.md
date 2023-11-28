如下图所示，若发现环境部署完成后宿主机列表中没有宿主机，可按照以下方式进行排查

  ![](../images/nohost.png)


1. 在控制节点排查 host 问题，请参考：[Host服务问题排障技巧](../onpremise/faq/host)


    1. 若日志报错信息中包含“register failed: try create network: find_matched == false”，则表示未成功创建包含宿主机的IP子网，导致宿主机注册失败，请创建包含宿主机网段的IP子网。

    ```
    # 创建包含宿主机网段的IP子网
    $ climc network-create bcast0  adm0 <start_ip> <end_ip> mask
    ```

    ![](../images/iperror.png)

    2. 若日志报错信息中包含“name starts with letter, and contains letter, number and - only”，则表示宿主机的主机名不合规，应改成以字母开头的hostname

    ![](../images/hostnameerror.png)
