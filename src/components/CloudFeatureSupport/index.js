import styles from './styles.module.css';

const tableList = [
    // 表头1
    [
        {
            text: '分类',
            rowspan: 2,
            style: {
                zIndex: 3,
            }
        },
        {
            text: '云资源类型',
            rowspan: 2,
            style: {
                zIndex: 3,
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
            colspan: 14,
            style: {
                textAlign: 'center'
            }
        }
    ],
    // 表头2
    [{ none: true }, { none: true }, { none: true }, '阿里云', '阿里金融云', '腾讯云', '华为云', 'AWS', 'Azure', 'GCP', '火山引擎', 'UCloud', '天翼云', '移动云', '京东云', '百度云', '联通云', '金山云', '青云', '阿里飞天 (3.12+)', 'HCSO', 'HCS (8.0.3+)', 'ZStack (3.4.0+)', 'OpenStack (M+)', 'VMware (6.5+)', 'Cloudpods', 'DStack', 'Nutanix (6.5.2+)', 'BingoCloud', 'inCloud Sphere (6.5.1+)', '外部数据', 'Proxmox (6.3+)', 'H3C (CloudOS 5.0+)'],
    [
        {
            text: '主机',
            rowspan: 7,
        },
        {
            text: '虚拟机',
            rowspan: 2,
        }, '新建', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', '', '', '', '', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'
    ],
    [{ none: true }, { none: true }, '克隆', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', '', '', '', '', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'],
    [{ none: true },'弹性伸缩组', '', '', '', '', '', 'Y', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Y', '', '', '', '', 'Y', '', ''],
    [{ none: true }, '系统镜像', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', '', '', '', '', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', '', 'Y', 'Y', '', '', ''],
    [{ none: true }, '硬盘', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', '', '', '', '', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'],
    [{ none: true }, '快照', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', '', '', 'Y', 'Y', '', '', '', '', 'Y', 'Y', 'Y', 'Y', 'Y', '', 'Y', 'Y', 'Y', '', '', '', '', ''],
    [{ none: true }, '自动快照策略', 'Y', '', 'Y', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Y', '', '', '', '', '', '', ''], 
    [{ none: true }, '安全组', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', '', '', '', '', 'Y', 'Y', 'Y', 'Y', 'Y', '', 'Y', 'Y', 'Y', '', '', 'Y', '', ''],
    [
        {
            text: '网络',
            rowspan: 9,
        },
        '专有网络VPC', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', '', '', '', '', 'Y', 'Y', 'Y', 'Y', 'Y', '', 'Y', 'Y', '', 'Y', 'Y', 'Y', '', 'Y'],
    [{ none: true }, 'IP子网', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', '', '', '', '', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y','', 'Y', 'Y', 'Y', '', 'Y'],
    [{ none: true }, '弹性公网IP', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', '', '', '', '', 'Y', 'Y', 'Y', 'Y', 'Y','', 'Y', 'Y', '', 'Y', '', 'Y', '', 'Y'],
    [{ none: true }, 'NAT网关', 'Y', 'Y', '', 'Y', '', '', '', '', '', '', '', '', '', '', '', '', 'Y', 'Y', 'Y', '', '', '', '', '', '', '', '', '', '', ''],
    [{ none: true }, 'DNS解析', 'Y', 'Y', 'Y', '', 'Y', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''], 
    [{ none: true }, '负载均衡LB', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', '', '', '', '', '', '', '', '', '','Y', 'Y', 'Y', '', 'Y','', 'Y', '', '', '', '', 'Y', '', 'Y'],
    [{ none: true }, 'CDN', 'Y', 'Y', 'Y', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    [{ none: true }, 'WAF', 'Y', 'Y', '', '', 'Y', 'Y', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    [{ none: true }, 'IPv6网关', 'Y', 'Y', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Y', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    [
        {
            text: '存储',
            rowspan: 3,
        },
        '对象存储', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', '', '', '', '', '', '', '','Y', 'Y', 'Y', '', '', '', 'Y', '', '', '', '', 'Y', '', ''],
    [{ none: true }, 'NAS文件存储', 'Y', 'Y', '', 'Y', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    [{ none: true }, '表格存储', 'Y', 'Y', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Y', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    [
        {
            text: '数据库',
            rowspan: 3,
        }, 
        'RDS', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', '', '', '', '', '', '', '', '', '', 'Y', 'Y', 'Y', '', '', '', '', '', '', '', '','Y', '', 'Y'],
    [{ none: true }, 'Redis', 'Y', 'Y', 'Y', 'Y', '', '', '', '', '', '', '', '', '', '', '', '', 'Y', 'Y', 'Y', '', '', '', '', '', '', '', '', '', '', ''],
    [{ none: true }, 'MongoDB', '', '', 'Y', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    [
        {
            text: '中间件',
            rowspan: 2,
        },
        'Kafka', '', '', 'Y', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
    ],
    [{ none: true }, 'Elasticsearch', '', '', 'Y', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',],
    [
        {
            text: '容器',
            rowspan: 2,
        },
        'Kubernetes集群纳管', 'Y', '', 'Y', 'Y', 'Y', 'Y', 'Y', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
    ],
    [{ none: true }, 'Kubernetes集群新建', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '','Y', 'Y', 'Y', '', '', '', '', '', '', ''],
    ['监控', '监控告警', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y','', 'Y', 'Y', '', '', '', '', '','Y', 'Y', '', 'Y', '', 'Y', 'Y', 'Y', '', '', '', '', '', ''],
    ['费用', '公有云账单分析/私有云计费服务', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', '', '', '', '', '', '', '', '','Y', 'Y', '', 'Y', 'Y', 'Y', 'Y', 'Y','', '', '', '', '', ''],
    [
        {
            text: '其他',
            rowspan: 2,
        },
        '公有云子账号', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', '', '', '', '', '', '', '', '', '', '','Y', '', '', '', '', '', 'Y', 'Y', 'Y', 'Y', '', '', ''
    ],
    [{ none: true }, '免密登录云平台', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', '', '', '', '', '', '', '', '', '', '', '', 'Y', '', '', '', '', '', '', '', '', '', '', '', ''],

]

console.log(tableList)

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
    if (rowIdx < fixedRowLen || colIdx < fixedColLen) {
        return (
            <th rowspan={item.rowspan || 1} colspan={item.colspan || 1} style={{ ...(item.style || {}), minWidth: '80px', textAlign: 'center' }} className={getClassName(rowIdx, colIdx)}>
                {item.text || item}
            </th>
        )
    }
    return (
        <td rowspan={item.rowspan || 1} colspan={item.colspan || 1} style={item.style || {}} className={getClassName(rowIdx, colIdx)}>
            {item.text || item}
        </td>
    )
}
export default function CloudFeatureSupportTable() {
  // TODO: 把下面这个表格用组件重构了
  return (
    <div>
      <ul>
        <li>Y: 支持(增删查改)</li>
        <li>N: 不支持</li>
        <li>-: 平台本身不支持</li>
        <li>D: 开发过程中</li>
        <li>R: 只读同步</li>
      </ul>
      
    <table>
        {tableList.map((rowList, rowIdx) => (
            <tr>
                {rowList.map((item, colIdx) => (
                    getTableItem(item, rowIdx, colIdx)
                ))}
            </tr>
        ))}
    </table>

    </div>
  )
}
