app.controller('loginController2',function ($scope,loginService2) {
    $scope.login=function () {
        loginService2.loginName().success(
            function (response) {
                $scope.loginName=response.loginName
            }
        )
    }

});