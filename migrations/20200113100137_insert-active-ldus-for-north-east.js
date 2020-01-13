exports.up = async knex => {
  await knex.schema.alterTable('active_local_delivery_units', table => {
    table.dropUnique('ldu_code')
  })

  await knex('active_local_delivery_units').insert([
    { ldu_code: 'C01ALL', probation_area_code: 'C01' },
    { ldu_code: 'C01UAT', probation_area_code: 'C01' },
    { ldu_code: 'NBR_ALL', probation_area_code: 'C01' },
    { ldu_code: 'C03HART', probation_area_code: 'C03' },
    { ldu_code: 'C03IOM', probation_area_code: 'C03' },
    { ldu_code: 'C03MGMT', probation_area_code: 'C03' },
    { ldu_code: 'C03MIDD', probation_area_code: 'C03' },
    { ldu_code: 'C03NDRH', probation_area_code: 'C03' },
    { ldu_code: 'C03REDC', probation_area_code: 'C03' },
    { ldu_code: 'C03SART', probation_area_code: 'C03' },
    { ldu_code: 'C03SDRH', probation_area_code: 'C03' },
    { ldu_code: 'C03STOC', probation_area_code: 'C03' },
    { ldu_code: 'C03SUP', probation_area_code: 'C03' },
    { ldu_code: 'C03TTG', probation_area_code: 'C03' },
    { ldu_code: 'C03WTT', probation_area_code: 'C03' },
    { ldu_code: 'C03IAP', probation_area_code: 'C03' },
    { ldu_code: 'C03UAT', probation_area_code: 'C03' },
    { ldu_code: 'C04ALL', probation_area_code: 'C04' },
    { ldu_code: 'C04ITTG', probation_area_code: 'C04' },
    { ldu_code: 'HBSGRI', probation_area_code: 'C04' },
    { ldu_code: 'HBSSCU', probation_area_code: 'C04' },
    { ldu_code: 'LNSCNTY', probation_area_code: 'C04' },
    { ldu_code: 'LNSEAST', probation_area_code: 'C04' },
    { ldu_code: 'LNSWEST', probation_area_code: 'C04' },
    { ldu_code: 'C04IAP', probation_area_code: 'C04' },
    { ldu_code: 'C04CPPS', probation_area_code: 'C04' },
    { ldu_code: 'C04PSC', probation_area_code: 'C04' },
    { ldu_code: 'C04PSSD', probation_area_code: 'C04' },
    { ldu_code: 'C04UAT', probation_area_code: 'C04' },
    { ldu_code: 'HBS_ALL', probation_area_code: 'C04' },
    { ldu_code: 'HBSEYK', probation_area_code: 'C04' },
    { ldu_code: 'HBSHUL', probation_area_code: 'C04' },
    { ldu_code: 'YSN_ALL', probation_area_code: 'C04' },
    { ldu_code: 'YSNNYK', probation_area_code: 'C04' },
    { ldu_code: 'YSNYOR', probation_area_code: 'C04' },
    { ldu_code: 'C05ALL', probation_area_code: 'C05' },
    { ldu_code: 'C05ITTG', probation_area_code: 'C05' },
    { ldu_code: 'C05IAP', probation_area_code: 'C05' },
    { ldu_code: 'C05CPPS', probation_area_code: 'C05' },
    { ldu_code: 'C05PSC', probation_area_code: 'C05' },
    { ldu_code: 'C05PSSD', probation_area_code: 'C05' },
    { ldu_code: 'C05UAT', probation_area_code: 'C05' },
    { ldu_code: 'C05COTS', probation_area_code: 'C05' },
    { ldu_code: 'YSWCALL', probation_area_code: 'C05' },
    { ldu_code: 'YSWCBFD', probation_area_code: 'C05' },
    { ldu_code: 'YSWCINT', probation_area_code: 'C05' },
    { ldu_code: 'YSWCLDS', probation_area_code: 'C05' },
    { ldu_code: 'YSWCWAK', probation_area_code: 'C05' },
    { ldu_code: 'YSWLDS', probation_area_code: 'C05' },
    { ldu_code: 'YSWNALL', probation_area_code: 'C05' },
    { ldu_code: 'YSWNINT', probation_area_code: 'C05' },
    { ldu_code: 'YSWNWAK', probation_area_code: 'C05' },
    { ldu_code: 'C09BAR', probation_area_code: 'C09' },
    { ldu_code: 'C09CTRL', probation_area_code: 'C09' },
    { ldu_code: 'C09DON', probation_area_code: 'C09' },
    { ldu_code: 'C09HUB', probation_area_code: 'C09' },
    { ldu_code: 'C09INT', probation_area_code: 'C09' },
    { ldu_code: 'C09PROV', probation_area_code: 'C09' },
    { ldu_code: 'C09RHM', probation_area_code: 'C09' },
    { ldu_code: 'C09SHF', probation_area_code: 'C09' },
    { ldu_code: 'C09IAP', probation_area_code: 'C09' },
    { ldu_code: 'C09UAT', probation_area_code: 'C09' },
    { ldu_code: 'DTV_NOR', probation_area_code: 'N02' },
    { ldu_code: 'DTV_SOD', probation_area_code: 'N02' },
    { ldu_code: 'N02NDH', probation_area_code: 'N02' },
    { ldu_code: 'HBSEYK', probation_area_code: 'N02' },
    { ldu_code: 'HBSHUL', probation_area_code: 'N02' },
    { ldu_code: 'N02AHER', probation_area_code: 'N02' },
    { ldu_code: 'HBSGRI', probation_area_code: 'N02' },
    { ldu_code: 'HBSSCU', probation_area_code: 'N02' },
    { ldu_code: 'N02ANEL', probation_area_code: 'N02' },
    { ldu_code: 'LNSCNTY', probation_area_code: 'N02' },
    { ldu_code: 'LNSEAST', probation_area_code: 'N02' },
    { ldu_code: 'LNSWEST', probation_area_code: 'N02' },
    { ldu_code: 'N02ALL', probation_area_code: 'N02' },
    { ldu_code: 'N02OMIC', probation_area_code: 'N02' },
    { ldu_code: 'N02BRA', probation_area_code: 'N02' },
    { ldu_code: 'N02CAL', probation_area_code: 'N02' },
    { ldu_code: 'N02NBC', probation_area_code: 'N02' },
    { ldu_code: 'N02NBS', probation_area_code: 'N02' },
    { ldu_code: 'YSS_BAR', probation_area_code: 'N02' },
    { ldu_code: 'YSS_SHF', probation_area_code: 'N02' },
    { ldu_code: 'DTV_HOM', probation_area_code: 'N02' },
    { ldu_code: 'DTV_MOM', probation_area_code: 'N02' },
    { ldu_code: 'DTV_ROM', probation_area_code: 'N02' },
    { ldu_code: 'DTV_SOM', probation_area_code: 'N02' },
    { ldu_code: 'N02NCL', probation_area_code: 'N02' },
    { ldu_code: 'N02NDR', probation_area_code: 'N02' },
    { ldu_code: 'YSS_DON', probation_area_code: 'N02' },
    { ldu_code: 'YSS_RTM', probation_area_code: 'N02' },
    { ldu_code: 'N02IAP', probation_area_code: 'N02' },
    { ldu_code: 'N02IAV', probation_area_code: 'N02' },
    { ldu_code: 'N02LEE', probation_area_code: 'N02' },
    { ldu_code: 'N02NLE', probation_area_code: 'N02' },
    { ldu_code: 'N02NEW', probation_area_code: 'N02' },
    { ldu_code: 'N02NNT', probation_area_code: 'N02' },
    { ldu_code: 'N02NTS', probation_area_code: 'N02' },
    { ldu_code: 'N02NUL', probation_area_code: 'N02' },
    { ldu_code: 'N02PPU', probation_area_code: 'N02' },
    { ldu_code: 'N02GHD', probation_area_code: 'N02' },
    { ldu_code: 'N02NST', probation_area_code: 'N02' },
    { ldu_code: 'N02SDL', probation_area_code: 'N02' },
    { ldu_code: 'N02STC', probation_area_code: 'N02' },
    { ldu_code: 'N02STS', probation_area_code: 'N02' },
    { ldu_code: 'N02UAT', probation_area_code: 'N02' },
    { ldu_code: 'N02KIR', probation_area_code: 'N02' },
    { ldu_code: 'N02NWK', probation_area_code: 'N02' },
    { ldu_code: 'N02WAK', probation_area_code: 'N02' },
    { ldu_code: 'YSN_ALL', probation_area_code: 'N02' },
    { ldu_code: 'YSNNYK', probation_area_code: 'N02' },
  ])
}

