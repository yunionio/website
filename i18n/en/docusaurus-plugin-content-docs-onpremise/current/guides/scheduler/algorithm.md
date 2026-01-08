---
sidebar_position: 1
---

# Scheduling Algorithm

The scheduler's implementation principle references Kubernetes' scheduler, also implemented through two scheduling phases:

* Filtering Phase

Filter candidate hosts according to virtual machine requirements for hosts and host attributes. Exclude hosts that do not meet requirements.

* Ranking Phase

Sort remaining hosts, prioritize selecting hosts with high scores as candidates.


The scheduler's special feature is: supports batch scheduling, that is, can schedule N hosts simultaneously, without needing to schedule one by one.


