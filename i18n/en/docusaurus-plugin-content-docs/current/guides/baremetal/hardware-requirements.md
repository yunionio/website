---
sidebar_position: 10
---

# Physical Machine Hardware Requirements

## CPU Architecture

x86 or arm64

## BIOS Motherboard

- Support Legacy (traditional mode) or UEFI PXE boot network startup
- Support BMC IPMI out-of-band control (enable IPMI-over-LAN)
- If PXE and hard disk boot order is set, when PXE boot is unsuccessful, it will try disk boot

## Hard Disk

Hard disks support HDD (mechanical hard disk), SSD (solid state disk) and NVME SSD.

Support the following RAID drivers:

- MegaRaid
- HPSARaid
- Mpt2/3SAS
- AdaptecRaid
- MarvelRaid

NVME SSD requires **nvme** or **nvme_core** driver in the kernel

## Network Card

Support the following kernel network card drivers:

- ixgbe
- igb
- e1000, e100e
- tg3
- bnx2
- i40e
- bnx2x
- bnxt_en

