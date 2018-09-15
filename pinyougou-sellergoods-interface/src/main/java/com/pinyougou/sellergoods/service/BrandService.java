package com.pinyougou.sellergoods.service;

import java.util.List;
import java.util.Map;

import com.pinyougou.pojo.TbBrand;
import entity.PageResult;

/**
 * 品牌接口
 * @author Administrator
 *
 */
public interface BrandService {
	//查询所有品牌信息
	public List<TbBrand> findAll();
	//分页查询所有品牌信息
	public PageResult findPage(int pageNum,int pageSize);
	//添加方法
	public void add(TbBrand tbBrand);
	//回显数据的方法
	public TbBrand findOne(long id);
	//修改方法
	public void update(TbBrand tbBrand);
	//删除方法
	public void delete(Long[] ids);
	//分页版条件查询(利用方法重载)
    public PageResult findPage(TbBrand tbBrand,int pageNum,int pageSize);
    //查询下拉菜单
	public List<Map> selectOptionList();
}
