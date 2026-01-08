---
sidebar_position: 1
---

# New Resource Integration

Introduces how cloud platforms integrate a new resource type.

This article uses Alibaba Cloud ElasticSearch as an example (cloudpods has supported it since v3.8) to introduce how to manage ElasticSearch

## git diff Reference (Tencent Cloud integration will also be included)

[https://github.com/yunionio/cloudpods/pull/11595/files](https://github.com/yunionio/cloudpods/pull/11595/files)

:::tip
Since v3.10, cloudpods' operations for each cloud have been moved to the [cloudmux](https://github.com/yunionio/cloudmux) repository. Changes to pkg/cloudprovider and pkg/multicloud need to be made in **cloudmux**
:::

## Define ElasticSearch Interface

Edit the pkg/cloudprovider/resources.go file and append at the end of the file.

```go
type ICloudElasticSearch interface {
    // Note: During synchronization, you can only define some basic information first, then synchronize resources
    // Later, add corresponding interfaces or operations to resources based on resource attributes
    IVirtualResource
    IBillingResource
}
```

## Implement Alibaba Cloud Basic Data Structure

Create pkg/multicloud/aliyun/elastic_search.go file and fill in Alibaba Cloud ElasticSearch basic data structure.

```go
package aliyun

type SElasticSearch struct {
    // Here we uniformly implement the Aliyun tag interface, which can reduce some function declarations
    multicloud.AliyunTags
    // Same as above, but some IVirtualResource interfaces still need to be implemented
    multicloud.SVirtualResourceBase
    // Some basic methods for billing
    multicloud.SBillingBase
    // Chain structure for operating on ElasticSearch
    region *SRegion

    // Alibaba Cloud ElasticSearch attributes
    ...
}

// Implement functions to get Alibaba Cloud ElasticSearch resources

// Get ElasticSearch resource list
func (self *SRegion) GetElasticSearchs(size, page int) ([]SElasticSearch, int, error) {
    ...
}

// Get single ElasticSearch resource
func (self *SRegion) GetElasitcSearch(id string) (*SElasticSearch, error) {
    ...
}
```

## Implement aliyuncli Command Line (for quick debugging)

Create pkg/multicloud/aliyun/shell/elk.go file.

```go
package shell

func init() {
    type ElkListOptions struct {
        Page int
        Size int
    }
    shellutils.R(&ElkListOptions{}, "elastic-search-list", "List elastic searchs", func(cli *aliyun.SRegion, args *ElkListOptions) error {
        elks, _, err := cli.GetElasticSearchs(args.Size, args.Page)
        if err != nil {
            return err
        }
        printList(elks, 0, 0, 0, nil)
        return nil
    })

    type ElkIdOptions struct {
        ID string
    }

    shellutils.R(&ElkIdOptions{}, "elastic-search-show", "Show elasitc search", func(cli *aliyun.SRegion, args *ElkIdOptions) error {
        elk, err := cli.GetElasitcSearch(args.ID)
        if err != nil {
            return err
        }
        printObject(elk)
        return nil
    })

}
```

## Debug aliyuncli Command

```bash
# Clone cloudmux
$ git clone https://github.com/yunionio/cloudmux.git && cd cloudmux
# Compile aliyuncli command
$ make cmd/aliyuncli

# Declare environment variables
$ export ALIYUN_ACCESS_KEY=LTAI5H1wXkXeas1M
$ export ALIYUN_SECRET=cByPBQM9zFVgNBMKNJZMYrKFUkvVk8
# Set according to region situation
$ export ALIYUN_REGION=cn-beijing

# Execute ElasticSearch resource list command
$ ./_output/bin/aliyuncli elastic-search-list
$ ./_output/bin/aliyuncli elastic-search-show es-cn-n6w1ptcb30009****
```

## Supplement ElasticSearch Interface

Edit pkg/multicloud/aliyun/elastic_search.go file and implement the following interfaces.

```go
func (self *SElasticSearch) GetId() string {
    ...
}

// The return value of this function will be stored in the external_id field of the database. Please ensure it can correspond one-to-one with cloud resources
// If it's an Azure resource, please be sure to return strings.ToLower(), because Azure resource IDs are case-insensitive, but ID case returns are not fixed, which will cause resource repeated addition/deletion issues during synchronization
func (self *SElasticSearch) GetGlobalId() string {
    ...
}

// Get ElasticSearch resource name
func (self *SElasticSearch) GetName() string {
    ...
}

// Create, delete, or other operations need to loop to get resource status to determine if the operation is complete. This function mainly refreshes status fields or other related fields
func (self *SElasticSearch) Refresh() error {
    ...
}

// Get resource creation time
func (self *SElasticSearch) GetCreatedAt() time.Time {
    ...
}

// Get resource billing method: prepaid, postpaid?
func (self *SElasticSearch) GetBillingType() string {
    ...
}

// Get resource project ID
func (self *SElasticSearch) GetProjectId() string {
    ...
}

// Get resource status
func (self *SElasticSearch) GetStatus() string {
    ...
}

```

## Add Region Get ElasticSearch Interface

Edit pkg/cloudprovider/resources.go file, find the ICloudRegion definition, and add the following two interfaces:

```go
type ICloudRegion interface {
    ...

    GetIElasticSearchs() ([]ICloudElasticSearch, error)
    GetIElasticSearchById(id string) (ICloudElasticSearch, error)
}
```

Edit pkg/multicloud/region_base.go to implement the two basic methods.

```go
// This is mainly because integration often starts with one or two clouds
// If these two basic methods are not implemented, then these two methods need to be implemented in each cloud's region.go file
func (self *SRegion) GetIElasticSearchs() ([]cloudprovider.ICloudElasticSearch, error) {
    return nil, errors.Wrapf(cloudprovider.ErrNotImplemented, "GetIElasticSearchs")
}

func (self *SRegion) GetIElasticSearchById(id string) (cloudprovider.ICloudElasticSearch, error) {
    return nil, errors.Wrapf(cloudprovider.ErrNotImplemented, "GetIElasticSearchById")
}
```

Edit pkg/multicloud/aliyun/elastic_search.go file
```go
// Implement these two methods for Alibaba Cloud

// Implement GetIElasticSearchs interface
func (self *SRegion) GetIElasticSearchs() ([]cloudprovider.ICloudElasticSearch, error) {
    // Get all elasticsearch instances in the current region
    ess, err := self.GetElasticSearchs(...)
    if err != nil {
        return err
    }
    ret := []cloudprovider.ICloudElasticSearch{}
    for i := range ess {
        // Assignment is needed here. For example, for deletion, you can use ess[i].region.DeleteElasticSearch(ess[i].InstanceId)
        ess[i].region = self
        ret = append(ret, &ess[i])
    }
    return ret, nil
}

// Implement GetIElasticSearchById interface
func (self *SRegion) GetIElasticSearchById(id string) (cloudprovider.ICloudElasticSearch, error) {
    // es.region = self is not used here because it has already been assigned in the GetElasitcSearch function
    es, err := self.GetElasitcSearch(id)
    if err != nil {
        return nil, err
    }
    return es, nil
}
```

## Define Local Resource Model

Create pkg/apis/compute/elastic_search.go file and prepare the required data structure.

```go
package compute

import "yunion.io/x/onecloud/pkg/apis"

const (
    ELASTIC_SEARCH_STATUS_AVAILABLE     = "available"
    ELASTIC_SEARCH_STATUS_UNAVAILABLE   = "unavailable"
    ELASITC_SEARCH_STATUS_CREATING      = "creating"
    ELASTIC_SEARCH_STATUS_DELETING      = "deleting"
    ELASTIC_SEARCH_STATUS_DELETE_FAILED = "delete_failed"
    ELASTIC_SEARCH_STATUS_UNKNOWN       = "unknown"
)

// Resource creation parameters, currently just placeholder
type ElasticSearchCreateInput struct {
}

// Resource return details
type ElasticSearchDetails struct {
    apis.VirtualResourceDetails
    ManagedResourceInfo
    CloudregionResourceInfo
}

// Resource list request parameters
type ElasticSearchListInput struct {
    apis.VirtualResourceListInput
    apis.ExternalizedResourceBaseListInput
    apis.DeletePreventableResourceBaseListInput

    RegionalFilterListInput
    ManagedResourceListInput
}
```

Create pkg/compute/models/elastic_search.go file and implement basic manager and model.

```go
package models

import (
    "context"
    "fmt"

    "yunion.io/x/jsonutils"
    "yunion.io/x/pkg/errors"
    "yunion.io/x/pkg/util/compare"
    "yunion.io/x/sqlchemy"

    billing_api "yunion.io/x/onecloud/pkg/apis/billing"
    api "yunion.io/x/onecloud/pkg/apis/compute"
    "yunion.io/x/onecloud/pkg/cloudcommon/db"
    "yunion.io/x/onecloud/pkg/cloudcommon/db/lockman"
    "yunion.io/x/onecloud/pkg/cloudprovider"
    "yunion.io/x/onecloud/pkg/httperrors"
    "yunion.io/x/onecloud/pkg/mcclient"
    "yunion.io/x/onecloud/pkg/util/stringutils2"
)

type SElasticSearchManager struct {
    # Since resources are user resources, they are defined as Virtual resources
    db.SVirtualResourceBaseManager
    db.SExternalizedResourceBaseManager
    SDeletePreventableResourceBaseManager

    SCloudregionResourceBaseManager
    SManagedResourceBaseManager
}

var ElasticSearchManager *SElasticSearchManager

func init() {
    ElasticSearchManager = &SElasticSearchManager{
        SVirtualResourceBaseManager: db.NewVirtualResourceBaseManager(
            SElasticSearch{},
            "elastic_searchs_tbl",
            "elastic_search",
            "elastic_searchs",
        ),
    }
    ElasticSearchManager.SetVirtualObject(ElasticSearchManager)
}

type SElasticSearch struct {
    db.SVirtualResourceBase
    db.SExternalizedResourceBase
    SManagedResourceBase
    SBillingResourceBase

    SCloudregionResourceBase
    SDeletePreventableResourceBase
}

func (manager *SElasticSearchManager) GetContextManagers() [][]db.IModelManager {
    return [][]db.IModelManager{
        {CloudregionManager},
    }
}

// ElasticSearch instance list
func (man *SElasticSearchManager) ListItemFilter(
    ctx context.Context,
    q *sqlchemy.SQuery,
    userCred mcclient.TokenCredential,
    query api.ElasticSearchListInput,
) (*sqlchemy.SQuery, error) {
    var err error
    q, err = man.SVirtualResourceBaseManager.ListItemFilter(ctx, q, userCred, query.VirtualResourceListInput)
    if err != nil {
        return nil, errors.Wrap(err, "SVirtualResourceBaseManager.ListItemFilter")
    }
    q, err = man.SExternalizedResourceBaseManager.ListItemFilter(ctx, q, userCred, query.ExternalizedResourceBaseListInput)
    if err != nil {
        return nil, errors.Wrap(err, "SExternalizedResourceBaseManager.ListItemFilter")
    }
    q, err = man.SDeletePreventableResourceBaseManager.ListItemFilter(ctx, q, userCred, query.DeletePreventableResourceBaseListInput)
    if err != nil {
        return nil, errors.Wrap(err, "SDeletePreventableResourceBaseManager.ListItemFilter")
    }
    q, err = man.SManagedResourceBaseManager.ListItemFilter(ctx, q, userCred, query.ManagedResourceListInput)
    if err != nil {
        return nil, errors.Wrap(err, "SManagedResourceBaseManager.ListItemFilter")
    }
    q, err = man.SCloudregionResourceBaseManager.ListItemFilter(ctx, q, userCred, query.RegionalFilterListInput)
    if err != nil {
        return nil, errors.Wrap(err, "SCloudregionResourceBaseManager.ListItemFilter")
    }

    return q, nil
}

func (man *SElasticSearchManager) OrderByExtraFields(
    ctx context.Context,
    q *sqlchemy.SQuery,
    userCred mcclient.TokenCredential,
    query api.ElasticSearchListInput,
) (*sqlchemy.SQuery, error) {
    q, err := man.SVirtualResourceBaseManager.OrderByExtraFields(ctx, q, userCred, query.VirtualResourceListInput)
    if err != nil {
        return nil, errors.Wrap(err, "SVirtualResourceBaseManager.OrderByExtraFields")
    }
    q, err = man.SCloudregionResourceBaseManager.OrderByExtraFields(ctx, q, userCred, query.RegionalFilterListInput)
    if err != nil {
        return nil, errors.Wrap(err, "SCloudregionResourceBaseManager.OrderByExtraFields")
    }
    q, err = man.SManagedResourceBaseManager.OrderByExtraFields(ctx, q, userCred, query.ManagedResourceListInput)
    if err != nil {
        return nil, errors.Wrap(err, "SManagedResourceBaseManager.OrderByExtraFields")
    }
    return q, nil
}

func (man *SElasticSearchManager) QueryDistinctExtraField(q *sqlchemy.SQuery, field string) (*sqlchemy.SQuery, error) {
    q, err := man.SVirtualResourceBaseManager.QueryDistinctExtraField(q, field)
    if err == nil {
        return q, nil
    }
    q, err = man.SCloudregionResourceBaseManager.QueryDistinctExtraField(q, field)
    if err == nil {
        return q, nil
    }
    q, err = man.SManagedResourceBaseManager.QueryDistinctExtraField(q, field)
    if err == nil {
        return q, nil
    }
    return q, httperrors.ErrNotFound
}

func (man *SElasticSearchManager) ValidateCreateData(ctx context.Context, userCred mcclient.TokenCredential, ownerId mcclient.IIdentityProvider, query jsonutils.JSONObject, input api.ElasticSearchCreateInput) (api.ElasticSearchCreateInput, error) {
    return input, httperrors.NewNotImplementedError("Not Implemented")
}

func (manager *SElasticSearchManager) FetchCustomizeColumns(
    ctx context.Context,
    userCred mcclient.TokenCredential,
    query jsonutils.JSONObject,
    objs []interface{},
    fields stringutils2.SSortedStrings,
    isList bool,
) []api.ElasticSearchDetails {
    rows := make([]api.ElasticSearchDetails, len(objs))
    virtRows := manager.SVirtualResourceBaseManager.FetchCustomizeColumns(ctx, userCred, query, objs, fields, isList)
    manRows := manager.SManagedResourceBaseManager.FetchCustomizeColumns(ctx, userCred, query, objs, fields, isList)
    regRows := manager.SCloudregionResourceBaseManager.FetchCustomizeColumns(ctx, userCred, query, objs, fields, isList)

    for i := range rows {
        rows[i] = api.ElasticSearchDetails{
            VirtualResourceDetails:  virtRows[i],
            ManagedResourceInfo:     manRows[i],
            CloudregionResourceInfo: regRows[i],
        }
    }

    return rows
}

func (self *SCloudregion) GetElasticSearchs(managerId string) ([]SElasticSearch, error) {
    q := ElasticSearchManager.Query().Equals("cloudregion_id", self.Id)
    if len(managerId) > 0 {
        q = q.Equals("manager_id", managerId)
    }
    ret := []SElasticSearch{}
    err := db.FetchModelObjects(ElasticSearchManager, q, &ret)
    if err != nil {
        return nil, errors.Wrapf(err, "db.FetchModelObjects")
    }
    return ret, nil
}

func (self *SCloudregion) SyncElasticSearchs(ctx context.Context, userCred mcclient.TokenCredential, provider *SCloudprovider, exts []cloudprovider.ICloudElasticSearch) compare.SyncResult {
    // Lock to prevent re-entry
    lockman.LockRawObject(ctx, ElasticSearchManager.KeywordPlural(), fmt.Sprintf("%s-%s", provider.Id, self.Id))
    defer lockman.ReleaseRawObject(ctx, ElasticSearchManager.KeywordPlural(), fmt.Sprintf("%s-%s", provider.Id, self.Id))

    result := compare.SyncResult{}

    dbEss, err := self.GetElasticSearchs(provider.Id)
    if err != nil {
        result.Error(err)
        return result
    }

    removed := make([]SElasticSearch, 0)
    commondb := make([]SElasticSearch, 0)
    commonext := make([]cloudprovider.ICloudElasticSearch, 0)
    added := make([]cloudprovider.ICloudElasticSearch, 0)
    // Compare local and cloud resource lists
    err = compare.CompareSets(dbEss, exts, &removed, &commondb, &commonext, &added)
    if err != nil {
        result.Error(err)
        return result
    }

    // Delete resources that don't exist on cloud
    for i := 0; i < len(removed); i++ {
        err := removed[i].syncRemoveCloudElasticSearch(ctx, userCred)
        if err != nil {
            result.DeleteError(err)
            continue
        }
        result.Delete()
    }

    // Synchronize with cloud resource attributes
    for i := 0; i < len(commondb); i++ {
        err := commondb[i].SyncWithCloudElasticSearch(ctx, userCred, commonext[i])
        if err != nil {
            result.UpdateError(err)
            continue
        }
        result.Update()
    }

    // Create cloud resources that don't exist locally
    for i := 0; i < len(added); i++ {
        _, err := self.newFromCloudElasticSearch(ctx, userCred, provider, added[i])
        if err != nil {
            result.AddError(err)
            continue
        }
        result.Add()
    }
    return result
}

// Determine if resource can be deleted
func (self *SElasticSearch) ValidateDeleteCondition(ctx context.Context) error {
    if self.DisableDelete.IsTrue() {
        return httperrors.NewInvalidStatusError("ElasticSearch is locked, cannot delete")
    }
    return self.SStatusStandaloneResourceBase.ValidateDeleteCondition(ctx)
}

func (self *SElasticSearch) syncRemoveCloudElasticSearch(ctx context.Context, userCred mcclient.TokenCredential) error {
    return self.Delete(ctx, userCred)
}

// Synchronize resource attributes
func (self *SElasticSearch) SyncWithCloudElasticSearch(ctx context.Context, userCred mcclient.TokenCredential, ext cloudprovider.ICloudElasticSearch) error {
    diff, err := db.UpdateWithLock(ctx, self, func() error {
        self.ExternalId = ext.GetGlobalId()
        self.Status = ext.GetStatus()

        self.BillingType = ext.GetBillingType()
        if self.BillingType == billing_api.BILLING_TYPE_PREPAID {
            if expiredAt := ext.GetExpiredAt(); !expiredAt.IsZero() {
                self.ExpiredAt = expiredAt
            }
            self.AutoRenew = ext.IsAutoRenew()
        }
        return nil
    })
    if err != nil {
        return errors.Wrapf(err, "db.Update")
    }

    syncVirtualResourceMetadata(ctx, userCred, self, ext)
    if provider := self.GetCloudprovider(); provider != nil {
        SyncCloudProject(userCred, self, provider.GetOwnerId(), ext, provider.Id)
    }
    db.OpsLog.LogSyncUpdate(self, diff, userCred)
    return nil
}

func (self *SCloudregion) newFromCloudElasticSearch(ctx context.Context, userCred mcclient.TokenCredential, provider *SCloudprovider, ext cloudprovider.ICloudElasticSearch) (*SElasticSearch, error) {
    es := SElasticSearch{}
    es.SetModelManager(ElasticSearchManager, &es)

    es.ExternalId = ext.GetGlobalId()
    es.CloudregionId = self.Id
    es.ManagerId = provider.Id
    es.IsEmulated = ext.IsEmulated()
    es.Status = ext.GetStatus()

    if createdAt := ext.GetCreatedAt(); !createdAt.IsZero() {
        es.CreatedAt = createdAt
    }

    es.BillingType = ext.GetBillingType()
    if es.BillingType == billing_api.BILLING_TYPE_PREPAID {
        if expired := ext.GetExpiredAt(); !expired.IsZero() {
            es.ExpiredAt = expired
        }
        es.AutoRenew = ext.IsAutoRenew()
    }

    var err error
    err = func() error {
        // Lock here to prevent duplicate names
        lockman.LockRawObject(ctx, ElasticSearchManager.Keyword(), "name")
        defer lockman.ReleaseRawObject(ctx, ElasticSearchManager.Keyword(), "name")

        es.Name, err = db.GenerateName(ctx, ElasticSearchManager, provider.GetOwnerId(), ext.GetName())
        if err != nil {
            return errors.Wrapf(err, "db.GenerateName")
        }
        return ElasticSearchManager.TableSpec().Insert(ctx, &es)
    }()
    if err != nil {
        return nil, errors.Wrapf(err, "newFromCloudElasticSearch.Insert")
    }

    // Synchronize tags
    syncVirtualResourceMetadata(ctx, userCred, &es, ext)
    // Synchronize project ownership
    SyncCloudProject(userCred, &es, provider.GetOwnerId(), ext, provider.Id)

    db.OpsLog.LogEvent(&es, db.ACT_CREATE, es.GetShortDesc(ctx), userCred)

    return &es, nil
}

func (manager *SElasticSearchManager) ListItemExportKeys(ctx context.Context,
    q *sqlchemy.SQuery,
    userCred mcclient.TokenCredential,
    keys stringutils2.SSortedStrings,
) (*sqlchemy.SQuery, error) {
    var err error

    q, err = manager.SVirtualResourceBaseManager.ListItemExportKeys(ctx, q, userCred, keys)
    if err != nil {
        return nil, errors.Wrap(err, "SVirtualResourceBaseManager.ListItemExportKeys")
    }

    if keys.ContainsAny(manager.SManagedResourceBaseManager.GetExportKeys()...) {
        q, err = manager.SManagedResourceBaseManager.ListItemExportKeys(ctx, q, userCred, keys)
        if err != nil {
            return nil, errors.Wrap(err, "SManagedResourceBaseManager.ListItemExportKeys")
        }
    }

    if keys.ContainsAny(manager.SCloudregionResourceBaseManager.GetExportKeys()...) {
        q, err = manager.SCloudregionResourceBaseManager.ListItemExportKeys(ctx, q, userCred, keys)
        if err != nil {
            return nil, errors.Wrap(err, "SCloudregionResourceBaseManager.ListItemExportKeys")
        }
    }

    return q, nil
}
```

## Add RESTful Interface

Edit pkg/compute/service/handlers.go file.

```go
func InitHandlers(app *appsrv.Application) {
    ...
    for _, manager := range []db.IModelManager{
        ...
    } {
        db.RegisterModelManager(manager)
    }

    for _, manager := range []db.IModelManager{
        ...

        // Add es manager        
        models.ElasticSearchManager,
    } {
        db.RegisterModelManager(manager)
        handler := db.NewModelHandler(manager)
        dispatcher.AddModelDispatcher("", app, handler)
    }
}
```

## Package Image, Restart region Service

```bash
# Package image
$ ARCH=all TAG=v3.8.es REGISTRY=registry.cn-beijing.aliyuncs.com/your-image-namespace ./scripts/docker_push.sh region
# Replace image, restart service
$ kubectl edit deployments. -n onecloud default-region # Replace the image in the configuration file with the image packaged above
```

## climc Command Writing

Create pkg/mcclient/modules/mod_elastic_searchs.go file and register module.

```go
package modules

import (
    "yunion.io/x/onecloud/pkg/mcclient/modulebase"
)

type ElasticSearchManager struct {
    modulebase.ResourceManager
}

var (
    ElasticSearchs ElasticSearchManager
)

func init() {
    ElasticSearchs = ElasticSearchManager{NewComputeManager("elastic_search", "elastic_searchs",
        []string{},
        []string{})}

    registerCompute(&ElasticSearchs)
}
```

Create pkg/mcclient/options/compute/elastic_search.go file and define climc command line parameters.

```go
package compute

import (
    "yunion.io/x/jsonutils"

    "yunion.io/x/onecloud/pkg/mcclient/options"
)

type ElasticSearchListOptions struct {
    options.BaseListOptions
}

func (opts *ElasticSearchListOptions) Params() (jsonutils.JSONObject, error) {
    return options.ListStructToParams(opts)
}

type ElasticSearchIdOption struct {
    ID string `help:"Elasticsearch Id"`
}

func (opts *ElasticSearchIdOption) GetId() string {
    return opts.ID
}

func (opts *ElasticSearchIdOption) Params() (jsonutils.JSONObject, error) {
    return nil, nil
}
```

Create cmd/climc/shell/compute/elastic_search.go file and add commands.

```go
package compute

import (
    "yunion.io/x/onecloud/cmd/climc/shell"
    "yunion.io/x/onecloud/pkg/mcclient/modules"
    "yunion.io/x/onecloud/pkg/mcclient/options/compute"
)

func init() {
    cmd := shell.NewResourceCmd(&modules.ElasticSearchs)
    cmd.List(&compute.ElasticSearchListOptions{})
    cmd.Show(&compute.ElasticSearchIdOption{})
}
```

## Debug climc Command

```bash
# Compile climc command
$ make cmd/climc

# Declare environment variables
$ source /root/.onecloud_rcadmin

# Execute ElasticSearch resource list command
$ ./_output/bin/climc --debug elastic-search-list # Since elastic search resources haven't been synchronized yet, the result is empty
$ ./_output/bin/climc --debug elastic-search-show es-cn-n6w1ptcb30009****

```

## Synchronize ElasticSearch Resources

Edit pkg/cloudprovider/consts.go file and define new resource type.

```go
const (
    CLOUD_CAPABILITY_PROJECT         = "project"
    ...
    CLOUD_CAPABILITY_ES              = "es"        // ElasticSearch
)

# Edit pkg/multicloud/aliyun/aliyun.go file and add cloud platform capability for new resource
func (region *SAliyunClient) GetCapabilities() []string {
    caps := []string{
        cloudprovider.CLOUD_CAPABILITY_PROJECT,
        ...
        ...
        cloudprovider.CLOUD_CAPABILITY_ES,
    }
    return caps
}
```


Edit pkg/compute/models/cloudsync.go file and add synchronization logic.

```go
func syncPublicCloudProviderInfo(
    ctx context.Context,
    userCred mcclient.TokenCredential,
    syncResults SSyncResultSet,
    provider *SCloudprovider,
    driver cloudprovider.ICloudProvider,
    localRegion *SCloudregion,
    remoteRegion cloudprovider.ICloudRegion,
    syncRange *SSyncRange,
) error {
    ...

    // If cloud platform supports ElasticSearch, synchronize es resources
    if utils.IsInStringArray(cloudprovider.CLOUD_CAPABILITY_ES, driver.GetCapabilities()) {
        syncElasticSearchs(ctx, userCred, syncResults, provider, localRegion, remoteRegion)
    }

    if cloudprovider.IsSupportCompute(driver) {
        ...
    }
    ...
}


func syncElasticSearchs(ctx context.Context, userCred mcclient.TokenCredential, syncResults SSyncResultSet, provider *SCloudprovider, localRegion *SCloudregion, remoteRegion cloudprovider.ICloudRegion) error {
    iEss, err := remoteRegion.GetIElasticSearchs()
    if err != nil {
        msg := fmt.Sprintf("GetIElasticSearchs for region %s failed %s", remoteRegion.GetName(), err)
        log.Errorf(msg)
        return err
    }

    result := localRegion.SyncElasticSearchs(ctx, userCred, provider, iEss)
    syncResults.Add(ElasticSearchManager, result)
    msg := result.Result()
    log.Infof("SyncElasticSearchs for region %s result: %s", localRegion.Name, msg)
    if result.IsError() {
        return result.AllError()
    }
    return nil
}

```

## Package Image, Restart Service, Synchronize Resources

```bash
# Package image
$ ARCH=all TAG=v3.8.es REGISTRY=registry.cn-beijing.aliyuncs.com/your-image-namespace ./scripts/docker_push.sh region
# Replace image, restart service
$ kubectl edit deployments. -n onecloud default-region # Replace the image in the configuration file with the image packaged above
# Declare environment variables
$ source /root/.onecloud_rcadmin
$ climc cloud-account-sync --force --full-sync Alibaba Cloud account id
# Wait for resource synchronization to complete, check if resources are synchronized
$ climc elastic-search-list --scope system
```

## Add Resource Delete Operation

Edit pkg/cloudprovider/resources.go.

```go
type ICloudElasticSearch interface {
    IVirtualResource
    IBillingResource
    
    // Add delete interface
    Delete()
}

// Edit pkg/multicloud/aliyun/elastic_search.go file and implement Delete operation
func (self *SElasticSearch) Delete() error {
    return self.region.DeleteElasticSearch(self.InstanceId)
}

func (self *SRegion) DeleteElasticSearch(id string) error {
    ...
}

// Add aliyuncli command
// Edit pkg/multicloud/aliyun/shell/elk.go file
func init() {
    ...
    type ElkIdOptions struct {
        ID string
    }
    ...
    shellutils.R(&ElkIdOptions{}, "elastic-search-delete", "Delete elasitc search", func(cli *aliyun.SRegion, args *ElkIdOptions) error {
        return cli.DeleteElasticSearch(args.ID)
    })
}

// Edit pkg/compute/models/elastic_search.go file
// Add delete logic
... 
// Here rewrite the Delete method. Only call RealDelete method for actual deletion after Delete task is complete
func (self *SElasticSearch) Delete(ctx context.Context, userCred mcclient.TokenCredential) error {
    return nil
}

// Only delete local database resource after resource is actually deleted
func (self *SElasticSearch) RealDelete(ctx context.Context, userCred mcclient.TokenCredential) error {
    return self.SVirtualResourceBase.Delete(ctx, userCred)
}

// Enter delete task
func (self *SElasticSearch) CustomizeDelete(ctx context.Context, userCred mcclient.TokenCredential, query jsonutils.JSONObject, data jsonutils.JSONObject) error {
    return self.StartDeleteTask(ctx, userCred, "")
}

func (self *SElasticSearch) StartDeleteTask(ctx context.Context, userCred mcclient.TokenCredential, parentTaskId string) error {
    task, err := taskman.TaskManager.NewTask(ctx, "ElasticSearchDeleteTask", self, userCred, nil, parentTaskId, "", nil)
    if err != nil {
        return err
    }
    self.SetStatus(userCred, api.ELASTIC_SEARCH_STATUS_DELETING, "")
    task.ScheduleRun(nil)
    return nil
}

func (self *SElasticSearch) GetRegion() (*SCloudregion, error) {
    region, err := CloudregionManager.FetchById(self.CloudregionId)
    if err != nil {
        return nil, errors.Wrapf(err, "CloudregionManager.FetchById(%s)", self.CloudregionId)
    }
    return region.(*SCloudregion), nil
}

func (self *SElasticSearch) GetIRegion() (cloudprovider.ICloudRegion, error) {
    region, err := self.GetRegion()
    if err != nil {
        return nil, errors.Wrapf(err, "GetRegion")
    }
    provider, err := self.GetDriver()
    if err != nil {
        return nil, errors.Wrap(err, "self.GetDriver")
    }
    return provider.GetIRegionById(region.GetExternalId())
}

// Get corresponding resource on cloud
func (self *SElasticSearch) GetIElasticSearch() (cloudprovider.ICloudElasticSearch, error) {
    if len(self.ExternalId) == 0 {
        return nil, errors.Wrapf(cloudprovider.ErrNotFound, "empty externalId")
    }
    iRegion, err := self.GetIRegion()
    if err != nil {
        return nil, errors.Wrapf(cloudprovider.ErrNotFound, "GetIRegion")
    }
    return iRegion.GetIElasticSearchById(self.ExternalId)
}

func (self *SElasticSearch) syncRemoveCloudElasticSearch(ctx context.Context, userCred mcclient.TokenCredential) error {
    // Here need to change previous self.Delete to self.RealDelete to prevent resources from not being deleted during synchronization
    return self.RealDelete(ctx, userCred)
}
```

Create pkg/compute/tasks/elastic_search_delete_task.go file and write delete task.

```go
package tasks

import (
    "context"

    "yunion.io/x/jsonutils"
    "yunion.io/x/pkg/errors"

    api "yunion.io/x/onecloud/pkg/apis/compute"
    "yunion.io/x/onecloud/pkg/cloudcommon/db"
    "yunion.io/x/onecloud/pkg/cloudcommon/db/taskman"
    "yunion.io/x/onecloud/pkg/cloudprovider"
    "yunion.io/x/onecloud/pkg/compute/models"
    "yunion.io/x/onecloud/pkg/util/logclient"
)

type ElasticSearchDeleteTask struct {
    taskman.STask
}

func init() {
    taskman.RegisterTask(ElasticSearchDeleteTask{})
}

func (self *ElasticSearchDeleteTask) taskFail(ctx context.Context, es *models.SElasticSearch, err error) {
    es.SetStatus(self.GetUserCred(), api.ELASTIC_SEARCH_STATUS_DELETE_FAILED, err.Error())
    db.OpsLog.LogEvent(es, db.ACT_DELOCATE_FAIL, err, self.UserCred)
    // Record delete failure log
    logclient.AddActionLogWithStartable(self, es, logclient.ACT_DELETE, err, self.UserCred, false)
    self.SetStageFailed(ctx, jsonutils.NewString(err.Error()))
}

func (self *ElasticSearchDeleteTask) OnInit(ctx context.Context, obj db.IStandaloneModel, data jsonutils.JSONObject) {
    es := obj.(*models.SElasticSearch)

    iEs, err := es.GetIElasticSearch()
    if err != nil {
        // Handle case where cloud resource has been deleted
        if errors.Cause(err) == cloudprovider.ErrNotFound {
            self.taskComplete(ctx, es)
            return
        }
        self.taskFail(ctx, es, errors.Wrapf(err, "GetIElasticSearch"))
        return
    }
    err = iEs.Delete()
    if err != nil {
        self.taskFail(ctx, es, errors.Wrapf(err, "iEs.Delete"))
        return
    }
    self.taskComplete(ctx, es)
}

func (self *ElasticSearchDeleteTask) taskComplete(ctx context.Context, es *models.SElasticSearch) {
    es.RealDelete(ctx, self.GetUserCred())
    self.SetStageComplete(ctx, nil)
}
```

Edit cmd/climc/shell/compute/elastic_search.go file and add climc delete command.

```go
func init() {
    ...
    cmd.Delete(&compute.ElasticSearchIdOption{})
}

# Test delete
$ climc elastic-search-delete test-elastic-search
```

## Resource Cleanup (Cloud Account Deletion)

This step only applies to new resource integration. Existing resources don't involve this operation. Edit pkg/compute/models/purge.go file and append the following content.

```go
func (manager *SElasticSearchManager) purgeAll(ctx context.Context, userCred mcclient.TokenCredential, providerId string) error {
    ess := []SElasticSearch{}
    err := fetchByManagerId(manager, providerId, &ess)
    if err != nil {
        return errors.Wrapf(err, "fetchByManagerId")
    }
    for i := range ess {
        lockman.LockObject(ctx, &ess[i])
        defer lockman.ReleaseObject(ctx, &ess[i])

        err := ess[i].RealDelete(ctx, userCred)
        if err != nil {
            return errors.Wrapf(err, "elastic search delete")
        }
    }
    return nil
}
```

Edit pkg/compute/models/cloudproviders.go file.

```go
func (self *SCloudprovider) RealDelete(ctx context.Context, userCred mcclient.TokenCredential) error {
    for _, manager := range []IPurgeableManager{
        ...
        // Sort by resource dependencies, smaller dependencies come first
        ElasticSearchManager,
        ...
    } {
        ...
    }
    
    ...
}
```

