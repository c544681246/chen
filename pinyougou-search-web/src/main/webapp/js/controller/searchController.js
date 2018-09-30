app.controller('searchController',function($scope,$location,searchService){
	
	//搜索
	$scope.search=function(){
        $scope.searchMap.pageNo=parseInt($scope.searchMap.pageNo);
		searchService.search($scope.searchMap).success(
			function(response){
				$scope.resultMap=response;
                buildPageLabel();
			}
		);		
	}
	
	//搜索对象
	$scope.searchMap={'keywords':'','category':'','brand':'','spec':{},'price':'','pageNo':1,'pageSize':40,'sort':'','sortField':''};

	//搜索项
	$scope.addSearchItem=function (key,value) {
		if(key=='brand'||key=='category'||key=='price'){
			$scope.searchMap[key]=value;
		}else {
			$scope.searchMap.spec[key]=value;
		}
		$scope.search();
    }

    //移除搜索条件
	$scope.removeSearchItem=function (key) {
		if(key=='brand'||key=='category'||key=='price'){
			$scope.searchMap[key]='';
		}else {
			delete $scope.searchMap.spec[key];
		}
		$scope.search();
    }
    //分页标签
	buildPageLabel=function () {
		$scope.pageLabel=[];
		//最后页码
		var maxPageNo=$scope.resultMap.totalPages;
		//开始页码
		var firstPage=1;
		//截止页码
		var lastPage=maxPageNo;
        $scope.firstDot=true;//前面有点
        $scope.lastDot=true;//后边有点
		//如果总页数大于5，则显示5个页码
		if($scope.resultMap.totalPages>5){
			//如果当前页小于3,将最后一页设置为5
			if($scope.searchMap.pageNo<=3){
				lastPage=5;
                $scope.firstDot=false;//前面没点
			}else if ($scope.searchMap.pageNo>=lastPage-2){
				//如果当前页大于截止页-2,则设置后5页
				firstPage=maxPageNo-4;
                $scope.lastDot=false;//后边没点
			}else {
				//显示5页，当前页为中间页
				firstPage=$scope.searchMap.pageNo-2;
				lastPage=$scope.searchMap.pageNo+2;
			}
		}else {
            $scope.firstDot=false;//前面无点
            $scope.lastDot=false;//后边无点
		}
		for (var i=firstPage;i<=lastPage;i++){
			$scope.pageLabel.push(i);
		}
    }

    //根据页码查询
	$scope.queryByPage=function (pageNo) {
		if(pageNo<1&&pageNo>$scope.resultMap.totalPages){
			return;
		}
		$scope.searchMap.pageNo=pageNo;
		$scope.search();
    }
    //判断当前页为第一页
    $scope.isTopPage=function(){
        if($scope.searchMap.pageNo==1){
            return true;
        }else{
            return false;
        }
    }
		//判断当前页是否未最后一页
    $scope.isEndPage=function(){
        if($scope.searchMap.pageNo==$scope.resultMap.totalPages){
            return true;
        }else{
            return false;
        }
    }

    //排序
	$scope.sortSearch=function ( sortField,sort) {
		$scope.searchMap.sort=sort;
		$scope.searchMap.sortField=sortField;
		$scope.search();
    }
    //判断关键字是不是品牌
    $scope.keywordsIsBrand=function () {
        for(var i=0;i<$scope.resultMap.brandList.length;i++){
            //判断关键字中是否包含品牌
            if($scope.searchMap.keywords.indexOf($scope.resultMap.brandList[i].text)>=0){
                return true;
            }
        }
        return false;
    }
    //接收首页传来的关键字
    $scope.loadkeywords=function () {
        $scope.searchMap.keywords=$location.search()['keywords'];
        $scope.search();
    }
});