---
sidebar_position: 4
---

# Go Language Code Standards

## Code Style

Most formatting issues can be resolved through **gofmt**. gofmt automatically formats code to ensure all go code is consistent with the officially recommended format, so all formatting-related issues are based on gofmt results.
Different editors have different configurations. Sublime configuration tutorial: http://michaelwhatcott.com/gosublime-goimports/
- LiteIDE already supports goimports by default. If yours doesn't, please click Properties Configuration->golangfmt→check goimports to automatically fmt your code before saving
- For vim development, please install the plugin: https://github.com/fatih/vim-go or coc.nvim + gopls
- For vscode development, please directly install the Go plugin: https://github.com/golang/vscode-go

## Naming Rules

Go language programmers recommend using **CamelCase** naming. When names consist of several words, prioritize using case separation rather than underscores.
Therefore, in the standard library there are function names like QuoteRuneToASCII and parseRequestLine, but generally not quote_rune_to_ASCII and parse_request_line.
Abbreviations like ASCII and HTML avoid mixed case writing. They may be called htmlEscape, HTMLEscape, or escapeHTML, but not escapeHtml.


## File Names

Named using kebab case, for example: foo_bar.go

## Package Name

Package name should be consistent with the directory name where the package is located and be lowercase

## Struct

Prioritize starting with **S**, private struct names start with lowercase s
Follow CamelCase naming convention, composed of meaningful nouns

## Interface

Follow CamelCase naming convention
Prioritize starting with I, private interface names start with lowercase i, for example: IModelManager 

## Functions or Methods

- Follow CamelCase naming convention, composed of meaningful English words
- If a function or method is a judgment type (return value is mainly bool type), the name should start with judgment verbs such as Has, Is, Can, or Allow:

```go
func HasPrefix(name string, prefixes []string) bool { ... }
func IsEntry(name string, entries []string) bool { ... }
func CanManage(name string) bool { ... }
func AllowGitHook() bool { ... }
```

- Must start with a verb, such as Get/Set/Make/Upload, etc. The function of the method can be seen from the name

## Constants

- Constants must be composed of all uppercase letters and use underscores for word separation:

```go
const APP_VER = "0.7.0.1110 Beta"
```

- If it is an enumeration type constant, you need to create the corresponding type first, and start with uppercase T (public type) or lowercase t (private type):

```go
type TScheme string
 
const (
   HTTP  TScheme = "http"
   HTTPS TScheme = "https"
)
```

- If the module's functionality is relatively complex and constant names are easily confused, you can use a complete prefix to better distinguish enumeration types:

```go
type TPullRequestStatus int
 
const (
   PULL_REQUEST_STATUS_CONFLICT TPullRequestStatus = iota
   PULL_REQUEST_STATUS_CHECKING
   PULL_REQUEST_STATUS_MERGEABLE
)
```

## Variables

### Variable Naming

- Follow CamelCase naming convention, composed of meaningful English words
- Must be a noun, variable naming basically follows the corresponding English expression or abbreviation
- In relatively simple environments (few objects, targeted), some names can be abbreviated from complete words to single letters, for example:
    - user can be abbreviated as u
    - userID can be abbreviated as uid
- If the variable type is bool, the name should start with Has, Is, Enable, Can, or Allow:

```go
var isExist bool
var hasConflict bool
var canManage bool
var allowGitHook bool
```

- The above rule also applies to structure definitions:

```go
// Webhook represents a web hook object.
type Webhook struct {
   Id           int64 `xorm:"pk autoincr"`
   RepoID       int64
   OrgID        int64
   Url          string `xorm:"url TEXT"`
   ContentType  HookContentType
   Secret       string `xorm:"TEXT"`
   Events       string `xorm:"TEXT"`
   *HookEvent   `xorm:"-"`
   IsSSL        bool `xorm:"is_ssl"`
   IsActive     bool
   HookTaskType HookTaskType
   Meta         string     `xorm:"TEXT"` // store hook-specific attributes
   LastStatus   HookStatus // Last delivery status
   Created      time.Time  `xorm:"CREATED"`
   Updated      time.Time  `xorm:"UPDATED"`
}
```

