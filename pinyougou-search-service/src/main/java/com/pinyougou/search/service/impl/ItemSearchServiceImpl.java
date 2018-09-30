package com.pinyougou.search.service.impl;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.solr.core.SolrTemplate;
import org.springframework.data.solr.core.query.*;
import org.springframework.data.solr.core.query.result.*;

import com.alibaba.dubbo.config.annotation.Service;
import com.pinyougou.pojo.TbItem;
import com.pinyougou.search.service.ItemSearchService;
@Service(timeout=5000)
public class ItemSearchServiceImpl implements ItemSearchService {

	@Autowired
	private SolrTemplate solrTemplate;

	@Override
	public Map<String,Object> search(Map searchMap) {
		//关键字空格处理
		String keywords = (String) searchMap.get("keywords");
		searchMap.put("keywords",keywords.replace(" ",""));
		Map<String,Object> map=new HashMap<>();
		//高亮显示
		map.putAll(searchList(searchMap));
		//根据关键字查询商品分类
		List categoryList = searchCategoryList(searchMap);
		map.put("categoryList",categoryList);
		//查询品牌和规格
		//3.查询品牌和规格列表
		String category= (String) searchMap.get("category");
		if(!category.equals("")){
			map.putAll(searchBrandAndSpecList(category));
		}else{
			if(categoryList.size()>0){
				map.putAll(searchBrandAndSpecList((String) categoryList.get(0)));
			}
		}
		return map;
	}

	@Override
	public void importList(List list) {
		//更新索引库
		solrTemplate.saveBeans(list);
		solrTemplate.commit();
	}

	@Override
	public void deleteByGoodsIds(List goodsIdList) {
		Query query=new SimpleQuery();
		Criteria criteria=new Criteria("item_goodsid").in(goodsIdList);
		query.addCriteria(criteria);
		solrTemplate.delete(query);
		solrTemplate.commit();
	}

