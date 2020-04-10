// It is important to know that for each EC2 instance each tag key can have only one value:
// Check tag restrictions here: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/Using_Tags.html
// NR Tags however can have multiple values for the same key

const getHostTagValue = (entity, key) => {
    return entity.tags.find(tag => tag.key === key).values[0];
}

const formatData = (hosts) => {
  const presentationData = {
    header:{
      accounts: [],
      awsRegions: [],
      awsAZs: [],
      awsSubnets: []
    },
    summary:{
      nbEc2: 0,
      nbUniqueServices: 0,
      nbServicesInstances: 0,
      nbServicesInSync: 0,
      nbServicesNotInSync: 0,
    },
    details:[]
  };
  // Details
  const details = hosts.map(host => {
                    const info = {accountId:host.accountId, name:host.name, guid:host.guid};
                    const ec2Tags = {};
                    host.tags.forEach(tag => {
                        if(tag.key.startsWith('label.')) {
                            ec2Tags[tag.key.replace('label.','')] = tag.values[0];  // EC2 instance can have only 1 value for each key
                        } else if(tag.key==='account' || tag.key==='aws.awsRegion' || tag.key==='aws.awsAvailabilityZone' || tag.key==='aws.ec2SubnetId'){
                            info[tag.key] = tag.values[0];
                        }
                    })
                    info['tags'] = ec2Tags;
                    info['apmApps'] = host.apmApps.map(app => {
                      const appObj = Object.assign({}, app);
                      delete appObj.tags;
                      appObj['tags'] = {};
                      app.tags.forEach(t => {
                        appObj.tags[t.key] = t.values;
                      })
                      appObj['isInSync'] = checkSync(info.tags, appObj.tags);
                      appObj['checked'] = false;
                      return appObj;
                  })
                    return info;
                  });
  presentationData.details = details;
  // Header
  presentationData.header = getHeader(details);            
  // Summary
  presentationData.summary = getSummary(details); 
  return presentationData;
}

const getHeader = (data) => {
  const accounts = data.map(host => host.account)
  const awsRegions = data.map(host => host['aws.awsRegion']);
  const awsAZs = data.map(host => host['aws.awsAvailabilityZone']);
  const awsSubnets = data.map(host => host['aws.ec2SubnetId']);
  return { accounts, awsRegions, awsAZs, awsSubnets };
}

const getSummary = (data) => {
  const nbEc2 = data.length;
  const servicesGuids = data.map(host => host.apmApps.map(app => app.guid)).flat();
  const nbServicesInstances = servicesGuids.length;
  const nbUniqueServices = [...new Set(servicesGuids)].length;
  const nbServicesInSync = data.reduce((acc, host) => {
    host.apmApps.forEach(app => app.isInSync && acc++);
    return acc;
  },0);
  const nbServicesNotInSync = nbServicesInstances - nbServicesInSync;
  return { nbEc2, nbUniqueServices, nbServicesInstances, nbServicesInSync, nbServicesNotInSync };
}

const filterData = (data, filters) => {
  const result = {};
  const { syncedDataOnly, notSyncedDataOnly, ...subsetFilters } = filters;
  // Let's filter using giving dropdown values
  let filteredData = [];
  Object.keys(subsetFilters).forEach((key) => (subsetFilters[key].length === 0) && delete subsetFilters[key]); // removing empty filters
  if (subsetFilters) {
    filteredData = data.details.filter(ele => Object.keys(subsetFilters).every(key => subsetFilters[key].includes(ele[key])));
  } else {
    filteredData = data.details;
  }
  // Let's filter again using the toogles
  if (syncedDataOnly !== notSyncedDataOnly) { // If both flags are true of false we should not filter the data
    const synced = syncedDataOnly ? true : false;
    filteredData = filteredData.filter(ele => ele.apmApps.reduce((acc,current) => current.isInSync && acc, true)===synced);
  }
  result['details'] = filteredData;
  result['header'] = getHeader(data.details);
  result['summary'] = getSummary(result.details);
  return result;
}

const checkSync = (hostTags, appTags) => { 
  // 'every' method will stop when the test doesn't pass and throw false
  const inSync = Object.keys(hostTags).every(hTagKey => appTags.hasOwnProperty(hTagKey) && appTags[hTagKey].includes(hostTags[hTagKey]));
  return inSync;
}

const updateAllCheckedFlags = (data, value) => { // value True or False
  data.details.forEach(host => {
    const apps = host.apmApps.map(app => {
        app['checked'] = value;
        return app;
    })
    host.apmApps = apps;
    return host;
  });
}

export { getHostTagValue, formatData, filterData, updateAllCheckedFlags };