###  string Variables

Similar to Java's String, string in golang is an immutable variable. When constructing strings through concat, please use bytes.Buffer or strings.Builder

```go
var buf bytes.Buffer
buf.WriteByte('a')
buf.WriteString("b")
return buf.String()
```

### size Variable Naming

Variables for capacity, size, time, etc. To avoid confusion of units, they need to carry unit dimensions, for example: sizeMb, sizeGb, intervalSeconds, etc.

## Declaration Statements

### Functions or Methods

- The parameter order of functions or methods follows the following principles (from left to right):
    - Simple types take precedence over complex types
    - Place parameters of the same type in adjacent positions as much as possible, so you only need to write the type once

Functions are prohibited from returning both result as nil and error as nil, for example:

```go
func FetcNicByMac(mac string) (*SNic, error) {
    ...
        return nil, nil // This kind of return is prohibited
    ...
    return &SNic{}, nil
}
```


In the following declaration statement, the User type is more complex than the string type, but since Repository is a subsidiary of User, User must be determined first before Repository can be determined. Therefore, User's order takes precedence over repoName.

```go
func IsRepositoryExist(user *User, repoName string) (bool, error) { ...
```

- Function return values should avoid using named function return values
Example:

```go
func findCertEndPosition(certBytes []byte) (endPost int, err error) {
    endPos = bytes.Index(certBytes, CERT_SEP)
    if endPos < 0 {
        err = ErrOutOfRange
        return
    }
    return
}
```

Recommended approach:

```go
func findCertEndPosition(certBytes []byte) (int, error) {
    endPos := bytes.Index(certBytes, CERT_SEP)
    if endPos < 0 {
        return -1, ErrOutOfRange
    }
    return endPos, nil
}
```

- Unless the function execution flow is certain that no error will occur, or the error can be determined to be ignored, function return values should carry error as much as possible. Errors encountered in the code flow should be returned as early as possible, and unless special handling is done, errors should be explicitly returned immediately when encountered.

Example: Not recommended approach

```go

func findCertEndPosition(certBytes []byte) (int, error) {
    endPos := bytes.Index(certBytes, CERT_SEP)
    if endPos < 0 {
        log.Errorf("find not certEndPost") // find error, but no immediate return
    }
    ...
    return endPos, nil
}
```

Recommended approach:

```go
func findCertEndPosition(certBytes []byte) (int, error) {
    endPos := bytes.Index(certBytes, CERT_SEP)
    if endPos < 0 {
        log.Errorf("find not certEndPost") // find error and immediately return error
        return -1, ErrOutOfRange
    }
    ...
    return endPos, nil
}
```

- Avoid unnecessary else branches

Example: Not recommended approach

```go
func (s *SReadSeeker) Read(p []byte) (int, error) {
    if s.offset == s.readerOffset && s.offset < s.readerSize {
        n, err := s.reader.Read(p)
        if n > 0 {
            wn, werr := s.tmpFile.Write(p[:n])
            if werr != nil {
                return n, werr
            }
            if wn < n {
                return n, errors.Error("sFakeSeeker write less bytes")
            }
            s.offset += int64(n)
            s.readerOffset += int64(n)
        }
        return n, err
    } else {
        n, err := s.tmpFile.ReadAt(p, s.offset)
        if n > 0 {
            s.offset += int64(n)
        }
        return n, err
    }
}
```

Recommended approach

```go
func (s *SReadSeeker) Read(p []byte) (int, error) {
    if s.offset == s.readerOffset && s.offset < s.readerSize {
        n, err := s.reader.Read(p)
        if n > 0 {
            wn, werr := s.tmpFile.Write(p[:n])
            if werr != nil {
                return n, werr
            }
            if wn < n {
                return n, errors.Error("sFakeSeeker write less bytes")
            }
            s.offset += int64(n)
            s.readerOffset += int64(n)
        }
        return n, err
    }
    n, err := s.tmpFile.ReadAt(p, s.offset)
    if n > 0 {
        s.offset += int64(n)
    }
    return n, err
}
```

