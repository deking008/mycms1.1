// +----------------------------------------------------------------------
// | CmsWing [ 网站内容管理框架 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2015-2115 http://www.cmswing.com All rights reserved.
// +----------------------------------------------------------------------
// | Author: arterli <arterli@qq.com>
// +----------------------------------------------------------------------

module.exports = class extends think.Controller {

    async __before() {

        //登陆验证
        let is_login = await this.islogin();
        if (!is_login) {
            return this.redirect('/admin/public/signin');
        }

        //用户信息
        this.user = await this.session('userInfo');
        this.assign("userinfo", this.user);
        this.roleid = await this.model("auth_user_role").where({user_id:this.user.uid}).getField('role_id', true);
        this.is_admin = await this.isadmin();

        //后台菜单
        this.adminmenu = await this.model('menu').getallmenu(this.user.uid,this.is_admin);

        let notifications ={};
        notifications.count = 0;
        notifications.data = [];
        this.assign({
            "navxs": false,
            "bg": "bg-black",
            "notifications":notifications
        })
    }

    /**
     * 判断是否登录
     * @returns {boolean}
     */
    async islogin() {
        //判断是否登录
        let user = await this.session('userInfo');
        let res = think.isEmpty(user) ? false : user.uid;
        return res;

    }

    /**
     * 检查当前用户是否为管理员
     * @param uid
     * @returns {*|boolean}
     */
    async isadmin(uid) {
        uid = uid || null;
        uid = think.isEmpty(uid) ? await this.islogin() : uid;
        return uid && (in_array(parseInt(uid), this.config('user_administrator')));
    }


}