	//设置高亮显示
	private Map searchList(Map searchMap){
		Map map=new HashMap();
		//高亮选项初始化
		HighlightQuery query=new SimpleHighlightQuery();
		HighlightOptions highlightOptions=new HighlightOptions().addField("item_title");//高亮域
		highlightOptions.setSimplePrefix("<em style='color:red'>");//前缀
		highlightOptions.setSimplePostfix("</em>");
		query.setHighlightOptions(highlightOptions);//为查询对象设置高亮选项

		//1.1 关键字查询
		Criteria criteria=new Criteria("item_keywords").is(searchMap.get("keywords"));
		query.addCriteria(criteria);

		//1.2 按商品分类过滤
		if(!"".equals(searchMap.get("category"))  )	{//如果用户选择了分类
			FilterQuery filterQuery=new SimpleFilterQuery();
			Criteria filterCriteria=new Criteria("item_category").is(searchMap.get("category"));
			filterQuery.addCriteria(filterCriteria);
			query.addFilterQuery(filterQuery);
		}

		//1.3 按品牌过滤
		if(!"".equals(searchMap.get("brand"))  )	{//如果用户选择了品牌
			FilterQuery filterQuery=new SimpleFilterQuery();
			Criteria filterCriteria=new Criteria("item_brand").is(searchMap.get("brand"));
			filterQuery.addCriteria(filterCriteria);
			query.addFilterQuery(filterQuery);
		}
		//1.4 按规格过滤
		if(searchMap.get("spec")!=null){
			Map<String,String> specMap= (Map<String, String>) searchMap.get("spec");
			for(String key :specMap.keySet()){

				FilterQuery filterQuery=new SimpleFilterQuery();
				Criteria filterCriteria=new Criteria("item_spec_"+key).is( specMap.get(key)  );
				filterQuery.addCriteria(filterCriteria);
				query.addFilterQuery(filterQuery);

			}

		}
		//按价格过滤
		if(!"".equals(searchMap.get("price"))){
			String[] prices = ((String) searchMap.get("price")).split("-");
			if(!prices[0].equals("0")){
				FilterQuery filterQuery=new SimpleFilterQuery();
				Criteria filterCriteria=new Criteria("item_price").greaterThanEqual(prices[0]);//大于等于
				filterQuery.addCriteria(filterCriteria);
				query.addFilterQuery(filterQuery);
			}
			if(!prices[1].equals("*")){
				FilterQuery filterQuery=new SimpleFilterQuery();
				Criteria filterCriteria=new Criteria("item_price").lessThanEqual(prices[1]);//小于等于
				filterQuery.addCriteria(filterCriteria);
				query.addFilterQuery(filterQuery);
			}
		}

		//分页查询
		Integer pageNo = (Integer) searchMap.get("pageNo");
		if(pageNo==null){
			pageNo=1;
		}
		Integer pageSize = (Integer) searchMap.get("pageSize");
		if(pageSize==null){
			pageSize=20;
		}
		query.setOffset((pageNo-1)*pageSize);
		query.setRows(pageSize);
		//排序
		String sortValue=(String) searchMap.get("sort");//排序规则DESC或ASC
		String sortField=(String) searchMap.get("sortField");//排序字段
		if(sortValue!=null&&!sortValue.equals("")){
			if(sortValue.equals("DESC")){
				Sort sort=new Sort(Sort.Direction.DESC,"item_"+sortField);
				query.addSort(sort);
			}
			if(sortValue.equals("ASC")){
				Sort sort=new Sort(Sort.Direction.ASC,"item_"+sortField);
				query.addSort(sort);
			}
		}
		//高亮页对象
		HighlightPage<TbItem> page = solrTemplate.queryForHighlightPage(query, TbItem.class);
		//获取高亮结果
		List<HighlightEntry<TbItem>> highlightEntries = page.getHighlighted();
		//循环高亮入口集合S
		for (HighlightEntry<TbItem> h : highlightEntries) {
			//获取实体类
			TbItem item = h.getEntity();
			//设置高亮的结果
			if(h.getHighlights().size()>0&&h.getHighlights().get(0).getSnipplets().size()>0){
				item.setTitle(h.getHighlights().get(0).getSnipplets().get(0));
			}
		}
		map.put("rows",page.getContent());
		map.put("totalPages",page.getTotalPages());//总页数
		map.put("total",page.getTotalElements());//总记录数
		return map;

	}
	//根据关键字查询商品分类
	private List searchCategoryList(Map searchMap){
		List list=new ArrayList();
		Query query=new SimpleQuery();
		//根据关键字查询
		Criteria criteria=new Criteria("item_keywords").is(searchMap.get("keywords"));
		query.addCriteria(criteria);
		//设置分组选项
		GroupOptions groupOptions =new GroupOptions().addGroupByField("item_category");
		query.setGroupOptions(groupOptions);
		//获取分页组
		GroupPage<TbItem> page = solrTemplate.queryForGroupPage(query, TbItem.class);
		//根据列得到结果集
		GroupResult<TbItem> result = page.getGroupResult("item_category");
		//得到分组结果入口页
		Page<GroupEntry<TbItem>> groupEntries = result.getGroupEntries();
		//得到分组入口集合
		List<GroupEntry<TbItem>> content = groupEntries.getContent();
		for (GroupEntry<TbItem> entry : content) {
			//封装对象
			list.add(entry.getGroupValue());
		}
		return list;
	}
	@Autowired
	private RedisTemplate redisTemplate;

	private Map searchBrandAndSpecList(String category){
		Map map=new HashMap();
		Long typeId = (Long) redisTemplate.boundHashOps("itemCat").get(category);
		if(typeId!=null){
			List brandList = (List) redisTemplate.boundHashOps("brandList").get(typeId);
			map.put("brandList",brandList);
			List specList = (List) redisTemplate.boundHashOps("specList").get(typeId);
			map.put("specList",specList);
		}
		return map;
	}
}
