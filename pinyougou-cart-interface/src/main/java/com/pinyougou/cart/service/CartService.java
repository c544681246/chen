package com.pinyougou.cart.service;

import com.pinyougou.pojogroup.Cart;

import java.util.List;
//购物车服务
public interface CartService {
    //添加购物车
    public List<Cart> addGoodsToCartList(List<Cart> cartList,Long itemId,Integer num);
    //从redis中获取购物车
    public List<Cart> findCartListFromRedis(String username);
    //讲购物车存入redis
    public void saveCartListToRedis(String username,List<Cart> cartList);
    //合并购物车
    public List<Cart> mergeCartList(List<Cart> cartList1,List<Cart> cartList2);
}
