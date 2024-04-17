import styles from './styles.module.css';

const Aliyun = '阿里云'
const TencentCloud = "腾讯云"
const HuaweiCloud = "华为云"
const Aws = "AWS"
const GoogleCloud = "GCP"
const Azure = "Azure"
const VolcEngine = "火山引擎"
const UCloud = "UCloud"
const Ctyun = "天翼云"
const ECloud = "移动云"
const JDCloud = "京东云"
const BaiduCloud = "百度云"
const CuCloud = "联通云"
const Ksyun = "金山云"
const QingCloud = "青云"
const Apsara = "阿里飞天(v3.12+)"
const HCSO = "HCSO"
const HCS = "HCS (v8.0.3+)"
const ZStack = "ZStack (v3.4.0+)"
const OpenStack = "OpenStack (M+)"
const VMware = "VMware (6.0+)"
const Cloudpods = "Cloudpods"
const Nutanix = "Nutanix (v6.5.2+)"
const BingoCloud = "BingoCloud"
const IncloudSphere = "IncloudSphere (6.5.1+)"
const RemoteFile = "外部数据"
const Proxmox = "Proxmox(v6.3+)"
const H3C = "H3C (CloudOS 5.0+)"
const OracleCloud = "OracleCloud"

const cloudList = [
    Aliyun,
    TencentCloud,
    HuaweiCloud,
    Aws,
    Azure,
    GoogleCloud,
    VolcEngine,
    UCloud,
    Ctyun,
    ECloud,
    JDCloud,
    BaiduCloud,
    CuCloud,
    Ksyun,
    QingCloud,
    OracleCloud,
    Apsara,
    HCSO,
    HCS,
    ZStack,
    OpenStack,
    VMware,
    Cloudpods,
    Nutanix,
    BingoCloud,
    IncloudSphere,
    RemoteFile,
    Proxmox,
    H3C,
]

const tableList = [
    // 表头1
    [
        {
            text: '分类',
            rowspan: 2,
            style: {
                zIndex: 3,
                width: '80px'
            }
        },
        {
            text: '云资源类型',
            rowspan: 2,
            style: {
                zIndex: 3,
                width: '130px!important'
            }
        },
        {
            text: '操作',
            rowspan: 2,
            style: {
                zIndex: 3,
            },
        },
        {
            text: '公有云',
            colspan: 16,
            style: {
                textAlign: 'center',
            }
        },
        {
            text: '私有云',
            colspan: 15,
            style: {
                textAlign: 'center'
            }
        }
    ],
    // 表头2
    [{ none: true }, { none: true }, { none: true }, 
        ...cloudList,
    ],
]