exports.down = async knex => {
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'C01ALL', probation_area_code: 'C01' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'C01UAT', probation_area_code: 'C01' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'NBR_ALL', probation_area_code: 'C01' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'C03HART', probation_area_code: 'C03' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'C03IOM', probation_area_code: 'C03' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'C03MGMT', probation_area_code: 'C03' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'C03MIDD', probation_area_code: 'C03' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'C03NDRH', probation_area_code: 'C03' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'C03REDC', probation_area_code: 'C03' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'C03SART', probation_area_code: 'C03' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'C03SDRH', probation_area_code: 'C03' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'C03STOC', probation_area_code: 'C03' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'C03SUP', probation_area_code: 'C03' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'C03TTG', probation_area_code: 'C03' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'C03WTT', probation_area_code: 'C03' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'C03IAP', probation_area_code: 'C03' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'C03UAT', probation_area_code: 'C03' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'C04ALL', probation_area_code: 'C04' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'C04ITTG', probation_area_code: 'C04' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'HBSGRI', probation_area_code: 'C04' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'HBSSCU', probation_area_code: 'C04' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'LNSCNTY', probation_area_code: 'C04' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'LNSEAST', probation_area_code: 'C04' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'LNSWEST', probation_area_code: 'C04' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'C04IAP', probation_area_code: 'C04' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'C04CPPS', probation_area_code: 'C04' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'C04PSC', probation_area_code: 'C04' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'C04PSSD', probation_area_code: 'C04' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'C04UAT', probation_area_code: 'C04' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'HBS_ALL', probation_area_code: 'C04' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'HBSEYK', probation_area_code: 'C04' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'HBSHUL', probation_area_code: 'C04' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'YSN_ALL', probation_area_code: 'C04' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'YSNNYK', probation_area_code: 'C04' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'YSNYOR', probation_area_code: 'C04' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'C05ALL', probation_area_code: 'C05' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'C05ITTG', probation_area_code: 'C05' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'C05IAP', probation_area_code: 'C05' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'C05CPPS', probation_area_code: 'C05' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'C05PSC', probation_area_code: 'C05' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'C05PSSD', probation_area_code: 'C05' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'C05UAT', probation_area_code: 'C05' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'C05COTS', probation_area_code: 'C05' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'YSWCALL', probation_area_code: 'C05' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'YSWCBFD', probation_area_code: 'C05' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'YSWCINT', probation_area_code: 'C05' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'YSWCLDS', probation_area_code: 'C05' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'YSWCWAK', probation_area_code: 'C05' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'YSWLDS', probation_area_code: 'C05' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'YSWNALL', probation_area_code: 'C05' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'YSWNINT', probation_area_code: 'C05' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'YSWNWAK', probation_area_code: 'C05' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'C09BAR', probation_area_code: 'C09' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'C09CTRL', probation_area_code: 'C09' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'C09DON', probation_area_code: 'C09' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'C09HUB', probation_area_code: 'C09' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'C09INT', probation_area_code: 'C09' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'C09PROV', probation_area_code: 'C09' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'C09RHM', probation_area_code: 'C09' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'C09SHF', probation_area_code: 'C09' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'C09IAP', probation_area_code: 'C09' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'C09UAT', probation_area_code: 'C09' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'DTV_NOR', probation_area_code: 'N02' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'DTV_SOD', probation_area_code: 'N02' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'N02NDH', probation_area_code: 'N02' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'HBSEYK', probation_area_code: 'N02' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'HBSHUL', probation_area_code: 'N02' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'N02AHER', probation_area_code: 'N02' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'HBSGRI', probation_area_code: 'N02' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'HBSSCU', probation_area_code: 'N02' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'N02ANEL', probation_area_code: 'N02' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'LNSCNTY', probation_area_code: 'N02' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'LNSEAST', probation_area_code: 'N02' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'LNSWEST', probation_area_code: 'N02' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'N02ALL', probation_area_code: 'N02' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'N02OMIC', probation_area_code: 'N02' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'N02BRA', probation_area_code: 'N02' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'N02CAL', probation_area_code: 'N02' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'N02NBC', probation_area_code: 'N02' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'N02NBS', probation_area_code: 'N02' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'YSS_BAR', probation_area_code: 'N02' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'YSS_SHF', probation_area_code: 'N02' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'DTV_HOM', probation_area_code: 'N02' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'DTV_MOM', probation_area_code: 'N02' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'DTV_ROM', probation_area_code: 'N02' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'DTV_SOM', probation_area_code: 'N02' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'N02NCL', probation_area_code: 'N02' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'N02NDR', probation_area_code: 'N02' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'YSS_DON', probation_area_code: 'N02' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'YSS_RTM', probation_area_code: 'N02' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'N02IAP', probation_area_code: 'N02' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'N02IAV', probation_area_code: 'N02' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'N02LEE', probation_area_code: 'N02' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'N02NLE', probation_area_code: 'N02' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'N02NEW', probation_area_code: 'N02' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'N02NNT', probation_area_code: 'N02' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'N02NTS', probation_area_code: 'N02' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'N02NUL', probation_area_code: 'N02' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'N02PPU', probation_area_code: 'N02' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'N02GHD', probation_area_code: 'N02' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'N02NST', probation_area_code: 'N02' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'N02SDL', probation_area_code: 'N02' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'N02STC', probation_area_code: 'N02' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'N02STS', probation_area_code: 'N02' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'N02UAT', probation_area_code: 'N02' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'N02KIR', probation_area_code: 'N02' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'N02NWK', probation_area_code: 'N02' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'N02WAK', probation_area_code: 'N02' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'YSN_ALL', probation_area_code: 'N02' })
    .delete()
  await knex('active_local_delivery_units')
    .where({ ldu_code: 'YSNNYK', probation_area_code: 'N02' })
    .delete()

  await knex.schema.alterTable('active_local_delivery_units', table => {
    table
      .string('ldu_code', 10)
      .notNullable()
      .unique()
      .alter()
  })
}
