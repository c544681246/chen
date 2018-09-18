app.controller("baseController",function ($scope) {

    $scope.reloadList=function () {
        $scope.search($scope.paginationConf.currentPage,$scope.paginationConf.itemsPerPage)
    };;


    //分页控件配置
    $scope.paginationConf = {
        currentPage: 1,//当前页
        totalItems: 10,//总记录数  items:条数
        itemsPerPage: 10,//每页记录数
        perPageOptions: [10, 20, 30, 40, 50],//选择每页显示的页数
        onChange: function(){		//当页码变更后自动触发的方法
            $scope.reloadList();//页码变更或者页面初始化调用此方法
        }
    };

    //用户勾选的id集合
    $scope.selectIds=[];

    $scope.updateSelection=function ($event,id) {
        if($event.target.checked){
            //push向集合添加元素
            $scope.selectIds.push(id);
        }else{
            var index= $scope.selectIds.indexOf(id);//查找值的 位置
            $scope.selectIds.splice(index,1);//参数1：移除的位置 参数2：移除的个数
        }
    };

    $scope.jsonToString=function (Json,key) {

       var json= JSON.parse(Json);
       var v='';
       for(var i=0;i<json.length;i++){
           if(i>0){
               v+=",";
           }
           v+=json[i][key]

       }
        return v;
    }

});