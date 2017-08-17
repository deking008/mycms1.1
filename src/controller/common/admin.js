// +----------------------------------------------------------------------
// | CmsWing [ 网站内容管理框架 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2015-2115 http://www.cmswing.com All rights reserved.
// +----------------------------------------------------------------------
// | Author: arterli <arterli@qq.com>
// +----------------------------------------------------------------------

module.exports = class extends think.Controller {

    async __before() {

        //后台菜单
        this.adminmenu = await this.model('menu').getallmenu(1,true);

        let notifications ={};
        notifications.count = 0;
        notifications.data = [];
        this.assign({
            "navxs": false,
            "bg": "bg-black",
            "notifications":notifications
        })
    }


}