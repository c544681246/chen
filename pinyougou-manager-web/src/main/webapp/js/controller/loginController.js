app.controller('loginController',function ($scope,loginService) {
    $scope.login=function () {
        loginService.login().success(
            function (response) {
                $scope.loginName=response.loginName
            }
        )
    }
});