---
sidebar_position: 15
---

# Process of Adding an API

This article uses DNS record export to Zone format file as an example to introduce how to add an API.

## Principle

Implement Zone format file export for DNS resource records: Read DNS records of a DNS zone from the database, organize them into a string in Zone file format, and return the result in JSON format.

According to the [Backend Service Framework](./backend-framework/):

* REST API is responsible for parsing CRUD HTTP requests sent by clients and mapping different requests to the Model Dispatcher module;
* Model Dispatcher distributes client requests to business operations for corresponding resources;
* Model defines various resources in the cloud platform and performs database read and write operations.

Therefore, according to the [Backend Code Structure](./codestruct/):

* `pkg/compute/models` is the service resource model code, where generally one model corresponds to one table in the database. Since we need to process all DNS records under a zone, we add the **GetDetailsExports** method to SDnsZone in the dns_zones.go file. If necessary, we can also add methods to SDnsRecordSet in the dns_recordsets.go file to process a single DNS record.

  ```go
  func (self *SDnsZone) GetDetailsExports(ctx context.Context, userCred mcclient.TokenCredential, query jsonutils.JSONObject) (jsonutils.JSONObject, error) {
      // TODO
  }
  ```

* `pkg/cloudcommon/db` is the common code for service models. In the **GetSpecific** method of the db_dispatcher.go file, you can see that the above GetDetailsXXX methods are called via reflection.

* `cmd/climc/shell` is the command-line tool code for each service. In the cmd/climc/shell/compute/dnszone.go file, the **GetWithCustomShow** method is called, which calls the above GetSpecific method to test the results returned by the dns-zone-exports command. The first parameter of GetWithCustomShow is the lowercase of XXX in GetDetailsXXX, the second parameter is the function that processes the result returned by GetDetailsXXX, and the third parameter is the parameter for this test command.

  ```go
  cmd.GetWithCustomShow("exports", func(result jsonutils.JSONObject) {
      // TODO	
  }, &options.SDnsZoneIdOptions{})
  ```

## Implementation

### Implement GetDetailsExports Method

Edit the pkg/compute/models/dns_zones.go file

```go
// Convert DNS records to zone format and return JSON
func (self *SDnsZone) GetDetailsExports(ctx context.Context, userCred mcclient.TokenCredential, query jsonutils.JSONObject) (jsonutils.JSONObject, error) {
        // Get DNS records from database
        records, err := self.GetDnsRecordSets()
        if err != nil {
                return nil, errors.Wrapf(err, "GetDnsRecordSets")
        }
        // Zone file content
        result := "$ORIGIN " + self.Name + ".\n"
        lines := []string{}
        for _, record := range records {
                lines = append(lines, record.ToZoneLine())
        }
        result += strings.Join(lines, "\n")
        // Write string to map and convert to JSON for return
        rr := make(map[string]string)
        rr["zone"] = result
        return jsonutils.Marshal(rr), nil
}
```

### Implement ToZoneLine Method

Edit the pkg/compute/models/dns_recordsets.go file to implement the ToZoneLine() method mentioned above

```go
// Convert a DNS record to zone format and return string
func (self *SDnsRecordSet) ToZoneLine() string {
        result := self.Name + "\t" + fmt.Sprint(self.TTL) + "\tIN\t" + self.DnsType + "\t"
        if self.MxPriority != 0 {
                result += fmt.Sprint(self.MxPriority) + "\t"
        }
        result += self.DnsValue
        if self.DnsType == "CNAME" || self.DnsType == "MX" || self.DnsType == "SRV" {
                result += "."
        }
        return result
}
```

### Write climc Command

Edit the cmd/climc/shell/compute/dnszone.go file

```go
// For command-line testing
func init() {
        cmd := shell.NewResourceCmd(&modules.DnsZones).WithKeyword("dns-zone")
    
        ...
    
        // Add dns-zone-exports command
        cmd.GetWithCustomShow("exports", func(result jsonutils.JSONObject) {
                // Convert JSON returned by GetDetailsExports to map
                rr := make(map[string]string)
                err := result.Unmarshal(&rr)
                if err != nil {
                        log.Errorf("error: %v", err)
                        return
                }
                // Output result
                for _, v := range rr {
                        fmt.Printf("%s\n", v)
                }
        }, &options.SDnsZoneIdOptions{})
}
```

## Testing

Note that after compiling the latest region service, you need to replace the service in the environment

- [Container Deployment](./dev-env#docker-镜像编译上传)
- [Manual Deployment](./single_service_dev#计算服务region初始化)

```bash
# Compile climc and region
$ make cmd/climc cmd/region

# Execute climc
$ cd cloudpods/_output/bin
$ ./climc

# Test command
climc> dns-zone-exports <zone id>

# Exit
climc> exit
```

