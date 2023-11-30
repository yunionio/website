As shown in the figure below, if there is no host in the host list after the environment is deployed, you can troubleshoot as follows:

  ![](../images/nohost.png)

1. To troubleshoot host issues on the control node, please refer to: [Troubleshooting Host Service Issues](../../guides/onpremise/host/troubleshooting)

    1. If the log error message contains "register failed: try create network: find_matched == false", it means that the IP subnet containing the host has not been successfully created, resulting in host registration failure. Please create an IP subnet containing the host network segment.

    ```
    # Create an IP subnet containing the host network segment
    $ climc network-create bcast0 adm0 <start_ip> <end_ip> mask
    ```

    ![](../images/iperror.png)

    2. If the log error message contains "name starts with letter, and contains letter, number and - only", it means that the hostname of the host is not compliant and should be changed to a hostname starting with a letter.

    ![](../images/hostnameerror.png)