const data = {
    "主机": {
        "虚拟机": {
            "同步": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "Y", [GoogleCloud]: "Y", [VolcEngine]: "Y", [UCloud]: "Y", [Ctyun]: "Y", [ECloud]: "Y", [BaiduCloud]: "", [JDCloud]: "Y", [CuCloud]: "", [Ksyun]: "Y", [QingCloud]: "", [OracleCloud]: "Y", [Apsara]: "Y", [HCSO]: "Y", [HCS]: "Y", [ZStack]: "Y", [OpenStack]: "Y", [VMware]: "Y", [Cloudpods]: "Y", [Nutanix]: "Y", [BingoCloud]: "Y", [IncloudSphere]: "Y", [RemoteFile]: "Y", [Proxmox]: "Y", [H3C]: "Y" },
            "新建": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "Y", [GoogleCloud]: "Y", [VolcEngine]: "Y", [UCloud]: "Y", [Ctyun]: "Y", [ECloud]: "N", [BaiduCloud]: "", [JDCloud]: "", [CuCloud]: "", [Ksyun]: "", [QingCloud]: "", [OracleCloud]: "", [Apsara]: "Y", [HCSO]: "Y", [HCS]: "Y", [ZStack]: "Y", [OpenStack]: "Y", [VMware]: "Y", [Cloudpods]: "Y", [Nutanix]: "Y", [BingoCloud]: "Y", [IncloudSphere]: "Y", [RemoteFile]: "-", [Proxmox]: "Y", [H3C]: "N" },
            "删除": { [Aliyun]: 'Y', [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "Y", [GoogleCloud]: "Y", [VolcEngine]: "Y", [UCloud]: "Y", [Ctyun]: "Y", [ECloud]: "N", [BaiduCloud]: "", [JDCloud]: "", [CuCloud]: "", [Ksyun]: "", [QingCloud]: "", [OracleCloud]: "", [Apsara]: "Y", [HCSO]: "Y", [HCS]: "Y", [ZStack]: "Y", [OpenStack]: "Y", [VMware]: "Y", [Cloudpods]: "Y", [Nutanix]: "Y", [BingoCloud]: "Y", [IncloudSphere]: "Y", [RemoteFile]: "-", [Proxmox]: "Y", [H3C]: "" },
            "开机": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "Y", [GoogleCloud]: "Y", [VolcEngine]: "Y", [UCloud]: "Y", [Ctyun]: "Y", [ECloud]: "N", [BaiduCloud]: "", [JDCloud]: "", [CuCloud]: "", [Ksyun]: "", [QingCloud]: "", [OracleCloud]: "", [Apsara]: "Y", [HCSO]: "Y", [HCS]: "Y", [ZStack]: "Y", [OpenStack]: "Y", [VMware]: "Y", [Cloudpods]: "Y", [Nutanix]: "Y", [BingoCloud]: "Y", [IncloudSphere]: "Y", [RemoteFile]: "-", [Proxmox]: "Y", [H3C]: "N" },
            "关机": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "Y", [GoogleCloud]: "Y", [VolcEngine]: "Y", [UCloud]: "Y", [Ctyun]: "Y", [ECloud]: "N", [BaiduCloud]: "", [JDCloud]: "", [CuCloud]: "", [Ksyun]: "", [QingCloud]: "", [OracleCloud]: "", [Apsara]: "Y", [HCSO]: "Y", [HCS]: "Y", [ZStack]: "Y", [OpenStack]: "Y", [VMware]: "Y", [Cloudpods]: "Y", [Nutanix]: "Y", [BingoCloud]: "Y", [IncloudSphere]: "Y", [RemoteFile]: "-", [Proxmox]: "Y", [H3C]: "N" }, 
            "续费": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "-", [Azure]: "-", [GoogleCloud]: "-", [VolcEngine]: "N", [UCloud]: "", [Ctyun]: "", [ECloud]: "N", [BaiduCloud]: "", [JDCloud]: "", [CuCloud]: "", [Ksyun]: "", [QingCloud]: "", [OracleCloud]: "", [Apsara]: "-", [HCSO]: "-", [HCS]: "", [ZStack]: "", [OpenStack]: "", [VMware]: "", [Cloudpods]: "", [Nutanix]: "", [BingoCloud]: "", [IncloudSphere]: "", [RemoteFile]: "", [Proxmox]: "", [H3C]: "" },
            "重装系统": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "Y", [GoogleCloud]: "Y", [VolcEngine]: "-", [UCloud]: "Y", [Ctyun]: "Y", [ECloud]: "N", [BaiduCloud]: "", [JDCloud]: "", [CuCloud]: "", [Ksyun]: "", [QingCloud]: "", [OracleCloud]: "", [Apsara]: "Y", [HCSO]: "Y", [HCS]: "Y", [ZStack]: "Y", [OpenStack]: "Y", [VMware]: "Y", [Cloudpods]: "Y", [Nutanix]: "-", [BingoCloud]: "-", [IncloudSphere]: "-", [RemoteFile]: "-", [Proxmox]: "-", [H3C]: "-" },
            "调整配置": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "Y", [GoogleCloud]: "Y", [VolcEngine]: "Y", [UCloud]: "Y", [Ctyun]: "Y", [ECloud]: "N", [BaiduCloud]: "", [JDCloud]: "", [CuCloud]: "", [Ksyun]: "", [QingCloud]: "", [OracleCloud]: "", [Apsara]: "Y", [HCSO]: "Y", [HCS]: "Y", [ZStack]: "Y", [OpenStack]: "Y", [VMware]: "Y", [Cloudpods]: "Y", [Nutanix]: "Y", [BingoCloud]: "-", [IncloudSphere]: "Y", [RemoteFile]: "-", [Proxmox]: "Y", [H3C]: "-" },
            "重置密码": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "-", [Azure]: "Y", [GoogleCloud]: "Y", [VolcEngine]: "Y", [UCloud]: "Y", [Ctyun]: "Y", [ECloud]: "N", [BaiduCloud]: "", [JDCloud]: "", [CuCloud]: "", [Ksyun]: "", [QingCloud]: "", [OracleCloud]: "", [Apsara]: "Y", [HCSO]: "Y", [HCS]: "Y", [ZStack]: "Y", [OpenStack]: "Y", [VMware]: "Y", [Cloudpods]: "Y", [Nutanix]: "-", [BingoCloud]: "-", [IncloudSphere]: "-", [RemoteFile]: "-", [Proxmox]: "-", [H3C]: "-" },
            "绑定秘钥": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "-", [Aws]: "-", [Azure]: "Y", [GoogleCloud]: "Y", [VolcEngine]: "Y", [UCloud]: "-", [Ctyun]: "Y", [ECloud]: "N", [BaiduCloud]: "", [JDCloud]: "", [CuCloud]: "", [Ksyun]: "", [QingCloud]: "", [OracleCloud]: "", [Apsara]: "Y", [HCSO]: "-", [HCS]: "-", [ZStack]: "Y", [OpenStack]: "Y", [VMware]: "Y", [Cloudpods]: "Y", [Nutanix]: "-", [BingoCloud]: "-", [IncloudSphere]: "-", [RemoteFile]: "-", [Proxmox]: "-", [H3C]: "-" },
            "保存镜像": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "Y", [GoogleCloud]: "Y", [VolcEngine]: "Y", [UCloud]: "", [Ctyun]: "Y", [ECloud]: "N", [BaiduCloud]: "", [JDCloud]: "", [CuCloud]: "", [Ksyun]: "", [QingCloud]: "", [OracleCloud]: "", [Apsara]: "Y", [HCSO]: "Y", [HCS]: "Y", [ZStack]: "", [OpenStack]: "", [VMware]: "", [Cloudpods]: "Y", [Nutanix]: "", [BingoCloud]: "", [IncloudSphere]: "", [RemoteFile]: "-", [Proxmox]: "", [H3C]: "" },
            "绑定&解绑安全组": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "Y", [GoogleCloud]: "Y", [VolcEngine]: "Y", [UCloud]: "Y", [Ctyun]: "Y", [ECloud]: "N", [BaiduCloud]: "", [JDCloud]: "", [CuCloud]: "", [Ksyun]: "", [QingCloud]: "", [OracleCloud]: "", [Apsara]: "Y", [HCSO]: "Y", [HCS]: "Y", [ZStack]: "Y", [OpenStack]: "Y", [VMware]: "-", [Cloudpods]: "Y", [Nutanix]: "-", [BingoCloud]: "Y", [IncloudSphere]: "-", [RemoteFile]: "-", [Proxmox]: "-", [H3C]: "" },
            "绑定&解绑EIP": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "Y", [GoogleCloud]: "Y", [VolcEngine]: "Y", [UCloud]: "Y", [Ctyun]: "Y", [ECloud]: "N", [BaiduCloud]: "", [JDCloud]: "", [CuCloud]: "", [Ksyun]: "", [QingCloud]: "", [OracleCloud]: "", [Apsara]: "Y", [HCSO]: "Y", [HCS]: "Y", [ZStack]: "Y", [OpenStack]: "Y", [VMware]: "-", [Cloudpods]: "N", [Nutanix]: "N", [BingoCloud]: "Y", [IncloudSphere]: "-", [RemoteFile]: "", [Proxmox]: "", [H3C]: "" },
            "公网转EIP": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "", [Aws]: "", [Azure]: "", [GoogleCloud]: "", [VolcEngine]: "", [UCloud]: "", [Ctyun]: "Y", [ECloud]: "N", [BaiduCloud]: "", [JDCloud]: "", [CuCloud]: "", [Ksyun]: "", [QingCloud]: "", [OracleCloud]: "", [Apsara]: "", [HCSO]: "", [HCS]: "", [ZStack]: "", [OpenStack]: "", [VMware]: "", [Cloudpods]: "", [Nutanix]: "", [BingoCloud]: "", [IncloudSphere]: "", [RemoteFile]: "-", [Proxmox]: "", [H3C]: "" },
            "迁移": { [Aliyun]: "-", [TencentCloud]: "-", [HuaweiCloud]: "-", [Aws]: "-", [Azure]: "-", [GoogleCloud]: "-", [VolcEngine]: "-", [UCloud]: "-", [Ctyun]: "Y", [ECloud]: "-", [BaiduCloud]: "-", [JDCloud]: "-", [CuCloud]: "-", [Ksyun]: "-", [QingCloud]: "-", [OracleCloud]: "", [Apsara]: "-", [HCSO]: "-", [HCS]: "-", [ZStack]: "-", [OpenStack]: "Y", [VMware]: "Y", [Cloudpods]: "N", [Nutanix]: "N", [BingoCloud]: "N", [IncloudSphere]: "N", [RemoteFile]: "-", [Proxmox]: "N", [H3C]: "N" },
            "VNC远程": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "-", [Azure]: "-", [GoogleCloud]: "-", [VolcEngine]: "Y", [UCloud]: "Y", [Ctyun]: "Y", [ECloud]: "Y", [BaiduCloud]: "N", [JDCloud]: "Y", [CuCloud]: "N", [Ksyun]: "N", [QingCloud]: "N", [OracleCloud]: "N", [Apsara]: "N", [HCSO]: "N", [HCS]: "Y", [ZStack]: "Y", [OpenStack]: "Y", [VMware]: "Y", [Cloudpods]: "Y", [Nutanix]: "N", [BingoCloud]: "N", [IncloudSphere]: "N", [RemoteFile]: "-", [Proxmox]: "Y", [H3C]: "N" },
        },
        "公共镜像": {
            "同步": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "Y", [GoogleCloud]: "Y", [VolcEngine]: "Y", [UCloud]: "Y", [Ctyun]: "Y", [ECloud]: "", [BaiduCloud]: "", [JDCloud]: "", [CuCloud]: "", [Ksyun]: "", [QingCloud]: "", [OracleCloud]: "", [Apsara]: "-", [HCSO]: "-", [HCS]: "-", [ZStack]: "-", [OpenStack]: "-", [VMware]: "-", [Cloudpods]: "-", [Nutanix]: "-", [BingoCloud]: "-", [IncloudSphere]: "-", [RemoteFile]: "-", [Proxmox]: "-", [H3C]: "-" },
        },
        "自定义镜像": {
            "同步": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "Y", [GoogleCloud]: "Y", [VolcEngine]: "Y", [UCloud]: "Y", [Ctyun]: "Y", [ECloud]: "", [BaiduCloud]: "", [JDCloud]: "Y", [CuCloud]: "", [Ksyun]: "", [QingCloud]: "", [OracleCloud]: "", [Apsara]: "Y", [HCSO]: "Y", [HCS]: "Y", [ZStack]: "Y", [OpenStack]: "Y", [VMware]: "Y", [Cloudpods]: "Y", [Nutanix]: "Y", [BingoCloud]: "Y", [IncloudSphere]: "Y", [RemoteFile]: "Y", [Proxmox]: "Y", [H3C]: "-" },
            "创建": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "Y", [GoogleCloud]: "Y", [VolcEngine]: "Y", [UCloud]: "Y", [Ctyun]: "N", [ECloud]: "", [BaiduCloud]: "", [JDCloud]: "", [CuCloud]: "", [Ksyun]: "", [QingCloud]: "", [OracleCloud]: "", [Apsara]: "N", [HCSO]: "N", [HCS]: "N", [ZStack]: "Y", [OpenStack]: "Y", [VMware]: "Y", [Cloudpods]: "Y", [Nutanix]: "Y", [BingoCloud]: "N", [IncloudSphere]: "N", [RemoteFile]: "-", [Proxmox]: "Y", [H3C]: "-" },
        },
        "硬盘": {
            "同步": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "Y", [GoogleCloud]: "Y", [VolcEngine]: "Y", [UCloud]: "Y", [Ctyun]: "Y", [ECloud]: "Y", [BaiduCloud]: "", [JDCloud]: "Y", [CuCloud]: "", [Ksyun]: "Y", [QingCloud]: "", [OracleCloud]: "Y", [Apsara]: "Y", [HCSO]: "Y", [HCS]: "Y", [ZStack]: "Y", [OpenStack]: "Y", [VMware]: "Y", [Cloudpods]: "Y", [Nutanix]: "Y", [BingoCloud]: "Y", [IncloudSphere]: "Y", [RemoteFile]: "Y", [Proxmox]: "Y", [H3C]: "Y" },
            "创建": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "Y", [GoogleCloud]: "Y", [VolcEngine]: "Y", [UCloud]: "Y", [Ctyun]: "Y", [ECloud]: "", [BaiduCloud]: "", [JDCloud]: "", [CuCloud]: "", [Ksyun]: "", [QingCloud]: "", [OracleCloud]: "", [Apsara]: "Y", [HCSO]: "Y", [HCS]: "Y", [ZStack]: "Y", [OpenStack]: "Y", [VMware]: "-", [Cloudpods]: "Y", [Nutanix]: "-", [BingoCloud]: "Y", [IncloudSphere]: "N", [RemoteFile]: "-", [Proxmox]: "-", [H3C]: "N" },
            "删除": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "Y", [GoogleCloud]: "Y", [VolcEngine]: "Y", [UCloud]: "Y", [Ctyun]: "Y", [ECloud]: "", [BaiduCloud]: "", [JDCloud]: "", [CuCloud]: "", [Ksyun]: "", [QingCloud]: "", [OracleCloud]: "", [Apsara]: "Y", [HCSO]: "Y", [HCS]: "Y", [ZStack]: "Y", [OpenStack]: "Y", [VMware]: "Y", [Cloudpods]: "Y", [Nutanix]: "Y", [BingoCloud]: "Y", [IncloudSphere]: "N", [RemoteFile]: "-", [Proxmox]: "-", [H3C]: "N" },
            "扩容": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "Y", [GoogleCloud]: "Y", [VolcEngine]: "Y", [UCloud]: "Y", [Ctyun]: "Y", [ECloud]: "", [BaiduCloud]: "", [JDCloud]: "", [CuCloud]: "", [Ksyun]: "", [QingCloud]: "", [OracleCloud]: "", [Apsara]: "Y", [HCSO]: "Y", [HCS]: "Y", [ZStack]: "Y", [OpenStack]: "Y", [VMware]: "Y", [Cloudpods]: "Y", [Nutanix]: "Y", [BingoCloud]: "N", [IncloudSphere]: "N", [RemoteFile]: "-", [Proxmox]: "Y", [H3C]: "N" },
            "挂载&卸载": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "Y", [GoogleCloud]: "Y", [VolcEngine]: "Y", [UCloud]: "Y", [Ctyun]: "Y", [ECloud]: "", [BaiduCloud]: "", [JDCloud]: "", [CuCloud]: "", [Ksyun]: "", [QingCloud]: "", [OracleCloud]: "", [Apsara]: "Y", [HCSO]: "Y", [HCS]: "Y", [ZStack]: "Y", [OpenStack]: "Y", [VMware]: "-", [Cloudpods]: "Y", [Nutanix]: "-", [BingoCloud]: "Y", [IncloudSphere]: "-", [RemoteFile]: "-", [Proxmox]: "-", [H3C]: "" },
        },
        "快照": {
            "同步": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "Y", [GoogleCloud]: "Y", [VolcEngine]: "Y", [UCloud]: "Y", [Ctyun]: "Y", [ECloud]: "", [BaiduCloud]: "", [JDCloud]: "Y", [CuCloud]: "", [Ksyun]: "", [QingCloud]: "", [OracleCloud]: "", [Apsara]: "Y", [HCSO]: "Y", [HCS]: "Y", [ZStack]: "Y", [OpenStack]: "Y", [VMware]: "N", [Cloudpods]: "Y", [Nutanix]: "N", [BingoCloud]: "Y", [IncloudSphere]: "-", [RemoteFile]: "-", [Proxmox]: "-", [H3C]: "-" },
            "创建": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "Y", [GoogleCloud]: "Y", [VolcEngine]: "Y", [UCloud]: "Y", [Ctyun]: "", [ECloud]: "", [BaiduCloud]: "", [JDCloud]: "", [CuCloud]: "", [Ksyun]: "", [QingCloud]: "", [OracleCloud]: "", [Apsara]: "Y", [HCSO]: "Y", [HCS]: "Y", [ZStack]: "Y", [OpenStack]: "Y", [VMware]: "N", [Cloudpods]: "", [Nutanix]: "N", [BingoCloud]: "", [IncloudSphere]: "", [RemoteFile]: "", [Proxmox]: "", [H3C]: "" },
            "删除": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "Y", [GoogleCloud]: "Y", [VolcEngine]: "Y", [UCloud]: "Y", [Ctyun]: "", [ECloud]: "", [BaiduCloud]: "", [JDCloud]: "", [CuCloud]: "", [Ksyun]: "", [QingCloud]: "", [OracleCloud]: "", [Apsara]: "Y", [HCSO]: "Y", [HCS]: "Y", [ZStack]: "Y", [OpenStack]: "Y", [VMware]: "N", [Cloudpods]: "", [Nutanix]: "N", [BingoCloud]: "", [IncloudSphere]: "", [RemoteFile]: "", [Proxmox]: "", [H3C]: "" },
        },
        "自动快照策略": {
            "同步": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "", [Aws]: "", [Azure]: "", [GoogleCloud]: "Y", [VolcEngine]: "", [UCloud]: "", [Ctyun]: "", [ECloud]: "", [BaiduCloud]: "", [JDCloud]: "", [CuCloud]: "", [Ksyun]: "", [QingCloud]: "", [OracleCloud]: "", [Apsara]: "Y", [HCSO]: "", [HCS]: "N", [ZStack]: "", [OpenStack]: "", [VMware]: "N", [Cloudpods]: "", [Nutanix]: "N", [BingoCloud]: "", [IncloudSphere]: "", [RemoteFile]: "", [Proxmox]: "", [H3C]: "" },
            "删除": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "", [Aws]: "", [Azure]: "", [GoogleCloud]: "Y", [VolcEngine]: "", [UCloud]: "", [Ctyun]: "", [ECloud]: "", [BaiduCloud]: "", [JDCloud]: "", [CuCloud]: "", [Ksyun]: "", [QingCloud]: "", [OracleCloud]: "", [Apsara]: "Y", [HCSO]: "", [HCS]: "N", [ZStack]: "", [OpenStack]: "", [VMware]: "N", [Cloudpods]: "", [Nutanix]: "N", [BingoCloud]: "", [IncloudSphere]: "", [RemoteFile]: "", [Proxmox]: "", [H3C]: "" },
        },
        "安全组": {
            "同步": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "Y", [GoogleCloud]: "Y", [VolcEngine]: "Y", [UCloud]: "Y", [Ctyun]: "Y", [ECloud]: "", [BaiduCloud]: "", [JDCloud]: "Y", [CuCloud]: "", [Ksyun]: "Y", [QingCloud]: "", [OracleCloud]: "Y", [Apsara]: "Y", [HCSO]: "Y", [HCS]: "Y", [ZStack]: "Y", [OpenStack]: "Y", [VMware]: "-", [Cloudpods]: "Y", [Nutanix]: "-", [BingoCloud]: "Y", [IncloudSphere]: "-", [RemoteFile]: "Y", [Proxmox]: "-", [H3C]: "-" },
            "创建": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "Y", [GoogleCloud]: "Y", [VolcEngine]: "Y", [UCloud]: "Y", [Ctyun]: "Y", [ECloud]: "", [BaiduCloud]: "", [JDCloud]: "", [CuCloud]: "", [Ksyun]: "", [QingCloud]: "", [OracleCloud]: "N", [Apsara]: "Y", [HCSO]: "Y", [HCS]: "Y", [ZStack]: "Y", [OpenStack]: "Y", [VMware]: "-", [Cloudpods]: "Y", [Nutanix]: "-", [BingoCloud]: "Y", [IncloudSphere]: "-", [RemoteFile]: "-", [Proxmox]: "-", [H3C]: "-" },
            "删除": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "Y", [GoogleCloud]: "Y", [VolcEngine]: "Y", [UCloud]: "Y", [Ctyun]: "Y", [ECloud]: "", [BaiduCloud]: "", [JDCloud]: "", [CuCloud]: "", [Ksyun]: "", [QingCloud]: "", [OracleCloud]: "N", [Apsara]: "Y", [HCSO]: "Y", [HCS]: "Y", [ZStack]: "Y", [OpenStack]: "Y", [VMware]: "-", [Cloudpods]: "Y", [Nutanix]: "-", [BingoCloud]: "Y", [IncloudSphere]: "-", [RemoteFile]: "-", [Proxmox]: "-", [H3C]: "-" },
            "规则增删改查": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "Y", [GoogleCloud]: "Y", [VolcEngine]: "Y", [UCloud]: "Y", [Ctyun]: "Y", [ECloud]: "", [BaiduCloud]: "", [JDCloud]: "", [CuCloud]: "", [Ksyun]: "", [QingCloud]: "", [OracleCloud]: "N", [Apsara]: "Y", [HCSO]: "Y", [HCS]: "Y", [ZStack]: "Y", [OpenStack]: "Y", [VMware]: "-", [Cloudpods]: "Y", [Nutanix]: "-", [BingoCloud]: "Y", [IncloudSphere]: "-", [RemoteFile]: "-", [Proxmox]: "-", [H3C]: "-" },
        }
    },
    "网络": {
        "VPC": {
            "同步": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "Y", [GoogleCloud]: "Y", [VolcEngine]: "Y", [UCloud]: "Y", [Ctyun]: "Y", [ECloud]: "Y", [BaiduCloud]: "", [JDCloud]: "Y", [CuCloud]: "", [Ksyun]: "Y", [QingCloud]: "", [OracleCloud]: "Y", [Apsara]: "Y", [HCSO]: "Y", [HCS]: "Y", [ZStack]: "Y", [OpenStack]: "Y", [VMware]: "-", [Cloudpods]: "Y", [Nutanix]: "-", [BingoCloud]: "Y", [IncloudSphere]: "-", [RemoteFile]: "Y", [Proxmox]: "-", [H3C]: "-" },
            "创建": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "Y", [GoogleCloud]: "Y", [VolcEngine]: "Y", [UCloud]: "Y", [Ctyun]: "Y", [ECloud]: "", [BaiduCloud]: "", [JDCloud]: "", [CuCloud]: "", [Ksyun]: "", [QingCloud]: "", [OracleCloud]: "", [Apsara]: "Y", [HCSO]: "Y", [HCS]: "Y", [ZStack]: "", [OpenStack]: "Y", [VMware]: "-", [Cloudpods]: "Y", [Nutanix]: "-", [BingoCloud]: "Y", [IncloudSphere]: "-", [RemoteFile]: "-", [Proxmox]: "-", [H3C]: "-" },
            "删除": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "Y", [GoogleCloud]: "Y", [VolcEngine]: "Y", [UCloud]: "Y", [Ctyun]: "Y", [ECloud]: "", [BaiduCloud]: "", [JDCloud]: "", [CuCloud]: "", [Ksyun]: "", [QingCloud]: "", [OracleCloud]: "", [Apsara]: "Y", [HCSO]: "Y", [HCS]: "Y", [ZStack]: "", [OpenStack]: "Y", [VMware]: "-", [Cloudpods]: "Y", [Nutanix]: "-", [BingoCloud]: "Y", [IncloudSphere]: "-", [RemoteFile]: "-", [Proxmox]: "-", [H3C]: "-" },
        },
        "IP子网": {
            "同步": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "Y", [GoogleCloud]: "Y", [VolcEngine]: "Y", [UCloud]: "Y", [Ctyun]: "Y", [ECloud]: "Y", [BaiduCloud]: "", [JDCloud]: "Y", [CuCloud]: "", [Ksyun]: "Y", [QingCloud]: "", [OracleCloud]: "Y", [Apsara]: "Y", [HCSO]: "Y", [HCS]: "Y", [ZStack]: "Y", [OpenStack]: "Y", [VMware]: "Y", [Cloudpods]: "Y", [Nutanix]: "-", [BingoCloud]: "Y", [IncloudSphere]: "Y", [RemoteFile]: "Y", [Proxmox]: "-", [H3C]: "Y" },
            "创建": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "Y", [GoogleCloud]: "Y", [VolcEngine]: "Y", [UCloud]: "Y", [Ctyun]: "Y", [ECloud]: "", [BaiduCloud]: "", [JDCloud]: "", [CuCloud]: "", [Ksyun]: "", [QingCloud]: "", [OracleCloud]: "Y", [Apsara]: "Y", [HCSO]: "Y", [HCS]: "Y", [ZStack]: "Y", [OpenStack]: "Y", [VMware]: "-", [Cloudpods]: "Y", [Nutanix]: "-", [BingoCloud]: "Y", [IncloudSphere]: "N", [RemoteFile]: "-", [Proxmox]: "-", [H3C]: "-" },
            "删除": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "Y", [GoogleCloud]: "Y", [VolcEngine]: "Y", [UCloud]: "Y", [Ctyun]: "Y", [ECloud]: "", [BaiduCloud]: "", [JDCloud]: "", [CuCloud]: "", [Ksyun]: "", [QingCloud]: "", [OracleCloud]: "Y", [Apsara]: "Y", [HCSO]: "Y", [HCS]: "Y", [ZStack]: "Y", [OpenStack]: "Y", [VMware]: "-", [Cloudpods]: "Y", [Nutanix]: "-", [BingoCloud]: "Y", [IncloudSphere]: "N", [RemoteFile]: "-", [Proxmox]: "-", [H3C]: "-" },
        },
        "弹性公网IP": {
            "同步": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "Y", [GoogleCloud]: "Y", [VolcEngine]: "Y", [UCloud]: "Y", [Ctyun]: "Y", [ECloud]: "Y", [Ksyun]: "Y", [OracleCloud]: "Y", [Apsara]: "Y", [HCSO]: "Y", [HCS]: "Y", [ZStack]: "Y", [OpenStack]: "Y", [VMware]: "-", [Cloudpods]: "Y", [Nutanix]: "-", [BingoCloud]: "Y", [IncloudSphere]: "-", [RemoteFile]: "Y", [Proxmox]: "-" },
            "创建": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "Y", [GoogleCloud]: "Y", [VolcEngine]: "Y", [UCloud]: "Y", [Ctyun]: "Y", [Apsara]: "Y", [HCSO]: "Y", [HCS]: "Y", [ZStack]: "Y", [OpenStack]: "Y", [VMware]: "-", [Cloudpods]: "Y", [Nutanix]: "-", [BingoCloud]: "Y", [IncloudSphere]: "-", [RemoteFile]: "-", [Proxmox]: "-" },
            "删除": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "Y", [GoogleCloud]: "Y", [VolcEngine]: "Y", [UCloud]: "Y", [Ctyun]: "Y", [Apsara]: "Y", [HCSO]: "Y", [HCS]: "Y", [ZStack]: "Y", [OpenStack]: "Y", [VMware]: "-", [Cloudpods]: "Y", [Nutanix]: "-", [BingoCloud]: "Y", [IncloudSphere]: "-", [RemoteFile]: "-", [Proxmox]: "-" },
            "绑定&解绑": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "Y", [GoogleCloud]: "Y", [VolcEngine]: "Y", [UCloud]: "Y", [Ctyun]: "Y", [Apsara]: "Y", [HCSO]: "Y", [HCS]: "Y", [ZStack]: "Y", [OpenStack]: "Y", [VMware]: "-", [Cloudpods]: "Y", [Nutanix]: "-", [BingoCloud]: "Y", [IncloudSphere]: "-", [RemoteFile]: "-", [Proxmox]: "-" },
        },
        "NAT网关": {
            "同步": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Apsara]: "Y", [HCSO]: "Y", [HCS]: "", [ZStack]: "", [OpenStack]: "", [VMware]: "-", [Cloudpods]: "", [Nutanix]: "-", [BingoCloud]: "", [IncloudSphere]: "-", [RemoteFile]: "-", [Proxmox]: "-", [H3C]: "" },
            "创建": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "N", [Apsara]: "", [HCSO]: "Y", [HCS]: "", [ZStack]: "", [OpenStack]: "", [VMware]: "-", [Cloudpods]: "", [Nutanix]: "-", [BingoCloud]: "", [IncloudSphere]: "-", [RemoteFile]: "-", [Proxmox]: "-", [H3C]: "" },
            "删除": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "N", [Apsara]: "", [HCSO]: "Y", [HCS]: "", [ZStack]: "", [OpenStack]: "", [VMware]: "-", [Cloudpods]: "", [Nutanix]: "-", [BingoCloud]: "", [IncloudSphere]: "-", [RemoteFile]: "-", [Proxmox]: "-", [H3C]: "" },
        },
        "负载均衡": {
            "同步": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "Y", [GoogleCloud]: "Y", [Apsara]: "Y", [HCSO]: "Y", [HCS]: "Y", [ZStack]: "", [OpenStack]: "Y", [VMware]: "-", [Cloudpods]: "", [Nutanix]: "-", [BingoCloud]: "", [IncloudSphere]: "-", [RemoteFile]: "-", [Proxmox]: "-", [H3C]: "" },
            "创建": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "N", [GoogleCloud]: "N", [HCSO]: "Y", [HCS]: "", [ZStack]: "", [OpenStack]: "Y", [VMware]: "-", [Cloudpods]: "", [Nutanix]: "-", [BingoCloud]: "", [IncloudSphere]: "-", [RemoteFile]: "-", [Proxmox]: "-", [H3C]: "" },
            "删除": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "N", [GoogleCloud]: "N", [HCSO]: "Y", [HCS]: "", [ZStack]: "", [OpenStack]: "Y", [VMware]: "-", [Cloudpods]: "", [Nutanix]: "-", [BingoCloud]: "", [IncloudSphere]: "-", [RemoteFile]: "-", [Proxmox]: "-", [H3C]: "" },
        },
        "CDN": {
            "同步": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y" },
            "创建": { [TencentCloud]: "Y" },
            "删除": { [TencentCloud]: "Y" },
        },
        "IPv6网关": {
            "同步": { [Apsara]: "Y" }
        }
    },
    "存储": {
        "对象存储": {
            "同步": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "Y", [GoogleCloud]: "Y", [VolcEngine]: "Y", [Apsara]: "Y", [HCSO]: "Y", [HCS]: "Y", [OpenStack]: "", [VMware]: "-", [Cloudpods]: "", [Nutanix]: "-", [RemoteFile]: "Y", [Proxmox]: "-" },
            "创建": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "Y", [GoogleCloud]: "Y", [VolcEngine]: "Y", [Apsara]: "Y", [HCSO]: "Y", [HCS]: "Y", [OpenStack]: "", [VMware]: "-", [Cloudpods]: "", [Nutanix]: "-", [RemoteFile]: "-", [Proxmox]: "-" },
            "删除": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "Y", [GoogleCloud]: "Y", [VolcEngine]: "Y", [Apsara]: "Y", [HCSO]: "Y", [HCS]: "Y", [OpenStack]: "", [VMware]: "-", [Cloudpods]: "", [Nutanix]: "-", [RemoteFile]: "-", [Proxmox]: "-" },
            "文件操作": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "Y", [GoogleCloud]: "Y", [VolcEngine]: "Y", [Apsara]: "Y", [HCSO]: "Y", [HCS]: "Y", [OpenStack]: "", [VMware]: "-", [Cloudpods]: "", [Nutanix]: "-", [RemoteFile]: "-", [Proxmox]: "-" },
        },
        "NAS文件存储": {
            "同步": { [Aliyun]: "Y", [HuaweiCloud]: "Y", [HCSO]: "Y" },
            "创建": { [Aliyun]: "Y", [HuaweiCloud]: "Y", [HCSO]: "" },
            "删除": { [Aliyun]: "Y", [HuaweiCloud]: "Y", [HCSO]: "" },
        },
        "表格存储": {
            "同步": { [Aliyun]: "Y", [Apsara]: "Y" },
        },
    },
    "数据库": {
        "RDS": {
            "同步": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "Y", [GoogleCloud]: "Y", [JDCloud]: "Y", [Apsara]: "Y", [HCSO]: "Y", [HCS]: "Y" },
            "创建": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "N", [GoogleCloud]: "Y", [JDCloud]: "N", [Apsara]: "N", [HCSO]: "Y", [HCS]: "N" },
            "删除": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "N", [GoogleCloud]: "Y", [JDCloud]: "N", [Apsara]: "N", [HCSO]: "Y", [HCS]: "N" },
            "数据库增删改": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "N", [GoogleCloud]: "Y", [JDCloud]: "N", [Apsara]: "N", [HCSO]: "Y", [HCS]: "N" },
            "用户增删改": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "N", [GoogleCloud]: "Y", [JDCloud]: "N", [Apsara]: "N", [HCSO]: "Y", [HCS]: "N" },
        },
        "Redis": {
            "同步": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "Y", [Apsara]: "Y", [HCSO]: "Y" },
            "创建": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "N", [Apsara]: "N", [HCSO]: "Y" },
            "删除": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "N", [Apsara]: "N", [HCSO]: "Y" },
            "数据库增删改": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "N", [Apsara]: "N", [HCSO]: "Y" },
            "用户增删改": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "N", [Apsara]: "N", [HCSO]: "Y" },
        },
        "MongoDB": {
            "同步": { [Aliyun]: "Y", [TencentCloud]: "Y" },
        },
    },
    "中间件": {
        "Kafka": {
            "同步": { [Aliyun]: "Y", [TencentCloud]: "Y" },
        },
        "Elasticsearch": {
            "同步": { [Aliyun]: "Y", [TencentCloud]: "Y" },
        },
    },
    "容器": {
        "Kubernetes集群": {
            "同步": { [Aliyun]: "Y", [TencentCloud]: "Y", [Aws]: "Y", [Azure]: "Y" },
            "创建": { [Aliyun]: "Y", [TencentCloud]: "", [Aws]: "Y", [Azure]: "" },
            "删除": { [Aliyun]: "Y", [TencentCloud]: "", [Aws]: "Y", [Azure]: "" },
        },
    },
    "监控": {
        "虚拟机监控": {
            "同步": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "Y", [GoogleCloud]: "Y", [VolcEngine]: "Y", [JDCloud]: "Y", [Ctyun]: "Y", [ECloud]: "Y", [OracleCloud]: "Y", [Apsara]: "Y", [VMware]: "Y", [BingoCloud]: "Y", [ZStack]: "Y", [Cloudpods]: "Y", [HCSO]: "Y", [HCS]: "Y", [H3C]: "Y" },
        },
    },
    "费用": {
        "计费": {
            "账单拉取": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "Y", [GoogleCloud]: "Y", [VolcEngine]: "Y", [Ksyun]: "Y" },
        },
    },
    "其他": {
        "云用户": {
            "同步": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "Y", [GoogleCloud]: "Y", [Ksyun]: "Y", [VolcEngine]: "Y" },
            "创建": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "Y", [Ksyun]: "Y", [VolcEngine]: "Y" },
            "删除": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "Y", [Ksyun]: "Y", [VolcEngine]: "Y" },
        },
        "云用户组": {
            "同步": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "Y", [Ksyun]: "Y", [VolcEngine]: "Y" },
            "创建": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "Y", [Ksyun]: "Y", [VolcEngine]: "Y" },
            "删除": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "Y", [Ksyun]: "Y", [VolcEngine]: "Y" },
            "绑定&解绑权限": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "Y", [Ksyun]: "Y", [VolcEngine]: "Y" },
            "添加&删除用户": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [Azure]: "Y", [Ksyun]: "Y", [VolcEngine]: "Y" },
        },
        "身份提供商": {
            "同步": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [VolcEngine]: "Y" },
            "创建": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [VolcEngine]: "Y" },
            "删除": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [VolcEngine]: "Y" },
        },
        "免密登录": {
            "角色SSO(SAML2.0)": { [Aliyun]: "Y", [TencentCloud]: "Y", [HuaweiCloud]: "Y", [Aws]: "Y", [VolcEngine]: "Y" },
        },
    }
}

