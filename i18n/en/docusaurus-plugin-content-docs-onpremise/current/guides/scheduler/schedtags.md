---
sidebar_position: 2
---

# Scheduling Policy

Introduction to scheduling tags and scheduling policy function concepts, and examples of how to implement scheduling functionality.

Implement complex scheduling policies based on scheduling tags.

## Scheduling Tags

Scheduling tags are used to bind with resources to achieve resource scheduling. Scheduling tags support binding to basic resources such as hosts, networks, block storage, etc. Administrators can create and statically bind tags or create dynamic scheduling for them according to resource usage scenarios and purposes.

Default policies for scheduling tags include prefer, avoid, exclude, and none. Note that require cannot be set as the default policy for scheduling tags. When creating virtual machines, if no scheduling policy is matched and no preference for any scheduling tag is specified, the default policy takes effect.

- Prefer: Default policy for resources bound with this type of scheduling tag is prefer. That is, try to use resources bound with this type of scheduling tag. If they don't have this type of tag, they can also be used.
- Avoid: Default policy for resources bound with this type of scheduling tag is avoid. That is, try to avoid using resources bound with this type of scheduling tag. If they have this type of tag, they can also be used.
- Exclude: Default policy for resources bound with this type of scheduling tag is exclude. That is, prohibit using resources bound with this type of scheduling tag.
- None: Default policy for resources bound with this type of scheduling tag is none.

## Dynamic Scheduling Tags

Dynamic scheduling tags are a way for scheduling tags to bind with resources. According to set conditions, dynamically bind scheduling tags to hosts before resource scheduling. Tags bound to hosts each time may not be the same, thus achieving flexible resource scheduling.

## Scheduling Policy

Set that when specified conditions are met, virtual machines will be created on hosts bound with a certain type of scheduling tag according to preference selection or exclusion. Preferences in scheduling policies will override default preferences in scheduling tags. Scheduling policies will affect the final scheduling results.

Preferences in scheduling policies are divided into the following four types:

- Prefer: Prioritize using hosts with this type of scheduling tag during scheduling. If there are no hosts with this type of scheduling tag, it is also acceptable.
- Avoid: Try to avoid hosts with this type of scheduling tag during scheduling. If there are hosts with this type of scheduling tag, it is also acceptable.
- Exclude: Must exclude hosts with this type of scheduling tag during scheduling.
- Require: Must use hosts with this type of scheduling tag during scheduling.

## Examples

Using hosts as an example, introduce how scheduling tags and scheduling policies implement resource scheduling functionality.

### Scheduling Policy Application

If there is a batch of hosts only for specific project A to use, and other projects cannot use these hosts. Scheduling functionality can be implemented through the following operations.

1. Create a scheduling tag owner_by_project with default policy exclude, and bind this tag to corresponding hosts.
2. Create a scheduling policy with preference prefer for scheduling tag owner_by_project, and condition select specific project A.
3. When users create virtual machines in project A later, if scheduling policy remains default, the system will select hosts with owner_by_project scheduling tag to create virtual machines according to the scheduling policy. When creating virtual machines in other projects, hosts with owner_by_project scheduling tag will not be selected.

### Dynamic Scheduling Tag Application


When a host's free cpu count is less than 10 or memory is less than 2g, try to avoid scheduling virtual machines to these hosts.

1. Create scheduling tag low_cpu_mem with default policy avoid.
2. Create dynamic scheduling tag host_low_cpu_mem, add matching condition as 'host.free_cpu_count < 10 || host.free_mem_size < 2048', corresponding to low_cpu_mem scheduling tag. Currently the interface does not support setting CPU memory conditions, can be set through Climc command.

```bash
# Create scheduling tag
$ climc schedtag-create low_cpu_mem --strategy avoid

# Create dynamic scheduling tag mechanism
$ climc dynamic-schedtag-create --enable host_low_cpu_mem low_cpu_mem 'host.free_cpu_count < 10 || host.free_mem_size < 2048'
```


