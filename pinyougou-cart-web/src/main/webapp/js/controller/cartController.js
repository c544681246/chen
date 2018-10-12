//购物车控制层
app.controller('cartController',function($scope,cartService){
    //查询购物车列表
    $scope.findCartList=function(){
        cartService.findCartList().success(
            function(response){
                $scope.cartList=response;
                $scope.totalValue=cartService.sum(response);
            }
        );
    }
    //添加购物车
    $scope.addGoodsToCartList=function (itemId,num) {
        cartService.addGoodsToCartList(itemId,num).success(
                function (response) {
                if(response.success){
                    $scope.findCartList();
                }else {
                    alert(response.message)
                }
            }
        )
    }
    //查询用户地址
    $scope.findListByLoginUser=function () {
        cartService.findListByLoginUser().success(
            function (response) {
                $scope.addressList=response;
                //设置默认地址
                for(var i=0;i< $scope.addressList.length;i++){
                    if($scope.addressList[i].isDefault=='1'){
                        $scope.address=$scope.addressList[i];
                        break;
                    }
                }
            }
        )
    }
    //选择地址
    $scope.selectAddress=function (address) {
        $scope.address=address;
    }
    //是否选中地址
    $scope.isSelectAddress=function (address) {
        if(address==$scope.address){
            return true;
        }else {
            return false;
        }
    }
    //设置支付默认值
    $scope.order={paymentTtype:'1'};

    //选择支付方式
    $scope.selectPayType=function (type) {
        $scope.order.paymentTtype=type;
    }

    $scope.submitOrder=function () {
        $scope.order.receiverAreaAame=$scope.address.address;
        $scope.order.receiverMobile=$scope.address.mobile;
        $scope.order.receiver=$scope.address.contact;
        cartService.submitOrder($scope.order).success(
            function (response) {
                if($scope.order.paymentType=='1'){
                    location.href='pay.html';
                }else {
                    location.href="paysuccess.html";
                }
            }
        )
    }
});