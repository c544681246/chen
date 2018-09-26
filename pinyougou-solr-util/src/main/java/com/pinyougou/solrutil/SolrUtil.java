package com.pinyougou.solrutil;

import com.alibaba.fastjson.JSON;
import com.pinyougou.mapper.TbItemMapper;
import com.pinyougou.pojo.TbItem;
import com.pinyougou.pojo.TbItemExample;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;
import org.springframework.data.solr.core.SolrTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

//将品优购数据导入solr
@Component
public class SolrUtil {
    @Autowired
    private SolrTemplate solrTemplate;
    @Autowired
    private TbItemMapper itemMapper;

    public void importItemData(){
        TbItemExample example=new TbItemExample();
        TbItemExample.Criteria criteria = example.createCriteria();
        criteria.andStatusEqualTo("1");//查询已被审核
        List<TbItem> itemList = itemMapper.selectByExample(example);
        System.out.println("商品列表");
        for (TbItem item : itemList) {
            Map specMap = JSON.parseObject(item.getSpec()); //将spec字段转换成Json
            item.setSpecMap(specMap);//给specMap赋值
            System.out.println(item.getTitle());
        }
        solrTemplate.saveBeans(itemList);//将数据注入solr
        solrTemplate.commit();//提交
        System.out.println("---结束---");
    }

    public static void main(String[] args) {
        ApplicationContext context=new ClassPathXmlApplicationContext("classpath*:spring/applicationContext*.xml");
        SolrUtil solrUtil = (SolrUtil) context.getBean("solrUtil");
        solrUtil.importItemData();
    }
}
