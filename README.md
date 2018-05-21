<h2 text-align="center">用户管理模块</h2>

用于管理用户的模块，目前提供的api有

```javascript
1, /user/login/github
介绍：跳转到这个路径，这个路径会转到github的oauth界面

2，/user/login/state
介绍：获取当前用户的公开信息,具体请参考 controller/example.js

3, /user/logout
介绍: 登出功能

```

目前提供的界面有:

```javascript
1，/user/login/
介绍：简单的登录界面
```