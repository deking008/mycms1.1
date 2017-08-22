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
}