const typeList = Object.keys(data)
typeList.map((typeItem, typeIdx) => {
    const resourceList = Object.keys(data[typeItem])
    let actionsLen = 0
    resourceList.map((resourceItem, resourceIdx) => {
        const actionList = Object.keys(data[typeItem][resourceItem])
        actionsLen += actionList.length
    })
    resourceList.map((resourceItem, resourceIdx) => {
        const actionList = Object.keys(data[typeItem][resourceItem])
        actionList.map((action, index) => {
            let row = []
            // 分类
            row.push(resourceIdx === 0 && index === 0 ? { text: typeItem, rowspan: actionsLen } : {none: true})
            // 资源类型
            row.push(index === 0 ? {text: resourceItem, rowspan: actionList.length} : {none: true})
            // 操作
            row.push(action)
            // 值
            cloudList.map(cloud => {
                row.push(data[typeItem][resourceItem][action][cloud] || '')
            })
            tableList.push(row)
        })
    })
})

const fixedRowLen = 2
const fixedColLen = 3

const getClassName = (rowIdx, colIdx) => {
    let str = ''
    if (rowIdx < fixedRowLen) {
        str = styles[`fixedRow${rowIdx + 1}`]
    }
    if (colIdx < fixedColLen) {
        str = str ? `${str} ${styles[`fixedCol${colIdx + 1}`]}` : styles[`fixedCol${colIdx + 1}`]
    }
    return str
}

