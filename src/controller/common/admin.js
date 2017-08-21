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
    async editRow(model, data, where, msg) {
        // let id = this.para('id');
        // id = think.isArray(id) ? id : id;
        //如存在id字段，则加入该条件
        // let fields = await this.model(model).getSchema();
        // console.log(fields);
        // if (in_array('id', fields) && !think.isEmpty(id)) {
        //     where = think.extend({ 'id': ['IN', id] }, where);
        // }

        msg = think.extend({ 'success': '操作成功！', 'error': '操作失败！', 'url': '', 'ajax': this.isAjax() }, msg);
        let res = await this.model(model).where(where).update(data);
        if (res) {
            switch (model){
                case 'channel'://更新频道缓存信息
                    update_cache("channel")//更新频道缓存信息
                    break;
                case 'category'://更新全站分类缓存
                    update_cache("category")//更新栏目缓存
                    break;
                case 'model':
                    update_cache("model")//更新栏目缓存
                    break;
            }
            return this.success({ name: msg.success, url: msg.url });
        } else {
            return this.fail(msg.error, msg.url);
        }
    }
    /**
     * 禁用条目
     * @param {String} model 模型名称,供D函数使用的参数
     * @param {Object}  where 查询时的 where()方法的参数
     * @param {Object}  msg   执行正确和错误的消息,可以设置四个元素 {'success':'','error':'', 'url':'','ajax':false}
     *                     url为跳转页面,ajax是否ajax方式(数字则为倒数计时秒数)
     *
     * @author arterli <arterli@qq.com>
     */
    async forbid(model, where, msg) {
        where = where || {}, msg = msg || { 'success': '状态禁用成功！', 'error': '状态禁用失败！' };
        let data = { 'status': 0 };
        await this.editRow(model, data, where, msg);
    }

    /**
     * 恢复条目
     * @param {String} model 模型名称,供D函数使用的参数
     * @param {Object}  where 查询时的where()方法的参数
     * @param {Object}  msg   执行正确和错误的消息 {'success':'','error':'', 'url':'','ajax':false}
     *                     url为跳转页面,ajax是否ajax方式(数字则为倒数计时秒数)
     *
     * @author arterli <arterli@qq.com>
     */
    async resume(model, where, msg) {
        where = where || {}, msg = msg || { 'success': '状态恢复成功！', 'error': '状态恢复失败！' };
        let data = { 'status': 1 };
        await this.editRow(model, data, where, msg);
    }

    /**
     * 还原条目
     * @param {string} model 模型名称,供D函数使用的参数
     * @param {array}  where 查询时的where()方法的参数
     * @param {array}  msg   执行正确和错误的消息 {'success':'','error':'', 'url':'','ajax':false}
     *                     url为跳转页面,ajax是否ajax方式(数字则为倒数计时秒数)
     * @author arterli <arterli@qq.com>
     */
    async restore(model, where, msg) {
        where = where || {}, msg = msg || { 'success': '状态还原成功！', 'error': '状态还原失败！' };
        let data = { 'status': 1 };
        where = think.extend({ 'status': -1 }, where);
        await this.editRow(model, data, where, msg);
    }

    /**
     * 条目假删除
     * @param {string} model 模型名称,供D函数使用的参数
     * @param {array}  where 查询时的where()方法的参数
     * @param {array} msg   执行正确和错误的消息 {'success':'','error':'', 'url':'','ajax':false}
     *                     url为跳转页面,ajax是否ajax方式(数字则为倒数计时秒数)
     *
     * @author arterli <arterli@qq.com>
     */
    async delete(model, where, msg) {
        where = where || {}, msg = msg || { 'success': '删除成功！', 'error': '删除失败！' };
        let data = { 'status': -1 };
        await this.editRow(model, data, where, msg);
    }

    /**
     * 设置一条或者多条数据的状态
     */
    async setstatusAction(model,pk="id") {
        if(think.isEmpty(this.ctx.param('model'))){
            model = model || this.ctx.controller.substring(6);
        }else {
            model = this.para('model');
        }

        let ids = this.para('ids');
        let status = this.para('status');
        status = parseInt(status);
        if (think.isEmpty(ids)) {
            return this.fail("请选择要操作的数据");
        }
        let map = {};
        if(!think.isEmpty(this.para('pk'))){
            pk=this.para('pk');
        }
        map[pk] = ['IN', ids];
        // return this.fail(model);

        switch (status) {
            case -1:
                await this.delete(model, map, { 'success': '删除成功', 'error': '删除失败' });
                break;
            case 0:
                await this.forbid(model, map, { 'success': '禁用成功', 'error': '禁用失败' });
                break;
            case 1:
                await this.resume(model, map, { 'success': '启用成功', 'error': '启用失败' });
                break;
            default:
                this.fail('参数错误');
                break;
        }

    }

}