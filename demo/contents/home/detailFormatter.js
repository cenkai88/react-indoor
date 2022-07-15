// Detail
export const formatEventDetail = (item, eventCategoryMapping = {}, sourceCategoryMapping = {}) => `事件id：${item.id}
优先级：${{ HIGH: '高', LOW: '低', MEDIUM: '中' }[item.priority] || '无'}
类型：${eventCategoryMapping[item.category] || item.category || '无'}
描述：${item.description || '无'}
发生时间：${item.insertTime || '无'}
更新时间：${item.updateTime || '无'}
来源：${sourceCategoryMapping[item.source] || item.source || '无'}
`;

export const formatCaseDetail = (item, caseCategoryMapping = {}, sourceCategoryMapping = {}) => `工单id：${item.id}
优先级：${{ HIGH: '高', LOW: '低', MEDIUM: '中' }[item.priority] || '无'}
负责人：${item?.owner?.name || '无'}
类型：${caseCategoryMapping[item.category] || item.category || '无'}
描述：${item.description || '无'}
发生时间：${item.insertTime || '无'}
更新时间：${item.updateTime || '无'}
来源：${sourceCategoryMapping[item.source] || item.source || '无'}
`;


export const formatVehicleDetail = item => `载具设备id：${item.id}
载具名称：${item.name || '无'}
所属部门：${item?.ownerDepartment?.name || '无'}
使用部门：${item?.userDepartment?.name || '无'}
载具负责人：${item?.owner?.name || '无'}
线路号：${item?.routeNum || '无'}
班组：${item?.groupName || '无'}
车型：${item?.model || '无'}
驾驶员：${item?.driver || '无'}
工作状态：${item?.workStatus === "ALERT" ? "出警" : "巡逻" || '无'}
车牌：${item?.plateNum || '无'}
上岗时间：${item?.startTime || '无'}
上次定位时间：${item?.lastDetectedTime || '无'}
`;

export const formatIndividualDetail = item => `单兵设备id：${item.id}
单兵设备名称：${item.name || '无'}
所属部门：${item?.ownerDepartment?.name || '无'}
使用部门：${item?.userDepartment?.name || '无'}
对应人员：${item?.owner?.name || '无'}
上次定位时间：${item?.lastDetectedTime || '无'}
`;

export const formatArponDetail = (item = {}) => `航班状态：${{
    CX: '航班取消',
    DV: '航班转降',
    NI: '航班可能延误',
    RS: '返回停机位',
    XF: '固定航班',
}[(item?.status || '').toUpperCase()] || item?.status || '无'}
机位号：${item?.stand || '无'}
航空器注册号：${item?.arn || '无'}
航班计划时间：${item?.operationDate || '无'}
航班代码：${item?.flightNoIata || '无'}
航空公司代码：${item?.airlineCodeIata || '无'}
始发机场代码：${item?.originAirportIata || '无'}
目的机场代码：${item?.destAirportIata || '无'}
登机门：${item?.gate || '无'}
跑道号：${item?.rwy || '无'}
出港或进港：${item?.aOrD ? (item?.aOrD === 'A' ? '进港' : '出港') : '未知'}
预计着陆时间：${item?.eldt || '无'}
实际着陆时间：${item?.aldt || '无'}
计划上轮挡时间：${item?.sibt || '无'}
实际上轮挡时间：${item?.aibt || '无'}
计划下轮挡时间：${item?.sobt || '无'}
实际下轮挡时间：${item?.aobt || '无'}
`;


// Tooltip
export const formatEventTooltip = (item, eventCategoryMapping = {}) => item ? `优先级：${{ HIGH: '高', LOW: '低', MEDIUM: '中' }[item.priority] || '无'}
类型：${eventCategoryMapping[item.category] || item.category || '无'}
描述：${item.description || '无'}
发生时间：${item.insertTime || '无'}
`: '';

export const formatCaseTooltip = (item, caseCategoryMapping = {}) => item ? `优先级：${{ HIGH: '高', LOW: '低', MEDIUM: '中' }[item.priority] || '无'}
负责人：${item?.owner?.name || '无'}
类型：${caseCategoryMapping[item.category] || item.category || '无'}
描述：${item.description || '无'}
发生时间：${item.insertTime || '无'}
`: '';

export const formatVehicleTooltip = item => item ? `使用部门：${item?.userDepartment?.name || '无'}
线路号：${item?.routeNum || '无'}
班组：${item?.groupName || '无'}
车型：${item?.model || '无'}
上岗时间：${item?.startTime || '无'}
`: '';

export const formatIndividualTooltip = item => item ? `单兵设备名称：${item.name || '无'}
对应人员：${item?.owner?.name || '无'}
`: '';


export const formatArponTooltip = (item = {}) => `航班状态：${{
    CX: '航班取消',
    DV: '航班转降',
    NI: '航班可能延误',
    RS: '返回停机位',
    XF: '固定航班',
}[(item?.status || '').toUpperCase()] || item?.status || '无'}
机位号：${item?.stand || '无'}
航班计划时间：${item?.operationDate || '无'}
航班代码：${item?.flightNoIata || '无'}
登机门：${item?.gate || '无'}
出港或进港：${item?.aOrD ? (item?.aOrD === 'A' ? '进港' : '出港') : '未知'}
`;