const getTableItem = (item, rowIdx, colIdx) => {
    if (item.none) return null
    if (rowIdx < fixedRowLen) {
        return (
            <th rowSpan={item.rowspan || 1} colSpan={item.colspan || 1} style={{ ...(item.style || {}), minWidth: '95px', textAlign: 'center' }} className={getClassName(rowIdx, colIdx)} key={`${rowIdx}-${colIdx}`}>
                {item.text || item}
            </th>
        )
    }
    return (
        <td rowSpan={item.rowspan || 1} colSpan={item.colspan || 1} style={item.style || {}} className={getClassName(rowIdx, colIdx)} key={`${rowIdx}-${colIdx}`}>
            {item.text || item}
        </td>
    )
}
export default function CloudFeatureSupportTable() {
  return (
    <div>
      <ul>
        <li>Y: 支持(增删查改)</li>
        <li>N: 不支持</li>
        <li>-: 平台本身不支持</li>
      </ul>

    <table>
        <thead>
            {tableList.filter((item,index) => index < 2).map((rowList, rowIdx) => (
                <tr key={rowIdx}>
                    {rowList.map((item, colIdx) => (
                        getTableItem(item, rowIdx, colIdx)
                    ))}
                </tr>
            ))}
        </thead>
        <tbody>
            {tableList.filter((item, index) => index >= 2).map((rowList, rowIdx) => (
                <tr key={rowIdx + 2}>
                    {rowList.map((item, colIdx) => (
                        getTableItem(item, rowIdx + 2, colIdx)
                    ))}
                </tr>
            ))}
        </tbody>
    </table>

    </div>
  )
}
