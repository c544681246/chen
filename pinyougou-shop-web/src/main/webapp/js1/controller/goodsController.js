 //控制层
app.controller('goodsController' ,function($scope,$controller,$location,goodsService,uploadService,itemCatService,typeTemplateService){

	$controller('baseController',{$scope:$scope});//继承

	$scope.status=['未审核','已审核','审核未通过','关闭'];//商品状态

    //读取列表数据绑定到表单中
	$scope.findAll=function(){
		goodsService.findAll().success(
			function(response){
				$scope.list=response;
			}
		);
	};

	//分页
	$scope.findPage=function(page,rows){
		goodsService.findPage(page,rows).success(
			function(response){
				$scope.list=response.rows;
				$scope.paginationConf.totalItems=response.total;//更新总记录数
			}
		);
	};

	//查询实体
	$scope.findOne=function(){
		var id=$location.search()['id'];
		if(id==null){
			return;
		}
		goodsService.findOne(id).success(
			function(response){
				$scope.entity= response;
				//将数据库中的数据显示到富文本编辑器中
				editor.html($scope.entity.goodsDesc.introduction);
				//将字符串转换成Json对象，显示图片
				$scope.entity.goodsDesc.itemImages=JSON.parse($scope.entity.goodsDesc.itemImages);
				// 显示扩展属性
				$scope.entity.goodsDesc.customAttributeItems= JSON.parse($scope.entity.goodsDesc.customAttributeItems);
				//显示规格
                $scope.entity.goodsDesc.specificationItems=JSON.parse($scope.entity.goodsDesc.specificationItems);
                //SKU 列表规格列转换
                for( var i=0;i<$scope.entity.itemList.length;i++ ){
                	$scope.entity.itemList[i].spec = JSON.parse( $scope.entity.itemList[i].spec);
                }
			}
		);
	}

	//保存
	$scope.save=function(){
		$scope.entity.goodsDesc.introduction=editor.html();
		var serviceObject;//服务层对象
		if($scope.entity.id!=null){//如果有ID
			serviceObject=goodsService.update( $scope.entity ); //修改
		}else{
			serviceObject=goodsService.add( $scope.entity  );//增加
		}
		serviceObject.success(
			function(response){
				if(response.success){
                    location.href="goods.html";//跳转到商品列表页

				}else{
					alert(response.message);
				}
			}
		);
	}


	//批量删除
	$scope.dele=function(){
		//获取选中的复选框
		goodsService.dele( $scope.selectIds ).success(
			function(response){
				if(response.success){
					$scope.reloadList();//刷新列表
					$scope.selectIds=[];
				}
			}
		);
	}

	$scope.searchEntity={};//定义搜索对象

	//搜索
	$scope.search=function(page,rows){
		goodsService.search(page,rows,$scope.searchEntity).success(
			function(response){
				$scope.list=response.rows;
				$scope.paginationConf.totalItems=response.total;//更新总记录数
			}
		);
	}

    //保存
    $scope.add=function(){
        $scope.entity.goodsDesc.introduction=editor.html();
        goodsService.add( $scope.entity ).success(
            function(response){
                if(response.success){
                    alert('保存成功');
                    $scope.entity={};
                    editor.html('');//清空富文本编辑器
                }else{
                    alert(response.message);
                }
            }
        );
    }
    $scope.uploadFile=function(){
        uploadService.uploadFile().success(function(response) {
            if(response.success){
                $scope.image_entity.url=response.message;
            }else{
                alert(response.message);
            }
        }).error(function() {
            alert("上传发生错误");
        });
    };
	//双向绑定
    $scope.entity={goods:{},goodsDesc:{itemImages:[],specificationItems:[]}};

    $scope.add_image_entity=function(){
        $scope.entity.goodsDesc.itemImages.push($scope.image_entity);
    }
    //列表中移除图片
    $scope.remove_image_entity=function(index){
        $scope.entity.goodsDesc.itemImages.splice(index,1);
    }
    //一级下拉分类
    $scope.selectItemCat1List=function () {
    	itemCatService.findByParentId(0).success(
    		function (response) {
				$scope.itemCat1List=response;
            }
		);
    }

    //二级下拉分类
	$scope.$watch('entity.goods.category1Id',function (newValue,oldValue) {
		itemCatService.findByParentId(newValue).success(
			function (response) {
				$scope.itemCat2List=response;
            }
		);
    })
	//三级下拉分类
    $scope.$watch('entity.goods.category2Id',function (newValue,oldValue) {
        itemCatService.findByParentId(newValue).success(
            function (response) {
                $scope.itemCat3List=response;
            }
        );
    })
	//显示模板id
	$scope.$watch('entity.goods.category3Id',function (newValue, oldValue) {
		itemCatService.findOne(newValue).success(
			function (response) {
				$scope.entity.goods.typeTemplateId=response.typeId;
            }
		);
    })

	//品牌下拉列表
	$scope.$watch('entity.goods.typeTemplateId',function (newValue, oldValue) {
		typeTemplateService.findOne(newValue).success(
			function (response) {
				$scope.typeTemplate=response;
				//将[{"id":2,"text":"华为"},{"id":9,"text":"苹果"}]转换成json对象
				$scope.typeTemplate.brandIds=JSON.parse($scope.typeTemplate.brandIds);
                //扩展属性
                if( $location.search()['id']==null ){//如果是增加商品
                    $scope.entity.goodsDesc.customAttributeItems= JSON.parse($scope.typeTemplate.customAttributeItems);
                }
            }
		);
		//查询规格选项
		typeTemplateService.findSpecIds(newValue).success(
			function(response){
				//后台返回一个List<Map>
				$scope.specList=response;
			}
		);
    })

	//复选框是否勾选  name:attributeName   value:attributeValue
    $scope.updateSpecAttribute=function($event,name,value){
        var object= $scope.searchObjectByKey($scope.entity.goodsDesc.specificationItems ,'attributeName', name);
        if(object!=null){
            if($event.target.checked ){
                object.attributeValue.push(value);
            }else{//取消勾选
                object.attributeValue.splice( object.attributeValue.indexOf(value ) ,1);//移除选项
				//如果选项都取消了，将此条记录移除
                if(object.attributeValue.length==0){
                    $scope.entity.goodsDesc.specificationItems.splice(
                        $scope.entity.goodsDesc.specificationItems.indexOf(object),1);
                }
            }
        }else{
            $scope.entity.goodsDesc.specificationItems.push(
                {"attributeName":name,"attributeValue":[value]});
        }
    }

	$scope.createItemList=function () {
		$scope.entity.itemList=[{spec:{},price:0,num:9999,status:'0',idDefault:'0'}];
		var items=$scope.entity.goodsDesc.specificationItems;
		for(var i=0;i<items.length;i++){
			$scope.entity.itemList=addColumn( $scope.entity.itemList,items[i].attributeName,items[i].attributeValue );
		}
    }
    //深克隆
	addColumn=function(list,columnName,columnValue){

    	var newList=[];
    	for(var i=0;i<list.length;i++){
    		var oldRow=list[i];
    		for(var j=0;j<columnValue.length;j++){
    			var newRow=JSON.parse(JSON.stringify(oldRow));
    			newRow.spec[columnName]=columnValue[j];
    			newList.push(newRow);
			}
		}
		return newList;
	}
	//显示列表
	$scope.itemCatList=[];
	$scope.findItemCatList=function () {
		itemCatService.findAll().success(
			function (response) {
				for(var i=0;i<response.length;i++){
					$scope.itemCatList[response[i].id]=response[i].name
				}
            }
		);
    }
    //显示规格是否被勾选
    $scope.checkAttributeValue=function (specName, optionName) {
		var item=$scope.entity.goodsDesc.specificationItems;
		var object=$scope.searchObjectByKey(item,'AttributeName',specName)
		if(object==null){
			return false;
		}else {
			if(object.attributeValue.indexOf(optionName)>=0){
				return true;
			}else {
				return false;
			}
		}
    }
    $scope.checkAttributeValue=function(specName,optionName){
        var items= $scope.entity.goodsDesc.specificationItems;
        var object= $scope.searchObjectByKey(items,'attributeName',specName);
        if(object==null){
            return false;
        }else{
            if(object.attributeValue.indexOf(optionName)>=0){
                return true;
            }else{
                return false;
            }
        }
    }
    $scope.updateStatus=function(status){
        goodsService.updateStatus($scope.selectIds,status).success(
            function(response){
                if(response.success){//成功
                    $scope.reloadList();//刷新列表
                    $scope.selectIds=[];//清空 ID 集合
                }else{
                    alert(response.message);
                }
            }
        );
    }

});	
