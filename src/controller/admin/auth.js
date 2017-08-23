/**
 * Created by Administrator on 2017/8/22.
 */
const Base = require('../common/admin');
const fs = require('fs');
module.exports = class extends Base {
    /**
     * index action
     * @return {Promise} []
     */
    constructor(ctx){
        super(ctx); // 调用父级的 constructor 方法，并把 ctx 传递进去
        // 其他额外的操作
        this.tactive = "user";

    }
    /**
     * 排序
     */
    async sortAction() {

        if(this.para('type')==1){
            await super.sortAction('member_group','groupid');
        }else {
            await super.sortAction('auth_role','id');
        }
    }
    /**
     * 后台节点配置的url作为规则存入auth_rule
     * 执行新节点的插入,已有节点的更新,无效规则的删除三项任务
     * @author
     */


    /**
     * 用户分组管理首页
     * @returns {*}
     */
    async indexAction(){
        let list = await this.model("member_group").order("sort ASC").select();
        this.assign("list",list);
        this.meta_title = "会员组管理";
        return this.display();
    }
    /**
     * 管理角色管理首页
     * @returns {*}
     */

    async adminAction() {
        let list = await this.model('auth_role').order("id ASC").select();
        this.assign({
            "datatables": true,
            "tactive": "/admin/user",
            "selfjs": "auth",
            "list":list
        })
        this.active = "admin/auth/index";
        this.meta_title = "权限管理";
        return this.display();
    }
}