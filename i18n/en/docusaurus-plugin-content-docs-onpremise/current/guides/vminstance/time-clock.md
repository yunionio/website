---
sidebar_position: 13
---

# Virtual Machine Clock

Virtual machine clock is provided by virtual device `-rtc base=utc,clock=host,driftfix=none`. Virtual machine hardware base clock is based on host's UTC time.

Therefore, virtual machines need to configure their hardware clock as UTC time. If not configured correctly, virtual machine time may be inaccurate.

The following introduces methods for virtual machines to configure hardware clock as UTC time.

### Linux System

Modify /etc/adjtime, set the third line to UTC

### Windows System

Run regedit, open registry, under HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\TimeZoneInformation, right-click New > DWORD (32-bit) Value, name it RealTimeIsUniversal, key value is 1.

