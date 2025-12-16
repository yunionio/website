---
sidebar_position: 10
---

# Network Card Traffic Limit

This section introduces setting network card traffic limits. Network card traffic limits are divided into upstream and downstream traffic. As long as traffic on one side exceeds the limit, the network card will be cut off. Network card traffic limits are implemented by collecting network card receive and send packet monitoring data. The collection cycle is one minute, so traffic may exceed the limit but the network card will only be cut off after the traffic collection cycle arrives.

## Set Traffic Limit

### Set Traffic Limit When Creating Virtual Machine
```bash
$ climc server-create --network rx-traffic-limit=102400000,tx-traffic-limit=102400000 ...

# tx-traffic-limit is upstream, rx-traffic-limit is downstream, both in bytes

# View network card details
$ climc server-network-show <SERVER_ID> <NETWORK_ID>
| rx_traffic_limit | 102400000                            |
| rx_traffic_used  | 0                                    |
......
| tx_traffic_limit | 102400000                            |
| tx_traffic_used  | 0                                    |

# rx_traffic_used/tx_traffic_used are used network card traffic information, both in bytes
```

### Set Traffic Limit for Network Card Separately

```bash
# There are two interfaces for setting traffic limits:
$ server-set-nic-traffic-limit
Usage: climc server-set-nic-traffic-limit [--tx-traffic-limit TX_TRAFFIC_LIMIT] [--help] [--rx-traffic-limit RX_TRAFFIC_LIMIT] <ID> <MAC>
$ server-reset-nic-traffic-limit
Usage: climc server-reset-nic-traffic-limit [--tx-traffic-limit TX_TRAFFIC_LIMIT] [--help] [--rx-traffic-limit RX_TRAFFIC_LIMIT] <ID> <MAC>

# server-set-nic-traffic-limit sets network card traffic limit without resetting used traffic
# server-reset-nic-traffic-limit sets network card traffic limit and resets used traffic at the same time
# MAC in parameters is the network card's mac address

# After setting, view network card information
$ climc server-network-show <SERVER_ID> <NETWORK_ID>
```

After the network card traffic reaches the limit, the network card will be cut off. You need to call these two interfaces to set a higher traffic limit or reset the network card's used traffic to restore the network card.

