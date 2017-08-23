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
     * 添加会员组
     */
    async adduserAction(){
        if(this.isPost){
            let data = this.post();
            let add = await this.model("member_group").add(data);
            if(add) {
                return this.success({name:"添加成功！",url:"/admin/auth/index"});
            } else {
                return this.fail("添加失败");
            }
        } else {
            this.meta_title = "添加会员组";
            this.active = "admin/auth/index";
            return this.display();
        }
    }
    /**
     * 删除会员组
     */
    async deluserAction(){
        if(this.isPost){
            let ids = this.post("ids");
            let dels = await this.model('member_group').where({groupid:['IN',ids]}).delete();
            if(dels){
                return this.success({name: "删除成功！"});
            } else {
                return this.fail("删除失败！");
            }
        } else {
            let id = this.get("id");
            let issystem = await this.model('member_group').where({groupid:id}).getField("issystem",true);
            if(issystem>0){
                return this.fail("系统组，不能删除！");
            }
            let del = await this.model('member_group').where({groupid:id}).delete();
            if(del){
                return this.success({name: "删除成功！"});
            } else {
                return this.fail("删除失败！");
            }
        }
    }
    /**
     * 编辑会员组
     */
    async edituserAction(){
        if(this.isPost){
            let data = this.post();
            data.allowpost= data.allowpost||0;
            data.allowpostverify= data.allowpostverify||0;
            data.allowupgrade= data.allowupgrade||0;
            data.allowsendmessage= data.allowsendmessage||0;
            data.allowattachment= data.allowattachment||0;
            data.allowsearch= data.allowsearch||0;
            let update = await this.model("member_group").where({groupid:data.groupid}).update(data);

            if (update) {
                return this.success({ name: "编辑成功！",url:"/admin/auth/index"});
            } else {
                return this.fail("编辑失败！");
            }
        } else {
            let id = this.get("id");
            let info = await this.model("member_group").where({groupid:id}).find();
            this.assign("info",info);
            this.meta_title = "编辑会员组";
            this.active = "admin/auth/index";
            return this.display();
        }
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