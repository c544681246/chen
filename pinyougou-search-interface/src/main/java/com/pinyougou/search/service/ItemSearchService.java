package com.pinyougou.search.service;

import java.util.List;
import java.util.Map;
//搜索服务
public interface ItemSearchService {
    public Map<String,Object> search(Map searchMap);

    //导入数据
    public void importList(List list);
    //删除索引库
    public void deleteByGoodsIds(List goodsIdList);
}