- Unless necessary, try to avoid using interface{}, jsonutils.JSONObject and other generic data types as function input and output parameters. It is recommended to define struct or specialized type to constrain parameter types to make good use of golang's static type checking and discover parameter passing errors.

## Control Statements

Unless necessary, avoid using if ... else ... nesting with more than 3 branches. In this case, switch case statements should be considered as a replacement.
Try to avoid using if initialization statements unless the initialization statement has only one branch. Multiple-branch if initialization statements are prohibited.

Example: Not recommended approach

```go
if diskId, err := cli.CreateDisk(args.StorageType, args.NAME, args.SizeGb, args.Desc, args.Image); err != nil {
    return err
} else if disk, err := cli.GetDisk(diskId); err != nil {
    return err
} else {
    printObject(disk)
    return nil
}
```

Recommended approach:

```go
diskId, err := cli.CreateDisk(args.StorageType, args.NAME, args.SizeGb, args.Desc, args.Image)
if err != nil {
    return err
}
disk, err := cli.GetDisk(diskId)
if err != nil {
    return err
}
printObject(disk)
return nil
```

When using range loops to enumerate Array/Slice and Map, note that in the following pattern, the memory addresses of variables k, v are the same in each loop. At the beginning of each loop, the corresponding key value and the value of Slice[k]/Map[k] are copied to the memory of k, v through memory copy.

```go
for k, v := range myMap {
    // access v
}
```

If you want to directly access the memory of Slice[k]/Map[k], use the following method

```go
for k := range myMap {
    // access &myMap[k]
}
```

Recommendation: When using for...range to traverse map or slice, if uncertain, only traverse the key (for map) or index (for slice), and in the for ...range body, access the elements in map or slice through map[key] or slice[index].

## Line Width

Try to avoid very long lines of code

Example: Not recommended approach

```go
func init() {
    CachedimageManager = &SCachedimageManager{SStandaloneResourceBaseManager: db.NewStandaloneResourceBaseManager(SCachedimage{}, "cachedimages_tbl", "cachedimage", "cachedimages")}
}
```

Recommended approach

```go
func init() {
    CachedimageManager = &SCachedimageManager{
        SStandaloneResourceBaseManager: db.NewStandaloneResourceBaseManager(
            SCachedimage{},
            "cachedimages_tbl",
            "cachedimage",
            "cachedimages",
        ),
    }
}
```

## Function Spacing

Try to avoid functions directly adjacent to each other

Example: Not recommended approach

```go
func IsRepositoryExist(user *User, repoName string) (bool, error) { ...
    
}
func findCertEndPosition(certBytes []byte) (int, error) {
    endPos := bytes.Index(certBytes, CERT_SEP)
    if endPos < 0 {
        return -1, ErrOutOfRange
    }
    return endPos, nil
}
```

Recommended approach

```go
func IsRepositoryExist(user *User, repoName string) (bool, error) { ...
    
}

func findCertEndPosition(certBytes []byte) (int, error) {
    endPos := bytes.Index(certBytes, CERT_SEP)
    if endPos < 0 {
        return -1, ErrOutOfRange
    }
    return endPos, nil
}
```

## Receiver or Function Parameter Type (by value or by pointer) Recommendations

