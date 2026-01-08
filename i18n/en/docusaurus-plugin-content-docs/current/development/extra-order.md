---
sidebar_position: 7
---

# Add Option Support for External Table Queries

For sorting functionality within tables, it can be achieved through order_by&&order, but for external table association query functionality, order_by&&order is no longer sufficient. Therefore, additional fields need to be added to implement association query functionality. This example uses disk association with guest sorted by total guest count as an example.

## Determine Resource

First determine the resource that needs to be associated. For example, this time it is the disk resource, so in climc calls it corresponds to disk-list. In climc and region, the files that need to be modified and added are cmd/climc/shell/compute/disks.go, pkg/apis/compute/disks.go, pkg/compute/models/disks.go

## climc Content

In climc, it is mainly used for command-line input to determine input parameters, --order-by-guest-count asc|desc

```bash
# vim cmd/climc/shell/compute/disks.go, add command in ListOptions in init()

type DiskListOptions struct {
		options.BaseListOptions
		...
		OrderByGuestCount string `help:"Order By Guest Count"`
        ...
}

```

##  region Content

In climc, it is mainly used for logic processing to determine the region service fields that need to be added for list commands

```sh
#vim pkg/apis/compute/disks.go, add field in ListInput
type DiskListInput struct {
	...
	OrderByGuestCount sting `json:"order_by_guest_count" choices:"asc|desc"`
	...
}
```


```sh
#vim pkg/compute/models/disks.go, add sorting logic in OrderByExtraFields function
func (manager *SDiskManager) OrderByExtraFields(
	ctx context.Context,
	q *sqlchemy.SQuery,
	userCred mcclient.TokenCredential,
	query api.DiskListInput,
) (*sqlchemy.SQuery, error) {
	...
if db.NeedOrderQuery([]string{query.OrderByGuestCount}) {
		guestdisks := GuestdiskManager.Query().SubQuery()
		disks := DiskManager.Query().SubQuery()
		guestdiskQ := guestdisks.Query(
			guestdisks.Field("guest_id"),
			guestdisks.Field("disk_id"),
			sqlchemy.COUNT("guest_count", guestdisks.Field("guest_id")),
		)

		guestdiskQ = guestdiskQ.LeftJoin(disks, sqlchemy.Equals(guestdiskQ.Field("disk_id"), disks.Field("id")))
		guestdiskSQ := guestdiskQ.GroupBy(guestdiskQ.Field("disk_id")).SubQuery()
		q.AppendField(q.QueryFields()...)
		q.AppendField(guestdiskSQ.Field("guest_count"))
		q = q.LeftJoin(guestdiskSQ, sqlchemy.Equals(q.Field("id"), guestdiskSQ.Field("disk_id")))
		db.OrderByFields(q, []string{query.OrderByGuestCount}, []sqlchemy.IQueryField{guestdiskQ.Field("guest_count")})
	}
	...
}
```

