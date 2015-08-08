## RESTful Web App

[jee-restful-web]的前端。基于[sb-admin-angular]开发。一个RESTful Web 应用的简单实现，目前实现了注册、认证、用户管理等简单功能。

对[sb-admin-angular]主要有如下更改：

* 移除jQuery及其他无用的库
* 添加resize，sidemenu指令分别实现自适应和侧边栏，导航栏的下拉菜单使用ui bootstrap的dropdown指令
* 合并原有的[jee-restful-web]的前端代码
* 使用gulp构建

## 安装

```
git clone https://github.com/howiefh/restful-web-app.git
cd ws-app
npm install
bower install
```

执行`gulp serve`前需要先部署好后端服务，之后就可以在浏览器中查看运行效果了

[jee-restful-web]: https://github.com/howiefh/jee-restful-web
[sb-admin-angular]: https://github.com/start-angular/sb-admin-angular