- The receiver or input parameters of methods can be passed by value or by pointer. Refer to https://github.com/golang/go/wiki/CodeReviewComments#receiver-type. Generally, follow these recommendations:
    - If the type of receiver or input parameter is map, func, or chan, don't use pointers. If it's a slice, if you don't want to reallocate the slice (reslice or reallocate the slice), don't use pointers either.
    - If the member variables of the receiver or input parameter need to be modified within this method, pointers must be used
    - If the receiver or input parameter contains sync.Mutex or other data structures used for synchronization, pointers must be used
    - If the receiver or input parameter is a very large struct or array, passing by pointer will be more efficient (avoiding memory copy)
    - If the receiver or input parameter is a struct, array, slice, and its member variables contain pointers, and the value pointed to by the pointer needs to be modified, then pointers are recommended
    - If the receiver or input parameter is a basic data type (such as int, string, time.Time), a small struct, and the modification to this value is only valid within the function, then passing by value is recommended. Parameters passed by value are allocated on the stack. Using value passing as much as possible can reduce memory garbage collection probability and improve program efficiency
    - Finally, if you're not sure, pass by pointer

## Code Comments

Comments should prioritize using double slashes (//). Use "/* ... */" for: large blocks of text, full-page length, for example encoding/gob's doc.go
The "magic" parts in the code should describe the reason through comments, notes for changes here, and consequences of improper changes. This way improvements can take care of it
Comments should be "meaningful", concise and easy to read quickly
 - Usually start with the name being commented, summarize the function in a short sentence (who does what). The context is generally the current package or the larger functional point it composes.
 - More detailed descriptions open another paragraph, one thing per paragraph, the first sentence of the paragraph reflects the theme of the subsequent content
During code changes, code that is no longer used should be directly deleted, and comments are not recommended
Example:

```go
// Errorf formats according to a format specifier and returns the string
// as a value that satisfies error.
func Errorf(format string, a ...interface{}) error {
        return errors.New(Sprintf(format, a...))
}
 
// Strings for use with buffer.WriteString.
// This is less overhead than using buffer.Write with byte arrays.
const (
        commaSpaceString  = ", "
        nilAngleString    = "<nil>"
        ...
)
 
// State represents the printer state passed to custom formatters.
// It provides access to the io.Writer interface plus information about
// the flags and options for the operand's format specifier.
type State interface {
        // Write is the function to call to emit formatted output to be printed.
        Write(b []byte) (n int, err error)
        ...
}
```

## Importing Standard Library, Third-Party or Other Packages

Except for the standard library, Go language import paths basically depend on URL paths on code hosting platforms. Therefore, packages that a source file needs to import have 4 categories: standard library, third-party packages, other packages within the organization, and sub-packages of the current package.
Basic rules:
- If 2 or more categories exist simultaneously, partitions need to be used for imports. Each category uses one partition, with blank lines as separators between partitions.
- In non-test files (\*_test.go), using . to simplify imported package object calls is prohibited.
- Using relative path imports (./subpackage) is prohibited. All import paths must conform to go get standards.
Below is a complete example:

```go
import (
    "fmt"
    "encoding/json"
    "net/http"
    "os"
 
    "github.com/codegangsta/cli"
    "gopkg.in/macaron.v1"
    "k8s.io/helm/pkg/helm"
 
    "github.com/yunionio/jsonutils"
    "github.com/yunionio/log"
 
    "github.com/yunionio/onecloud/pkg/cloudcommon"
    "github.com/yunionio/onecloud/pkg/compute/models"
)
```

## API Parameter Exposure

Basic rules:

- For creation and filtering parameters, if it's an internal model, please use the model's keyword, avoid using keyword_id to expose parameters externally

```go
type ServerCreateInput struct {
 
    //Instance snapshot ID or name, try to use instance snapshot ID for unique matching
    InstanceSnapshot string
 
    //swagger:ignore Internal use, this parameter will not appear in API documentation
    InstanceSnapshotId string
}
 
func (manager *SGusetManager)ValidateCreateData(...., input api.ServerCreateInput) (..., error) {
    var err error
    input.InstanceSnapshotId, err = InstanceSnapshotManager.FetchByIdOrName(userCred, input.InstanceSnapshot)
    if err != nil {
        return nil, err
    }
}
```

## References

- https://github.com/golang/go/wiki/CodeReviewComments
- Godoc documenting Go code: https://blog.golang.org/godoc-documenting-go-code
- https://github.com/Unknwon/go-code-convention/

